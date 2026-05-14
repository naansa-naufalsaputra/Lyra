/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
/**
 * TaskContext — Firestore real-time sync
 *
 * All task data is stored in the `tasks` Firestore collection.
 * Each document is scoped to a userId, ensuring per-user data isolation.
 * Uses `onSnapshot` for real-time synchronization.
 */

import React, { createContext, useState, useEffect, useContext } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthContext";
import type { Task, RecurrenceRule } from "../components/TaskCard";
import { addDays, addMonths, format, parseISO } from "date-fns";

interface TaskContextType {
  tasks: Task[];
  rules: RecurrenceRule[];
  mounted: boolean;
  addTask: (task: Omit<Task, "id" | "createdAt" | "completed">) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
}

export const TaskContext = createContext<TaskContextType | undefined>(undefined);

/** Convert Firestore doc data → Task object */
function docToTask(id: string, data: Record<string, unknown>): Task {
  return {
    id,
    text: data.text as string,
    completed: data.completed as boolean,
    createdAt:
      data.createdAt && typeof (data.createdAt as Timestamp).toMillis === "function"
        ? (data.createdAt as Timestamp).toMillis()
        : Date.now(),
    completedAt:
      data.completedAt && typeof (data.completedAt as Timestamp).toMillis === "function"
        ? (data.completedAt as Timestamp).toMillis()
        : undefined,
    priority: data.priority as Task["priority"],
    category: data.category as Task["category"],
    dueDate: data.dueDate as string | undefined,
    isRecurring: data.isRecurring as boolean | undefined,
    description: data.description as string | undefined,
    ruleId: data.ruleId as string | undefined,
    recurrence: data.recurrence as Task["recurrence"],
  };
}

function docToRule(id: string, data: Record<string, unknown>): RecurrenceRule {
  return {
    id,
    userId: data.userId as string,
    title: data.title as string,
    frequency: data.frequency as RecurrenceRule["frequency"],
    daysOfWeek: (data.daysOfWeek as number[]) || [],
    category: data.category as string,
    priority: data.priority as Task["priority"],
    nextOccurrence: data.nextOccurrence as string,
    active: data.active !== false,
  };
}

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rules, setRules] = useState<RecurrenceRule[]>([]);
  const [mounted, setMounted] = useState(false);

  /* ── Real-time Firestore listener (scoped to userId) ── */
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setRules([]);
      setMounted(true);
      return;
    }

    const tasksRef = collection(db, "tasks");
    const tasksQuery = query(
      tasksRef,
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const rulesRef = collection(db, "recurrenceRules");
    const rulesQuery = query(
      rulesRef,
      where("userId", "==", user.uid)
    );

    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      const result = snapshot.docs.map((d) =>
        docToTask(d.id, d.data() as Record<string, unknown>)
      );
      setTasks(result);
      setMounted(true);
    });

    const unsubRules = onSnapshot(rulesQuery, (snapshot) => {
      const result = snapshot.docs.map((d) =>
        docToRule(d.id, d.data() as Record<string, unknown>)
      );
      setRules(result);
    });

    return () => {
      unsubTasks();
      unsubRules();
    };
  }, [user]);

  /* ── Mutations ── */

  const addTask = async (
    task: Omit<Task, "id" | "createdAt" | "completed">
  ): Promise<Task> => {
    if (!user) throw new Error("Not authenticated");

    const today = new Date().toISOString().split("T")[0];
    let ruleId: string | undefined;

    // 1. Create Recurrence Rule if needed
    if (task.isRecurring && task.recurrence) {
      const ruleData = {
        userId: user.uid,
        title: task.text,
        frequency: task.recurrence.frequency,
        daysOfWeek: task.recurrence.daysOfWeek,
        category: task.category,
        priority: task.priority,
        nextOccurrence: (task as Task).dueDate || today,
        active: true,
      };
      const ruleRef = await addDoc(collection(db, "recurrenceRules"), ruleData);
      ruleId = ruleRef.id;
    }

    // 2. Create the Task Instance
    const docData = {
      userId: user.uid,
      text: task.text,
      completed: false,
      createdAt: serverTimestamp(),
      priority: task.priority,
      category: task.category,
      dueDate: (task as Task).dueDate || today,
      isRecurring: task.isRecurring || false,
      description: task.description || "",
      recurrence: task.recurrence || null,
      ruleId: ruleId || null,
    };

    const ref = await addDoc(collection(db, "tasks"), docData);

    const newTask: Task = {
      ...task,
      id: ref.id,
      createdAt: Date.now(),
      completed: false,
      dueDate: (task as Task).dueDate || today,
      ruleId,
    };
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const docRef = doc(db, "tasks", id);
    // Strip the `id` field — Firestore doc ID is not stored in document data
    const { id: _id, ...cleanUpdates } = updates;
    void _id;
    await updateDoc(docRef, cleanUpdates);
  };

  const handleRecurringTask = async (task: Task) => {
    if (!task.isRecurring || !task.recurrence || !task.dueDate) return;

    // Use ruleId to find the master rule if available
    const rule = task.ruleId ? rules.find(r => r.id === task.ruleId) : null;
    
    // If rule is deleted or inactive, stop cycle
    if (task.ruleId && (!rule || !rule.active)) return;

    const currentDate = parseISO(task.dueDate);
    let nextDate = new Date(currentDate);

    switch (task.recurrence.frequency) {
      case "daily":
        nextDate = addDays(currentDate, 1);
        break;
      case "weekly": {
        const days = task.recurrence.daysOfWeek;
        if (days && days.length > 0) {
          let found = false;
          for (let i = 1; i <= 7; i++) {
            const checkDate = addDays(currentDate, i);
            if (days.includes(checkDate.getDay())) {
              nextDate = checkDate;
              found = true;
              break;
            }
          }
          if (!found) nextDate = addDays(currentDate, 7);
        } else {
          nextDate = addDays(currentDate, 7);
        }
        break;
      }
      case "biweekly":
        nextDate = addDays(currentDate, 14);
        break;
      case "monthly":
        nextDate = addMonths(currentDate, 1);
        break;
    }

    const nextOccurrenceStr = format(nextDate, "yyyy-MM-dd");

    // Update the master rule if it exists
    if (task.ruleId) {
      const ruleRef = doc(db, "recurrenceRules", task.ruleId);
      await updateDoc(ruleRef, { nextOccurrence: nextOccurrenceStr });
    }

    // Create the next instance
    const nextTaskData: Omit<Task, "id" | "createdAt" | "completed"> = {
      text: task.text,
      priority: task.priority,
      category: task.category,
      dueDate: nextOccurrenceStr,
      isRecurring: true,
      recurrence: task.recurrence,
      ruleId: task.ruleId,
    };

    // Direct addDoc to avoid re-creating rule
    const docData = {
      userId: user!.uid,
      ...nextTaskData,
      completed: false,
      createdAt: serverTimestamp(),
    };
    await addDoc(collection(db, "tasks"), docData);
  };

  const toggleTask = async (id: string) => {
    // Add haptic feedback for mobile
    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }

    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    // Handle recurring logic BEFORE marking the current one as completed
    if (!task.completed && task.isRecurring) {
      await handleRecurringTask(task);
    }

    const docRef = doc(db, "tasks", id);
    await updateDoc(docRef, {
      completed: !task.completed,
      completedAt: !task.completed ? serverTimestamp() : null,
    });
  };

  const deleteTask = async (id: string) => {
    const docRef = doc(db, "tasks", id);
    await deleteDoc(docRef);
  };

  const deleteRule = async (id: string) => {
    const docRef = doc(db, "recurrenceRules", id);
    await deleteDoc(docRef);
    // Future tasks linked to this rule will no longer spawn (handled in handleRecurringTask)
  };

  return (
    <TaskContext.Provider
      value={{ tasks, rules, mounted, addTask, updateTask, toggleTask, deleteTask, deleteRule }}
    >
      {children}
    </TaskContext.Provider>
  );
};

/** Hook to consume task data */
export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within TaskProvider");
  return ctx;
}

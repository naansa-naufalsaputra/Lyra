/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
/**
 * TaskContext — Firestore real-time sync
 *
 * All task data is stored in the `tasks` Firestore collection.
 * Each document is scoped to a userId, ensuring per-user data isolation.
 * Uses `onSnapshot` for real-time synchronization.
 */

import React, { createContext, useEffect, useContext } from "react";
import { useAuth } from "./AuthContext";
import { useStore, type Task, type RecurrenceRule } from "../store/useStore";

interface TaskContextType {
  tasks: Task[];
  rules: RecurrenceRule[];
  mounted: boolean;
  addTask: (task: Omit<Task, "id" | "createdAt" | "completed">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
}

export const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { 
    tasks, 
    rules, 
    mounted, 
    addTask: storeAddTask,
    updateTask,
    toggleTask,
    deleteTask,
    deleteRule,
    subscribeToTasks 
  } = useStore();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToTasks(user.uid);
    return () => unsubscribe();
  }, [user, subscribeToTasks]);

  const addTask = async (task: Omit<Task, "id" | "createdAt" | "completed">) => {
    if (!user) throw new Error("Not authenticated");
    await storeAddTask(user.uid, task);
  };

  return (
    <TaskContext.Provider
      value={{ tasks, rules, mounted, addTask, updateTask, toggleTask, deleteTask, deleteRule }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within TaskProvider");
  return ctx;
}

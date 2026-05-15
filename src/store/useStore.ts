import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
  type Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format, parseISO, addDays, addMonths } from 'date-fns';

// Types
export type Priority = "high" | "medium" | "low";
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  priority: Priority;
  category: string;
  dueDate?: string;
  isRecurring?: boolean;
  description?: string;
  ruleId?: string;
  recurrence?: {
    frequency: "daily" | "weekly" | "biweekly" | "monthly";
    daysOfWeek: number[];
  };
}

export interface RecurrenceRule {
  id: string;
  userId: string;
  title: string;
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  daysOfWeek: number[];
  category: string;
  priority: Priority;
  nextOccurrence: string;
  active: boolean;
}

interface LyraStore {
  // Theme State
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Task State
  tasks: Task[];
  rules: RecurrenceRule[];
  mounted: boolean;
  userId: string | null;
  
  // Actions
  addTask: (userId: string, task: Omit<Task, "id" | "createdAt" | "completed">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  subscribeToTasks: (userId: string) => () => void;
}

/** Convert Firestore doc data → Task object */
function docToTask(id: string, data: Record<string, unknown>): Task {
  return {
    id,
    text: data.text as string,
    completed: data.completed as boolean,
    createdAt: data.createdAt && typeof (data.createdAt as Timestamp).toMillis === "function"
        ? (data.createdAt as Timestamp).toMillis()
        : Date.now(),
    completedAt: data.completedAt && typeof (data.completedAt as Timestamp).toMillis === "function"
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

export const useStore = create<LyraStore>()(
  persist(
    (set, get) => ({
      // Theme
      theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      setTheme: (theme) => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        set({ theme });
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newTheme);
        set({ theme: newTheme });
      },

      // Tasks
      tasks: [],
      rules: [],
      mounted: false,
      userId: null,

      addTask: async (userId, task) => {
        const today = new Date().toISOString().split("T")[0];
        let ruleId: string | undefined;

        if (task.isRecurring && task.recurrence) {
          const ruleData = {
            userId,
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

        const docData = {
          userId,
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

        await addDoc(collection(db, "tasks"), docData);
      },

      updateTask: async (id, updates) => {
        const docRef = doc(db, "tasks", id);
        const { id: _id, ...cleanUpdates } = updates;
        void _id;
        await updateDoc(docRef, cleanUpdates);
      },

      toggleTask: async (id) => {
        if ("vibrate" in navigator) navigator.vibrate(50);
        const state = get();
        const task = state.tasks.find((t) => t.id === id);
        if (!task || !state.userId) return;

        if (!task.completed && task.isRecurring && task.recurrence && task.dueDate) {
          const rule = task.ruleId ? state.rules.find(r => r.id === task.ruleId) : null;
          if (!task.ruleId || (rule && rule.active)) {
            const currentDate = parseISO(task.dueDate);
            let nextDate = new Date(currentDate);
            
            switch (task.recurrence.frequency) {
              case "daily": nextDate = addDays(currentDate, 1); break;
              case "weekly": {
                const days = task.recurrence.daysOfWeek;
                if (days?.length > 0) {
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
                } else nextDate = addDays(currentDate, 7);
                break;
              }
              case "biweekly": nextDate = addDays(currentDate, 14); break;
              case "monthly": nextDate = addMonths(currentDate, 1); break;
            }

            const nextOccurrenceStr = format(nextDate, "yyyy-MM-dd");
            if (task.ruleId) {
              await updateDoc(doc(db, "recurrenceRules", task.ruleId), { nextOccurrence: nextOccurrenceStr });
            }

            await addDoc(collection(db, "tasks"), {
              userId: state.userId,
              text: task.text,
              priority: task.priority,
              category: task.category,
              dueDate: nextOccurrenceStr,
              isRecurring: true,
              recurrence: task.recurrence,
              ruleId: task.ruleId,
              completed: false,
              createdAt: serverTimestamp(),
            });
          }
        }

        await updateDoc(doc(db, "tasks", id), {
          completed: !task.completed,
          completedAt: !task.completed ? serverTimestamp() : null,
        });
      },

      deleteTask: async (id) => {
        await deleteDoc(doc(db, "tasks", id));
      },

      deleteRule: async (id) => {
        await deleteDoc(doc(db, "recurrenceRules", id));
      },

      subscribeToTasks: (userId) => {
        set({ userId });
        const tasksQuery = query(collection(db, "tasks"), where("userId", "==", userId), orderBy("createdAt", "desc"));
        const rulesQuery = query(collection(db, "recurrenceRules"), where("userId", "==", userId));

        const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
          set({ tasks: snapshot.docs.map(d => docToTask(d.id, d.data() as Record<string, unknown>)), mounted: true });
        });

        const unsubRules = onSnapshot(rulesQuery, (snapshot) => {
          set({ rules: snapshot.docs.map(d => docToRule(d.id, d.data() as Record<string, unknown>)) });
        });

        return () => {
          unsubTasks();
          unsubRules();
          set({ userId: null, mounted: false });
        };
      },
    }),
    {
      name: 'lyra-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }), 
    }
  )
);

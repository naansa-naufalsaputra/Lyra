/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthContext";

const DEFAULT_CATEGORIES = ["Personal", "Kuliah", "BEM", "Work", "Lainnya"];

interface CategoryRecord {
  id: string;
  name: string;
}

interface CategoryContextType {
  categories: string[];
  addCategory: (name: string) => Promise<void>;
  updateCategory: (currentName: string, nextName: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

function normalizeCategory(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function mergeUniqueCategories(records: CategoryRecord[]) {
  return [...new Set(records.map((record) => record.name).filter(Boolean))];
}

export function CategoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [categoryRecords, setCategoryRecords] = useState<CategoryRecord[]>([]);

  useEffect(() => {
    if (!user) {
      setCategoryRecords([]);
      return;
    }

    const categoriesRef = collection(db, "categories");
    const q = query(categoriesRef, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs
        .map((item) => {
          const data = item.data() as Record<string, unknown>;
          return {
            id: item.id,
            name: typeof data.name === "string" ? data.name : "",
          };
        })
        .filter((item) => item.name);

      setCategoryRecords(records);
    });

    return unsubscribe;
  }, [user]);

  const categories = useMemo(() => {
    const customCategories = mergeUniqueCategories(categoryRecords);
    const merged = [...DEFAULT_CATEGORIES, ...customCategories];
    return [...new Set(merged)];
  }, [categoryRecords]);

  const value = useMemo<CategoryContextType>(() => ({
    categories,
    addCategory: async (name) => {
      if (!user) return;

      const nextName = normalizeCategory(name);
      if (!nextName) return;
      if (categories.some((item) => item.toLowerCase() === nextName.toLowerCase())) return;

      await addDoc(collection(db, "categories"), {
        userId: user.uid,
        name: nextName,
        createdAt: serverTimestamp(),
      });
    },
    updateCategory: async (currentName, nextName) => {
      if (!user) return;

      const normalizedName = normalizeCategory(nextName);
      if (!normalizedName) return;
      if (categories.some((item) => item !== currentName && item.toLowerCase() === normalizedName.toLowerCase())) return;

      const record = categoryRecords.find((item) => item.name === currentName);
      if (!record) {
        await addDoc(collection(db, "categories"), {
          userId: user.uid,
          name: normalizedName,
          createdAt: serverTimestamp(),
        });
        return;
      }

      await updateDoc(doc(db, "categories", record.id), { name: normalizedName });
    },
    deleteCategory: async (name) => {
      const record = categoryRecords.find((item) => item.name === name);
      if (!record) return;
      await deleteDoc(doc(db, "categories", record.id));
    },
  }), [categories, categoryRecords, user]);

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) throw new Error("useCategories must be used within CategoryProvider");
  return context;
}

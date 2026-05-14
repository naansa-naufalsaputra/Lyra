/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DayPicker } from "react-day-picker";
import { format, isValid, parseISO } from "date-fns";
import "react-day-picker/style.css";
import { Calendar, Check, ChevronDown, Flag, Plus, Tag, Trash2, X } from "lucide-react";
import { useTaskModal } from "../context/TaskModalContext";
import { useTasks } from "../hooks/useTasks";
import { useCategories } from "../context/CategoryContext";
import type { Priority } from "./TaskCard";
import { parseSmartInput } from "../utils/smartParser";

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function formatDueDate(value: string) {
  const parsed = parseISO(value);
  if (!isValid(parsed)) return "Pilih tanggal";
  return format(parsed, "dd MMM yyyy");
}

export const AddTaskModal: React.FC = () => {
  const { isOpen, closeModal, editingTask } = useTaskModal();
  const { tasks, addTask, updateTask } = useTasks();
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("low");
  const [category, setCategory] = useState<string>("Personal");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "biweekly" | "monthly">("weekly");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);

  const [isOpenPriority, setIsOpenPriority] = useState(false);
  const [isOpenCategory, setIsOpenCategory] = useState(false);
  const [isOpenCalendar, setIsOpenCalendar] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState("");

  const priorityRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const isEditMode = !!editingTask;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (priorityRef.current && !priorityRef.current.contains(target)) setIsOpenPriority(false);
      if (categoryRef.current && !categoryRef.current.contains(target)) setIsOpenCategory(false);
      if (calendarRef.current && !calendarRef.current.contains(target)) setIsOpenCalendar(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setIsOpenPriority(false);
      setIsOpenCategory(false);
      setIsOpenCalendar(false);
      setEditingCategoryName(null);
      setEditingCategoryValue("");
      setNewCategoryName("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.text);
      setPriority(editingTask.priority);
      setCategory(editingTask.category);
      setDueDate(editingTask.dueDate || new Date().toISOString().split("T")[0]);
      setIsRecurring(editingTask.isRecurring || false);
      setFrequency(editingTask.recurrence?.frequency || "weekly");
      setDaysOfWeek(editingTask.recurrence?.daysOfWeek || []);
      return;
    }

    setTitle("");
    setPriority("low");
    setCategory(categories[0] ?? "Personal");
    setDueDate(new Date().toISOString().split("T")[0]);
    setIsRecurring(false);
    setFrequency("weekly");
    setDaysOfWeek([]);
  }, [categories, editingTask, isOpen]);

  const dueDateValue = useMemo(() => parseISO(dueDate), [dueDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextTitle = normalizeText(title);
    if (!nextTitle) return;

    const taskData = { 
      text: nextTitle, 
      priority, 
      category, 
      dueDate,
      isRecurring,
      recurrence: isRecurring ? { frequency, daysOfWeek } : undefined
    };

    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await addTask(taskData);
    }

    closeModal();
  };

  const handleAddCategory = async () => {
    const nextName = normalizeText(newCategoryName);
    if (!nextName) return;

    await addCategory(nextName);
    setCategory(nextName);
    setNewCategoryName("");
  };

  const handleRenameCategory = async () => {
    if (!editingCategoryName) return;
    const nextName = normalizeText(editingCategoryValue);
    if (!nextName) return;

    await updateCategory(editingCategoryName, nextName);
    await Promise.all(
      tasks
        .filter((task) => task.category === editingCategoryName)
        .map((task) => updateTask(task.id, { category: nextName }))
    );

    if (category === editingCategoryName) setCategory(nextName);
    setEditingCategoryName(null);
    setEditingCategoryValue("");
  };

  const handleDeleteCategory = async (name: string) => {
    const fallbackCategory = categories.find((item) => item !== name) ?? "Lainnya";

    await deleteCategory(name);
    await Promise.all(
      tasks
        .filter((task) => task.category === name)
        .map((task) => updateTask(task.id, { category: fallbackCategory }))
    );

    if (category === name) setCategory(fallbackCategory);
    if (editingCategoryName === name) {
      setEditingCategoryName(null);
      setEditingCategoryValue("");
    }
  };

  const closeAllPopovers = () => {
    setIsOpenPriority(false);
    setIsOpenCategory(false);
    setIsOpenCalendar(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              closeAllPopovers();
              closeModal();
            }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 320 }}
              className="w-full max-w-lg overflow-visible pointer-events-auto rounded-card shadow-lyra-lg border"
              style={{ 
                backgroundColor: 'var(--bg-surface)', 
                color: 'var(--text-primary)',
                borderColor: 'var(--border-default)'
              }}
            >
              <form onSubmit={handleSubmit} className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {isEditMode ? "Edit Task" : "New Task"}
                  </h2>

                  <button
                    type="button"
                    onClick={() => {
                      closeAllPopovers();
                      closeModal();
                    }}
                    className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                <input
                  autoFocus
                  type="text"
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTitle(val);
                    
                    // Auto-sync with Smart Input
                    const parsed = parseSmartInput(val, categories);
                    if (parsed.priority !== "medium" || val.includes("!")) setPriority(parsed.priority);
                    if (parsed.category !== "Personal") setCategory(parsed.category);
                    
                    if (parsed.isRecurring) {
                      setIsRecurring(true);
                      setFrequency(parsed.recurrence.frequency);
                      setDaysOfWeek(parsed.recurrence.daysOfWeek || []);
                      setDueDate(parsed.dueDate);
                    } else if (isRecurring && !val.match(/setiap|tiap|mingguan|bulanan/i)) {
                      // Only disable if user explicitly removes recurring keywords
                      setIsRecurring(false);
                    }
                  }}
                  className="w-full bg-transparent text-xl font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none mb-6"
                  style={{ color: 'var(--text-primary)' }}
                />

                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {/* Date */}
                  <div ref={calendarRef} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpenCalendar((v) => !v);
                        setIsOpenPriority(false);
                        setIsOpenCategory(false);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-pill text-sm transition-all hover:bg-black/5 dark:hover:bg-white/5 border"
                      style={{ 
                        backgroundColor: 'var(--bg-surface-elevated)', 
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-default)'
                      }}
                    >
                      <Calendar size={14} className="text-gray-500 dark:text-gray-400" />
                      <span className="min-w-[120px] text-left" style={{ color: 'var(--text-primary)' }}>
                        {formatDueDate(dueDate)}
                      </span>
                      <ChevronDown size={14} className={`transition-transform ${isOpenCalendar ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {isOpenCalendar && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
                          className="absolute left-0 z-[140] mt-2 w-[320px] rounded-card p-3 shadow-lyra-lg border"
                          style={{ 
                            backgroundColor: 'var(--bg-surface)', 
                            color: 'var(--text-primary)',
                            borderColor: 'var(--border-default)'
                          }}
                        >
                          <DayPicker
                            mode="single"
                            selected={dueDateValue}
                            onSelect={(date) => {
                              if (!date) return;
                              setDueDate(format(date, "yyyy-MM-dd"));
                              setIsOpenCalendar(false);
                            }}
                            className="[--rdp-accent-color:var(--accent)] [--rdp-background-color:rgba(0,0,0,0.06)] dark:[--rdp-background-color:rgba(255,255,255,0.08)]"
                            style={{ color: 'var(--text-primary)' }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Priority */}
                  <div ref={priorityRef} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpenPriority((v) => !v);
                        setIsOpenCalendar(false);
                        setIsOpenCategory(false);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-pill text-sm transition-all border hover:bg-black/5 dark:hover:bg-white/10"
                      style={{ 
                        backgroundColor: 'var(--bg-surface-elevated)', 
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-default)'
                      }}
                    >
                      <Flag size={14} className="text-gray-500 dark:text-gray-400" />
                      <span className="min-w-[92px] text-left" style={{ color: 'var(--text-primary)' }}>
                        {PRIORITIES.find((p) => p.value === priority)?.label}
                      </span>
                      <ChevronDown size={14} className={`transition-transform ${isOpenPriority ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {isOpenPriority && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98, y: -6 }}
                          transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
                          className="absolute left-0 z-[130] mt-2 w-44 overflow-hidden rounded-card shadow-lyra-lg border"
                          style={{ 
                            backgroundColor: 'var(--bg-surface)', 
                            color: 'var(--text-primary)',
                            borderColor: 'var(--border-default)'
                          }}
                        >
                          {PRIORITIES.map((p) => {
                            const selected = p.value === priority;
                            return (
                              <button
                                key={p.value}
                                type="button"
                                onClick={() => {
                                  setPriority(p.value);
                                  setIsOpenPriority(false);
                                }}
                                className={
                                  "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition " +
                                  (selected
                                    ? "bg-black/5 dark:bg-white/10"
                                    : "hover:bg-black/5 dark:hover:bg-white/5")
                                }
                                style={{ color: 'var(--text-primary)' }}
                              >
                                <span className="font-medium">{p.label}</span>
                                {selected && <Check size={16} className="text-accent" />}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Category */}
                  <div ref={categoryRef} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpenCategory((v) => !v);
                        setIsOpenCalendar(false);
                        setIsOpenPriority(false);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-pill text-sm transition-all border hover:bg-black/5 dark:hover:bg-white/10"
                      style={{ 
                        backgroundColor: 'var(--bg-surface-elevated)', 
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-default)'
                      }}
                    >
                      <Tag size={14} className="text-gray-500 dark:text-gray-400" />
                      <span className="min-w-[110px] text-left truncate" style={{ color: 'var(--text-primary)' }}>{category}</span>
                      <ChevronDown size={14} className={`transition-transform ${isOpenCategory ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {isOpenCategory && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98, y: -6 }}
                          transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
                          className="absolute left-0 z-[130] mt-2 w-[320px] overflow-hidden rounded-card shadow-lyra-lg border"
                          style={{ 
                            backgroundColor: 'var(--bg-surface)', 
                            color: 'var(--text-primary)',
                            borderColor: 'var(--border-default)'
                          }}
                        >
                          <div className="p-2 border-b border-gray-100 dark:border-white/10">
                            <div className="flex items-center gap-2">
                              <input
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Tambah kategori..."
                                className="h-9 flex-1 rounded-input border px-3 text-sm outline-none focus:ring-2 focus:ring-accent/30"
                                style={{ 
                                  backgroundColor: 'var(--bg-surface)', 
                                  color: 'var(--text-primary)',
                                  borderColor: 'var(--border-default)'
                                }}
                              />
                              <button
                                type="button"
                                onClick={handleAddCategory}
                                className="flex h-9 items-center gap-1.5 rounded-input bg-accent px-3 text-sm font-semibold text-white hover:bg-accent-hover transition"
                              >
                                <Plus size={16} />
                                Add
                              </button>
                            </div>
                          </div>

                          <div className="max-h-[240px] overflow-auto p-1">
                            {categories.map((item) => {
                              const selected = item === category;
                              const editing = item === editingCategoryName;

                              return (
                                <div
                                  key={item}
                                  className={
                                    "rounded-input border border-transparent " +
                                    (selected
                                      ? "bg-black/5 dark:bg-white/10"
                                      : "hover:bg-black/5 dark:hover:bg-white/5")
                                  }
                                >
                                  <div className="flex items-center gap-2 px-2 py-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCategory(item);
                                        setIsOpenCategory(false);
                                      }}
                                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                                    >
                                      <span className="truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item}</span>
                                    </button>

                                    {selected && <Check size={16} className="text-accent shrink-0" />}

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingCategoryName(item);
                                        setEditingCategoryValue(item);
                                      }}
                                      className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => void handleDeleteCategory(item)}
                                      className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-destructive"
                                      aria-label={`Delete category ${item}`}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>

                                  <AnimatePresence>
                                    {editing && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="px-2 pb-2"
                                      >
                                        <div className="flex items-center gap-2">
                                          <input
                                            value={editingCategoryValue}
                                            onChange={(e) => setEditingCategoryValue(e.target.value)}
                                            className="h-9 flex-1 rounded-input border px-3 text-sm outline-none focus:ring-2 focus:ring-accent/30"
                                            style={{ 
                                              backgroundColor: 'var(--bg-surface)', 
                                              color: 'var(--text-primary)',
                                              borderColor: 'var(--border-default)'
                                            }}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => void handleRenameCategory()}
                                            className="h-9 rounded-input px-3 text-sm font-semibold transition"
                                            style={{ 
                                              backgroundColor: 'var(--bg-surface-elevated)', 
                                              color: 'var(--text-primary)'
                                            }}
                                          >
                                            Save
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingCategoryName(null);
                                              setEditingCategoryValue("");
                                            }}
                                            className="h-9 rounded-input px-3 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Recurring UI */}
                <div className="mb-6 p-4 rounded-card border border-default bg-surface-elevated/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isRecurring ? 'bg-accent/10 text-accent' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}>
                         <Plus size={16} className={isRecurring ? 'rotate-45 transition-transform' : 'transition-transform'} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Berulang Mingguan</p>
                        <p className="text-xs text-secondary">Generate otomatis untuk minggu depan</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsRecurring(!isRecurring)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isRecurring ? 'bg-accent' : 'bg-gray-300 dark:bg-white/10'}`}
                    >
                      <motion.span
                        animate={{ x: isRecurring ? 22 : 2 }}
                        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm"
                      />
                    </button>
                  </div>

                  <AnimatePresence>
                    {isRecurring && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex justify-between gap-2 pt-2">
                          {[
                            { label: 'S', value: 1 },
                            { label: 'S', value: 2 },
                            { label: 'R', value: 3 },
                            { label: 'K', value: 4 },
                            { label: 'J', value: 5 },
                            { label: 'S', value: 6 },
                            { label: 'M', value: 0 },
                          ].map((day) => {
                            const isSelected = daysOfWeek.includes(day.value);
                            return (
                              <button
                                key={day.value + day.label}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setDaysOfWeek(daysOfWeek.filter(d => d !== day.value));
                                  } else {
                                    setDaysOfWeek([...daysOfWeek, day.value]);
                                  }
                                }}
                                className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all border ${
                                  isSelected 
                                    ? 'bg-accent border-accent text-white shadow-sm' 
                                    : 'bg-surface border-default text-secondary hover:border-strong'
                                }`}
                              >
                                {day.label}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      closeAllPopovers();
                      closeModal();
                    }}
                    className="px-4 py-2 rounded-pill text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!normalizeText(title)}
                    className="flex items-center gap-2 px-6 py-2 rounded-pill bg-accent text-white font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lyra-sm"
                  >
                    {isEditMode ? <Check size={18} /> : <Plus size={18} />}
                    <span>{isEditMode ? "Save Changes" : "Create Task"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

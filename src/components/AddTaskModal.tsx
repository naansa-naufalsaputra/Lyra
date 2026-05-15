import React, { useState } from "react";
import { X, Calendar, Flag, Tag, ChevronDown, Plus, Home, Briefcase, Zap, BookOpen, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { useTaskModal } from "../context/TaskModalContext";
import { useTasks } from "../hooks/useTasks";
import { Task } from "./TaskCard";

const PRIORITIES = [
  { value: "low", label: "Low", color: "text-blue-500", bg: "bg-blue-500/10" },
  { value: "medium", label: "Medium", color: "text-amber-500", bg: "bg-amber-500/10" },
  { value: "high", label: "High", color: "text-red-500", bg: "bg-red-500/10" },
];

const CATEGORIES = [
  { name: "Personal", icon: Home },
  { name: "Work", icon: Briefcase },
  { name: "Urgent", icon: Zap },
  { name: "Study", icon: BookOpen },
  { name: "Other", icon: Layers },
];

export function AddTaskModal() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isOpen, closeModal, editingTask } = useTaskModal();
  const { addTask, updateTask } = useTasks();
  
  const isEditMode = !!editingTask;

  // Key-based re-initialization:
  // Instead of useEffect, we'll use a unique key for the form content.
  // When isOpen changes or editingTask changes, the key changes,
  // causing the component to re-mount with fresh initial state.
  const modalKey = isOpen ? (editingTask?.id || "new-task") : "closed";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />

          <AddTaskModalContent 
            key={modalKey}
            t={t}
            theme={theme}
            isEditMode={isEditMode}
            editingTask={editingTask}
            addTask={addTask}
            updateTask={updateTask}
            closeModal={closeModal}
          />
        </div>
      )}
    </AnimatePresence>
  );
}

interface AddTaskModalContentProps {
  t: (key: string) => string;
  theme: string;
  isEditMode: boolean;
  editingTask: Task | null;
  addTask: (task: Omit<Task, "id" | "createdAt" | "completed">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  closeModal: () => void;
}

function AddTaskModalContent({ 
  t, theme, isEditMode, editingTask, addTask, updateTask, closeModal 
}: AddTaskModalContentProps) {
  const [title, setTitle] = useState(editingTask?.text || "");
  const [dueDate, setDueDate] = useState<Date>(editingTask?.dueDate ? new Date(editingTask.dueDate) : new Date());
  const [priority, setPriority] = useState<"low" | "medium" | "high">((editingTask?.priority as "low" | "medium" | "high") || "low");
  const [category, setCategory] = useState(editingTask?.category || "Personal");
  const [isRecurring, setIsRecurring] = useState(editingTask?.isRecurring || false);

  const [isOpenCalendar, setIsOpenCalendar] = useState(false);
  const [isOpenPriority, setIsOpenPriority] = useState(false);
  const [isOpenCategory, setIsOpenCategory] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      text: title,
      dueDate: dueDate.toISOString(),
      priority: priority as "low" | "medium" | "high",
      category,
      isRecurring,
    };

    if (isEditMode && editingTask) {
      await updateTask(editingTask.id, {
        text: title,
        dueDate: dueDate.toISOString(),
        priority: priority as "low" | "medium" | "high",
        category,
        isRecurring,
      });
    } else {
      await addTask(taskData);
    }
    
    closeModal();
  };

  const closeAllPopovers = () => {
    setIsOpenCalendar(false);
    setIsOpenPriority(false);
    setIsOpenCategory(false);
  };

  const textStyle = { color: theme === 'dark' ? '#ffffff' : '#1a1a1a' };
  const secondaryTextStyle = { color: theme === 'dark' ? '#9ca3af' : '#4b5563' };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="relative w-full max-w-lg overflow-visible rounded-card bg-surface shadow-2xl border border-default p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold" style={textStyle}>
          {isEditMode ? t("common.edit_task") : t("common.add_task")}
        </h2>
        <button 
          onClick={closeModal} 
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          style={secondaryTextStyle}
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("common.placeholder")}
            className="w-full bg-transparent text-xl font-medium focus:outline-none placeholder:text-tertiary transition-all"
            style={textStyle}
          />
          <div className="h-0.5 w-0 group-focus-within:w-full bg-accent transition-all duration-300 rounded-full mt-1" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeAllPopovers();
                setIsOpenCalendar(!isOpenCalendar);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-pill text-sm border border-default bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            >
              <Calendar size={14} style={secondaryTextStyle} />
              <span className="font-medium" style={secondaryTextStyle}>
                {format(dueDate, "dd MMM yyyy")}
              </span>
              <ChevronDown size={14} className={`transition-transform ${isOpenCalendar ? "rotate-180" : ""}`} style={secondaryTextStyle} />
            </button>

            <AnimatePresence>
              {isOpenCalendar && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 z-[60] bg-surface border border-strong rounded-card shadow-lyra-lg p-2 min-w-[280px] glow-accent"
                >
                  <DayPicker
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      if (date) setDueDate(date);
                      setIsOpenCalendar(false);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeAllPopovers();
                setIsOpenPriority(!isOpenPriority);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-pill text-sm border border-default bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            >
              <Flag size={14} className={PRIORITIES.find(p => p.value === priority)?.color} />
              <span className="font-medium" style={secondaryTextStyle}>
                {PRIORITIES.find(p => p.value === priority)?.label}
              </span>
              <ChevronDown size={14} className={`transition-transform ${isOpenPriority ? "rotate-180" : ""}`} style={secondaryTextStyle} />
            </button>

            <AnimatePresence>
              {isOpenPriority && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 z-[60] w-40 bg-surface border border-default rounded-card shadow-2xl overflow-hidden"
                >
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => {
                        setPriority(p.value);
                        setIsOpenPriority(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                    >
                      <Flag size={14} className={p.color} />
                      <span className="text-sm font-medium" style={textStyle}>{p.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeAllPopovers();
                setIsOpenCategory(!isOpenCategory);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-pill text-sm border border-default bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            >
              {(() => {
                const Icon = CATEGORIES.find(c => c.name === category)?.icon || Tag;
                return <Icon size={14} style={secondaryTextStyle} />;
              })()}
              <span className="font-medium truncate max-w-[100px]" style={secondaryTextStyle}>{category}</span>
              <ChevronDown size={14} className={`transition-transform ${isOpenCategory ? "rotate-180" : ""}`} style={secondaryTextStyle} />
            </button>

            <AnimatePresence>
              {isOpenCategory && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 z-[60] w-48 bg-surface border border-default rounded-card shadow-2xl overflow-hidden"
                >
                  <div className="max-h-60 overflow-y-auto">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => {
                          setCategory(cat.name);
                          setIsOpenCategory(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                      >
                        <cat.icon size={14} className="text-accent" />
                        <span className="text-sm font-medium" style={textStyle}>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-4 rounded-card border border-default bg-gray-50/50 dark:bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${isRecurring ? 'bg-accent text-white shadow-lg' : 'bg-gray-200 dark:bg-white/10 text-gray-500'}`}>
              <Plus size={18} className={isRecurring ? 'rotate-45 transition-transform' : 'transition-transform'} />
            </div>
            <div>
              <p className="text-sm font-bold" style={textStyle}>{t("settings.recurrence")}</p>
              <p className="text-xs" style={secondaryTextStyle}>Auto-generate for next week</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsRecurring(!isRecurring)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none ${isRecurring ? 'bg-accent' : 'bg-gray-300 dark:bg-white/10 shadow-inner'}`}
          >
            <motion.span
              animate={{ x: isRecurring ? 24 : 4 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
            />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-default">
          <button
            type="button"
            onClick={closeModal}
            className="px-6 py-2.5 text-sm font-bold transition-colors hover:opacity-70"
            style={secondaryTextStyle}
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="px-8 py-2.5 rounded-pill bg-accent text-white text-sm font-bold shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all"
          >
            {isEditMode ? "Save Changes" : "Create Task"}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

import { motion, AnimatePresence } from "framer-motion";
import { X, AlignLeft, Clock, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { useTaskModal } from "../context/TaskModalContext";
import { Priority, Task } from "./TaskCard";
import { format, parseISO } from "date-fns";
import { useCategories } from "../context/CategoryContext";

/* eslint-disable react-hooks/set-state-in-effect */
export function TaskDetailSheet() {
  const { detailTask, closeDetail } = useTaskModal();
  const { updateTask, deleteTask } = useTasks();
  const { categories } = useCategories();
  const [localTask, setLocalTask] = useState<Task | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (detailTask) {
      setLocalTask(detailTask);
    } else {
      setLocalTask(null);
    }
  }, [detailTask]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [localTask?.description]);

  if (!detailTask && !localTask) return null;

  const activeTask = localTask || detailTask;
  if (!activeTask) return null;

  const handleUpdate = async (updates: Partial<Task>) => {
    if (!activeTask) return;
    setLocalTask(prev => prev ? { ...prev, ...updates } : null);
    await updateTask(activeTask.id, updates);
  };

  return (
    <AnimatePresence>
      {detailTask && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetail}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 z-[101] h-full w-full max-w-[450px] border-l border-default bg-[#0f1011]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="mb-8 flex items-center justify-between">
                <button
                  onClick={closeDetail}
                  className="flex h-10 w-10 items-center justify-center rounded-pill text-tertiary transition-colors hover:bg-surface-hover hover:text-primary cursor-pointer"
                >
                  <X size={20} />
                </button>
                <button
                  onClick={() => {
                    deleteTask(activeTask.id);
                    closeDetail();
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-pill text-tertiary transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Title */}
              <input
                type="text"
                value={activeTask.text}
                onChange={(e) => handleUpdate({ text: e.target.value })}
                className="mb-6 w-full bg-transparent text-2xl font-bold text-primary outline-none focus:ring-0"
                placeholder="Judul Tugas"
              />

              {/* Meta Grid */}
              <div className="mb-8 space-y-6">
                {/* Status & Priority Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">Status</span>
                    <button
                      onClick={() => handleUpdate({ completed: !activeTask.completed })}
                      className={`flex w-full items-center gap-2 rounded-lg border border-default px-3 py-2 text-xs font-semibold transition-all hover:bg-surface-hover cursor-pointer ${
                        activeTask.completed ? "text-accent border-accent/30 bg-accent/5" : "text-primary bg-surface"
                      }`}
                    >
                      <div className={`h-1.5 w-1.5 rounded-full ${activeTask.completed ? "bg-accent shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]" : "bg-tertiary/40"}`} />
                      {activeTask.completed ? "Selesai" : "Belum Selesai"}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">Priority</span>
                    <div className="flex gap-1">
                      {(["low", "medium", "high"] as Priority[]).map((p) => (
                        <button
                          key={p}
                          onClick={() => handleUpdate({ priority: p })}
                          className={`flex-1 rounded-pill border py-1.5 text-[9px] font-bold uppercase transition-all cursor-pointer ${
                            activeTask.priority === p
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-default text-tertiary hover:border-strong bg-surface"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category & Date Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">Category</span>
                    <select
                      value={activeTask.category}
                      onChange={(e) => handleUpdate({ category: e.target.value })}
                      className="w-full rounded-lg border border-default bg-surface px-3 py-2 text-xs font-semibold text-primary outline-none focus:border-accent cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c} className="bg-[#1a1b1e]">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">Due Date</span>
                    <div className="flex h-[38px] items-center gap-2 rounded-lg border border-default bg-surface px-3 text-xs font-semibold text-secondary">
                      <Clock size={14} className="text-tertiary" />
                      {activeTask.dueDate ? format(parseISO(activeTask.dueDate), "dd MMM yyyy") : "No Date"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-1 flex-col space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-tertiary">
                  <AlignLeft size={14} className="text-accent/60" />
                  Notes
                </div>
                <div className="flex-1 rounded-xl border border-default bg-surface/30 p-4 backdrop-blur-sm">
                  <textarea
                    ref={textareaRef}
                    value={activeTask.description || ""}
                    onChange={(e) => handleUpdate({ description: e.target.value })}
                    placeholder="Tambahkan catatan atau deskripsi di sini..."
                    className="w-full min-h-[150px] resize-none bg-transparent text-[14px] leading-relaxed text-primary placeholder:text-tertiary/40 outline-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

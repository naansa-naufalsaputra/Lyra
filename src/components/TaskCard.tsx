import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Trash2, Pencil, RefreshCcw, AlignLeft } from "lucide-react";
import { isToday, isTomorrow, parseISO, format } from "date-fns";
import { useTaskModal } from "../context/TaskModalContext";
import { useTasks } from "../hooks/useTasks";

export type Priority = "high" | "medium" | "low";
export type Category = string;

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  priority: Priority;
  category: Category;
  dueDate?: string;
  isRecurring?: boolean;
  description?: string;
  ruleId?: string; // Link to the master recurrence rule
  recurrence?: {
    frequency: "daily" | "weekly" | "biweekly" | "monthly";
    daysOfWeek: number[];
  };
}

export type NewTask = Omit<Task, "id" | "createdAt" | "completed">;

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

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { openModal, openDetail } = useTaskModal();
  const { rules } = useTasks();

  const rule = task.ruleId ? rules.find(r => r.id === task.ruleId) : null;

  const priorityColors = {
    high: "var(--priority-high)",
    medium: "var(--priority-medium)",
    low: "var(--priority-low)",
  };

  const urgencyLabel = useMemo(() => {
    if (!task.dueDate || task.completed) return null;

    const date = parseISO(task.dueDate);
    if (isToday(date)) return "Hari Ini";
    if (isTomorrow(date)) return "Besok";
    return null;
  }, [task.completed, task.dueDate]);

  const urgencyClass = urgencyLabel === "Hari Ini"
    ? "border-red-400/40 shadow-red-500/10"
    : urgencyLabel === "Besok"
      ? "border-amber-400/40 shadow-amber-500/10"
      : task.completed
        ? ""
        : "hover:border-strong";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{
        layout: { duration: 0.3, ease: [0.2, 0, 0, 1] },
        opacity: { duration: 0.2 },
        y: { duration: 0.3, ease: [0.2, 0, 0, 1] },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      <div
        onClick={() => openDetail(task)}
        className={`
          relative flex items-start gap-3 rounded-card border border-default bg-surface p-[18px] sm:p-5
          shadow-lyra-sm transition-all duration-200 surface-edge
          hover:bg-surface-hover hover:shadow-lyra-md hover:-translate-y-[0.5px] cursor-pointer
          ${task.completed ? "opacity-75" : urgencyClass}
        `}
      >
        {/* Priority Indicator - Subtle left border */}
        <div 
          className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full transition-colors"
          style={{ backgroundColor: priorityColors[task.priority] }}
        />

        {/* Checkbox */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            if (navigator.vibrate) navigator.vibrate(10);
            onToggle(task.id);
          }}
          className="relative mt-0.5 flex h-[20px] w-[20px] shrink-0 items-center justify-center cursor-pointer"
          whileTap={{ scale: 0.9 }}
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        >
          <div
            className={`
              absolute inset-0 rounded-[6px] border-[1.5px] transition-all duration-200
              ${task.completed
                ? "border-accent bg-accent"
                : "border-strong bg-transparent group-hover:border-accent/50"
              }
            `}
          />
          <AnimatePresence>
            {task.completed && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
              >
                <Check size={12} strokeWidth={3} className="text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Task Text */}
        <div className="min-w-0 flex-1 ml-1">
          <div className="relative">
            <div className="flex flex-col gap-0.5">
              <div
                className={`
                  text-[15px] leading-[22px] transition-colors duration-300 font-sans tracking-editorial
                  ${task.completed ? "text-secondary" : "text-primary"}
                `}
              >
                <div className="flex items-center gap-1.5">
                  {task.text}
                  {task.description && (
                    <AlignLeft size={12} className="text-tertiary ml-0.5 opacity-60" />
                  )}
                </div>
              </div>
              
              {rule && rule.active && (
                <div className="flex items-center gap-1.5 text-[11px] text-secondary/60 font-medium">
                  <RefreshCcw size={10} className="text-accent/50" />
                  <span>Jadwal Berikutnya: {format(parseISO(rule.nextOccurrence), "dd MMM")}</span>
                </div>
              )}
            </div>
            
            {/* Animated strikethrough */}
            <motion.div
              className="absolute left-0 top-[11px] h-[1.2px] bg-secondary origin-left"
              initial={false}
              animate={{
                scaleX: task.completed ? 1 : 0,
                opacity: task.completed ? 0.6 : 0,
              }}
              transition={{
                duration: 0.3,
                ease: [0.2, 0, 0, 1],
              }}
              style={{ width: "100%" }}
            />
          </div>
          
          {/* Metadata / Tags */}
          {!task.completed && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
               {/* Priority Badge */}
               <span 
                className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[4px] bg-app/50 border border-default"
                style={{ color: priorityColors[task.priority] }}
               >
                 {task.priority}
               </span>

               {/* Category Badge */}
                 <span 
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-pill border"
                  style={{ 
                    backgroundColor: task.category === "Kuliah" ? "var(--cat-cyan-bg)" : 
                                     task.category === "BEM" ? "var(--cat-rose-bg)" : 
                                     task.category === "Personal" ? "var(--cat-mint-bg)" : 
                                     task.category === "Work" ? "var(--cat-sky-bg)" : 
                                     "rgba(245, 158, 11, 0.14)",
                    color: task.category === "Kuliah" ? "var(--cat-cyan-text)" : 
                           task.category === "BEM" ? "var(--cat-rose-text)" : 
                           task.category === "Personal" ? "var(--cat-mint-text)" : 
                           task.category === "Work" ? "var(--cat-sky-text)" : 
                           "#fbbf24",
                    borderColor: "transparent"
                  }}
                 >
                   {task.category}
                 </span>

                {task.dueDate && (
                  <div className="ml-auto flex items-center gap-2 sm:ml-1">
                    {urgencyLabel && (
                      <span
                        className={`
                          rounded-pill border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em]
                          ${urgencyLabel === "Hari Ini"
                            ? "border-red-400/30 bg-red-500/10 text-red-200"
                            : "border-amber-400/30 bg-amber-500/10 text-amber-200"
                          }
                        `}
                      >
                        {urgencyLabel}
                      </span>
                    )}
                    <span className="text-[11px] font-medium text-tertiary flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-tertiary/40" />
                      {format(parseISO(task.dueDate), "dd MMM")}
                      {task.dueDate.includes("T") && (
                        <>
                          <span className="mx-0.5 opacity-40">•</span>
                          <span>{format(parseISO(task.dueDate), "HH:mm")}</span>
                        </>
                      )}
                    </span>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <AnimatePresence>
          {(isHovered || task.completed) && (
            <motion.div 
              className="flex items-center gap-1"
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 4 }}
            >
              {!task.completed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(task);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-pill text-tertiary transition-colors hover:bg-surface-hover hover:text-accent cursor-pointer"
                  aria-label="Edit task"
                >
                  <Pencil size={14} strokeWidth={2} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-pill text-tertiary transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                aria-label="Delete task"
              >
                <Trash2 size={14} strokeWidth={2} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

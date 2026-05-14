import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutPanelTop, Plus } from "lucide-react";
import { TaskCard, Priority } from "../components/TaskCard";
import { ReminderBanner } from "../components/ReminderBanner";
import { useTasks } from "../hooks/useTasks";
import { useCategories } from "../context/CategoryContext";
import { EmptyState } from "../components/EmptyState";
import { DashboardSkeleton } from "../components/SkeletonLoader";
import { parseSmartInput } from "../utils/smartParser";

export function Dashboard() {
  const { tasks, mounted, addTask, toggleTask, deleteTask } = useTasks();
  const { categories } = useCategories();
  const [inputValue, setInputValue] = useState("");
  const [priority, setPriority] = useState<Priority>("low");
  const [category, setCategory] = useState<string>("Personal");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const parsed = parseSmartInput(inputValue, categories);

    await addTask({
      text: parsed.text,
      priority: parsed.priority || priority,
      category: parsed.category || category,
      dueDate: parsed.dueDate,
      isRecurring: parsed.isRecurring,
      recurrence: parsed.recurrence
    });

    setInputValue("");
    setPriority("low");
    setCategory("Personal");
    inputRef.current?.focus();
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    const cat = task.category || "Personal";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(task);
    return acc;
  }, {} as Record<string, typeof tasks>);

  const sortedCategories = Object.keys(groupedTasks).sort((a, b) => {
    if (a === "Personal") return -1;
    if (b === "Personal") return 1;
    return a.localeCompare(b);
  });

  if (!mounted) {
    return (
      <div className="mx-auto w-full max-w-[600px] px-4 pt-8 sm:pt-12 pb-24">
        <div className="h-32 mb-10 rounded-card bg-surface/50 border border-default animate-pulse" />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[600px] px-4 pt-8 sm:pt-12 pb-24">
      <ReminderBanner />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <form onSubmit={handleAddTask} className="group relative space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Add a task..."
                className="h-[48px] w-full rounded-input border border-default bg-surface px-4 text-[15px] text-primary placeholder:text-tertiary outline-none transition-all shadow-lyra-sm focus:border-accent"
              />
            </div>
            <motion.button
              type="submit"
              disabled={!inputValue.trim()}
              whileTap={{ scale: 0.96 }}
              className="flex h-[48px] items-center gap-1.5 rounded-input bg-accent px-5 text-[14px] font-semibold text-white shadow-lyra-sm transition-all hover:bg-accent-hover disabled:opacity-40"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span className="hidden sm:inline">Add Task</span>
            </motion.button>
          </div>

          <p className="px-1 text-xs text-gray-500 tracking-[0.01em]">
            Ketik 'Tugas PBO besok !high #kuliah' lalu tekan Enter ↵
          </p>

          <div className="flex flex-wrap items-center gap-4 px-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-tertiary uppercase tracking-widest">Priority</span>
              <div className="flex gap-1.5">
                {(["low", "medium", "high"] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`
                      px-2.5 py-0.5 rounded-pill text-[11px] font-semibold transition-all border
                      ${priority === p 
                        ? "bg-accent/10 border-accent text-accent" 
                        : "bg-surface border-default text-secondary hover:border-strong"
                      }
                    `}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              <span className="text-[11px] font-bold text-tertiary uppercase tracking-widest">Category</span>
              <div className="flex gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`
                      px-2.5 py-0.5 rounded-pill text-[11px] font-semibold transition-all border
                      ${category === c 
                        ? "bg-accent/10 border-accent text-accent" 
                        : "bg-surface border-default text-secondary hover:border-strong"
                      }
                    `}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </motion.div>

      <div className="space-y-8">
        <AnimatePresence initial={false} mode="popLayout">
          {tasks.length > 0 ? (
            sortedCategories.map((cat) => (
              <motion.section 
                key={cat} 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-3 px-1 mb-2">
                  <h3 className="text-[10px] font-bold text-tertiary uppercase tracking-[0.2em]">
                    {cat}
                  </h3>
                  <div className="h-[1px] flex-1 bg-default/50" />
                  <span className="text-[10px] font-medium text-tertiary/60">
                    {groupedTasks[cat].length}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {groupedTasks[cat].map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              </motion.section>
            ))
          ) : (
            <EmptyState
              icon={LayoutPanelTop}
              title="Semua beres!"
              description="Waktunya istirahat sejenak. Radar Anda bersih dari tugas."
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

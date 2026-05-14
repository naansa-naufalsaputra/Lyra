import { motion, AnimatePresence } from "framer-motion";
import { History as HistoryIcon, RotateCcw, Trash2, CheckCircle2, Trash } from "lucide-react";
import { useTasks } from "../hooks/useTasks";

export function History() {
  const { tasks, toggleTask, deleteTask } = useTasks();
  const completedTasks = tasks.filter(t => t.completed).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  const clearAllHistory = () => {
    if (window.confirm("Are you sure you want to clear all history? This cannot be undone.")) {
      completedTasks.forEach(task => deleteTask(task.id));
    }
  };

  return (
    <div className="mx-auto w-full max-w-[600px] px-4 pt-8 sm:pt-12 pb-24">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2.5">
          <HistoryIcon size={24} className="text-accent" />
          History
        </h2>
        {completedTasks.length > 0 && (
          <button
            onClick={clearAllHistory}
            className="flex items-center gap-2 px-3 py-1.5 rounded-pill text-sm text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
          >
            <Trash size={14} />
            Clear All
          </button>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {completedTasks.length > 0 ? (
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98, x: -20 }}
                className="group relative p-4 rounded-card glass bg-surface border-default flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex-shrink-0 text-accent">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-primary font-medium line-through opacity-60 truncate">
                      {task.text}
                    </h3>
                    <p className="text-[10px] text-tertiary uppercase tracking-wider font-semibold">
                      Completed {new Date(task.completedAt || 0).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleTask(task.id)}
                    title="Restore task"
                    className="p-2 rounded-lg text-secondary hover:text-accent hover:bg-accent/10 transition-all"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    title="Delete permanently"
                    className="p-2 rounded-lg text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="h-16 w-16 bg-surface-hover rounded-full flex items-center justify-center mb-4 border border-default text-tertiary opacity-40">
              <HistoryIcon size={24} />
            </div>
            <h4 className="text-primary font-semibold mb-1">Clean slate.</h4>
            <p className="text-secondary text-sm">Your completed tasks will appear here.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

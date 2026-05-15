import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, X } from "lucide-react";
import { isToday, isTomorrow, parseISO } from "date-fns";
import { useTasks } from "../hooks/useTasks";

export function ReminderBanner() {
  const { tasks } = useTasks();
  const [dismissed, setDismissed] = useState(false);

  const dueClassTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (task.completed || task.category !== "Kuliah" || !task.dueDate) return false;
      const dueDate = parseISO(task.dueDate);
      return isToday(dueDate) || isTomorrow(dueDate);
    });
  }, [tasks]);

  const todayCount = useMemo(
    () => dueClassTasks.filter((task) => task.dueDate && isToday(parseISO(task.dueDate))).length,
    [dueClassTasks]
  );

  const tomorrowCount = dueClassTasks.length - todayCount;

  if (dismissed || dueClassTasks.length === 0) return null;

  const message =
    todayCount > 0
      ? `Pengingat: Ada ${todayCount} jadwal kuliah hari ini!`
      : `Pengingat: Ada ${tomorrowCount} jadwal kuliah besok!`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.28, ease: [0.2, 0, 0, 1] }}
        className="sticky top-[72px] z-40 mb-4"
      >
        <div className="flex items-center gap-3 rounded-card border border-amber-400/20 bg-amber-400/10 px-4 py-3 shadow-lyra-md backdrop-blur-xl glow-accent">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-500 dark:text-amber-200">
            <Bell size={16} />
          </div>
          <p className="flex-1 text-sm font-medium text-amber-800 dark:text-amber-100">{message}</p>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/5 dark:border-white/10 text-amber-800/80 dark:text-amber-100/80 transition hover:bg-black/5 dark:hover:bg-white/10 hover:text-amber-900 dark:hover:text-amber-100"
            aria-label="Dismiss reminder"
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

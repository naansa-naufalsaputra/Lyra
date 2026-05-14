import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Plus, LayoutPanelTop } from "lucide-react";
import { TaskCard } from "../components/TaskCard";
import { useTasks } from "../hooks/useTasks";
import { useTaskModal } from "../context/TaskModalContext";
import { EmptyState } from "../components/EmptyState";
import { DashboardSkeleton } from "../components/SkeletonLoader";

export function Upcoming() {
  const { tasks, mounted, toggleTask, deleteTask } = useTasks();
  const { openModal } = useTaskModal();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Generate 14 days starting from today for the weekly strip
  const stripDates = useMemo(() => {
    const arr = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, []);

  const selectedDateString = selectedDate?.toISOString().split('T')[0];

  const hasTaskOnDate = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    return tasks.some(t => t.dueDate === dStr && !t.completed);
  };

  // Grouping logic for the Grouped Feed (Today, Tomorrow, Week, etc.)
  const groupedTasks = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const todayTasks = tasks.filter(t => t.dueDate === todayStr);
    const tomorrowTasks = tasks.filter(t => t.dueDate === tomorrowStr);
    const thisWeekTasks = tasks.filter(t => t.dueDate && t.dueDate > tomorrowStr && t.dueDate <= weekEndStr);
    const laterTasks = tasks.filter(t => t.dueDate && t.dueDate > weekEndStr);
    
    return [
      { title: "Hari Ini", tasks: todayTasks },
      { title: "Besok", tasks: tomorrowTasks },
      { title: "Minggu Ini", tasks: thisWeekTasks },
      { title: "Mendatang", tasks: laterTasks }
    ].filter(group => group.tasks.length > 0);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (!selectedDateString) return [];
    return tasks.filter(task => task.dueDate === selectedDateString);
  }, [tasks, selectedDateString]);

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (selectedDateString === dateStr) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };

  if (!mounted) {
    return (
      <div className="mx-auto w-full max-w-[600px] px-4 pt-8 sm:pt-12 pb-24">
        <div className="h-8 w-40 mb-8 rounded-md bg-surface/50 border border-default animate-pulse" />
        <div className="h-20 mb-10 rounded-card bg-surface/50 border border-default animate-pulse" />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[600px] px-4 pt-8 sm:pt-12 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2.5">
          <CalendarIcon size={24} className="text-accent" />
          Upcoming
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setSelectedDate(null)}
            className={`text-[12px] font-bold px-3 py-1.5 rounded-pill transition-all ${!selectedDate ? "bg-accent text-white" : "text-accent bg-accent/10 hover:bg-accent/20"}`}
          >
            Semua Jadwal
          </button>
        </div>
      </div>

      {/* Weekly Strip */}
      <div className="mb-10">
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 scroll-smooth">
          {stripDates.map((date, i) => {
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = dateStr === selectedDateString;
            const isToday = i === 0;
            const hasTasks = hasTaskOnDate(date);
            
            return (
              <motion.button
                key={dateStr}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDateClick(date)}
                className={`
                  relative flex flex-col items-center justify-center min-w-[56px] h-[76px] rounded-card border transition-all duration-200
                  ${isSelected 
                    ? "bg-accent border-accent text-white shadow-lyra-md" 
                    : "bg-surface border-default text-primary hover:border-strong"
                  }
                `}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isSelected ? "text-white/80" : "text-tertiary"}`}>
                  {date.toLocaleDateString('id-ID', { weekday: 'short' })}
                </span>
                <span className="text-lg font-bold leading-none">
                  {date.getDate()}
                </span>
                
                {/* Task Indicator Dot */}
                {hasTasks && (
                  <div className={`absolute bottom-2.5 h-1 w-1 rounded-full ${isSelected ? "bg-white" : "bg-accent"}`} />
                )}
                
                {/* Today Indicator */}
                {isToday && !isSelected && (
                  <div className="absolute top-1.5 right-1.5 h-1 w-1 rounded-full bg-accent" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Task List Feed */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-bold text-tertiary uppercase tracking-[0.15em]">
            {!selectedDate 
              ? "Garis Waktu" 
              : selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-1.5 text-accent hover:text-accent-hover transition-colors text-sm font-semibold"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Tambah Tugas</span>
          </button>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {!selectedDate ? (
              <motion.div
                key="grouped-feed"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-10"
              >
                {groupedTasks.length > 0 ? (
                  groupedTasks.map((group) => (
                    <div key={group.title} className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="text-[12px] font-bold text-secondary bg-surface-hover px-2.5 py-1 rounded-md border border-default">
                          {group.title}
                        </span>
                        <div className="h-[1px] flex-1 bg-default opacity-50" />
                      </div>
                      <div className="space-y-3">
                        {group.tasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={LayoutPanelTop}
                    title="Cakrawala bersih!"
                    description="Tidak ada tugas mendatang dalam radar Anda. Waktunya bersantai."
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="filtered-feed"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={CalendarIcon}
                    title="Hari yang tenang"
                    description="Tidak ada tugas untuk tanggal yang dipilih."
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

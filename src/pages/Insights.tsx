import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, Flame, Timer, TrendingUp, Plus } from "lucide-react";
import { useTasks } from "../hooks/useTasks";
import { useCategories } from "../context/CategoryContext";
import { useTaskModal } from "../context/TaskModalContext";
import { EmptyState } from "../components/EmptyState";

export function Insights() {
  const { tasks } = useTasks();
  const { categories } = useCategories();
  const { openModal } = useTaskModal();

  const stats = useMemo(() => {
    const completedTasks = tasks.filter(t => t.completed);
    const completedCount = completedTasks.length;
    
    // Calculate streak (consecutive days with at least one task completed)
    const completionDates = new Set(
      completedTasks
        .filter(t => t.completedAt)
        .map(t => new Date(t.completedAt!).toISOString().split('T')[0])
    );
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (completionDates.has(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Chart data: tasks completed in the last 7 days
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const chartData = Array(7).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const count = completedTasks.filter(t => 
        t.completedAt && new Date(t.completedAt).toISOString().split('T')[0] === dateStr
      ).length;
      return { day: days[d.getDay()], count };
    });

    return { completedCount, streak, chartData };
  }, [tasks]);

  return (
    <div className="mx-auto w-full max-w-[600px] px-4 pt-8 sm:pt-12 pb-24">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2.5">
          <BarChart3 size={24} className="text-accent" />
          Insights
        </h2>
      </div>

      {tasks.length > 0 ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Done", value: stats.completedCount, icon: CheckCircle2, color: "text-emerald-500" },
              { label: "Streak", value: `${stats.streak}d`, icon: Flame, color: "text-orange-500" },
              { label: "Tasks", value: tasks.length, icon: Timer, color: "text-blue-500" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface border border-default rounded-card p-4 flex flex-col items-center text-center shadow-lyra-sm"
              >
                <item.icon size={18} className={`${item.color} mb-2`} />
                <span className="text-xl font-bold text-primary">{item.value}</span>
                <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider">{item.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Productivity Chart */}
          <section className="bg-surface border border-default rounded-card p-6 mb-8 shadow-lyra-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-accent" />
                <h3 className="font-bold text-primary">Last 7 Days</h3>
              </div>
              <span className="text-[11px] font-bold text-tertiary uppercase tracking-wider">Completed</span>
            </div>

            <div className="flex items-end justify-between h-40 gap-2">
              {stats.chartData.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.min(100, (data.count / (Math.max(...stats.chartData.map(d => d.count)) || 1)) * 100)}%` }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                    className="w-full max-w-[24px] bg-accent/20 border-t-2 border-accent rounded-t-sm relative group"
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-app text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {data.count}
                    </div>
                  </motion.div>
                  <span className="text-[10px] font-bold text-tertiary">{data.day}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Category Distribution */}
          <section className="bg-surface border border-default rounded-card p-6 shadow-lyra-sm">
            <h3 className="font-bold text-primary mb-6">Task Distribution</h3>
            <div className="space-y-5">
              {categories.map((cat) => {
                const catTasks = tasks.filter(t => t.category === cat);
                const totalTasks = tasks.length || 1;
                const percentage = (catTasks.length / totalTasks) * 100;
                
                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-secondary uppercase tracking-wider">{cat}</span>
                      <span className="text-tertiary font-medium">{catTasks.length} tasks</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden border border-default">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          cat === "Kuliah" ? "bg-blue-500" : 
                          cat === "BEM" ? "bg-purple-500" : 
                          cat === "Personal" ? "bg-emerald-500" : "bg-slate-500"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <EmptyState
          icon={BarChart3}
          title="No data insights yet"
          description="Complete some tasks to unlock your productivity analytics and streaks."
          action={
            <button 
              onClick={() => openModal()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-pill bg-accent text-white font-bold text-sm shadow-lyra-md hover:bg-accent-hover transition-all active:scale-95"
            >
              <Plus size={18} strokeWidth={2.5} />
              Add First Task
            </button>
          }
        />
      )}
    </div>
  );
}


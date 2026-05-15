import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutPanelTop, SearchX, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TaskCard, NewTask } from "../components/TaskCard";
import { ReminderBanner } from "../components/ReminderBanner";
import { useTasks } from "../hooks/useTasks";
import { useCategories } from "../context/CategoryContext";
import { EmptyState } from "../components/EmptyState";
import { DashboardSkeleton } from "../components/SkeletonLoader";
import { SmartTaskInput } from "../components/SmartTaskInput";
import { TaskFilters } from "../components/TaskFilters";
import { AiSuggestModal } from "../components/AiSuggestModal";
import { isKeyConfigured } from "../services/aiScheduler";

export function Dashboard() {
  const { t } = useTranslation();
  const { tasks, mounted, addTask, toggleTask, deleteTask } = useTasks();
  const { categories } = useCategories();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("active");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddTask = useCallback(async (taskData: NewTask) => {
    await addTask(taskData);
  }, [addTask]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const query = debouncedSearch.toLowerCase();
      const matchesSearch =
        task.text.toLowerCase().includes(query) ||
        (task.description?.toLowerCase().includes(query) ?? false);

      const matchesPriority =
        filterPriority === "all" || task.priority === filterPriority;

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" ? !task.completed : task.completed);

      const matchesCategory =
        filterCategory === "all" || 
        task.category.toLowerCase() === filterCategory.toLowerCase();

      return matchesSearch && matchesPriority && matchesStatus && matchesCategory;
    });
  }, [tasks, debouncedSearch, filterPriority, filterStatus, filterCategory]);

  const groupedTasks = useMemo(() => {
    return filteredTasks.reduce((acc, task) => {
      const catName = task.category || "Personal";
      const existingKey = Object.keys(acc).find(k => k.toLowerCase() === catName.toLowerCase());
      const key = existingKey || catName;
      
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    }, {} as Record<string, typeof tasks>);
  }, [filteredTasks]);

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
    <div className="min-h-screen bg-app transition-colors duration-300">
      <div className="mx-auto w-full max-w-[600px] px-4 pt-8 sm:pt-12 pb-24">
        <ReminderBanner />
        
        <SmartTaskInput 
          categories={categories} 
          onAdd={handleAddTask} 
        />

        {/* AI Suggest Button */}
        {isKeyConfigured() && (
          <motion.button
            onClick={() => setShowAiModal(true)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/5 via-violet-500/5 to-accent/5 text-accent font-semibold text-[13px] shadow-lyra-sm backdrop-blur-sm hover:from-accent/10 hover:via-violet-500/10 hover:to-accent/10 hover:border-accent/30 transition-all cursor-pointer"
          >
            <Sparkles size={16} />
            {t("ai.button")}
          </motion.button>
        )}

        <AiSuggestModal isOpen={showAiModal} onClose={() => setShowAiModal(false)} />

        <TaskFilters 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          filterPriority={filterPriority}
          onPriorityChange={setFilterPriority}
          filterCategory={filterCategory}
          onCategoryChange={setFilterCategory}
          categories={categories}
        />

        <div className="space-y-8">
          <AnimatePresence initial={false} mode="popLayout">
            {filteredTasks.length > 0 ? (
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
            ) : tasks.length > 0 ? (
              <EmptyState
                icon={SearchX}
                title={t("empty.no_results")}
                description={t("empty.no_results_desc")}
              />
            ) : (
              <EmptyState
                icon={LayoutPanelTop}
                title={t("empty.all_done")}
                description={t("empty.all_done_desc")}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

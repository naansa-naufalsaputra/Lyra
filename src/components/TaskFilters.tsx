import React from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: string;
  onStatusChange: (status: string) => void;
  filterPriority: string;
  onPriorityChange: (priority: string) => void;
  filterCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export const TaskFilters = React.memo(({
  searchQuery,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterPriority,
  onPriorityChange,
  filterCategory,
  onCategoryChange,
  categories
}: TaskFiltersProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mb-8 flex flex-col gap-6"
    >
      <div className="relative group flex-1 sm:min-w-[250px]">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary transition-colors group-focus-within:text-accent">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("common.search")}
          aria-label={t("common.search")}
          className="h-[44px] w-full rounded-xl border border-default bg-surface pl-11 pr-11 text-[14px] text-primary placeholder:text-tertiary outline-none transition-all shadow-sm focus:border-accent/40 focus:ring-4 focus:ring-accent/5"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-tertiary hover:text-primary transition-colors"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-6 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest whitespace-nowrap">
            {t("common.status")}
          </span>
          <div className="flex p-1 rounded-lg bg-app w-fit border border-default">
            {["all", "active", "completed"].map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                className="relative px-3 py-1 rounded-md text-[11px] font-semibold transition-colors"
              >
                {filterStatus === s && (
                  <motion.div
                    layoutId="activeStatus"
                    className="absolute inset-0 rounded-md bg-surface shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={`relative z-10 capitalize ${filterStatus === s ? "text-primary" : "text-tertiary"}`}>
                  {t(`status.${s}`)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest whitespace-nowrap">
            {t("common.priority")}
          </span>
          <div className="flex p-1 rounded-lg bg-app w-fit border border-default">
            {["all", "high", "medium", "low"].map((p) => (
              <button
                key={p}
                onClick={() => onPriorityChange(p)}
                className="relative px-3 py-1 rounded-md text-[11px] font-semibold transition-colors"
              >
                {filterPriority === p && (
                  <motion.div
                    layoutId="activeFilterPriority"
                    className="absolute inset-0 rounded-md bg-surface shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={`relative z-10 capitalize ${filterPriority === p ? "text-primary" : "text-tertiary"}`}>
                  {t(`priority.${p}`)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest whitespace-nowrap">
            {t("common.category")}
          </span>
          <div className="flex p-1 rounded-lg bg-app w-fit border border-default overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-none">
            {["all", ...categories].map((c) => (
              <button
                key={c}
                onClick={() => onCategoryChange(c)}
                className="relative px-3 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap"
              >
                {filterCategory === c && (
                  <motion.div
                    layoutId="activeCategoryFilter"
                    className="absolute inset-0 rounded-md bg-surface shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={`relative z-10 ${filterCategory === c ? "text-primary" : "text-tertiary"}`}>
                  {c === "all" ? t("status.all") : c}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

TaskFilters.displayName = "TaskFilters";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { parseSmartInput } from "../utils/smartParser";
import { Priority, NewTask } from "./TaskCard";

interface SmartTaskInputProps {
  categories: string[];
  onAdd: (task: NewTask) => Promise<void>;
}

export const SmartTaskInput = React.memo(({ categories, onAdd }: SmartTaskInputProps) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [priority, setPriority] = useState<Priority>("low");
  const [category, setCategory] = useState<string>("Personal");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const parsed = parseSmartInput(inputValue, categories);

    await onAdd({
      text: parsed.text,
      priority: (parsed.priority as Priority) || priority,
      category: parsed.category || category,
      dueDate: parsed.dueDate,
      isRecurring: parsed.isRecurring,
      recurrence: parsed.recurrence ?? undefined,
    });

    setInputValue("");
    setPriority("low");
    setCategory("Personal");
    inputRef.current?.focus();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-10 p-6 rounded-2xl border border-default bg-surface shadow-lyra-sm"
    >
      <form onSubmit={handleSubmit} className="group space-y-5">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t("common.placeholder")}
              aria-label={t("common.add_task")}
              className="h-[48px] w-full rounded-xl border border-default bg-app px-4 text-[15px] text-primary placeholder:text-tertiary outline-none transition-all focus:border-accent/40 focus:ring-4 focus:ring-accent/5"
            />
          </div>
          <motion.button
            type="submit"
            disabled={!inputValue.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex h-[48px] items-center gap-1.5 rounded-xl bg-accent px-6 text-[14px] font-semibold text-white shadow-lyra-sm transition-all hover:bg-accent-hover disabled:opacity-40"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span className="hidden sm:inline">{t("common.add_task")}</span>
          </motion.button>
        </div>

        <div className="flex flex-wrap items-center gap-6 px-1">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest px-1">
              {t("common.priority")}
            </span>
            <div className="flex p-1.5 rounded-xl bg-app w-fit">
              {(["low", "medium", "high"] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className="relative px-5 py-2.5 rounded-lg text-[12px] font-semibold transition-colors min-w-[80px] min-h-[44px]"
                >
                  {priority === p && (
                    <motion.div
                      layoutId="activePriority"
                      className="absolute inset-0 rounded-lg bg-surface shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className={`relative z-10 capitalize ${priority === p ? "text-primary" : "text-tertiary"}`}>
                    {t(`priority.${p}`)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest px-1">
              {t("common.category")}
            </span>
            <div className="flex p-1.5 rounded-xl bg-app w-fit">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className="relative px-5 py-2.5 rounded-lg text-[12px] font-semibold transition-colors min-h-[44px]"
                >
                  {category === c && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 rounded-lg bg-surface shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className={`relative z-10 ${category === c ? "text-primary" : "text-tertiary"}`}>
                    {c}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="px-1 text-[11px] text-tertiary/70 italic border-t border-default/50 pt-3">
          {t("common.hint")}
        </p>
      </form>
    </motion.div>
  );
});

SmartTaskInput.displayName = "SmartTaskInput";

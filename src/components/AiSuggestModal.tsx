import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { generateScheduleSuggestion, isKeyConfigured } from "../services/aiScheduler";
import { useTasks } from "../hooks/useTasks";
import { format, parseISO } from "date-fns";

interface AiSuggestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AiSuggestion {
  text: string;
  priority: string;
  reason: string;
}

export function AiSuggestModal({ isOpen, onClose }: AiSuggestModalProps) {
  const { t } = useTranslation();
  const { tasks } = useTasks();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [rawResponse, setRawResponse] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!isKeyConfigured()) {
      setError(t("ai.no_key"));
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestions([]);
    setRawResponse(null);

    // Build context from current tasks
    const activeTasks = tasks
      .filter((task) => !task.completed)
      .slice(0, 10)
      .map((task) => {
        const due = task.dueDate ? format(parseISO(task.dueDate), "dd MMM yyyy") : "no date";
        return `- ${task.text} (${task.priority} priority, due: ${due}, category: ${task.category})`;
      })
      .join("\n");

    const prompt = `Here are the user's current active tasks:\n${activeTasks || "No active tasks."}\n\nBased on these tasks, provide 3 smart scheduling suggestions. For each suggestion, provide:
1. A recommended action or new task
2. Priority level (high/medium/low)
3. Brief reason why

Respond in this exact JSON format:
[{"text": "...", "priority": "...", "reason": "..."}]

Only respond with the JSON array, nothing else.`;

    const result = await generateScheduleSuggestion(prompt);

    if (!result.success) {
      setError(result.error || t("ai.error"));
      setLoading(false);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseData = result.data as any;
      const textContent =
        responseData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Try to parse JSON from response
      const jsonMatch = textContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as AiSuggestion[];
        setSuggestions(parsed);
      } else {
        // Fallback: show raw text
        setRawResponse(textContent);
      }
    } catch {
      setError(t("ai.parse_error"));
    }

    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg rounded-2xl border border-default bg-surface/95 p-6 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-accent/20 border border-accent/20 flex items-center justify-center">
                  <Sparkles size={20} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-primary">{t("ai.title")}</h2>
                  <p className="text-[12px] text-tertiary">{t("ai.subtitle")}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface-hover text-tertiary hover:text-primary transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Generate Button */}
              {!loading && suggestions.length === 0 && !rawResponse && (
                <motion.button
                  onClick={handleGenerate}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-accent/10 to-violet-500/10 border border-accent/20 text-accent font-semibold text-[14px] hover:from-accent/15 hover:to-violet-500/15 transition-all cursor-pointer"
                >
                  <Sparkles size={16} />
                  {t("ai.generate")}
                </motion.button>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  >
                    <Loader2 size={28} className="text-accent" />
                  </motion.div>
                  <p className="text-[13px] text-secondary animate-pulse">{t("ai.loading")}</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5"
                >
                  <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-red-300">{error}</p>
                </motion.div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-tertiary uppercase tracking-widest px-1">{t("ai.suggestions")}</p>
                  {suggestions.map((suggestion, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-xl border border-default bg-app/50 hover:bg-surface-hover transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-primary leading-relaxed">{suggestion.text}</p>
                          <p className="text-[12px] text-tertiary mt-1 italic">{suggestion.reason}</p>
                          <span
                            className={`inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              suggestion.priority === "high"
                                ? "bg-red-500/10 text-red-400"
                                : suggestion.priority === "medium"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-blue-500/10 text-blue-400"
                            }`}
                          >
                            {suggestion.priority}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Regenerate Button */}
                  <button
                    onClick={handleGenerate}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl border border-default text-[13px] font-medium text-secondary hover:text-primary hover:bg-surface-hover transition-all cursor-pointer"
                  >
                    <Sparkles size={14} />
                    {t("ai.regenerate")}
                  </button>
                </div>
              )}

              {/* Raw Text Fallback */}
              {rawResponse && (
                <div className="p-4 rounded-xl border border-default bg-app/50">
                  <p className="text-[13px] text-secondary whitespace-pre-wrap leading-relaxed">{rawResponse}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

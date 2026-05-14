import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="relative mb-6">
        <motion.div 
          className="absolute inset-0 blur-2xl bg-accent/10 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <Icon size={64} className="relative text-accent/20" strokeWidth={1} />
      </div>
      <h3 className="mb-2 text-xl font-bold text-primary tracking-tight">{title}</h3>
      <p className="mb-8 max-w-[280px] text-[15px] leading-relaxed text-secondary italic opacity-80">
        "{description}"
      </p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </motion.div>
  );
}

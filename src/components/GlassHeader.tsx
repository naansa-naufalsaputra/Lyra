import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface GlassHeaderProps {
  title: string;
  subtitle?: string;
}

export function GlassHeader({ title, subtitle }: GlassHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="glass sticky top-0 z-50 w-full">
      <div className="mx-auto flex max-w-[600px] items-center justify-between px-4 py-4 sm:py-6">
        <div className="flex flex-col">
          <motion.h1 
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[22px] sm:text-[26px] font-semibold tracking-tight text-primary leading-tight"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-[13px] sm:text-[14px] text-secondary font-medium"
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className="group relative flex h-9 w-9 items-center justify-center rounded-card border border-default bg-surface text-secondary transition-all hover:bg-surface-hover hover:text-primary cursor-pointer shadow-lyra-sm"
          aria-label="Toggle theme"
        >
          <motion.div
            initial={false}
            animate={{ rotate: theme === "dark" ? 0 : 180, scale: 1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
          >
            {theme === "dark" ? (
              <Sun size={17} strokeWidth={2} />
            ) : (
              <Moon size={17} strokeWidth={2} />
            )}
          </motion.div>
        </button>
      </div>
    </header>
  );
}

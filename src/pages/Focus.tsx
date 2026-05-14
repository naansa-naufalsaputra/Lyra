import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Zap, CheckCircle2 } from "lucide-react";
import { useTasks } from "../hooks/useTasks";
import { useFocus } from "../hooks/useFocus";

export function Focus() {
  const { tasks } = useTasks();
  const { timeLeft, isActive, isCompleted, toggleTimer, resetTimer } = useFocus();

  const highPriorityTask = tasks.find(t => t.priority === 'high' && !t.completed);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] md:min-h-screen px-4 py-12 bg-app">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex flex-col items-center"
      >
        {/* Breathing Glow Effect */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.2, 1],
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                repeat: Infinity, 
                duration: 4,
                ease: "easeInOut" 
              }}
              className="absolute inset-0 -z-10 rounded-full bg-accent blur-[80px]"
            />
          )}
        </AnimatePresence>

        {/* Timer Label */}
        <div className="flex items-center gap-2 mb-4 px-3 py-1 rounded-pill bg-accent/10 border border-accent/20">
          <Zap size={14} className="text-accent fill-accent" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
            {isCompleted ? "Session Complete" : "Deep Work Session"}
          </span>
        </div>

        {/* Countdown Timer */}
        <AnimatePresence mode="wait">
          {isCompleted ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <div className="h-32 w-32 rounded-full bg-accent/10 flex items-center justify-center mb-6 border border-accent/20">
                <CheckCircle2 size={64} className="text-accent" />
              </div>
              <h2 className="text-3xl font-bold text-primary mb-2">Great job!</h2>
              <p className="text-secondary text-center max-w-[280px]">
                You've completed your focus session. Take a well-deserved break!
              </p>
            </motion.div>
          ) : (
            <motion.h1 
              key="timer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[120px] sm:text-[160px] font-thin tracking-tighter text-primary leading-none select-none"
            >
              {formatTime(timeLeft)}
            </motion.h1>
          )}
        </AnimatePresence>

        {/* Priority Task Context */}
        {!isCompleted && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center max-w-[300px]"
          >
            <p className="text-tertiary text-sm font-medium uppercase tracking-widest mb-1">Focusing On</p>
            <p className="text-primary font-semibold truncate px-4">
              {highPriorityTask ? highPriorityTask.text : "No high-priority task"}
            </p>
          </motion.div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-4 mt-16">
          <button
            onClick={resetTimer}
            className="p-4 rounded-full bg-surface border border-default text-secondary hover:bg-surface-hover transition-all active:scale-95 shadow-lyra-sm"
            aria-label="Reset timer"
          >
            <RotateCcw size={22} />
          </button>

          <button
            onClick={toggleTimer}
            className={`
              flex items-center justify-center gap-3 px-10 py-4 rounded-pill font-bold transition-all active:scale-95 shadow-lyra-md
              ${isActive 
                ? "bg-surface border-2 border-accent text-accent" 
                : "bg-accent text-white hover:bg-accent-hover"
              }
            `}
          >
            {isCompleted ? (
              <>
                <RotateCcw size={20} />
                <span>Start Again</span>
              </>
            ) : isActive ? (
              <>
                <Pause size={20} fill="currentColor" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={20} fill="currentColor" />
                <span>{timeLeft < 25 * 60 ? "Resume" : "Start Session"}</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}


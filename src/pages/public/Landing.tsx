import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, Brain, Target, ArrowRight, Github, ShieldCheck, Cpu, Sparkles } from "lucide-react";
import { LyraLogo } from "../../components/LyraLogo";

const features = [
  {
    icon: Cpu,
    title: "BYOK Architecture",
    description:
      "Full control over your AI. Bring your own Gemini API key. Your data, your keys, your privacy.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy First",
    description:
      "We don't store your tasks on our servers. Everything is saved locally and synced securely via Firebase.",
  },
  {
    icon: Sparkles,
    title: "Premium Aesthetics",
    description:
      "A distraction-free, glassmorphic interface designed for deep focus and aesthetic pleasure.",
  },
  {
    icon: Brain,
    title: "Smart Scheduling",
    description:
      "AI-powered recurrences and smart inputs that understand natural language for faster capture.",
  },
  {
    icon: Zap,
    title: "Zero Latency",
    description:
      "Optimized with Vite and local-first patterns for an ultra-responsive, snappier-than-ever experience.",
  },
  {
    icon: Target,
    title: "Focus Mode",
    description:
      "Deep work sessions with ambient timers, distraction blocking, and progress tracking.",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.2, 0, 0, 1] as const },
  }),
};

export function Landing() {
  return (
    <div className="min-h-screen bg-app text-primary font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="mx-auto max-w-[1200px] flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <LyraLogo size={32} />
            <span className="text-xl font-semibold tracking-tight text-primary">
              Lyra
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[14px] text-secondary hover:text-primary transition-colors">
              Features
            </a>
            <a href="#advantages" className="text-[14px] text-secondary hover:text-primary transition-colors">
              Advantages
            </a>
            <Link
              to="/login"
              className="text-[14px] font-medium text-accent hover:text-primary transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Glowing grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 50% 0%, rgba(94, 106, 210, 0.15) 0%, transparent 70%),
              radial-gradient(circle at 50% 20%, rgba(94, 106, 210, 0.08) 0%, transparent 50%)
            `,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-[900px] px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-default bg-surface/50 px-4 py-1.5 text-[13px] text-secondary backdrop-blur-sm"
          >
            <Zap size={14} className="text-accent" />
            BYOK AI Task Management
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.2, 0, 0, 1] }}
            className="text-[clamp(40px,7vw,80px)] font-bold leading-[1.05] text-primary"
            style={{ letterSpacing: "-0.04em" }}
          >
            Your Tasks.{" "}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#5E6AD2] to-[#828FFF] bg-clip-text text-transparent">
              Your Privacy. Your AI.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.2, 0, 0, 1] }}
            className="mx-auto mt-6 max-w-[620px] text-[17px] leading-relaxed text-secondary"
          >
            Lyra is a next-gen task manager that puts you in control. 
            Bring your own Gemini API key for privacy-first AI assistance, 
            wrapped in a stunning premium interface.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.2, 0, 0, 1] }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/register"
              className="group flex items-center gap-2 rounded-card bg-accent px-7 py-3.5 text-[15px] font-semibold text-white shadow-lyra-md hover:bg-accent-hover transition-all"
            >
              Start Productivity
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="https://github.com/naansa-naufalsaputra/Lyra"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-card border border-default bg-surface/40 px-7 py-3.5 text-[15px] font-medium text-secondary backdrop-blur-sm hover:bg-surface-hover hover:text-primary transition-all"
            >
              <Github size={16} />
              Open Source
            </a>
          </motion.div>
        </div>
      </section>

      {/* Why Lyra Section (Advantages) */}
      <section id="advantages" className="relative py-24 px-6 border-t border-default/50">
        <div className="mx-auto max-w-[1100px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
             <motion.div
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6 }}
             >
               <h2 className="text-[32px] font-bold text-primary mb-6">Why Lyra?</h2>
               <div className="space-y-6">
                 <div className="flex gap-4">
                   <div className="h-10 w-10 shrink-0 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                     <ShieldCheck size={20} />
                   </div>
                   <div>
                     <h4 className="font-bold text-primary">Privacy-First BYOK</h4>
                     <p className="text-sm text-secondary leading-relaxed">
                       Unlike other AI tools, we don't own your data. You provide your own Google Gemini API key which stays stored safely in your browser's Local Storage.
                     </p>
                   </div>
                 </div>
                 <div className="flex gap-4">
                   <div className="h-10 w-10 shrink-0 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                     <Zap size={20} />
                   </div>
                   <div>
                     <h4 className="font-bold text-primary">Aesthetic Productivity</h4>
                     <p className="text-sm text-secondary leading-relaxed">
                       Beautifully crafted with Tailwind CSS v4 and Framer Motion. Every interaction is designed to be smooth, delightful, and distraction-free.
                     </p>
                   </div>
                 </div>
                 <div className="flex gap-4">
                   <div className="h-10 w-10 shrink-0 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                     <Target size={20} />
                   </div>
                   <div>
                     <h4 className="font-bold text-primary">Smart Workflows</h4>
                     <p className="text-sm text-secondary leading-relaxed">
                       From natural language task capture to automated recurring rules, Lyra handles the complexity so you can focus on doing.
                     </p>
                   </div>
                 </div>
               </div>
             </motion.div>

             <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative aspect-square rounded-card border border-default bg-surface/40 p-4 shadow-2xl backdrop-blur-md"
             >
                <div className="absolute inset-0 bg-accent/5 rounded-card animate-pulse" />
                <div className="relative h-full w-full rounded-lg border border-default/50 overflow-hidden bg-app/50 flex">
                   {/* Mini Sidebar */}
                   <div className="w-16 border-r border-default/30 p-3 space-y-4 hidden sm:block">
                      <div className="h-6 w-6 rounded-md bg-accent/20 mx-auto" />
                      <div className="space-y-2">
                        <div className="h-2 w-full rounded-full bg-default/20" />
                        <div className="h-2 w-2/3 rounded-full bg-default/10" />
                      </div>
                   </div>
                   
                   {/* Mini Dashboard Content */}
                   <div className="flex-1 p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-32 rounded-full bg-primary/10" />
                        <div className="h-8 w-8 rounded-full bg-accent" />
                      </div>
                      
                      <div className="space-y-3">
                         {[
                            { title: "Finalize Project Presentation", time: "09:00 AM", priority: "bg-red-500/20", text: "text-red-500" },
                            { title: "Client Weekly Sync", time: "11:30 AM", priority: "bg-amber-500/20", text: "text-amber-500" },
                            { title: "Gym & Morning Yoga", time: "05:00 PM", priority: "bg-blue-500/20", text: "text-blue-500" }
                         ].map((task, i) => (
                           <motion.div 
                             key={i}
                             initial={{ x: -10, opacity: 0 }}
                             animate={{ x: 0, opacity: 1 }}
                             transition={{ delay: i * 0.2 }}
                             className="flex items-center gap-3 p-3 rounded-card bg-surface/40 border border-default/50 shadow-sm backdrop-blur-sm"
                           >
                              <div className="h-5 w-5 rounded-full border-2 border-accent/30 flex items-center justify-center">
                                {i === 0 && <div className="h-2 w-2 rounded-full bg-accent" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-[11px] font-semibold text-primary leading-tight">{task.title}</p>
                                <p className="text-[9px] text-tertiary font-medium">{task.time}</p>
                              </div>
                              <div className={`px-2 py-0.5 rounded-full ${task.priority} ${task.text} text-[8px] font-bold uppercase tracking-wider`}>
                                {i === 0 ? "High" : i === 1 ? "Medium" : "Low"}
                              </div>
                           </motion.div>
                         ))}
                      </div>

                      {/* AI Input Mockup */}
                      <div className="mt-8 p-3 rounded-pill bg-surface/60 border border-accent/20 flex items-center gap-3">
                        <Sparkles size={12} className="text-accent animate-pulse" />
                        <p className="text-[10px] text-tertiary">"Remind me to call John at 2pm..."</p>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative py-32 px-6">
        <div className="mx-auto max-w-[1100px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2
              className="text-[36px] font-bold text-primary"
              style={{ letterSpacing: "-0.03em" }}
            >
              Power Features
            </h2>
            <p className="mt-4 text-[16px] text-secondary max-w-[480px] mx-auto">
              Engineered for those who value both function and form.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
                className="group relative rounded-card border border-default bg-surface/60 p-8 backdrop-blur-sm shadow-lyra-sm surface-edge hover:border-[rgba(94,106,210,0.15)] transition-all duration-300"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-card bg-accent/10 text-accent">
                  <feature.icon size={22} />
                </div>
                <h3 className="text-[18px] font-semibold text-primary tracking-editorial">
                  {feature.title}
                </h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-secondary">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-default py-10 px-6">
        <div className="mx-auto max-w-[1100px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LyraLogo size={24} />
            <span className="text-[13px] text-tertiary">
              © {new Date().getFullYear()} Lyra. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[13px] text-tertiary hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="text-[13px] text-tertiary hover:text-primary transition-colors">
              Terms
            </a>
            <a
              href="https://github.com/naansa-naufalsaputra/Lyra"
              target="_blank"
              rel="noopener noreferrer"
              className="text-tertiary hover:text-primary transition-colors"
            >
              <Github size={16} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

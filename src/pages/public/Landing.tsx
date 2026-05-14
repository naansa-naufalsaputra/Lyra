import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, Brain, Target, ArrowRight, Github } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Smart Scheduling",
    description:
      "AI analyzes your habits and priorities to build the perfect daily schedule automatically.",
  },
  {
    icon: Zap,
    title: "AI Insights",
    description:
      "Get actionable analytics on your productivity patterns and focus trends over time.",
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
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.2, 0, 0, 1] as const },
  }),
};

export function Landing() {
  return (
    <div className="min-h-screen bg-app text-primary font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="mx-auto max-w-[1200px] flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">L</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-primary">
              Lyra
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[14px] text-secondary hover:text-primary transition-colors">
              Features
            </a>
            <a href="#" className="text-[14px] text-secondary hover:text-primary transition-colors">
              Pricing
            </a>
            <a href="#" className="text-[14px] text-secondary hover:text-primary transition-colors">
              About
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
            AI-Powered Task Management
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.2, 0, 0, 1] }}
            className="text-[clamp(40px,7vw,80px)] font-bold leading-[1.05] text-primary"
            style={{ letterSpacing: "-0.04em" }}
          >
            Master Your Time.{" "}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#5E6AD2] to-[#828FFF] bg-clip-text text-transparent">
              Command Your Focus.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.2, 0, 0, 1] }}
            className="mx-auto mt-6 max-w-[560px] text-[17px] leading-relaxed text-secondary"
          >
            AI-powered task management that adapts to your workflow.
            Prioritize smarter, focus deeper, achieve more.
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
              Get Started
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-card border border-default bg-surface/40 px-7 py-3.5 text-[15px] font-medium text-secondary backdrop-blur-sm hover:bg-surface-hover hover:text-primary transition-all"
            >
              <Github size={16} />
              View GitHub
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features */}
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
              Everything you need to stay focused
            </h2>
            <p className="mt-4 text-[16px] text-secondary max-w-[480px] mx-auto">
              Powerful features designed to help you take control of your day.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="h-6 w-6 rounded-md bg-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm leading-none">L</span>
            </div>
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
              href="https://github.com"
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

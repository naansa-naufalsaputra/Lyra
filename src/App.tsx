import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Navigation } from "./components/Navigation";
import { GlassHeader } from "./components/GlassHeader";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TaskModalProvider } from "./context/TaskModalContext";
import { FocusProvider } from "./context/FocusContext";
import { TaskProvider } from "./context/TaskContext";
import { CategoryProvider } from "./context/CategoryContext";
import { AddTaskModal } from "./components/AddTaskModal";
import { TaskDetailSheet } from "./components/TaskDetailSheet";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

const Dashboard = lazy(() => import("./pages/Dashboard").then((module) => ({ default: module.Dashboard })));
const Upcoming = lazy(() => import("./pages/Upcoming").then((module) => ({ default: module.Upcoming })));
const Focus = lazy(() => import("./pages/Focus").then((module) => ({ default: module.Focus })));
const Insights = lazy(() => import("./pages/Insights").then((module) => ({ default: module.Insights })));
const History = lazy(() => import("./pages/History").then((module) => ({ default: module.History })));
const Settings = lazy(() => import("./pages/Settings").then((module) => ({ default: module.Settings })));
const Landing = lazy(() => import("./pages/public/Landing").then((module) => ({ default: module.Landing })));
const Login = lazy(() => import("./pages/public/Login").then((module) => ({ default: module.Login })));
const Register = lazy(() => import("./pages/public/Register").then((module) => ({ default: module.Register })));

/* ── Auth-guarded route wrappers ──────────────────── */

/** Redirects to /login if user is not authenticated */
function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageFallback />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

/** Redirects to /app if user is already authenticated */
function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageFallback />;
  }

  return user ? <Navigate to="/app" replace /> : <Outlet />;
}

function PageFallback() {
  return (
    <div className="min-h-screen bg-app flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
    </div>
  );
}

/* ── Private layout (sidebar + header) ────────────── */

function PrivateLayout() {
  useKeyboardShortcuts();
  const location = useLocation();
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.displayName ? `, ${user.displayName.split(' ')[0]}` : "";
    
    if (hour < 12) return `Good morning${name}`;
    if (hour < 18) return `Good afternoon${name}`;
    return `Good evening${name}`;
  };

  return (
    <div className="min-h-screen bg-app text-primary font-sans pb-20 md:pb-0 md:pl-64">
      <Navigation />
      <GlassHeader title={getGreeting()} />

      <main className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <AddTaskModal />
      <TaskDetailSheet />
    </div>
  );
}

/* ── App root ─────────────────────────────────────── */

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CategoryProvider>
          <TaskProvider>
            <TaskModalProvider>
            <FocusProvider>
              <BrowserRouter>
                <Suspense fallback={<PageFallback />}>
                  <AppRoutes />
                </Suspense>
              </BrowserRouter>
            </FocusProvider>
          </TaskModalProvider>
        </TaskProvider>
        </CategoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppRoutes() {
  const location = useLocation();
  
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Landing />} />

      {/* Public routes — redirect to /app if already logged in */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Private routes — redirect to /login if not authenticated */}
      <Route element={<ProtectedRoute />}>
        <Route element={<PrivateLayout />}>
          <Route path="/app" element={<Dashboard />} />
          <Route path="/app/upcoming" element={<Upcoming />} />
          <Route path="/app/focus" element={<Focus />} />
          <Route path="/app/insights" element={<Insights />} />
          <Route path="/app/history" element={<History />} />
          <Route path="/app/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
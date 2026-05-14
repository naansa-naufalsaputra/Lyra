import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { GlassHeader } from "./components/GlassHeader";
import { Dashboard } from "./pages/Dashboard";
import { Upcoming } from "./pages/Upcoming";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";
import { Focus } from "./pages/Focus";
import { Insights } from "./pages/Insights";
import { Landing } from "./pages/public/Landing";
import { Login } from "./pages/public/Login";
import { Register } from "./pages/public/Register";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TaskModalProvider } from "./context/TaskModalContext";
import { FocusProvider } from "./context/FocusContext";
import { TaskProvider } from "./context/TaskContext";
import { CategoryProvider } from "./context/CategoryContext";
import { AddTaskModal } from "./components/AddTaskModal";
import { TaskDetailSheet } from "./components/TaskDetailSheet";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

/* ── Auth-guarded route wrappers ──────────────────── */

/** Redirects to /login if user is not authenticated */
function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

/** Redirects to /app if user is already authenticated */
function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
      </div>
    );
  }

  return user ? <Navigate to="/app" replace /> : <Outlet />;
}

/* ── Private layout (sidebar + header) ────────────── */

function PrivateLayout() {
  useKeyboardShortcuts();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-app text-primary font-sans pb-20 md:pb-0 md:pl-64">
      <Navigation />
      <GlassHeader title={getGreeting()} />

      <main className="w-full">
        <Outlet />
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
                <Routes>
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
              </BrowserRouter>
            </FocusProvider>
          </TaskModalProvider>
        </TaskProvider>
        </CategoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
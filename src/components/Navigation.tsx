import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Calendar, History, Settings, Plus, Zap, BarChart3 } from "lucide-react";
import { useTaskModal } from "../context/TaskModalContext";

const navItems = [
  { path: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "/app/upcoming", label: "Upcoming", icon: Calendar },
  { path: "/app/focus", label: "Focus", icon: Zap },
  { path: "/app/insights", label: "Insights", icon: BarChart3 },
  { path: "/app/history", label: "History", icon: History },
  { path: "/app/settings", label: "Settings", icon: Settings },
];

export function Navigation() {
  const { openModal } = useTaskModal();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-default bg-surface/50 backdrop-blur-xl z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <span className="text-xl font-semibold tracking-tight text-primary">Lyra</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-card text-[14px] font-medium
                ${isActive 
                  ? "bg-accent/10 text-accent" 
                  : "text-secondary hover:bg-surface-hover hover:text-primary"
                }
              `}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4">
          <button 
            onClick={() => openModal()}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-card bg-accent text-white font-semibold text-[14px] shadow-lyra-sm hover:bg-accent-hover transition-all cursor-pointer"
          >
            <Plus size={18} strokeWidth={2.5} />
            Add Task
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-default bg-surface/80 backdrop-blur-xl z-50 flex items-center justify-around px-1 overflow-x-auto no-scrollbar">
        {navItems.map((item, index) => (
          <React.Fragment key={item.path}>
            {/* Insert Add Button in the middle for mobile (after item index 2 - Focus) */}
            {index === 3 && (
               <button 
                onClick={() => openModal()}
                className="flex items-center justify-center -mt-8 h-12 w-12 shrink-0 rounded-full bg-accent text-white shadow-lyra-lg transition-transform active:scale-95"
               >
                 <Plus size={24} strokeWidth={2.5} />
               </button>
            )}
            <NavLink
              to={item.path}
              end={item.end}
              className={({ isActive }) => `
                flex flex-col items-center justify-center gap-1 min-w-[56px] transition-all
                ${isActive ? "text-accent" : "text-secondary"}
              `}
            >
              <item.icon size={18} />
              <span className="text-[9px] font-medium">{item.label}</span>
            </NavLink>
          </React.Fragment>
        ))}
      </nav>
    </>
  );
}


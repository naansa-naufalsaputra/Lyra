/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Moon, Sun, User, Key, CheckCircle, XCircle, Eye, EyeOff, LogOut, RefreshCcw, Trash2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../hooks/useTasks";
import { motion, AnimatePresence } from "framer-motion";
import { getApiKey, setApiKey, removeApiKey, isKeyConfigured } from "../services/aiScheduler";

export function Settings() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { rules, deleteRule } = useTasks();

  const [keyInput, setKeyInput] = useState("");
  const [keyStatus, setKeyStatus] = useState<"idle" | "saved" | "removed">("idle");
  const [showKey, setShowKey] = useState(false);
  const hasKey = isKeyConfigured();

  // Populate input with masked key on mount
  useEffect(() => {
    const stored = getApiKey();
    if (stored) setKeyInput(stored);
  }, []);

  const handleSaveKey = () => {
    if (!keyInput.trim()) return;
    setApiKey(keyInput.trim());
    setKeyStatus("saved");
    setTimeout(() => setKeyStatus("idle"), 2500);
  };

  const handleRemoveKey = () => {
    removeApiKey();
    setKeyInput("");
    setKeyStatus("removed");
    setTimeout(() => setKeyStatus("idle"), 2500);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="mx-auto w-full max-w-[600px] px-4 pt-8 sm:pt-12 pb-24">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2.5">
          <SettingsIcon size={24} className="text-accent" />
          Settings
        </h2>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <section>
          <h3 className="text-[11px] font-bold text-tertiary uppercase tracking-widest mb-3 px-1">Appearance</h3>
          <div className="bg-surface border border-default rounded-card overflow-hidden divide-y divide-default shadow-lyra-sm">
            <button 
              onClick={() => setTheme('light')}
              className={`w-full flex items-center justify-between p-4 hover:bg-surface-hover transition-colors ${theme === 'light' ? 'bg-accent/5' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Sun size={18} className={theme === 'light' ? 'text-accent' : 'text-secondary'} />
                <span className="text-[15px] font-medium">Light Mode</span>
              </div>
              <div className={`h-4 w-4 rounded-full border-2 transition-all ${theme === 'light' ? 'border-4 border-accent' : 'border-default'}`} />
            </button>
            
            <button 
              onClick={() => setTheme('dark')}
              className={`w-full flex items-center justify-between p-4 hover:bg-surface-hover transition-colors ${theme === 'dark' ? 'bg-accent/5' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Moon size={18} className={theme === 'dark' ? 'text-accent' : 'text-secondary'} />
                <span className="text-[15px] font-medium">Dark Mode</span>
              </div>
              <div className={`h-4 w-4 rounded-full border-2 transition-all ${theme === 'dark' ? 'border-4 border-accent' : 'border-default'}`} />
            </button>
          </div>
        </section>

        {/* ─── AI Integration (BYOK) ─── */}
        <section>
          <h3 className="text-[11px] font-bold text-tertiary uppercase tracking-widest mb-3 px-1">AI Integration</h3>
          <div className="bg-surface border border-default rounded-card p-5 shadow-lyra-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-card bg-accent/10 text-accent">
                <Key size={18} />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-primary">Gemini API Key</p>
                <p className="text-[13px] text-tertiary leading-relaxed mt-0.5">
                  Bring your own key to unlock AI-powered scheduling. Your key is stored locally and never sent to our servers.
                </p>
              </div>
            </div>

            {/* API Key Input */}
            <div className="relative">
              <input
                id="settings-api-key"
                type={showKey ? "text" : "password"}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-input border border-default bg-app px-4 py-3 pr-11 text-[14px] text-primary placeholder:text-tertiary outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent/30 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-secondary transition-colors cursor-pointer"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveKey}
                disabled={!keyInput.trim()}
                className="rounded-input bg-accent px-5 py-2 text-[13px] font-semibold text-white transition-all hover:bg-accent-hover disabled:opacity-40 cursor-pointer"
              >
                {hasKey ? "Update Key" : "Save Key"}
              </button>
              {hasKey && (
                <button
                  onClick={handleRemoveKey}
                  className="rounded-input border border-default bg-surface-hover px-5 py-2 text-[13px] font-medium text-secondary transition-all hover:text-primary hover:border-red-500/30 cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Status Feedback */}
            {keyStatus === "saved" && (
              <div className="flex items-center gap-2 text-emerald-400 text-[13px]">
                <CheckCircle size={14} />
                API key saved successfully.
              </div>
            )}
            {keyStatus === "removed" && (
              <div className="flex items-center gap-2 text-red-400 text-[13px]">
                <XCircle size={14} />
                API key removed.
              </div>
            )}

            {/* Connection Status */}
            <div className="flex items-center gap-2 pt-1 text-[12px]">
              <span className={`h-2 w-2 rounded-full ${hasKey ? "bg-emerald-400" : "bg-tertiary"}`} />
              <span className="text-tertiary">
                {hasKey ? "Key configured — AI features active" : "No key — AI features disabled"}
              </span>
            </div>
          </div>
        </section>

        {/* Recurrence Rules Manager */}
        <section>
          <h3 className="text-[11px] font-bold text-tertiary uppercase tracking-widest mb-3 px-1">Aturan Berulang</h3>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {rules.length > 0 ? (
                rules.map((rule) => (
                  <motion.div
                    key={rule.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="group bg-surface/40 backdrop-blur-md border border-default rounded-card p-4 flex items-center justify-between shadow-lyra-sm hover:border-strong transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-accent/5 border border-accent/10 flex items-center justify-center text-accent">
                        <RefreshCcw size={18} />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-primary">{rule.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded">
                            {rule.frequency}
                          </span>
                          <span className="text-[12px] text-tertiary italic">
                            Next: {rule.nextOccurrence}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-full text-tertiary hover:bg-red-500/10 hover:text-red-500 transition-all cursor-pointer"
                      aria-label="Delete rule"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="bg-surface/20 border border-dashed border-default rounded-card p-8 text-center">
                  <p className="text-[13px] text-tertiary italic">Belum ada aturan berulang aktif.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Account */}
        <section>
          <h3 className="text-[11px] font-bold text-tertiary uppercase tracking-widest mb-3 px-1">Account</h3>
          <div className="bg-surface border border-default rounded-card p-4 flex items-center justify-between shadow-lyra-sm">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <User size={20} />
              </div>
              <div>
                <p className="text-[15px] font-bold text-primary text-left">{user?.displayName || "Lyra User"}</p>
                <p className="text-[13px] text-tertiary">{user?.email || "Not signed in"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-input border border-default bg-surface-hover px-4 py-2 text-[13px] font-medium text-secondary hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </section>

        <div className="pt-10 text-center">
          <p className="text-[12px] text-tertiary">Lyra v1.0.0 • Aesthetic Task Manager</p>
        </div>
      </div>
    </div>
  );
}

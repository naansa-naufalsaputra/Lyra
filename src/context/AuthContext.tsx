/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
/**
 * AuthContext — Firebase Auth state observer
 *
 * Provides the current Firebase user across the app via React context.
 * Uses `onAuthStateChanged` for real-time auth state synchronization.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "../lib/firebase";

interface AuthContextType {
  /** Current Firebase user (null if signed out) */
  user: User | null;
  /** True while the initial auth state is being resolved */
  loading: boolean;
  /** Sign out the current user */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    try {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      }, () => {
        // Auth error (e.g., invalid config) — resolve as "not logged in"
        setUser(null);
        setLoading(false);
      });

      return unsubscribe;
    } catch {
      // Firebase not configured — resolve immediately
      setLoading(false);
    }
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to access the current auth state */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { api, getToken, setToken } from "@core/http/client";
import type { LoginResponse } from "@core/types";

interface StoredUser {
  userId: string;
  username: string;
  role: string;
}

const USER_KEY = "erp.user";

/**
 * Restore a previously stored session synchronously, so it's present on the
 * very first render. Doing this in a useEffect instead would leave the first
 * render unauthenticated and bounce the user to /login on every refresh.
 */
function restoreUser(): StoredUser | null {
  if (!getToken()) return null;
  const cached = localStorage.getItem(USER_KEY);
  if (!cached) return null;
  try {
    return JSON.parse(cached) as StoredUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

interface AuthState {
  userId: string | null;
  username: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(restoreUser);

  async function login(username: string, password: string) {
    const { data } = await api.post<LoginResponse>("/auth/login", { username, password });
    setToken(data.accessToken);
    const stored: StoredUser = {
      userId: data.userId,
      username: data.username,
      role: data.role,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(stored));
    setUser(stored);
  }

  function logout() {
    setToken(null);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  const value = useMemo<AuthState>(
    () => ({
      userId: user?.userId ?? null,
      username: user?.username ?? null,
      role: user?.role ?? null,
      isAuthenticated: !!user,
      isAdmin: user?.role === "ADMIN",
      login,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, setToken } from "@core/http/client";
import { getAccessToken, getAccessTokenExpiry } from "@core/http/access-token";
import type { LoginResponse } from "@core/types";

interface StoredUser {
  userId: string;
  username: string;
  role: string;
}

const USER_KEY = "erp.user";

function restoreUser(): StoredUser | null {
  const cached = localStorage.getItem(USER_KEY);
  if (!getAccessToken()) {
    if (cached) localStorage.removeItem(USER_KEY);
    return null;
  }
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

const MAX_TIMEOUT_MILLIS = 2 ** 31 - 1;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(restoreUser);

  const endSession = useCallback(() => {
    setToken(null);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!user) return;
    const expiresAt = getAccessTokenExpiry();
    if (expiresAt === null) {
      endSession();
      return;
    }
    const delay = expiresAt - Date.now();
    if (delay <= 0) {
      endSession();
      return;
    }
    if (delay > MAX_TIMEOUT_MILLIS) return;
    const timer = window.setTimeout(endSession, delay);
    return () => window.clearTimeout(timer);
  }, [user, endSession]);

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
    endSession();
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

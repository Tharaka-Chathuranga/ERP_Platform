import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, getToken, setToken } from "../api/client";
import type { LoginResponse } from "../types";

interface AuthState {
  username: string | null;
  roles: string[];
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  // Restore a previously stored session on first load.
  useEffect(() => {
    const token = getToken();
    if (token) {
      const cached = localStorage.getItem("erp.user");
      if (cached) {
        const parsed = JSON.parse(cached) as { username: string; roles: string[] };
        setUsername(parsed.username);
        setRoles(parsed.roles);
      }
    }
  }, []);

  async function login(user: string, password: string) {
    const { data } = await api.post<LoginResponse>("/auth/login", {
      username: user,
      password,
    });
    setToken(data.accessToken);
    localStorage.setItem("erp.user", JSON.stringify({ username: data.username, roles: data.roles }));
    setUsername(data.username);
    setRoles(data.roles);
  }

  function logout() {
    setToken(null);
    localStorage.removeItem("erp.user");
    setUsername(null);
    setRoles([]);
  }

  const value = useMemo<AuthState>(
    () => ({ username, roles, isAuthenticated: !!username, login, logout }),
    [username, roles]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

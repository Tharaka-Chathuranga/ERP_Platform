import type { ReactNode } from "react";
import { AuthProvider } from "@auth/AuthContext";
import type { Role } from "@auth/permissions";

const TOKEN_KEY = "erp.token";
const USER_KEY = "erp.user";

const DISPLAY_NAMES: Record<Role, string> = {
  ADMIN: "Ayesha Perera",
  STORE_KEEPER: "Nuwan Silva",
  QUALITY_ASSURANCE: "Dilani Fernando",
  OIL_MART_ASSISTANT: "Kasun Jayawardena",
  STORES_MANAGER: "Ruwan Bandara",
};

export function seedMockSession(role: Role) {
  localStorage.setItem(TOKEN_KEY, "storybook-mock-token");
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      userId: `mock-user-${role.toLowerCase()}`,
      username: DISPLAY_NAMES[role],
      role,
    }),
  );
}

export function AuthMockProvider({ role, children }: { role: Role; children: ReactNode }) {
  seedMockSession(role);
  return <AuthProvider key={role}>{children}</AuthProvider>;
}

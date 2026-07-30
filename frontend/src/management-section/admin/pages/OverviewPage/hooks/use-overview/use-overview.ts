import { useAuth } from "@auth/AuthContext";

export function useOverview() {
  const { role } = useAuth();
  return { role };
}

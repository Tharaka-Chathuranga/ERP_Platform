import { api } from "@core/http/client";
import type { UserSummary } from "@core/types";

/** Lists users; pass a department to return only that department's members. */
export async function listUsers(department?: string): Promise<UserSummary[]> {
  const { data } = await api.get<UserSummary[]>("/users", {
    params: { department: department || undefined },
  });
  return data;
}

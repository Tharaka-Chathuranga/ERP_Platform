import { api } from "@core/http/client";
import type { UserSummary } from "@core/types";

export async function listUsers(): Promise<UserSummary[]> {
  const { data } = await api.get<UserSummary[]>("/users");
  return data;
}

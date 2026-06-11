import { api } from "./client";
import type { UserSummary } from "../types";

export async function listUsers(): Promise<UserSummary[]> {
  const { data } = await api.get<UserSummary[]>("/users");
  return data;
}

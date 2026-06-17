import { api } from "@core/http/client";
import type { AdminUser } from "@core/types";

// ── Admin user management. Mirrors /api/admin/users. ──

export interface CreateUserInput {
  username: string;
  password: string;
  displayName?: string;
  role: string;
  department?: string;
}

export interface UpdateUserInput {
  displayName?: string;
  role: string;
  department?: string;
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  const { data } = await api.get<AdminUser[]>("/admin/users");
  return data;
}

export async function getAdminUser(id: string): Promise<AdminUser> {
  const { data } = await api.get<AdminUser>(`/admin/users/${id}`);
  return data;
}

export async function createUser(input: CreateUserInput): Promise<AdminUser> {
  const { data } = await api.post<AdminUser>("/admin/users", input);
  return data;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<AdminUser> {
  const { data } = await api.patch<AdminUser>(`/admin/users/${id}`, input);
  return data;
}

export async function enableUser(id: string): Promise<AdminUser> {
  const { data } = await api.post<AdminUser>(`/admin/users/${id}/enable`);
  return data;
}

export async function disableUser(id: string): Promise<AdminUser> {
  const { data } = await api.post<AdminUser>(`/admin/users/${id}/disable`);
  return data;
}

export async function resetUserPassword(id: string, newPassword: string): Promise<AdminUser> {
  const { data } = await api.post<AdminUser>(`/admin/users/${id}/reset-password`, { newPassword });
  return data;
}

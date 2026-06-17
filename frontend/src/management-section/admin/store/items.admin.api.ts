import { api } from "@core/http/client";
import type { Item } from "@core/types";

// ── Admin item master-data edits. Mirrors PATCH/DELETE /api/store/items. ──

export interface UpdateItemInput {
  name: string;
  description?: string;
  category?: string;
  reorderLevel: number;
  criticalItem: boolean;
  approvalRequiredForIssue: boolean;
}

export async function updateItem(id: string, input: UpdateItemInput): Promise<Item> {
  const { data } = await api.patch<Item>(`/store/items/${id}`, input);
  return data;
}

export async function deactivateItem(id: string): Promise<void> {
  await api.delete(`/store/items/${id}`);
}

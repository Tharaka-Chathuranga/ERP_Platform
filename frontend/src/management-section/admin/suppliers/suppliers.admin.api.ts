import { api } from "@core/http/client";
import type { Supplier } from "@core/types";

// ── Admin supplier status changes. Mirrors /api/store/suppliers/{id}/(de)activate. ──

export async function activateSupplier(id: string): Promise<Supplier> {
  const { data } = await api.post<Supplier>(`/store/suppliers/${id}/activate`);
  return data;
}

export async function deactivateSupplier(id: string): Promise<Supplier> {
  const { data } = await api.post<Supplier>(`/store/suppliers/${id}/deactivate`);
  return data;
}

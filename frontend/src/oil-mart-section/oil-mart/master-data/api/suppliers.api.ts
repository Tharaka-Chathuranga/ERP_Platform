import { api } from "@core/http/client";
import type { OilMartSupplier, OilMartSupplierStatus } from "@core/types";

export interface SaveOilMartSupplierInput {
  code: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: OilMartSupplierStatus;
}

export async function listOilMartSuppliers(): Promise<OilMartSupplier[]> {
  const { data } = await api.get<OilMartSupplier[]>("/oilmart/suppliers");
  return data;
}

export async function createOilMartSupplier(
  input: SaveOilMartSupplierInput,
): Promise<OilMartSupplier> {
  const { data } = await api.post<OilMartSupplier>("/oilmart/suppliers", input);
  return data;
}

export async function updateOilMartSupplier(
  supplierId: string,
  input: SaveOilMartSupplierInput,
): Promise<OilMartSupplier> {
  const { data } = await api.put<OilMartSupplier>(`/oilmart/suppliers/${supplierId}`, input);
  return data;
}

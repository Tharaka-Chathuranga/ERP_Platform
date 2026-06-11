import { api } from "../client";
import type { Supplier, SupplierItem } from "../../types";

export async function listSuppliers(): Promise<Supplier[]> {
  const { data } = await api.get<Supplier[]>("/store/suppliers");
  return data;
}

export async function getSupplier(id: string): Promise<Supplier> {
  const { data } = await api.get<Supplier>(`/store/suppliers/${id}`);
  return data;
}

export async function listSupplierItems(id: string): Promise<SupplierItem[]> {
  const { data } = await api.get<SupplierItem[]>(`/store/suppliers/${id}/items`);
  return data;
}

export interface CreateSupplierInput {
  code: string;
  name: string;
  address?: string;
  country?: string;
  email?: string;
  phone?: string;
}

export async function createSupplier(input: CreateSupplierInput): Promise<Supplier> {
  const { data } = await api.post<Supplier>("/store/suppliers", input);
  return data;
}

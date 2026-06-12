import { api } from "../client";
import type { GoodsReceipt, Page, Receival } from "../../types";

export interface ReceivalLineInput {
  itemId: string;
  quantity: number;
  unitCost?: number;
}

export interface CreateReceivalInput {
  poNumber?: string;
  invoiceNumber?: string;
  /** Provide either supplierId (registered) or supplierName (unregistered). */
  supplierId?: string;
  supplierName?: string;
  allReceivedForPo: boolean;
  storeKeeperId: string;
  receivedAt?: string;
  lines: ReceivalLineInput[];
}

/** Lists receivals; pass a supplierId to filter, omit for all. */
export async function listReceivals(supplierId?: string): Promise<Page<Receival>> {
  const { data } = await api.get<Page<Receival>>("/store/receivals", {
    params: { supplierId: supplierId || undefined, size: 50 },
  });
  return data;
}

export async function getReceival(id: string): Promise<Receival> {
  const { data } = await api.get<Receival>(`/store/receivals/${id}`);
  return data;
}

/** Records a receival: posts stock and generates a GRN per the PO rules. */
export async function createReceival(input: CreateReceivalInput): Promise<Receival> {
  const { data } = await api.post<Receival>("/store/receivals", input);
  return data;
}

/** A generated GRN is read-only — fetched to show alongside its receival. */
export async function getGoodsReceipt(id: string): Promise<GoodsReceipt> {
  const { data } = await api.get<GoodsReceipt>(`/store/goods-receipts/${id}`);
  return data;
}

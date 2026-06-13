import { api } from "@core/http/client";
import type { GoodsReceipt, Page, Receival } from "@core/types";

export interface ReceivalLineInput {
  itemId: string;
  quantity: number;
  unitCost?: number;
}

export interface CreateReceivalInput {
  poNumber?: string;
  invoiceNumber?: string;
  supplierId?: string;
  supplierName?: string;
  allReceivedForPo: boolean;
  storeKeeperId: string;
  receivedAt?: string;
  receivalItems: ReceivalLineInput[];
}

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

export async function createReceival(input: CreateReceivalInput): Promise<Receival> {
  const { data } = await api.post<Receival>("/store/receivals", input);
  return data;
}

export async function getGoodsReceipt(id: string): Promise<GoodsReceipt> {
  const { data } = await api.get<GoodsReceipt>(`/store/goods-receipts/${id}`);
  return data;
}

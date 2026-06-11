import { api } from "../client";
import type { GoodsReceipt, Page } from "../../types";

export interface GoodsReceiptLineInput {
  itemId: string;
  quantity: number;
  unitCost?: number;
}

export interface CreateGoodsReceiptInput {
  poNumber?: string;
  invoiceNumber?: string;
  supplierId: string;
  storeKeeperId: string;
  receivedAt?: string;
  lines: GoodsReceiptLineInput[];
}

/** Lists goods receipts; pass a supplierId to filter, omit for all. */
export async function listGoodsReceipts(supplierId?: string): Promise<Page<GoodsReceipt>> {
  const { data } = await api.get<Page<GoodsReceipt>>("/store/goods-receipts", {
    params: { supplierId: supplierId || undefined, size: 50 },
  });
  return data;
}

export async function getGoodsReceipt(id: string): Promise<GoodsReceipt> {
  const { data } = await api.get<GoodsReceipt>(`/store/goods-receipts/${id}`);
  return data;
}

export async function createGoodsReceipt(input: CreateGoodsReceiptInput): Promise<GoodsReceipt> {
  const { data } = await api.post<GoodsReceipt>("/store/goods-receipts", input);
  return data;
}

/** Posts a DRAFT GRN to the stock ledger (ADMIN only). */
export async function postGoodsReceipt(id: string): Promise<GoodsReceipt> {
  const { data } = await api.post<GoodsReceipt>(`/store/goods-receipts/${id}/post`);
  return data;
}

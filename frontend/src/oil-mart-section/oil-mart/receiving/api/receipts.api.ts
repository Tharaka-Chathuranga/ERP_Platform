import { api } from "@core/http/client";
import type { OilMartReceipt, OilMartStockMovement } from "@core/types";

export interface OilMartReceiptLineInput {
  itemId: string;
  quantityLitres: number;
  buyUnitPrice: number;
}

export interface RecordOilMartReceiptInput {
  supplierId: string;
  referenceNo?: string;
  receivedAt: string;
  note?: string;
  lines: OilMartReceiptLineInput[];
}

export async function listOilMartReceipts(supplierId?: string): Promise<OilMartReceipt[]> {
  const { data } = await api.get<OilMartReceipt[]>("/oilmart/receipts", {
    params: { supplierId: supplierId && supplierId !== "ALL" ? supplierId : undefined },
  });
  return data;
}

export async function getOilMartReceipt(receiptId: string): Promise<OilMartReceipt> {
  const { data } = await api.get<OilMartReceipt>(`/oilmart/receipts/${receiptId}`);
  return data;
}

export async function listOilMartReceiptMovements(
  receiptId: string,
): Promise<OilMartStockMovement[]> {
  const { data } = await api.get<OilMartStockMovement[]>(
    `/oilmart/receipts/${receiptId}/movements`,
  );
  return data;
}

export async function recordOilMartReceipt(
  input: RecordOilMartReceiptInput,
): Promise<OilMartReceipt> {
  const { data } = await api.post<OilMartReceipt>("/oilmart/receipts", input);
  return data;
}

import { api } from "@core/http/client";
import type { OilMartPaymentMethod, OilMartSale } from "@core/types";

export interface OilMartSaleLineInput {
  itemId: string;
  quantityLitres: number;
  listUnitPrice: number;
  unitPrice: number;
  isPriceOverride: boolean;
  discountPercent: number;
}

export interface CreateOilMartSaleInput {
  clientId: string;
  quotedAt: string;
  validUntil?: string;
  discountAmount: number;
  note?: string;
  lines: OilMartSaleLineInput[];
}

export interface DispatchOilMartSaleInput {
  vehicleNo: string;
  driverName: string;
  note?: string;
}

export async function listOilMartSales(status?: string): Promise<OilMartSale[]> {
  const { data } = await api.get<OilMartSale[]>("/oilmart/sales", {
    params: { status: status && status !== "ALL" ? status : undefined },
  });
  return data;
}

export async function getOilMartSale(saleId: string): Promise<OilMartSale> {
  const { data } = await api.get<OilMartSale>(`/oilmart/sales/${saleId}`);
  return data;
}

export async function createOilMartSale(input: CreateOilMartSaleInput): Promise<OilMartSale> {
  const { data } = await api.post<OilMartSale>("/oilmart/sales", input);
  return data;
}

export async function submitOilMartSaleForApproval(saleId: string): Promise<OilMartSale> {
  const { data } = await api.post<OilMartSale>(`/oilmart/sales/${saleId}/submit`);
  return data;
}

export async function approveOilMartQuotation(saleId: string): Promise<OilMartSale> {
  const { data } = await api.post<OilMartSale>(`/oilmart/sales/${saleId}/approve-quotation`);
  return data;
}

export async function rejectOilMartQuotation(
  saleId: string,
  reason: string,
): Promise<OilMartSale> {
  const { data } = await api.post<OilMartSale>(`/oilmart/sales/${saleId}/reject-quotation`, {
    reason,
  });
  return data;
}

export async function approveOilMartSale(saleId: string): Promise<OilMartSale> {
  const { data } = await api.post<OilMartSale>(`/oilmart/sales/${saleId}/approve`);
  return data;
}

export async function rejectOilMartSale(saleId: string, reason: string): Promise<OilMartSale> {
  const { data } = await api.post<OilMartSale>(`/oilmart/sales/${saleId}/reject`, { reason });
  return data;
}

export async function dispatchOilMartSale(
  saleId: string,
  input: DispatchOilMartSaleInput,
): Promise<OilMartSale> {
  const { data } = await api.post<OilMartSale>(`/oilmart/sales/${saleId}/dispatch`, input);
  return data;
}

export async function invoiceOilMartSale(
  saleId: string,
  paymentMethod: OilMartPaymentMethod,
): Promise<OilMartSale> {
  const { data } = await api.post<OilMartSale>(`/oilmart/sales/${saleId}/invoice`, {
    paymentMethod,
  });
  return data;
}

export async function cancelOilMartSale(saleId: string, reason: string): Promise<OilMartSale> {
  const { data } = await api.post<OilMartSale>(`/oilmart/sales/${saleId}/cancel`, { reason });
  return data;
}

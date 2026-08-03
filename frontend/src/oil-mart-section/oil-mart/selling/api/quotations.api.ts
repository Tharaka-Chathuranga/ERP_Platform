import { api } from "@core/http/client";
import type { OilMartQuotation } from "@core/types";

export interface OilMartQuotationLineInput {
  itemId: string;
  quantityLitres: number;
  listUnitPrice?: number;
  unitPrice?: number;
  discountPercent: number;
}

export interface SaveOilMartQuotationInput {
  clientId: string;
  issuedDate: string;
  validUntil: string;
  note?: string;
  lines: OilMartQuotationLineInput[];
}

export async function listOilMartQuotations(status?: string): Promise<OilMartQuotation[]> {
  const { data } = await api.get<OilMartQuotation[]>("/oilmart/quotations", {
    params: { status: status && status !== "ALL" ? status : undefined },
  });
  return data;
}

export async function getOilMartQuotation(quotationId: string): Promise<OilMartQuotation> {
  const { data } = await api.get<OilMartQuotation>(`/oilmart/quotations/${quotationId}`);
  return data;
}

export async function createOilMartQuotation(
  input: SaveOilMartQuotationInput,
): Promise<OilMartQuotation> {
  const { data } = await api.post<OilMartQuotation>("/oilmart/quotations", input);
  return data;
}

export async function reviseOilMartQuotation(
  quotationId: string,
  input: SaveOilMartQuotationInput,
  expectedUpdatedAt: string,
): Promise<OilMartQuotation> {
  const { data } = await api.put<OilMartQuotation>(`/oilmart/quotations/${quotationId}`, {
    ...input,
    expectedUpdatedAt,
  });
  return data;
}

export async function submitOilMartQuotation(
  quotationId: string,
  expectedUpdatedAt: string,
): Promise<OilMartQuotation> {
  const { data } = await api.post<OilMartQuotation>(`/oilmart/quotations/${quotationId}/submit`, {
    expectedUpdatedAt,
  });
  return data;
}

export async function approveOilMartQuotation(
  quotationId: string,
  expectedUpdatedAt: string,
): Promise<OilMartQuotation> {
  const { data } = await api.post<OilMartQuotation>(`/oilmart/quotations/${quotationId}/approve`, {
    expectedUpdatedAt,
  });
  return data;
}

export async function rejectOilMartQuotation(
  quotationId: string,
  reason: string,
  expectedUpdatedAt: string,
): Promise<OilMartQuotation> {
  const { data } = await api.post<OilMartQuotation>(`/oilmart/quotations/${quotationId}/reject`, {
    reason,
    expectedUpdatedAt,
  });
  return data;
}

export async function cancelOilMartQuotation(
  quotationId: string,
  reason: string,
  expectedUpdatedAt: string,
): Promise<OilMartQuotation> {
  const { data } = await api.post<OilMartQuotation>(`/oilmart/quotations/${quotationId}/cancel`, {
    reason,
    expectedUpdatedAt,
  });
  return data;
}

export function oilMartQuotationPdfUrl(quotationId: string): string {
  return `/oilmart/quotations/${quotationId}/pdf`;
}

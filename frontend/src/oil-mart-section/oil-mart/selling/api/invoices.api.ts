import { api } from "@core/http/client";
import type { OilMartInvoice, OilMartQuotation } from "@core/types";

export interface CreateOilMartInvoiceInput {
  quotationId: string;
  invoiceDate?: string;
  note?: string;
}

export async function listOilMartInvoices(status?: string): Promise<OilMartInvoice[]> {
  const { data } = await api.get<OilMartInvoice[]>("/oilmart/invoices", {
    params: { status: status && status !== "ALL" ? status : undefined },
  });
  return data;
}

export async function getOilMartInvoice(invoiceId: string): Promise<OilMartInvoice> {
  const { data } = await api.get<OilMartInvoice>(`/oilmart/invoices/${invoiceId}`);
  return data;
}

export async function listInvoiceableOilMartQuotations(): Promise<OilMartQuotation[]> {
  const { data } = await api.get<OilMartQuotation[]>(
    "/oilmart/invoices/invoiceable-quotations",
  );
  return data;
}

export async function createOilMartInvoice(
  input: CreateOilMartInvoiceInput,
): Promise<OilMartInvoice> {
  const { data } = await api.post<OilMartInvoice>("/oilmart/invoices", input);
  return data;
}

export async function reselectOilMartInvoiceQuotation(
  invoiceId: string,
  quotationId: string,
  expectedUpdatedAt: string,
): Promise<OilMartInvoice> {
  const { data } = await api.put<OilMartInvoice>(`/oilmart/invoices/${invoiceId}/quotation`, {
    quotationId,
    expectedUpdatedAt,
  });
  return data;
}

export async function approveOilMartInvoice(
  invoiceId: string,
  expectedUpdatedAt: string,
): Promise<OilMartInvoice> {
  const { data } = await api.post<OilMartInvoice>(`/oilmart/invoices/${invoiceId}/approve`, {
    expectedUpdatedAt,
  });
  return data;
}

export async function rejectOilMartInvoice(
  invoiceId: string,
  reason: string,
  expectedUpdatedAt: string,
): Promise<OilMartInvoice> {
  const { data } = await api.post<OilMartInvoice>(`/oilmart/invoices/${invoiceId}/reject`, {
    reason,
    expectedUpdatedAt,
  });
  return data;
}

export async function cancelOilMartInvoice(
  invoiceId: string,
  reason: string,
  expectedUpdatedAt: string,
): Promise<OilMartInvoice> {
  const { data } = await api.post<OilMartInvoice>(`/oilmart/invoices/${invoiceId}/cancel`, {
    reason,
    expectedUpdatedAt,
  });
  return data;
}

export function oilMartInvoicePdfUrl(invoiceId: string): string {
  return `/oilmart/invoices/${invoiceId}/pdf`;
}

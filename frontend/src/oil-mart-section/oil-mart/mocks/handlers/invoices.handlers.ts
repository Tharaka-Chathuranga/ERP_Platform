import { HttpResponse, http, delay } from "msw";
import type { OilMartInvoice, OilMartInvoiceLine, OilMartQuotation } from "@core/types";
import type { CreateOilMartInvoiceInput } from "../../selling/api";
import { applyMovement, currentUserId, db, nextDocumentNo, nextId } from "./mock-db";

const notFound = () => HttpResponse.json({ detail: "Invoice not found" }, { status: 404 });

const stale = (invoice: OilMartInvoice) =>
  HttpResponse.json(
    {
      title: "Conflict",
      detail: `${invoice.invoiceNo} was changed by someone else since you loaded it — reload and try again`,
      code: "OILMART_INVOICE_MODIFIED",
    },
    { status: 409 },
  );

function find(invoiceId: string): OilMartInvoice | undefined {
  return db.invoices.find((i) => i.id === invoiceId);
}

function isExpired(validUntil: string): boolean {
  return new Date(validUntil) < new Date(new Date().toDateString());
}

function hasLiveInvoice(quotationId: string): boolean {
  return db.invoices.some((i) => i.quotationId === quotationId);
}

function invoiceable(): OilMartQuotation[] {
  return db.quotations.filter((q) => q.status === "APPROVED" && !hasLiveInvoice(q.id));
}

function copyFrom(invoice: OilMartInvoice, quotation: OilMartQuotation) {
  invoice.quotationId = quotation.id;
  invoice.quotationNo = quotation.quotationNo;
  invoice.clientId = quotation.clientId;
  invoice.clientName = quotation.clientName;
  invoice.subtotal = quotation.subtotal;
  invoice.gstRatePercent = quotation.gstRatePercent;
  invoice.gstAmount = quotation.gstAmount;
  invoice.grandTotal = quotation.grandTotal;
  invoice.totalCost = quotation.totalCost;
  invoice.totalProfit = quotation.totalProfit;
  invoice.lines = quotation.lines.map(
    (line): OilMartInvoiceLine => ({ ...line, id: nextId("iln") }),
  );
  invoice.updatedAt = new Date().toISOString();
}

async function bodyOf(request: Request) {
  try {
    return (await request.json()) as {
      expectedUpdatedAt?: string;
      reason?: string;
      quotationId?: string;
    };
  } catch {
    return {};
  }
}

function requireInvoiceable(quotationId: string) {
  const quotation = db.quotations.find((q) => q.id === quotationId);
  if (!quotation) {
    return { error: HttpResponse.json({ detail: "Unknown quotation" }, { status: 400 }) };
  }
  if (quotation.status !== "APPROVED") {
    return {
      error: HttpResponse.json(
        {
          detail: `Only an APPROVED quotation can be invoiced (${quotation.quotationNo} is ${quotation.status})`,
          code: "OILMART_QUOTATION_NOT_APPROVED",
        },
        { status: 409 },
      ),
    };
  }
  if (isExpired(quotation.validUntil)) {
    return {
      error: HttpResponse.json(
        {
          detail: `This quotation is not valid now, it needs to be edited with current data (${quotation.quotationNo} expired on ${quotation.validUntil})`,
          code: "OILMART_QUOTATION_EXPIRED",
        },
        { status: 409 },
      ),
    };
  }
  if (hasLiveInvoice(quotation.id)) {
    return {
      error: HttpResponse.json(
        {
          detail: `${quotation.quotationNo} already has an invoice`,
          code: "OILMART_QUOTATION_ALREADY_INVOICED",
        },
        { status: 409 },
      ),
    };
  }
  return { quotation };
}

export const invoiceHandlers = [
  http.get("/api/oilmart/invoices/invoiceable-quotations", async () => {
    await delay(140);
    return HttpResponse.json(invoiceable());
  }),

  http.get("/api/oilmart/invoices", async ({ request }) => {
    await delay(150);
    const status = new URL(request.url).searchParams.get("status");
    const rows = status ? db.invoices.filter((i) => i.status === status) : db.invoices;
    return HttpResponse.json(
      [...rows].sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate)),
    );
  }),

  http.get("/api/oilmart/invoices/:invoiceId", async ({ params }) => {
    await delay(110);
    const invoice = find(String(params.invoiceId));
    return invoice ? HttpResponse.json(invoice) : notFound();
  }),

  http.post("/api/oilmart/invoices", async ({ request }) => {
    await delay(320);
    const body = (await request.json()) as CreateOilMartInvoiceInput;
    const { quotation, error } = requireInvoiceable(body.quotationId);
    if (error) return error;

    const created: OilMartInvoice = {
      id: nextId("invoice"),
      invoiceNo: nextDocumentNo("IN"),
      quotationId: quotation!.id,
      quotationNo: quotation!.quotationNo,
      clientId: quotation!.clientId,
      clientName: quotation!.clientName,
      status: "PENDING_APPROVAL",
      createdByUserId: currentUserId(),
      invoiceDate: body.invoiceDate ?? new Date().toISOString().slice(0, 10),
      bankDetails: {
        accountName: "Enlear Oil Mart (Pvt) Ltd",
        bankName: "Commercial Bank of Ceylon PLC",
        branch: "Colombo 03",
        accountNumber: "1000123456",
        swiftCode: "CCEYLKLX",
      },
      subtotal: 0,
      gstRatePercent: quotation!.gstRatePercent,
      gstAmount: 0,
      grandTotal: 0,
      note: body.note,
      updatedAt: new Date().toISOString(),
      lines: [],
    };
    copyFrom(created, quotation!);

    db.invoices.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put("/api/oilmart/invoices/:invoiceId/quotation", async ({ params, request }) => {
    await delay(280);
    const invoice = find(String(params.invoiceId));
    if (!invoice) return notFound();
    const { expectedUpdatedAt, quotationId } = await bodyOf(request);
    if (expectedUpdatedAt !== invoice.updatedAt) return stale(invoice);
    if (invoice.status !== "REJECTED") {
      return HttpResponse.json(
        {
          detail: `Only a REJECTED invoice can be pointed at a different quotation (current: ${invoice.status})`,
          code: "OILMART_INVOICE_ILLEGAL_TRANSITION",
        },
        { status: 409 },
      );
    }

    const { quotation, error } = requireInvoiceable(String(quotationId));
    if (error) return error;

    copyFrom(invoice, quotation!);
    invoice.status = "PENDING_APPROVAL";
    invoice.rejectedAt = undefined;
    invoice.rejectedByUserId = undefined;
    invoice.rejectionReason = undefined;
    return HttpResponse.json(invoice);
  }),

  http.post("/api/oilmart/invoices/:invoiceId/approve", async ({ params, request }) => {
    await delay(340);
    const invoice = find(String(params.invoiceId));
    if (!invoice) return notFound();
    const { expectedUpdatedAt } = await bodyOf(request);
    if (expectedUpdatedAt !== invoice.updatedAt) return stale(invoice);
    if (invoice.status !== "PENDING_APPROVAL") {
      return HttpResponse.json(
        {
          detail: `Only a PENDING_APPROVAL invoice can be approved (current: ${invoice.status})`,
          code: "OILMART_INVOICE_ILLEGAL_TRANSITION",
        },
        { status: 409 },
      );
    }

    const userId = currentUserId();
    try {
      invoice.lines.forEach((line) =>
        applyMovement(
          line.itemId,
          -line.quantityLitres,
          "SALE",
          "INVOICE",
          invoice.id,
          invoice.invoiceNo,
          userId,
        ),
      );
    } catch (error) {
      return HttpResponse.json(
        { detail: (error as Error).message, code: "OILMART_INSUFFICIENT_STOCK" },
        { status: 409 },
      );
    }

    invoice.status = "APPROVED";
    invoice.approvedByUserId = userId;
    invoice.approvedAt = new Date().toISOString();
    invoice.updatedAt = new Date().toISOString();
    return HttpResponse.json(invoice);
  }),

  http.post("/api/oilmart/invoices/:invoiceId/reject", async ({ params, request }) => {
    await delay(260);
    const invoice = find(String(params.invoiceId));
    if (!invoice) return notFound();
    const { expectedUpdatedAt, reason } = await bodyOf(request);
    if (expectedUpdatedAt !== invoice.updatedAt) return stale(invoice);
    if (invoice.status !== "PENDING_APPROVAL") {
      return HttpResponse.json(
        {
          detail: `Only a PENDING_APPROVAL invoice can be rejected (current: ${invoice.status})`,
          code: "OILMART_INVOICE_ILLEGAL_TRANSITION",
        },
        { status: 409 },
      );
    }
    if (!reason?.trim()) {
      return HttpResponse.json({ detail: "A rejection reason is required" }, { status: 400 });
    }

    invoice.status = "REJECTED";
    invoice.rejectedByUserId = currentUserId();
    invoice.rejectedAt = new Date().toISOString();
    invoice.rejectionReason = reason;
    invoice.updatedAt = new Date().toISOString();
    return HttpResponse.json(invoice);
  }),

];

import { HttpResponse, http, delay } from "msw";
import type { OilMartQuotation, OilMartQuotationLine, OilMartQuotationStatus } from "@core/types";
import type { SaveOilMartQuotationInput } from "../../selling/api";
import { currentUserId, db, itemById, nextDocumentNo, nextId } from "./mock-db";

const GST_RATE_PERCENT = 10;

const illegal = (
  quotation: OilMartQuotation,
  expected: OilMartQuotationStatus,
  action: string,
) =>
  HttpResponse.json(
    {
      title: "Illegal transition",
      detail: `Only a ${expected} quotation can be ${action} (current: ${quotation.status})`,
      code: "OILMART_QUOTATION_ILLEGAL_TRANSITION",
    },
    { status: 409 },
  );

const notFound = () => HttpResponse.json({ detail: "Quotation not found" }, { status: 404 });

const stale = (quotation: OilMartQuotation) =>
  HttpResponse.json(
    {
      title: "Conflict",
      detail: `${quotation.quotationNo} was changed by someone else since you loaded it — reload and try again`,
      code: "OILMART_QUOTATION_MODIFIED",
    },
    { status: 409 },
  );

function find(quotationId: string): OilMartQuotation | undefined {
  return db.quotations.find((q) => q.id === quotationId);
}

function isExpired(validUntil: string): boolean {
  return new Date(validUntil) < new Date(new Date().toDateString());
}

function buildLines(input: SaveOilMartQuotationInput): OilMartQuotationLine[] {
  return input.lines.map((line) => {
    const item = itemById(line.itemId);
    const price = db.prices.find((p) => p.itemId === line.itemId);
    const listUnitPrice = line.listUnitPrice ?? price?.sellPrice ?? 0;
    const unitPrice = line.unitPrice ?? listUnitPrice;
    const unitCost = price?.buyPrice ?? 0;
    const lineTotal = Number(
      (line.quantityLitres * unitPrice * (1 - line.discountPercent / 100)).toFixed(2),
    );
    const lineCost = Number((line.quantityLitres * unitCost).toFixed(2));
    return {
      id: nextId("qln"),
      itemId: line.itemId,
      itemCode: item?.code ?? "—",
      itemName: item?.name ?? "Unknown oil",
      quantityLitres: line.quantityLitres,
      listUnitPrice,
      unitPrice,
      isPriceOverride: listUnitPrice > 0 && listUnitPrice !== unitPrice,
      discountPercent: line.discountPercent,
      lineTotal,
      unitCost,
      lineCost,
      lineProfit: Number((lineTotal - lineCost).toFixed(2)),
    };
  });
}

function applyTotals(quotation: OilMartQuotation) {
  const subtotal = Number(quotation.lines.reduce((sum, l) => sum + l.lineTotal, 0).toFixed(2));
  const gstAmount = Number(((subtotal * quotation.gstRatePercent) / 100).toFixed(2));
  quotation.subtotal = subtotal;
  quotation.gstAmount = gstAmount;
  quotation.grandTotal = Number((subtotal + gstAmount).toFixed(2));
  quotation.totalCost = Number(quotation.lines.reduce((sum, l) => sum + (l.lineCost ?? 0), 0).toFixed(2));
  quotation.totalProfit = Number((subtotal - quotation.totalCost).toFixed(2));
  quotation.expired = isExpired(quotation.validUntil);
  quotation.editable = quotation.status === "DRAFT" || quotation.status === "REJECTED";
  quotation.updatedAt = new Date().toISOString();
}

function insufficientStock(input: SaveOilMartQuotationInput) {
  const requested = new Map<string, number>();
  input.lines.forEach((line) =>
    requested.set(line.itemId, (requested.get(line.itemId) ?? 0) + line.quantityLitres),
  );
  for (const [itemId, litres] of requested) {
    const onHand = db.stock.find((s) => s.itemId === itemId)?.quantityOnHand ?? 0;
    if (litres > onHand) {
      const name = itemById(itemId)?.name ?? "this oil";
      return `Only ${onHand} L of ${name} is in stock, ${litres} L was requested`;
    }
  }
  return null;
}

async function tokenOf(request: Request): Promise<{ expectedUpdatedAt?: string; reason?: string }> {
  try {
    return (await request.json()) as { expectedUpdatedAt?: string; reason?: string };
  } catch {
    return {};
  }
}

export const quotationHandlers = [
  http.get("/api/oilmart/quotations", async ({ request }) => {
    await delay(150);
    const status = new URL(request.url).searchParams.get("status");
    const rows = status ? db.quotations.filter((q) => q.status === status) : db.quotations;
    return HttpResponse.json(
      [...rows].sort((a, b) => b.issuedDate.localeCompare(a.issuedDate)),
    );
  }),

  http.get("/api/oilmart/quotations/:quotationId", async ({ params }) => {
    await delay(110);
    const quotation = find(String(params.quotationId));
    return quotation ? HttpResponse.json(quotation) : notFound();
  }),

  http.post("/api/oilmart/quotations", async ({ request }) => {
    await delay(320);
    const body = (await request.json()) as SaveOilMartQuotationInput;
    const client = db.clients.find((c) => c.id === body.clientId);
    if (!client) return HttpResponse.json({ detail: "Unknown client" }, { status: 400 });
    if (!body.lines.length) {
      return HttpResponse.json({ detail: "A quotation needs at least one line" }, { status: 400 });
    }

    const shortage = insufficientStock(body);
    if (shortage) {
      return HttpResponse.json(
        { detail: shortage, code: "OILMART_INSUFFICIENT_STOCK" },
        { status: 409 },
      );
    }

    const created: OilMartQuotation = {
      id: nextId("quotation"),
      quotationNo: nextDocumentNo("QT"),
      clientId: client.id,
      clientName: client.name,
      status: "DRAFT",
      createdByUserId: currentUserId(),
      issuedDate: body.issuedDate,
      validUntil: body.validUntil,
      expired: false,
      editable: true,
      subtotal: 0,
      gstRatePercent: GST_RATE_PERCENT,
      gstAmount: 0,
      grandTotal: 0,
      note: body.note,
      updatedAt: new Date().toISOString(),
      lines: buildLines(body),
    };
    applyTotals(created);

    db.quotations.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put("/api/oilmart/quotations/:quotationId", async ({ params, request }) => {
    await delay(300);
    const quotation = find(String(params.quotationId));
    if (!quotation) return notFound();
    if (!quotation.editable) {
      return illegal(quotation, "DRAFT", "edited");
    }

    const body = (await request.json()) as SaveOilMartQuotationInput & {
      expectedUpdatedAt: string;
    };
    if (body.expectedUpdatedAt !== quotation.updatedAt) return stale(quotation);

    const shortage = insufficientStock(body);
    if (shortage) {
      return HttpResponse.json(
        { detail: shortage, code: "OILMART_INSUFFICIENT_STOCK" },
        { status: 409 },
      );
    }

    const wasRejected = quotation.status === "REJECTED";
    quotation.issuedDate = body.issuedDate;
    quotation.validUntil = body.validUntil;
    quotation.note = body.note;
    quotation.lines = buildLines(body);
    if (wasRejected) {
      quotation.status = "PENDING_APPROVAL";
      quotation.submittedAt = new Date().toISOString();
      quotation.rejectedAt = undefined;
      quotation.rejectedByUserId = undefined;
      quotation.rejectionReason = undefined;
    }
    applyTotals(quotation);
    return HttpResponse.json(quotation);
  }),

  http.post("/api/oilmart/quotations/:quotationId/submit", async ({ params, request }) => {
    await delay(220);
    const quotation = find(String(params.quotationId));
    if (!quotation) return notFound();
    const { expectedUpdatedAt } = await tokenOf(request);
    if (expectedUpdatedAt !== quotation.updatedAt) return stale(quotation);
    if (quotation.status !== "DRAFT" && quotation.status !== "REJECTED") {
      return illegal(quotation, "DRAFT", "submitted for approval");
    }

    quotation.status = "PENDING_APPROVAL";
    quotation.submittedAt = new Date().toISOString();
    quotation.rejectionReason = undefined;
    applyTotals(quotation);
    return HttpResponse.json(quotation);
  }),

  http.post("/api/oilmart/quotations/:quotationId/approve", async ({ params, request }) => {
    await delay(260);
    const quotation = find(String(params.quotationId));
    if (!quotation) return notFound();
    const { expectedUpdatedAt } = await tokenOf(request);
    if (expectedUpdatedAt !== quotation.updatedAt) return stale(quotation);
    if (quotation.status !== "PENDING_APPROVAL") {
      return illegal(quotation, "PENDING_APPROVAL", "approved");
    }
    if (isExpired(quotation.validUntil)) {
      return HttpResponse.json(
        {
          detail: `This quotation is not valid now, it needs to be edited with current dates (valid until ${quotation.validUntil})`,
          code: "OILMART_QUOTATION_EXPIRED",
        },
        { status: 409 },
      );
    }

    quotation.status = "APPROVED";
    quotation.approvedByUserId = currentUserId();
    quotation.approvedAt = new Date().toISOString();
    quotation.rejectionReason = undefined;
    applyTotals(quotation);
    return HttpResponse.json(quotation);
  }),

  http.post("/api/oilmart/quotations/:quotationId/reject", async ({ params, request }) => {
    await delay(260);
    const quotation = find(String(params.quotationId));
    if (!quotation) return notFound();
    const { expectedUpdatedAt, reason } = await tokenOf(request);
    if (expectedUpdatedAt !== quotation.updatedAt) return stale(quotation);
    if (quotation.status !== "PENDING_APPROVAL") {
      return illegal(quotation, "PENDING_APPROVAL", "rejected");
    }
    if (!reason?.trim()) {
      return HttpResponse.json({ detail: "A rejection reason is required" }, { status: 400 });
    }

    quotation.status = "REJECTED";
    quotation.rejectedByUserId = currentUserId();
    quotation.rejectedAt = new Date().toISOString();
    quotation.rejectionReason = reason;
    applyTotals(quotation);
    return HttpResponse.json(quotation);
  }),

  http.post("/api/oilmart/quotations/:quotationId/cancel", async ({ params, request }) => {
    await delay(240);
    const quotation = find(String(params.quotationId));
    if (!quotation) return notFound();
    const { expectedUpdatedAt, reason } = await tokenOf(request);
    if (expectedUpdatedAt !== quotation.updatedAt) return stale(quotation);
    if (quotation.status === "APPROVED" || quotation.status === "CANCELLED") {
      return HttpResponse.json(
        {
          title: "Illegal transition",
          detail: `An ${quotation.status} quotation cannot be cancelled`,
          code: "OILMART_QUOTATION_ILLEGAL_TRANSITION",
        },
        { status: 409 },
      );
    }

    quotation.status = "CANCELLED";
    quotation.cancellationReason = reason;
    applyTotals(quotation);
    return HttpResponse.json(quotation);
  }),
];

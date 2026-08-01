import { HttpResponse, http, delay } from "msw";
import type { OilMartSale, OilMartSaleLine, OilMartSaleStatus } from "@core/types";
import type { CreateOilMartSaleInput, DispatchOilMartSaleInput } from "../../selling/api";
import { applyMovement, currentUserId, db, itemById, nextDocumentNo, nextId } from "./mock-db";

const illegal = (sale: OilMartSale, expected: OilMartSaleStatus, action: string) =>
  HttpResponse.json(
    {
      title: "Illegal transition",
      detail: `Only a ${expected} sale can be ${action} (current: ${sale.status})`,
    },
    { status: 409 },
  );

const notFound = () => HttpResponse.json({ detail: "Sale not found" }, { status: 404 });

function findSale(saleId: string): OilMartSale | undefined {
  return db.sales.find((s) => s.id === saleId);
}

export const saleHandlers = [
  http.get("/api/oilmart/sales", async ({ request }) => {
    await delay(150);
    const status = new URL(request.url).searchParams.get("status");
    const sales = status ? db.sales.filter((s) => s.status === status) : db.sales;
    return HttpResponse.json([...sales].sort((a, b) => b.quotedAt.localeCompare(a.quotedAt)));
  }),

  http.get("/api/oilmart/sales/:saleId", async ({ params }) => {
    await delay(110);
    const sale = findSale(String(params.saleId));
    return sale ? HttpResponse.json(sale) : notFound();
  }),

  http.post("/api/oilmart/sales", async ({ request }) => {
    await delay(320);
    const body = (await request.json()) as CreateOilMartSaleInput;
    const client = db.clients.find((c) => c.id === body.clientId);
    if (!client) return HttpResponse.json({ detail: "Unknown client" }, { status: 400 });
    if (!body.lines.length) {
      return HttpResponse.json({ detail: "At least one line is required" }, { status: 400 });
    }

    const lines: OilMartSaleLine[] = body.lines.map((line) => {
      const item = itemById(line.itemId);
      const gross = line.quantityLitres * line.unitPrice;
      return {
        id: nextId("sln"),
        itemId: line.itemId,
        itemCode: item?.code ?? "—",
        itemName: item?.name ?? "Unknown oil",
        quantityLitres: line.quantityLitres,
        listUnitPrice: line.listUnitPrice,
        unitPrice: line.unitPrice,
        isPriceOverride: line.isPriceOverride,
        discountPercent: line.discountPercent,
        lineTotal: Number((gross * (1 - line.discountPercent / 100)).toFixed(2)),
      };
    });

    const subtotal = Number(lines.reduce((sum, l) => sum + l.lineTotal, 0).toFixed(2));

    const created: OilMartSale = {
      id: nextId("sale"),
      saleNo: nextDocumentNo("QT"),
      clientId: client.id,
      clientName: client.name,
      status: "QUOTATION",
      createdByUserId: currentUserId(),
      quotedAt: body.quotedAt,
      validUntil: body.validUntil,
      subtotal,
      discountAmount: body.discountAmount,
      total: Number((subtotal - body.discountAmount).toFixed(2)),
      note: body.note,
      lines,
    };

    db.sales.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.post("/api/oilmart/sales/:saleId/confirm", async ({ params }) => {
    await delay(260);
    const sale = findSale(String(params.saleId));
    if (!sale) return notFound();
    if (sale.status !== "QUOTATION") return illegal(sale, "QUOTATION", "confirmed as an order");

    sale.status = "ORDERED";
    sale.saleNo = nextDocumentNo("SO");
    sale.orderedAt = new Date().toISOString();
    return HttpResponse.json(sale);
  }),

  http.post("/api/oilmart/sales/:saleId/approve", async ({ params }) => {
    await delay(260);
    const sale = findSale(String(params.saleId));
    if (!sale) return notFound();
    if (sale.status !== "ORDERED") return illegal(sale, "ORDERED", "approved");

    const approver = currentUserId();
    if (approver === sale.createdByUserId) {
      return HttpResponse.json(
        {
          title: "Self approval",
          detail: "The approver must differ from the person who raised the sale",
        },
        { status: 409 },
      );
    }

    sale.status = "APPROVED";
    sale.approvedByUserId = approver;
    sale.approvedAt = new Date().toISOString();
    sale.rejectionReason = undefined;
    return HttpResponse.json(sale);
  }),

  http.post("/api/oilmart/sales/:saleId/reject", async ({ params, request }) => {
    await delay(260);
    const sale = findSale(String(params.saleId));
    if (!sale) return notFound();
    if (sale.status !== "ORDERED") return illegal(sale, "ORDERED", "rejected");

    const { reason } = (await request.json()) as { reason: string };
    if (!reason?.trim()) {
      return HttpResponse.json({ detail: "A rejection reason is required" }, { status: 400 });
    }

    sale.status = "REJECTED";
    sale.approvedByUserId = currentUserId();
    sale.approvedAt = new Date().toISOString();
    sale.rejectionReason = reason;
    return HttpResponse.json(sale);
  }),

  http.post("/api/oilmart/sales/:saleId/dispatch", async ({ params, request }) => {
    await delay(380);
    const sale = findSale(String(params.saleId));
    if (!sale) return notFound();
    if (sale.status !== "APPROVED") return illegal(sale, "APPROVED", "dispatched");

    const body = (await request.json()) as DispatchOilMartSaleInput;
    const userId = currentUserId();

    try {
      sale.lines.forEach((line) =>
        applyMovement(
          line.itemId,
          -line.quantityLitres,
          "SALE",
          "SALE",
          sale.id,
          sale.saleNo,
          userId,
        ),
      );
    } catch (error) {
      return HttpResponse.json({ detail: (error as Error).message }, { status: 409 });
    }

    sale.status = "DISPATCHED";
    sale.dispatchedAt = new Date().toISOString();
    sale.dispatchedByUserId = userId;
    sale.vehicleNo = body.vehicleNo;
    sale.driverName = body.driverName;
    return HttpResponse.json(sale);
  }),

  http.post("/api/oilmart/sales/:saleId/invoice", async ({ params, request }) => {
    await delay(280);
    const sale = findSale(String(params.saleId));
    if (!sale) return notFound();
    if (sale.status !== "DISPATCHED") return illegal(sale, "DISPATCHED", "invoiced");

    const { paymentMethod } = (await request.json()) as { paymentMethod: OilMartSale["paymentMethod"] };

    sale.status = "INVOICED";
    sale.invoiceNo = nextDocumentNo("INV");
    sale.invoicedAt = new Date().toISOString();
    sale.invoicedByUserId = currentUserId();
    sale.paymentMethod = paymentMethod;
    return HttpResponse.json(sale);
  }),

  http.post("/api/oilmart/sales/:saleId/cancel", async ({ params, request }) => {
    await delay(240);
    const sale = findSale(String(params.saleId));
    if (!sale) return notFound();
    if (sale.status !== "QUOTATION" && sale.status !== "ORDERED") {
      return HttpResponse.json(
        {
          title: "Illegal transition",
          detail: `Only a QUOTATION or ORDERED sale can be cancelled (current: ${sale.status})`,
        },
        { status: 409 },
      );
    }

    const { reason } = (await request.json()) as { reason: string };
    sale.status = "CANCELLED";
    sale.cancellationReason = reason;
    return HttpResponse.json(sale);
  }),
];

import { HttpResponse, http, delay } from "msw";
import type { OilMartReceipt, OilMartReceiptLine } from "@core/types";
import type { RecordOilMartReceiptInput } from "../../receiving/api";
import { applyMovement, currentUserId, db, itemById, nextDocumentNo, nextId } from "./mock-db";

export const receiptHandlers = [
  http.get("/api/oilmart/receipts", async ({ request }) => {
    await delay(130);
    const supplierId = new URL(request.url).searchParams.get("supplierId");
    const receipts = supplierId
      ? db.receipts.filter((r) => r.supplierId === supplierId)
      : db.receipts;
    return HttpResponse.json([...receipts].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)));
  }),

  http.get("/api/oilmart/receipts/:receiptId/movements", async ({ params }) => {
    await delay(110);
    return HttpResponse.json(db.movements.filter((m) => m.referenceId === params.receiptId));
  }),

  http.get("/api/oilmart/receipts/:receiptId", async ({ params }) => {
    await delay(90);
    const receipt = db.receipts.find((r) => r.id === params.receiptId);
    if (!receipt) return HttpResponse.json({ detail: "Receipt not found" }, { status: 404 });
    return HttpResponse.json(receipt);
  }),

  http.post("/api/oilmart/receipts", async ({ request }) => {
    await delay(320);
    const body = (await request.json()) as RecordOilMartReceiptInput;
    const supplier = db.suppliers.find((s) => s.id === body.supplierId);
    if (!supplier) return HttpResponse.json({ detail: "Unknown supplier" }, { status: 400 });
    if (!body.lines.length) {
      return HttpResponse.json({ detail: "At least one line is required" }, { status: 400 });
    }

    const receiptId = nextId("rcp");
    const receiptNo = nextDocumentNo("GRN");

    const lines: OilMartReceiptLine[] = body.lines.map((line) => {
      const item = itemById(line.itemId);
      return {
        id: nextId("rcl"),
        itemId: line.itemId,
        itemCode: item?.code ?? "—",
        itemName: item?.name ?? "Unknown oil",
        quantityLitres: line.quantityLitres,
        buyUnitPrice: line.buyUnitPrice,
        lineTotal: Number((line.quantityLitres * line.buyUnitPrice).toFixed(2)),
      };
    });

    const created: OilMartReceipt = {
      id: receiptId,
      receiptNo,
      supplierId: supplier.id,
      supplierName: supplier.name,
      referenceNo: body.referenceNo,
      receivedAt: body.receivedAt,
      receivedByUserId: currentUserId(),
      totalCost: Number(lines.reduce((sum, l) => sum + l.lineTotal, 0).toFixed(2)),
      note: body.note,
      lines,
    };

    lines.forEach((line) =>
      applyMovement(
        line.itemId,
        line.quantityLitres,
        "RECEIPT",
        "RECEIPT",
        receiptId,
        receiptNo,
        created.receivedByUserId,
      ),
    );

    db.receipts.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
];

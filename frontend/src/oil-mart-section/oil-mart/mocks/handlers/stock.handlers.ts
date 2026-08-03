import { HttpResponse, http, delay } from "msw";
import type { AdjustOilMartStockInput } from "../../stock/api";
import { applyMovement, currentUserId, db, itemById } from "./mock-db";

export const stockHandlers = [
  http.get("/api/oilmart/stock/low", async () => {
    await delay(90);
    return HttpResponse.json(db.stock.filter((s) => s.quantityOnHand < s.reorderLevelLitres));
  }),

  http.get("/api/oilmart/stock/:itemId/movements", async ({ params }) => {
    await delay(140);
    const movements = db.movements
      .filter((m) => m.itemId === params.itemId)
      .sort((a, b) => b.movedAt.localeCompare(a.movedAt));
    return HttpResponse.json(movements);
  }),

  http.get("/api/oilmart/stock", async () => {
    await delay(130);
    return HttpResponse.json(db.stock);
  }),

  http.post("/api/oilmart/stock/adjustments", async ({ request }) => {
    await delay(260);
    const body = (await request.json()) as AdjustOilMartStockInput;
    const item = itemById(body.itemId);

    if (!item) return HttpResponse.json({ detail: "Unknown oil" }, { status: 404 });
    if (item.status !== "ACTIVE") {
      return HttpResponse.json(
        { detail: `${item.name} is inactive and cannot be restocked` },
        { status: 400 },
      );
    }
    if (!body.quantityLitres || body.quantityLitres <= 0) {
      return HttpResponse.json(
        { detail: "A stock adjustment needs a quantity greater than zero" },
        { status: 400 },
      );
    }
    if (!body.reason?.trim()) {
      return HttpResponse.json({ detail: "A stock adjustment needs a reason" }, { status: 400 });
    }

    const delta = body.direction === "IN" ? body.quantityLitres : -body.quantityLitres;

    try {
      const movement = applyMovement(
        body.itemId,
        delta,
        "ADJUSTMENT",
        "MANUAL",
        undefined,
        undefined,
        currentUserId(),
        body.reason.trim(),
      );
      return HttpResponse.json(movement, { status: 201 });
    } catch (error) {
      return HttpResponse.json({ detail: (error as Error).message }, { status: 400 });
    }
  }),
];

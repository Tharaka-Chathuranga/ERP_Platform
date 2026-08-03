import { HttpResponse, http, delay } from "msw";
import { db } from "./mock-db";

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
];

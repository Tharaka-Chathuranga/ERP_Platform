import { HttpResponse, http, delay } from "msw";
import type { OilMartOverview } from "@core/types";
import { db } from "./mock-db";
import { oilMartOverview } from "../oil-mart.fixtures";

export const overviewHandlers = [
  http.get("/api/oilmart/overview", async () => {
    await delay(180);
    const lowStock = db.stock.filter((s) => s.quantityOnHand < s.reorderLevelLitres);
    const pendingApprovals = db.sales.filter((s) => s.status === "ORDERED");

    const overview: OilMartOverview = {
      ...oilMartOverview,
      stockValue: Number(db.stock.reduce((sum, s) => sum + s.stockValue, 0).toFixed(2)),
      awaitingApproval: pendingApprovals.length,
      lowStockCount: lowStock.length,
      lowStock,
      pendingApprovals,
    };

    return HttpResponse.json(overview);
  }),
];

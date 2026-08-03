import { HttpResponse, http, delay } from "msw";
import type { OilMartOverview } from "@core/types";
import { db } from "./mock-db";
import { oilMartOverview } from "../oil-mart.fixtures";

export const overviewHandlers = [
  http.get("/api/oilmart/overview", async ({ request }) => {
    await delay(180);
    const period = (new URL(request.url).searchParams.get("period") ??
      "THIS_MONTH") as OilMartOverview["period"];
    const lowStock = db.stock.filter((s) => s.quantityOnHand < s.reorderLevelLitres);
    const pendingApprovals = db.quotations.filter((q) => q.status === "PENDING_APPROVAL");

    const overview: OilMartOverview = {
      ...oilMartOverview,
      period,
      trendBucket: period === "TODAY" ? "HOURS" : "DAYS",
      salesTrend:
        period === "TODAY"
          ? Array.from({ length: 12 }, (_, hour) => ({
              bucketStart: `2026-08-03T${String(hour + 8).padStart(2, "0")}:00:00Z`,
              total: [0, 0, 18000, 42000, 0, 61000, 12000, 0, 39000, 0, 25000, 0][hour],
            }))
          : oilMartOverview.salesTrend,
      stockValue: Number(db.stock.reduce((sum, s) => sum + s.stockValue, 0).toFixed(2)),
      awaitingApproval: pendingApprovals.length,
      lowStockCount: lowStock.length,
      lowStock,
      pendingApprovals,
    };

    return HttpResponse.json(overview);
  }),
];

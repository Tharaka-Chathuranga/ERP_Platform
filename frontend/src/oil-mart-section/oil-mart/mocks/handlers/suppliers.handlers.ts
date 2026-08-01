import { HttpResponse, http, delay } from "msw";
import type { OilMartSupplier } from "@core/types";
import { db, nextId } from "./mock-db";

export const supplierHandlers = [
  http.get("/api/oilmart/suppliers", async () => {
    await delay(100);
    return HttpResponse.json(db.suppliers);
  }),

  http.post("/api/oilmart/suppliers", async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as Omit<OilMartSupplier, "id">;
    const created: OilMartSupplier = { ...body, id: nextId("sup") };
    db.suppliers.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put("/api/oilmart/suppliers/:supplierId", async ({ params, request }) => {
    await delay(200);
    const body = (await request.json()) as Omit<OilMartSupplier, "id">;
    const index = db.suppliers.findIndex((s) => s.id === params.supplierId);
    if (index < 0) return HttpResponse.json({ detail: "Supplier not found" }, { status: 404 });
    db.suppliers[index] = { ...body, id: String(params.supplierId) };
    return HttpResponse.json(db.suppliers[index]);
  }),
];

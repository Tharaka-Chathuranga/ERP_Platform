import { HttpResponse, http, delay } from "msw";
import type { OilMartItem, OilMartItemPrice } from "@core/types";
import { currentUserId, db, nextId } from "./mock-db";

const matches = (item: OilMartItem, search: string) =>
  [item.code, item.name, item.brand, item.grade]
    .filter(Boolean)
    .some((field) => field!.toLowerCase().includes(search.toLowerCase()));

export const itemHandlers = [
  http.get("/api/oilmart/items", async ({ request }) => {
    await delay(120);
    const search = new URL(request.url).searchParams.get("search");
    const items = search ? db.items.filter((i) => matches(i, search)) : db.items;
    return HttpResponse.json(items);
  }),

  http.get("/api/oilmart/items/:itemId/prices", async ({ params }) => {
    await delay(100);
    const prices = db.prices
      .filter((p) => p.itemId === params.itemId)
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
    return HttpResponse.json(prices);
  }),

  http.get("/api/oilmart/items/:itemId/price", async ({ params, request }) => {
    await delay(60);
    const on = new URL(request.url).searchParams.get("on") ?? new Date().toISOString().slice(0, 10);
    const price = db.prices.find(
      (p) => p.itemId === params.itemId && p.effectiveFrom <= on && (!p.effectiveTo || p.effectiveTo >= on),
    );
    return HttpResponse.json(price ?? null);
  }),

  http.get("/api/oilmart/items/:itemId", async ({ params }) => {
    await delay(80);
    const item = db.items.find((i) => i.id === params.itemId);
    if (!item) return HttpResponse.json({ detail: "Oil not found" }, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post("/api/oilmart/items", async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as Omit<OilMartItem, "id">;
    const created: OilMartItem = { ...body, id: nextId("itm") };
    db.items.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put("/api/oilmart/items/:itemId", async ({ params, request }) => {
    await delay(200);
    const body = (await request.json()) as Omit<OilMartItem, "id">;
    const index = db.items.findIndex((i) => i.id === params.itemId);
    if (index < 0) return HttpResponse.json({ detail: "Oil not found" }, { status: 404 });
    db.items[index] = { ...body, id: String(params.itemId) };
    return HttpResponse.json(db.items[index]);
  }),

  http.post("/api/oilmart/items/:itemId/prices", async ({ params, request }) => {
    await delay(200);
    const body = (await request.json()) as Omit<OilMartItemPrice, "id" | "itemId" | "recordedByUserId">;
    const itemId = String(params.itemId);

    const open = db.prices.find((p) => p.itemId === itemId && !p.effectiveTo);
    if (open) {
      const dayBefore = new Date(body.effectiveFrom);
      dayBefore.setDate(dayBefore.getDate() - 1);
      open.effectiveTo = dayBefore.toISOString().slice(0, 10);
    }

    const created: OilMartItemPrice = {
      ...body,
      effectiveTo: body.effectiveTo ?? null,
      id: nextId("prc"),
      itemId,
      recordedByUserId: currentUserId(),
    };
    db.prices.push(created);

    const balance = db.stock.find((s) => s.itemId === itemId);
    if (balance) {
      balance.buyPrice = created.buyPrice;
      balance.sellPrice = created.sellPrice;
      balance.stockValue = Number((balance.quantityOnHand * created.buyPrice).toFixed(2));
    }

    return HttpResponse.json(created, { status: 201 });
  }),
];

import { HttpResponse, http, delay } from "msw";
import type { OilMartClient } from "@core/types";
import { db, nextId } from "./mock-db";

export const clientHandlers = [
  http.get("/api/oilmart/clients", async ({ request }) => {
    await delay(110);
    const search = new URL(request.url).searchParams.get("search");
    const clients = search
      ? db.clients.filter((c) =>
          [c.code, c.name, c.contactPerson]
            .filter(Boolean)
            .some((f) => f!.toLowerCase().includes(search.toLowerCase())),
        )
      : db.clients;
    return HttpResponse.json(clients);
  }),

  http.get("/api/oilmart/clients/:clientId/quotations", async ({ params }) => {
    await delay(120);
    return HttpResponse.json(db.quotations.filter((q) => q.clientId === params.clientId));
  }),

  http.get("/api/oilmart/clients/:clientId", async ({ params }) => {
    await delay(80);
    const client = db.clients.find((c) => c.id === params.clientId);
    if (!client) return HttpResponse.json({ detail: "Client not found" }, { status: 404 });
    return HttpResponse.json(client);
  }),

  http.post("/api/oilmart/clients/quick-add", async ({ request }) => {
    await delay(200);
    const { name } = (await request.json()) as { name: string };
    const trimmed = name.trim();
    const existing = db.clients.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (existing) return HttpResponse.json(existing, { status: 201 });

    const code = trimmed
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 56);
    const created: OilMartClient = {
      id: nextId("cli"),
      code: code || "CLIENT",
      name: trimmed,
      status: "ACTIVE",
      profileIncomplete: true,
    };
    db.clients.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.post("/api/oilmart/clients", async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as Omit<OilMartClient, "id">;
    const created: OilMartClient = { ...body, id: nextId("cli") };
    db.clients.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put("/api/oilmart/clients/:clientId", async ({ params, request }) => {
    await delay(200);
    const body = (await request.json()) as Omit<OilMartClient, "id">;
    const index = db.clients.findIndex((c) => c.id === params.clientId);
    if (index < 0) return HttpResponse.json({ detail: "Client not found" }, { status: 404 });
    db.clients[index] = { ...body, id: String(params.clientId) };
    return HttpResponse.json(db.clients[index]);
  }),
];

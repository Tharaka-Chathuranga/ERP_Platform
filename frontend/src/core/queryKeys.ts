/**
 * Single source of truth for React Query keys.
 *
 * Import these builders instead of writing string-literal keys inline. Because
 * the fetch key and the invalidation key now come from the same function, they
 * can't silently drift — which is exactly the bug we had before: a receival was
 * fetched under ["grn", id] but invalidated under ["grns"], so the invalidation
 * matched nothing and the detail view served stale data.
 *
 * Convention:
 *   - Plural builder  → a list query.  Singular builder → one entity.
 *   - A list builder called with no/empty filter returns just its root, e.g.
 *     qk.receivals() === ["receivals"]. React Query matches by key *prefix*, so
 *     invalidating ["receivals"] clears every filtered variant
 *     (["receivals", supplierId]) in one call.
 *   - Entity keys are hierarchical (["item", id, "on-hand"]) so invalidating the
 *     parent (["item", id]) also clears everything derived from it.
 */

/** "ALL" is the UI's sentinel for an unfiltered list; treat it as no filter. */
const filtered = (root: string, value?: string) =>
  value && value !== "ALL" ? ([root, value] as const) : ([root] as const);

export const qk = {
  // ── Items & stock ──
  items: (search?: string) => filtered("items", search),
  item: (id: string) => ["item", id] as const,
  onHand: (itemId: string) => ["item", itemId, "on-hand"] as const,
  movements: (itemId: string) => ["item", itemId, "movements"] as const,

  // ── Stock movements (cross-item reporting) ──
  allMovements: () => ["movements"] as const,
  movementSummary: () => ["movements", "summary"] as const,

  // ── Suppliers ──
  suppliers: () => ["suppliers"] as const,
  supplier: (id: string) => ["supplier", id] as const,
  supplierItems: (id: string) => ["supplier", id, "items"] as const,

  // ── Users ──
  users: (department?: string) => filtered("users", department),

  // ── Receivals & GRNs ──
  receivals: (supplierId?: string) => filtered("receivals", supplierId),
  receival: (id: string) => ["receival", id] as const,
  goodsReceipts: () => ["goods-receipts"] as const,
  goodsReceipt: (id: string) => ["goods-receipt", id] as const,

  // ── Goods issuing ──
  issues: (status?: string) => filtered("issues", status),
  issue: (id: string) => ["issue", id] as const,

  // ── Borrow requests ──
  borrowRequests: (status?: string) => filtered("borrow-requests", status),
  borrowRequest: (id: string) => ["borrow-request", id] as const,

  // ── Deviation (defect) requests ──
  deviations: (stage?: string) => filtered("deviations", stage),
  deviation: (id: string) => ["deviation", id] as const,

  // ── Admin: dashboard ──
  adminSummary: () => ["admin", "summary"] as const,
  lowStock: () => ["admin", "low-stock"] as const,
  movementTrend: (days: number) => ["admin", "movement-trend", days] as const,
  defectItems: (stage?: string) => filtered("admin-defect-items", stage),

  // ── Admin: count-adjustment requests ──
  countRequests: (status?: string) => filtered("count-requests", status),
  countRequest: (id: string) => ["count-request", id] as const,

  // ── Admin: user management ──
  adminUsers: () => ["admin", "users"] as const,
  adminUser: (id: string) => ["admin", "user", id] as const,
} as const;

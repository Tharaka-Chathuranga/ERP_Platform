import dayjs from "dayjs";
import type { MovementType, StockMovement } from "@core/types";

/** Movement types that reduce stock; everything else adds stock. */
export const OUT_TYPES: ReadonlySet<MovementType> = new Set<MovementType>([
  "ISSUE",
  "ADJUSTMENT_OUT",
  "TRANSFER_OUT",
]);

/** True when a movement takes stock out (issue / adjustment-out / transfer-out). */
export const isOutbound = (type: MovementType) => OUT_TYPES.has(type);

export type Period = "week" | "month";

/** Per-item received-vs-issued totals plus the out/in ratio that flags drainers. */
export interface ItemMovement {
  itemId: string;
  in: number;
  out: number;
  /** out / in. Infinity when stock only left and never came in. */
  ratio: number;
}

export interface MovementTotals {
  in: number;
  out: number;
  net: number;
  itemsMoved: number;
  count: number;
}

export interface MovementStats {
  totals: MovementTotals;
  /** All items that moved, busiest (in + out) first. */
  byItem: ItemMovement[];
  /** Daily inflow/outflow buckets, oldest first — feeds the trend chart. */
  byDay: { date: string; In: number; Out: number }[];
}

/** out / in, treating "only went out" as a maximally-critical Infinity. */
function ratioOf(inQty: number, outQty: number) {
  if (inQty > 0) return outQty / inQty;
  return outQty > 0 ? Infinity : 0;
}

/** Keep only movements that fall inside the current week or month. */
export function inPeriod(rows: StockMovement[], period: Period): StockMovement[] {
  const start = dayjs().startOf(period);
  return rows.filter((m) => dayjs(m.occurredAt).isAfter(start));
}

/**
 * Aggregate a flat movement list into the figures the dashboard renders.
 * Counts all six movement types (not just RECEIPT/ISSUE) so the stats are
 * complete — that's the gap the server `/summary` endpoint leaves open.
 */
export function computeMovementStats(rows: StockMovement[]): MovementStats {
  const perItem = new Map<string, { in: number; out: number }>();
  const perDay = new Map<string, { In: number; Out: number }>();
  let totalIn = 0;
  let totalOut = 0;

  for (const m of rows) {
    const out = isOutbound(m.type);
    const qty = m.quantity;

    const item = perItem.get(m.itemId) ?? { in: 0, out: 0 };
    const day = dayjs(m.occurredAt).format("YYYY-MM-DD");
    const bucket = perDay.get(day) ?? { In: 0, Out: 0 };

    if (out) {
      item.out += qty;
      bucket.Out += qty;
      totalOut += qty;
    } else {
      item.in += qty;
      bucket.In += qty;
      totalIn += qty;
    }
    perItem.set(m.itemId, item);
    perDay.set(day, bucket);
  }

  const byItem: ItemMovement[] = [...perItem.entries()]
    .map(([itemId, v]) => ({ itemId, in: v.in, out: v.out, ratio: ratioOf(v.in, v.out) }))
    .sort((a, b) => b.in + b.out - (a.in + a.out));

  const byDay = [...perDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date: dayjs(date).format("MMM DD"), In: v.In, Out: v.Out }));

  return {
    totals: {
      in: totalIn,
      out: totalOut,
      net: totalIn - totalOut,
      itemsMoved: perItem.size,
      count: rows.length,
    },
    byItem,
    byDay,
  };
}

/**
 * The flagged-critical items that moved, most-drained first (highest out/in
 * ratio). "Critical" is the item's own `criticalItem` flag — not a heuristic —
 * so this matches what the store team marked as critical.
 */
export function criticalItems(
  byItem: ItemMovement[],
  isCritical: (itemId: string) => boolean,
): ItemMovement[] {
  return byItem.filter((i) => isCritical(i.itemId)).sort((a, b) => b.ratio - a.ratio);
}

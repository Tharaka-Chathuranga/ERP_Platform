import type {
  OilMartClient,
  OilMartItem,
  OilMartItemPrice,
  OilMartReceipt,
  OilMartInvoice,
  OilMartQuotation,
  OilMartStockBalance,
  OilMartStockMovement,
  OilMartSupplier,
} from "@core/types";
import {
  oilMartClients,
  oilMartItemPrices,
  oilMartItems,
  oilMartMovements,
  oilMartReceipts,
  oilMartInvoices,
  oilMartQuotations,
  oilMartStock,
  oilMartSuppliers,
} from "../oil-mart.fixtures";

interface MockDb {
  items: OilMartItem[];
  prices: OilMartItemPrice[];
  suppliers: OilMartSupplier[];
  clients: OilMartClient[];
  stock: OilMartStockBalance[];
  movements: OilMartStockMovement[];
  receipts: OilMartReceipt[];
  quotations: OilMartQuotation[];
  invoices: OilMartInvoice[];
  sequence: number;
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function seed(): MockDb {
  return {
    items: clone(oilMartItems),
    prices: clone(oilMartItemPrices),
    suppliers: clone(oilMartSuppliers),
    clients: clone(oilMartClients),
    stock: clone(oilMartStock),
    movements: clone(oilMartMovements),
    receipts: clone(oilMartReceipts),
    quotations: clone(oilMartQuotations),
    invoices: clone(oilMartInvoices),
    sequence: 100,
  };
}

export const db: MockDb = seed();

export function resetMockDb() {
  Object.assign(db, seed());
}

export function nextId(prefix: string): string {
  db.sequence += 1;
  return `${prefix}-${db.sequence}`;
}

export function nextDocumentNo(prefix: string): string {
  db.sequence += 1;
  return `${prefix}-26-08-${String(db.sequence).padStart(3, "0")}`;
}

export function itemById(itemId: string): OilMartItem | undefined {
  return db.items.find((i) => i.id === itemId);
}

export function balanceFor(itemId: string): OilMartStockBalance | undefined {
  return db.stock.find((s) => s.itemId === itemId);
}

export function applyMovement(
  itemId: string,
  quantityDelta: number,
  movementType: OilMartStockMovement["movementType"],
  referenceType: OilMartStockMovement["referenceType"],
  referenceId: string,
  referenceNo: string,
  movedByUserId: string,
): OilMartStockMovement {
  const item = itemById(itemId);
  let balance = balanceFor(itemId);

  if (!balance && item) {
    balance = {
      itemId,
      itemCode: item.code,
      itemName: item.name,
      oilType: item.oilType,
      quantityOnHand: 0,
      reorderLevelLitres: item.reorderLevelLitres,
      stockValue: 0,
    };
    db.stock.push(balance);
  }

  if (!balance) throw new Error(`Unknown oil mart item ${itemId}`);

  const next = balance.quantityOnHand + quantityDelta;
  if (next < 0) {
    throw new Error(
      `Insufficient stock for ${balance.itemName}: ${balance.quantityOnHand} L on hand, ${Math.abs(quantityDelta)} L required`,
    );
  }

  balance.quantityOnHand = Number(next.toFixed(4));
  balance.stockValue = Number((balance.quantityOnHand * (balance.buyPrice ?? 0)).toFixed(2));
  balance.lastMovementAt = new Date().toISOString();

  const movement: OilMartStockMovement = {
    id: nextId("mov"),
    itemId,
    movementType,
    quantityDelta,
    balanceAfter: balance.quantityOnHand,
    referenceType,
    referenceId,
    referenceNo,
    movedAt: new Date().toISOString(),
    movedByUserId,
  };

  db.movements.push(movement);
  return movement;
}

export function currentUserId(): string {
  try {
    const raw = localStorage.getItem("erp.user");
    if (!raw) return "mock-user-admin";
    return (JSON.parse(raw) as { userId?: string }).userId ?? "mock-user-admin";
  } catch {
    return "mock-user-admin";
  }
}

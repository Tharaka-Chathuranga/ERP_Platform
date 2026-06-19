import { api } from "@core/http/client";
import type {
  Item,
  LowStockItem,
  MovementType,
  OnHand,
  Page,
  StockMovement,
  ValuationMethod,
} from "@core/types";

// ── Items & stock. Mirrors the backend store REST contract. ──

export interface CreateItemInput {
  itemCode: string;
  name: string;
  description?: string;
  unitOfMeasure: string;
  category?: string;
  valuationMethod: ValuationMethod;
  reorderLevel: number;
}

export interface PostMovementInput {
  itemId: string;
  type: MovementType;
  quantity: number;
  unitCost?: number;
  reference?: string;
  occurredAt?: string;
}

export async function listItems(search?: string): Promise<Page<Item>> {
  const { data } = await api.get<Page<Item>>("/store/items", {
    params: { search: search || undefined, size: 50, sort: "itemCode" },
  });
  return data;
}

export async function getItem(id: string): Promise<Item> {
  const { data } = await api.get<Item>(`/store/items/${id}`);
  return data;
}

export async function createItem(input: CreateItemInput): Promise<Item> {
  const { data } = await api.post<Item>("/store/items", input);
  return data;
}

export interface UpdateItemInput {
  name: string;
  description?: string;
  category?: string;
  reorderLevel: number;
  criticalItem: boolean;
  approvalRequiredForIssue: boolean;
}

export async function updateItem(id: string, input: UpdateItemInput): Promise<Item> {
  const { data } = await api.patch<Item>(`/store/items/${id}`, input);
  return data;
}

export async function deactivateItem(id: string): Promise<void> {
  await api.delete(`/store/items/${id}`);
}

/** Active items below their reorder level — the shared low-stock warning list. */
export async function getLowStockItems(): Promise<LowStockItem[]> {
  const { data } = await api.get<LowStockItem[]>("/store/items/low-stock");
  return data;
}

export async function getOnHand(itemId: string): Promise<OnHand> {
  const { data } = await api.get<OnHand>(`/store/items/${itemId}/on-hand`);
  return data;
}

export async function getMovements(itemId: string): Promise<Page<StockMovement>> {
  const { data } = await api.get<Page<StockMovement>>(`/store/items/${itemId}/movements`, {
    params: { size: 50 },
  });
  return data;
}

export async function postMovement(input: PostMovementInput): Promise<StockMovement> {
  const { data } = await api.post<StockMovement>("/store/stock/movements", input);
  return data;
}

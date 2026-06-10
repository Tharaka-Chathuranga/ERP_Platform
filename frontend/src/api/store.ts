import { api } from "./client";
import type {
  Item,
  MovementType,
  Page,
  StockLevel,
  ValuationMethod,
  Warehouse,
} from "../types";

// ── Store module API calls, mirroring the backend REST contract. ──

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
  warehouseId: string;
  type: MovementType;
  quantity: number;
  unitCost?: number;
  reference?: string;
  note?: string;
}

export async function listItems(search?: string): Promise<Page<Item>> {
  const { data } = await api.get<Page<Item>>("/store/items", {
    params: { search, size: 50, sort: "itemCode" },
  });
  return data;
}

export async function createItem(input: CreateItemInput): Promise<Item> {
  const { data } = await api.post<Item>("/store/items", input);
  return data;
}

export async function listWarehouses(): Promise<Warehouse[]> {
  const { data } = await api.get<Warehouse[]>("/store/warehouses");
  return data;
}

export async function getStockLevels(itemId: string): Promise<StockLevel[]> {
  const { data } = await api.get<StockLevel[]>(`/store/items/${itemId}/stock-levels`);
  return data;
}

export async function postMovement(input: PostMovementInput): Promise<void> {
  await api.post("/store/stock/movements", input);
}

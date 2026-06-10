// Shared API types. In a mature setup these are generated from the backend's
// OpenAPI spec (/v3/api-docs) so they can never drift from the contract.

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  username: string;
  roles: string[];
}

export type ValuationMethod = "FIFO" | "WEIGHTED_AVERAGE" | "STANDARD_COST";
export type ItemStatus = "ACTIVE" | "INACTIVE";

export interface Item {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unitOfMeasure: string;
  category?: string;
  valuationMethod: ValuationMethod;
  reorderLevel: number;
  status: ItemStatus;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address?: string;
  active: boolean;
}

export type MovementType =
  | "RECEIPT"
  | "ISSUE"
  | "ADJUSTMENT_IN"
  | "ADJUSTMENT_OUT"
  | "TRANSFER_IN"
  | "TRANSFER_OUT";

export interface StockLevel {
  itemId: string;
  warehouseId: string;
  quantityOnHand: number;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

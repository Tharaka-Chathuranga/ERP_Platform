// Shared API types. In a mature setup these are generated from the backend's
// OpenAPI spec (/v3/api-docs) so they can never drift from the contract.

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  userId: string;
  username: string;
  /** Single role: "ADMIN" | "STORE_KEEPER". */
  role: string;
}

export interface UserSummary {
  id: string;
  username: string;
  displayName: string;
  role: string;
  /** Organisational unit; optional until the user has one assigned. */
  department?: string;
}

export type ValuationMethod = "FIFO" | "WEIGHTED_AVERAGE" | "STANDARD_COST";
export type ItemStatus = "ACTIVE" | "INACTIVE";

export interface Location {
  rack: string;
  row: string;
  column: string;
  primary: boolean;
}

export interface Item {
  id: string;
  itemCode: string;
  name: string;
  description?: string;
  unitOfMeasure: string;
  unitPrice?: number;
  category?: string;
  valuationMethod: ValuationMethod;
  reorderLevel: number;
  criticalItem: boolean;
  approvalRequiredForIssue: boolean;
  locations: Location[];
  status: ItemStatus;
}

export interface OnHand {
  itemId: string;
  quantityOnHand: number;
}

export type MovementType =
  | "RECEIPT"
  | "ISSUE"
  | "ADJUSTMENT_IN"
  | "ADJUSTMENT_OUT"
  | "TRANSFER_IN"
  | "TRANSFER_OUT";

export interface StockMovement {
  id: string;
  itemId: string;
  type: MovementType;
  quantity: number;
  unitCost?: number;
  reference?: string;
  occurredAt: string;
}

/** Received vs issued totals for a single item. */
export interface ItemMovementSummary {
  itemId: string;
  received: number;
  issued: number;
}

// ── Suppliers ──
export type SupplierStatus = "ACTIVE" | "INACTIVE";

export interface Supplier {
  id: string;
  code: string;
  name: string;
  address?: string;
  country?: string;
  email?: string;
  phone?: string;
  status: SupplierStatus;
}

export interface SupplierItem {
  id: string;
  supplierId: string;
  itemId: string;
  supplierSku?: string;
  leadTimeDays?: number;
  lastPurchasePrice?: number;
}

// ── Goods receipts (receiving) ──
export type GrnStatus = "DRAFT" | "POSTED";

export interface GoodsReceiptLine {
  id: string;
  itemId: string;
  quantity: number;
  unitCost?: number;
}

export interface GoodsReceipt {
  id: string;
  grnNumber: string;
  poNumber?: string;
  invoiceNumber?: string;
  supplierId?: string;
  supplierName?: string;
  storeKeeperId: string;
  status: GrnStatus;
  receivedAt?: string;
  lines: GoodsReceiptLine[];
}

// ── Receivals (the physical "goods arrived" event) ──
export interface ReceivalItem {
  id: string;
  itemId: string;
  quantity: number;
  unitCost?: number;
}

export interface Receival {
  id: string;
  receivalNumber: string;
  poNumber?: string;
  invoiceNumber?: string;
  /** Set when received from a registered supplier. */
  supplierId?: string;
  /** Set when received from an unregistered supplier. */
  supplierName?: string;
  allReceivedForPo: boolean;
  storeKeeperId: string;
  /** Set once this receival has been rolled into a generated GRN. */
  goodReceiveNoteId?: string;
  receivedAt: string;
  lines: ReceivalItem[];
}

// ── Issues ──
export type IssueStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "ISSUED"
  | "REJECTED"
  | "RETURNED";

/** Per-line approval state, independent of the document status. */
export type IssueLineStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IssueLine {
  id: string;
  itemId: string;
  quantity: number;
  returnable: boolean;
  returnedQuantity: number;
  approvalStatus: IssueLineStatus;
  approvedByUserId?: string;
  approvedAt?: string;
}

export interface Issue {
  id: string;
  issueNumber: string;
  borrowingUserId: string;
  storeKeeperId: string;
  status: IssueStatus;
  approvedByUserId?: string;
  approvedAt?: string;
  issuedAt?: string;
  lines: IssueLine[];
}

// ── Deviation (defect) requests ──
export type DeviationStage = "INCOMING" | "IN_PROGRESS" | "FINAL";
export type DeviationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface DeviationItem {
  itemId: string;
  quantity: number;
}

export interface DeviationRequest {
  id: string;
  items: DeviationItem[];
  status: DeviationStatus;
  stage: DeviationStage;
  reason?: string;
  requestedByUserId: string;
  requestedAt: string;
  approvedByUserId?: string;
  approvedAt?: string;
}

// ── Borrow requests ──
export type BorrowRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "ISSUED";

export interface BorrowRequest {
  id: string;
  issueId: string;
  status: BorrowRequestStatus;
  reason?: string;
  requestedByUserId: string;
  requestedAt: string;
  approvedByUserId?: string;
  approvedAt?: string;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ── Admin: stock count-adjustment requests ──
export type CountAdjustmentStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface CountAdjustmentRequest {
  id: string;
  itemId: string;
  currentQuantity: number;
  requestedQuantity: number;
  reason?: string;
  status: CountAdjustmentStatus;
  requestedByUserId: string;
  requestedAt: string;
  approvedByUserId?: string;
  approvedAt?: string;
}

// ── Admin: dashboard aggregations ──
export interface DashboardSummary {
  activeItemCount: number;
  inactiveItemCount: number;
  supplierCount: number;
  totalInventoryValue: number;
  lowStockItemCount: number;
  pendingIssueApprovalCount: number;
  pendingDeviationCount: number;
  pendingBorrowRequestCount: number;
  pendingCountAdjustmentCount: number;
  receivalCount: number;
}

export interface LowStockItem {
  itemId: string;
  itemCode: string;
  name: string;
  unitOfMeasure: string;
  quantityOnHand: number;
  reorderLevel: number;
  criticalItem: boolean;
}

export interface MovementTrendPoint {
  /** ISO timestamp at the start of the day bucket. */
  day: string;
  received: number;
  issued: number;
}

/** A single defective item line flattened out of its deviation request. */
export interface DeviationItemRow {
  requestId: string;
  itemId: string;
  quantity: number;
  status: DeviationStatus;
  stage: DeviationStage;
  reason?: string;
  requestedAt: string;
}

// ── Admin: user management (full view, includes `enabled`) ──
export interface AdminUser {
  id: string;
  username: string;
  displayName?: string;
  role: string;
  department?: string;
  enabled: boolean;
}

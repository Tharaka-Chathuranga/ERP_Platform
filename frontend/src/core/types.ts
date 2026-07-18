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
  primary?: boolean;
  general?: boolean;
  quantity?: number;
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
  supplierId?: string;
  supplierName?: string;
  allReceivedForPo: boolean;
  storeKeeperId: string;
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

// ── Nonconformity reports (NCR) — ISO 9001:2015 clause 8.7 "Control of nonconforming outputs" ──
export type DetectionStage = "INCOMING" | "IN_PROGRESS" | "FINAL";
export type NonconformityStatus =
  | "RAISED"
  | "UNDER_REVIEW"
  | "DISPOSITIONED"
  | "REJECTED"
  | "CLOSED";
export type DispositionType =
  | "USE_AS_IS"
  | "REWORK"
  | "SCRAP"
  | "RETURN_TO_SUPPLIER"
  | "REGRADE";

export interface NonconformityItem {
  itemId: string;
  quantity: number;
}

export interface NonconformityReport {
  id: string;
  items: NonconformityItem[];
  status: NonconformityStatus;
  detectionStage: DetectionStage;
  description?: string;
  reportedByUserId: string;
  reportedAt: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
  reviewNote?: string;
  dispositionType?: DispositionType;
  closedByUserId?: string;
  closedAt?: string;
  verificationNote?: string;
}

export interface QaNonconformitySummary {
  raisedCount: number;
  underReviewCount: number;
  dispositionedCount: number;
  rejectedCount: number;
  closedCount: number;
  incomingCount: number;
  inProgressCount: number;
  finalCount: number;
  totalCount: number;
}

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
  lowStockCriticalItemCount: number;
  lowStockNormalItemCount: number;
  pendingIssueApprovalCount: number;
  openNonconformityCount: number;
  pendingBorrowRequestCount: number;
  pendingCountAdjustmentCount: number;
  receivalCount: number;
  issuedCount: number;
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
  day: string;
  received: number;
  issued: number;
}

export interface NonconformityItemRow {
  reportId: string;
  itemId: string;
  quantity: number;
  status: NonconformityStatus;
  detectionStage: DetectionStage;
  description?: string;
  reportedAt: string;
}

export interface TodayReceivalRow {
  receivalId: string;
  receivalNumber: string;
  supplierName?: string;
  lineCount: number;
  totalQuantity: number;
  totalValue: number;
  receivedAt: string;
}

export interface TodayIssueRow {
  issueId: string;
  issueNumber: string;
  borrowingUserId: string;
  lineCount: number;
  totalQuantity: number;
  totalValue: number;
  issuedAt: string | null;
  status: IssueStatus;
  itemTypeCount: number;
  lines: TodayIssueLine[];
}

export interface TodayIssueLine {
  itemName: string;
  quantity: number;
}

export interface ItemStockRow {
  itemId: string;
  itemCode: string;
  name: string;
  unitOfMeasure: string;
  quantityOnHand: number;
  reorderLevel: number;
  unitPrice: number;
  criticalItem: boolean;
}

export interface StockHealth {
  criticalItems: ItemStockRow[];
  normalItems: ItemStockRow[];
  warningItems: ItemStockRow[];
  criticalWarningItems: ItemStockRow[];
  criticalCount: number;
  normalCount: number;
  warningCount: number;
  criticalWarningCount: number;
}

export interface AdminUser {
  id: string;
  username: string;
  displayName?: string;
  role: string;
  department?: string;
  enabled: boolean;
}

// ── Fuel ──
export type FuelTankPurpose = "INTERNAL" | "VEHICLE";
export type TankStatus = "ACTIVE" | "INACTIVE";
export type VehicleStatus = "ACTIVE" | "INACTIVE";

export interface FuelTank {
  id: string;
  name: string;
  purpose: FuelTankPurpose;
  capacityLitres: number;
  currentLitres: number;
  status: TankStatus;
}

export interface FuelTankRefill {
  id: string;
  tankId: string;
  litres: number;
  refilledAt: string;
  recordedByUserId: string;
  note?: string;
}

export interface FuelTankReading {
  id: string;
  tankId: string;
  litresMeasured: number;
  readingAt: string;
  recordedByUserId: string;
  note?: string;
  consumptionSincePrevious?: number;
}

export interface FuelDeliveryLine {
  id: string;
  tankId: string;
  litresDelivered: number;
  dipBeforeLitres?: number;
  dipAfterLitres?: number;
  /** dipAfter − dipBefore − litresDelivered; ~0 when the dip readings reconcile. */
  dipReconciliationVariance?: number;
}

export interface FuelDelivery {
  id: string;
  deliveryReference: string;
  supplierName?: string;
  orderedLitres: number;
  deliveredLitres: number;
  /** deliveredLitres − orderedLitres; positive = over-delivered, negative = short. */
  orderedVsDeliveredVariance: number;
  deliveredOn: string;
  dischargeStartedAt?: string;
  dischargeFinishedAt?: string;
  recordedByUserId: string;
  note?: string;
  lines: FuelDeliveryLine[];
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  name?: string;
  category?: string;
  fullTankCapacityLitres: number;
  description?: string;
  driverUserId?: string;
  status: VehicleStatus;
}

export interface VehicleFuelIssue {
  id: string;
  vehicleId: string;
  vehicleReadingBeforeIssueLitres: number;
  litresIssued: number;
  issuingUserId: string;
  receivingUserId: string;
  issuedAt: string;
  odometerReadingKm?: number;
}

export interface VehicleEfficiencyPoint {
  date: string;
  kmPerLitre: number;
  kmDriven: number;
  litresConsumed: number;
}

export interface VehicleEfficiencyReport {
  vehicleId: string;
  vehicleNumber: string;
  driverUserId: string;
  points: VehicleEfficiencyPoint[];
}

export interface FuelPrice {
  id: string;
  unitPrice: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  recordedByUserId: string;
  note?: string;
}

export interface FuelOverviewTank {
  purpose: FuelTankPurpose;
  name: string;
  currentLitres: number;
  capacityLitres: number;
}

export interface FuelOverview {
  tanks: FuelOverviewTank[];
  todayIssueCount: number;
  todayLitres: number;
  currentPrice?: { unitPrice: number; effectiveFrom: string; effectiveTo: string | null };
  lastInternalReading?: {
    litresMeasured: number;
    readingAt: string;
    consumptionSincePrevious?: number;
  };
}

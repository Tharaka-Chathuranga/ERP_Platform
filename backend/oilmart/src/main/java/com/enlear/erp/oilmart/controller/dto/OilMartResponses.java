package com.enlear.erp.oilmart.controller.dto;

import com.enlear.erp.oilmart.model.OilMartClient;
import com.enlear.erp.oilmart.model.OilMartClientStatus;
import com.enlear.erp.oilmart.model.OilMartItem;
import com.enlear.erp.oilmart.model.OilMartItemPrice;
import com.enlear.erp.oilmart.model.OilMartItemStatus;
import com.enlear.erp.oilmart.model.OilMartMovementReferenceType;
import com.enlear.erp.oilmart.model.OilMartMovementType;
import com.enlear.erp.oilmart.model.OilMartPaymentMethod;
import com.enlear.erp.oilmart.model.OilMartReceipt;
import com.enlear.erp.oilmart.model.OilMartReceiptLine;
import com.enlear.erp.oilmart.model.OilMartSale;
import com.enlear.erp.oilmart.model.OilMartSaleLine;
import com.enlear.erp.oilmart.model.OilMartSaleStatus;
import com.enlear.erp.oilmart.model.OilMartStockMovement;
import com.enlear.erp.oilmart.model.OilMartSupplier;
import com.enlear.erp.oilmart.model.OilMartSupplierStatus;
import com.enlear.erp.oilmart.model.OilType;
import com.enlear.erp.oilmart.service.overview.OilMartOverviewSnapshot;
import com.enlear.erp.oilmart.service.overview.OilMartStockView;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

public final class OilMartResponses {

    private OilMartResponses() {
    }

    public record OilMartItemResponse(
            UUID id, String code, String name, OilType oilType, String brand, String grade,
            String description, BigDecimal reorderLevelLitres, OilMartItemStatus status) {

        public static OilMartItemResponse from(OilMartItem item) {
            return new OilMartItemResponse(item.getId(), item.getCode(), item.getName(),
                    item.getOilType(), item.getBrand(), item.getGrade(), item.getDescription(),
                    item.getReorderLevelLitres(), item.getStatus());
        }
    }

    public record OilMartItemPriceResponse(
            UUID id, UUID itemId, BigDecimal buyPrice, BigDecimal sellPrice,
            LocalDate effectiveFrom, LocalDate effectiveTo, UUID recordedByUserId, String note) {

        public static OilMartItemPriceResponse from(OilMartItemPrice price) {
            return new OilMartItemPriceResponse(price.getId(), price.getItemId(), price.getBuyPrice(),
                    price.getSellPrice(), price.getEffectiveFrom(), price.getEffectiveTo(),
                    price.getRecordedByUserId(), price.getNote());
        }
    }

    public record OilMartSupplierResponse(
            UUID id, String code, String name, String contactPerson, String phone, String email,
            String address, OilMartSupplierStatus status) {

        public static OilMartSupplierResponse from(OilMartSupplier supplier) {
            return new OilMartSupplierResponse(supplier.getId(), supplier.getCode(), supplier.getName(),
                    supplier.getContactPerson(), supplier.getPhone(), supplier.getEmail(),
                    supplier.getAddress(), supplier.getStatus());
        }
    }

    public record OilMartClientResponse(
            UUID id, String code, String name, String contactPerson, String phone, String email,
            String address, OilMartClientStatus status) {

        public static OilMartClientResponse from(OilMartClient client) {
            return new OilMartClientResponse(client.getId(), client.getCode(), client.getName(),
                    client.getContactPerson(), client.getPhone(), client.getEmail(),
                    client.getAddress(), client.getStatus());
        }
    }

    public record OilMartStockBalanceResponse(
            UUID itemId, String itemCode, String itemName, OilType oilType,
            BigDecimal quantityOnHand, BigDecimal reorderLevelLitres,
            BigDecimal buyPrice, BigDecimal sellPrice, BigDecimal stockValue,
            Instant lastMovementAt) {

        public static OilMartStockBalanceResponse from(OilMartStockView view) {
            return new OilMartStockBalanceResponse(view.itemId(), view.itemCode(), view.itemName(),
                    view.oilType(), view.quantityOnHand(), view.reorderLevelLitres(),
                    view.buyPrice(), view.sellPrice(), view.stockValue(), view.lastMovementAt());
        }
    }

    public record OilMartStockMovementResponse(
            UUID id, UUID itemId, OilMartMovementType movementType, BigDecimal quantityDelta,
            BigDecimal balanceAfter, OilMartMovementReferenceType referenceType, UUID referenceId,
            String referenceNo, Instant movedAt, UUID movedByUserId, String note) {

        public static OilMartStockMovementResponse from(OilMartStockMovement movement) {
            return new OilMartStockMovementResponse(movement.getId(), movement.getItemId(),
                    movement.getMovementType(), movement.getQuantityDelta(), movement.getBalanceAfter(),
                    movement.getReferenceType(), movement.getReferenceId(), movement.getReferenceNo(),
                    movement.getMovedAt(), movement.getMovedByUserId(), movement.getNote());
        }
    }

    public record OilMartReceiptLineResponse(
            UUID id, UUID itemId, String itemCode, String itemName,
            BigDecimal quantityLitres, BigDecimal buyUnitPrice, BigDecimal lineTotal) {

        static OilMartReceiptLineResponse from(OilMartReceiptLine line, OilMartItem item) {
            return new OilMartReceiptLineResponse(line.getId(), line.getItemId(),
                    item != null ? item.getCode() : null,
                    item != null ? item.getName() : null,
                    line.getQuantityLitres(), line.getBuyUnitPrice(), line.getLineTotal());
        }
    }

    public record OilMartReceiptResponse(
            UUID id, String receiptNo, UUID supplierId, String supplierName, String referenceNo,
            Instant receivedAt, UUID receivedByUserId, BigDecimal totalCost, String note,
            List<OilMartReceiptLineResponse> lines) {

        public static OilMartReceiptResponse from(OilMartReceipt receipt, String supplierName,
                                                  Map<UUID, OilMartItem> itemsById) {
            return new OilMartReceiptResponse(receipt.getId(), receipt.getReceiptNo(),
                    receipt.getSupplierId(), supplierName, receipt.getReferenceNo(),
                    receipt.getReceivedAt(), receipt.getReceivedByUserId(), receipt.getTotalCost(),
                    receipt.getNote(),
                    receipt.getLines().stream()
                            .map(line -> OilMartReceiptLineResponse.from(line, itemsById.get(line.getItemId())))
                            .toList());
        }
    }

    public record OilMartSaleLineResponse(
            UUID id, UUID itemId, String itemCode, String itemName, BigDecimal quantityLitres,
            BigDecimal listUnitPrice, BigDecimal unitPrice, boolean isPriceOverride,
            BigDecimal discountPercent, BigDecimal lineTotal) {

        static OilMartSaleLineResponse from(OilMartSaleLine line, OilMartItem item) {
            return new OilMartSaleLineResponse(line.getId(), line.getItemId(),
                    item != null ? item.getCode() : null,
                    item != null ? item.getName() : null,
                    line.getQuantityLitres(), line.getListUnitPrice(), line.getUnitPrice(),
                    line.isPriceOverride(), line.getDiscountPercent(), line.getLineTotal());
        }
    }

    public record OilMartSaleResponse(
            UUID id, String saleNo, UUID clientId, String clientName, OilMartSaleStatus status,
            UUID createdByUserId, Instant quotedAt, LocalDate validUntil,
            UUID quotationApprovedByUserId, Instant quotationApprovedAt, Instant orderedAt,
            UUID approvedByUserId, Instant approvedAt, String rejectionReason,
            Instant dispatchedAt, UUID dispatchedByUserId, String vehicleNo, String driverName,
            String invoiceNo, Instant invoicedAt, UUID invoicedByUserId,
            OilMartPaymentMethod paymentMethod, String cancellationReason,
            BigDecimal subtotal, BigDecimal discountAmount, BigDecimal total, String note,
            List<OilMartSaleLineResponse> lines) {

        public static OilMartSaleResponse from(OilMartSale sale, String clientName,
                                               Map<UUID, OilMartItem> itemsById) {
            return new OilMartSaleResponse(sale.getId(), sale.getSaleNo(), sale.getClientId(),
                    clientName, sale.getStatus(), sale.getCreatedByUserId(), sale.getQuotedAt(),
                    sale.getValidUntil(), sale.getQuotationApprovedByUserId(),
                    sale.getQuotationApprovedAt(), sale.getOrderedAt(), sale.getApprovedByUserId(),
                    sale.getApprovedAt(), sale.getRejectionReason(), sale.getDispatchedAt(),
                    sale.getDispatchedByUserId(), sale.getVehicleNo(), sale.getDriverName(),
                    sale.getInvoiceNo(), sale.getInvoicedAt(), sale.getInvoicedByUserId(),
                    sale.getPaymentMethod(), sale.getCancellationReason(), sale.getSubtotal(),
                    sale.getDiscountAmount(), sale.getTotal(), sale.getNote(),
                    sale.getLines().stream()
                            .map(line -> OilMartSaleLineResponse.from(line, itemsById.get(line.getItemId())))
                            .toList());
        }
    }

    public record OilMartTrendPointResponse(LocalDate date, BigDecimal total) {
    }

    public record OilMartRevenueByMethodResponse(OilMartPaymentMethod paymentMethod, BigDecimal total) {
    }

    public record OilMartOverviewResponse(
            BigDecimal stockValue, BigDecimal salesThisPeriod, long saleCountThisPeriod,
            long awaitingApproval, long lowStockCount,
            List<OilMartTrendPointResponse> salesTrend,
            List<OilMartRevenueByMethodResponse> revenueByMethod,
            List<OilMartStockBalanceResponse> lowStock,
            List<OilMartSaleResponse> pendingApprovals) {

        public static OilMartOverviewResponse from(OilMartOverviewSnapshot snapshot,
                                                   Function<OilMartSale, OilMartSaleResponse> saleMapper) {
            return new OilMartOverviewResponse(
                    snapshot.stockValue(),
                    snapshot.salesThisPeriod(),
                    snapshot.saleCountThisPeriod(),
                    snapshot.awaitingApproval(),
                    snapshot.lowStockCount(),
                    snapshot.salesTrend().stream()
                            .map(point -> new OilMartTrendPointResponse(point.date(), point.total()))
                            .toList(),
                    snapshot.revenueByMethod().stream()
                            .map(entry -> new OilMartRevenueByMethodResponse(entry.paymentMethod(), entry.total()))
                            .toList(),
                    snapshot.lowStock().stream().map(OilMartStockBalanceResponse::from).toList(),
                    snapshot.pendingApprovals().stream().map(saleMapper).toList());
        }
    }
}

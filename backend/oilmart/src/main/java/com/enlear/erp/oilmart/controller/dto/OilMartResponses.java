package com.enlear.erp.oilmart.controller.dto;

import com.enlear.erp.oilmart.model.OilMartBankDetails;
import com.enlear.erp.oilmart.model.OilMartClient;
import com.enlear.erp.oilmart.model.OilMartClientStatus;
import com.enlear.erp.oilmart.model.OilMartInvoice;
import com.enlear.erp.oilmart.model.OilMartInvoiceLine;
import com.enlear.erp.oilmart.model.OilMartInvoiceStatus;
import com.enlear.erp.oilmart.model.OilMartItem;
import com.enlear.erp.oilmart.model.OilMartItemPrice;
import com.enlear.erp.oilmart.model.OilMartItemStatus;
import com.enlear.erp.oilmart.model.OilMartMovementReferenceType;
import com.enlear.erp.oilmart.model.OilMartMovementType;
import com.enlear.erp.oilmart.model.OilMartQuotation;
import com.enlear.erp.oilmart.model.OilMartQuotationLine;
import com.enlear.erp.oilmart.model.OilMartQuotationStatus;
import com.enlear.erp.oilmart.model.OilMartReceipt;
import com.enlear.erp.oilmart.model.OilMartReceiptLine;
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
            String description, String unitOfMeasure, BigDecimal reorderLevelLitres,
            OilMartItemStatus status) {

        public static OilMartItemResponse from(OilMartItem item) {
            return new OilMartItemResponse(item.getId(), item.getCode(), item.getName(),
                    item.getOilType(), item.getBrand(), item.getGrade(), item.getDescription(),
                    item.getUnitOfMeasure(), item.getReorderLevelLitres(), item.getStatus());
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
            String address, OilMartClientStatus status, boolean profileIncomplete) {

        public static OilMartClientResponse from(OilMartClient client) {
            return new OilMartClientResponse(client.getId(), client.getCode(), client.getName(),
                    client.getContactPerson(), client.getPhone(), client.getEmail(),
                    client.getAddress(), client.getStatus(), client.isProfileIncomplete());
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

    public record OilMartQuotationLineResponse(
            UUID id, UUID itemId, String itemCode, String itemName, String unitOfMeasure,
            BigDecimal quantityLitres,
            BigDecimal listUnitPrice, BigDecimal unitPrice, boolean isPriceOverride,
            BigDecimal discountPercent, BigDecimal lineTotal,
            BigDecimal unitCost, BigDecimal lineCost, BigDecimal lineProfit) {

        static OilMartQuotationLineResponse from(OilMartQuotationLine line, OilMartItem item,
                                                 boolean withProfit) {
            return new OilMartQuotationLineResponse(line.getId(), line.getItemId(),
                    item != null ? item.getCode() : null,
                    item != null ? item.getName() : null,
                    item != null ? item.getUnitOfMeasure() : OilMartItem.DEFAULT_UNIT_OF_MEASURE,
                    line.getQuantityLitres(), line.getListUnitPrice(), line.getUnitPrice(),
                    line.isPriceOverride(), line.getDiscountPercent(), line.getLineTotal(),
                    withProfit ? line.getUnitCost() : null,
                    withProfit ? line.getLineCost() : null,
                    withProfit ? line.getLineProfit() : null);
        }
    }

    public record OilMartQuotationResponse(
            UUID id, String quotationNo, UUID clientId, String clientName,
            OilMartQuotationStatus status, UUID createdByUserId,
            LocalDate issuedDate, LocalDate validUntil, boolean expired, boolean editable,
            Instant submittedAt, UUID approvedByUserId, Instant approvedAt,
            UUID rejectedByUserId, Instant rejectedAt, String rejectionReason,
            String cancellationReason,
            BigDecimal subtotal, BigDecimal gstRatePercent, BigDecimal gstAmount,
            BigDecimal grandTotal, BigDecimal totalCost, BigDecimal totalProfit,
            String note, Instant updatedAt, List<OilMartQuotationLineResponse> lines) {

        public static OilMartQuotationResponse from(OilMartQuotation quotation, String clientName,
                                                    Map<UUID, OilMartItem> itemsById,
                                                    boolean withProfit) {
            return new OilMartQuotationResponse(quotation.getId(), quotation.getQuotationNo(),
                    quotation.getClientId(), clientName, quotation.getStatus(),
                    quotation.getCreatedByUserId(), quotation.getIssuedDate(),
                    quotation.getValidUntil(), quotation.isExpired(), quotation.isEditable(),
                    quotation.getSubmittedAt(), quotation.getApprovedByUserId(),
                    quotation.getApprovedAt(), quotation.getRejectedByUserId(),
                    quotation.getRejectedAt(), quotation.getRejectionReason(),
                    quotation.getCancellationReason(), quotation.getSubtotal(),
                    quotation.getGstRatePercent(), quotation.getGstAmount(),
                    quotation.getGrandTotal(),
                    withProfit ? quotation.getTotalCost() : null,
                    withProfit ? quotation.getTotalProfit() : null,
                    quotation.getNote(), quotation.getUpdatedAt(),
                    quotation.getLines().stream()
                            .map(line -> OilMartQuotationLineResponse.from(
                                    line, itemsById.get(line.getItemId()), withProfit))
                            .toList());
        }
    }

    public record OilMartInvoiceLineResponse(
            UUID id, UUID itemId, String itemCode, String itemName, String unitOfMeasure,
            BigDecimal quantityLitres,
            BigDecimal listUnitPrice, BigDecimal unitPrice, boolean isPriceOverride,
            BigDecimal discountPercent, BigDecimal lineTotal,
            BigDecimal unitCost, BigDecimal lineCost, BigDecimal lineProfit) {

        static OilMartInvoiceLineResponse from(OilMartInvoiceLine line, OilMartItem item,
                                               boolean withProfit) {
            return new OilMartInvoiceLineResponse(line.getId(), line.getItemId(),
                    item != null ? item.getCode() : null,
                    item != null ? item.getName() : null,
                    item != null ? item.getUnitOfMeasure() : OilMartItem.DEFAULT_UNIT_OF_MEASURE,
                    line.getQuantityLitres(), line.getListUnitPrice(), line.getUnitPrice(),
                    line.isPriceOverride(), line.getDiscountPercent(), line.getLineTotal(),
                    withProfit ? line.getUnitCost() : null,
                    withProfit ? line.getLineCost() : null,
                    withProfit ? line.getLineProfit() : null);
        }
    }

    public record OilMartBankDetailsResponse(
            String accountName, String bankName, String branch, String accountNumber,
            String swiftCode) {

        static OilMartBankDetailsResponse from(OilMartBankDetails details) {
            return details == null ? null : new OilMartBankDetailsResponse(
                    details.getAccountName(), details.getBankName(), details.getBranch(),
                    details.getAccountNumber(), details.getSwiftCode());
        }
    }

    public record OilMartInvoiceResponse(
            UUID id, String invoiceNo, UUID quotationId, String quotationNo,
            UUID clientId, String clientName, OilMartInvoiceStatus status, UUID createdByUserId,
            LocalDate invoiceDate, UUID approvedByUserId, Instant approvedAt,
            UUID rejectedByUserId, Instant rejectedAt, String rejectionReason,
            OilMartBankDetailsResponse bankDetails,
            BigDecimal subtotal, BigDecimal gstRatePercent, BigDecimal gstAmount,
            BigDecimal grandTotal, BigDecimal totalCost, BigDecimal totalProfit,
            String note, Instant updatedAt, List<OilMartInvoiceLineResponse> lines) {

        public static OilMartInvoiceResponse from(OilMartInvoice invoice, String clientName,
                                                  Map<UUID, OilMartItem> itemsById,
                                                  boolean withProfit) {
            return new OilMartInvoiceResponse(invoice.getId(), invoice.getInvoiceNo(),
                    invoice.getQuotationId(), invoice.getQuotationNo(), invoice.getClientId(),
                    clientName, invoice.getStatus(), invoice.getCreatedByUserId(),
                    invoice.getInvoiceDate(), invoice.getApprovedByUserId(),
                    invoice.getApprovedAt(), invoice.getRejectedByUserId(),
                    invoice.getRejectedAt(), invoice.getRejectionReason(),
                    OilMartBankDetailsResponse.from(invoice.getBankDetails()),
                    invoice.getSubtotal(), invoice.getGstRatePercent(), invoice.getGstAmount(),
                    invoice.getGrandTotal(),
                    withProfit ? invoice.getTotalCost() : null,
                    withProfit ? invoice.getTotalProfit() : null,
                    invoice.getNote(), invoice.getUpdatedAt(),
                    invoice.getLines().stream()
                            .map(line -> OilMartInvoiceLineResponse.from(
                                    line, itemsById.get(line.getItemId()), withProfit))
                            .toList());
        }
    }

    public record OilMartTrendPointResponse(LocalDate date, BigDecimal total) {
    }

    public record OilMartOverviewResponse(
            BigDecimal stockValue, BigDecimal salesThisPeriod, long saleCountThisPeriod,
            long awaitingApproval, long lowStockCount,
            List<OilMartTrendPointResponse> salesTrend,
            List<OilMartStockBalanceResponse> lowStock,
            List<OilMartQuotationResponse> pendingApprovals) {

        public static OilMartOverviewResponse from(
                OilMartOverviewSnapshot snapshot,
                Function<OilMartQuotation, OilMartQuotationResponse> quotationMapper) {
            return new OilMartOverviewResponse(
                    snapshot.stockValue(),
                    snapshot.salesThisPeriod(),
                    snapshot.saleCountThisPeriod(),
                    snapshot.awaitingApproval(),
                    snapshot.lowStockCount(),
                    snapshot.salesTrend().stream()
                            .map(point -> new OilMartTrendPointResponse(point.date(), point.total()))
                            .toList(),
                    snapshot.lowStock().stream().map(OilMartStockBalanceResponse::from).toList(),
                    snapshot.pendingApprovals().stream().map(quotationMapper).toList());
        }
    }
}

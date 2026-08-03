package com.enlear.erp.oilmart.controller.dto;

import com.enlear.erp.oilmart.model.OilMartClientStatus;
import com.enlear.erp.oilmart.model.OilMartItemStatus;
import com.enlear.erp.oilmart.model.OilMartStockAdjustmentDirection;
import com.enlear.erp.oilmart.model.OilMartSupplierStatus;
import com.enlear.erp.oilmart.model.OilType;
import com.enlear.erp.oilmart.service.command.AddOilMartItemPriceCommand;
import com.enlear.erp.oilmart.service.command.AdjustOilMartStockCommand;
import com.enlear.erp.oilmart.service.command.CreateOilMartInvoiceCommand;
import com.enlear.erp.oilmart.service.command.RecordOilMartReceiptCommand;
import com.enlear.erp.oilmart.service.command.SaveOilMartClientCommand;
import com.enlear.erp.oilmart.service.command.SaveOilMartItemCommand;
import com.enlear.erp.oilmart.service.command.SaveOilMartQuotationCommand;
import com.enlear.erp.oilmart.service.command.SaveOilMartSupplierCommand;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class OilMartRequests {

    private OilMartRequests() {
    }

    public record SaveOilMartItemRequest(
            @NotBlank @Size(max = 64) String code,
            @NotBlank @Size(max = 200) String name,
            @NotNull OilType oilType,
            @Size(max = 100) String brand,
            @Size(max = 100) String grade,
            @Size(max = 1000) String description,
            @Size(max = 16) String unitOfMeasure,
            @PositiveOrZero BigDecimal reorderLevelLitres,
            OilMartItemStatus status) {

        public SaveOilMartItemCommand toCommand() {
            return new SaveOilMartItemCommand(code, name, oilType, brand, grade, description,
                    unitOfMeasure,
                    reorderLevelLitres != null ? reorderLevelLitres : BigDecimal.ZERO,
                    status != null ? status : OilMartItemStatus.ACTIVE);
        }
    }

    public record AddOilMartItemPriceRequest(
            @NotNull @PositiveOrZero BigDecimal buyPrice,
            @NotNull @PositiveOrZero BigDecimal sellPrice,
            @NotNull LocalDate effectiveFrom,
            LocalDate effectiveTo,
            @Size(max = 1000) String note) {

        public AddOilMartItemPriceCommand toCommand(UUID itemId, UUID recordedByUserId) {
            return new AddOilMartItemPriceCommand(itemId, buyPrice, sellPrice, effectiveFrom,
                    effectiveTo, recordedByUserId, note);
        }
    }

    public record SaveOilMartSupplierRequest(
            @NotBlank @Size(max = 64) String code,
            @NotBlank @Size(max = 200) String name,
            @Size(max = 150) String contactPerson,
            @Size(max = 50) String phone,
            @Email @Size(max = 150) String email,
            @Size(max = 500) String address,
            OilMartSupplierStatus status) {

        public SaveOilMartSupplierCommand toCommand() {
            return new SaveOilMartSupplierCommand(code, name, contactPerson, phone, email, address,
                    status != null ? status : OilMartSupplierStatus.ACTIVE);
        }
    }

    public record SaveOilMartClientRequest(
            @NotBlank @Size(max = 64) String code,
            @NotBlank @Size(max = 200) String name,
            @Size(max = 150) String contactPerson,
            @Size(max = 50) String phone,
            @Email @Size(max = 150) String email,
            @Size(max = 500) String address,
            OilMartClientStatus status) {

        public SaveOilMartClientCommand toCommand() {
            return new SaveOilMartClientCommand(code, name, contactPerson, phone, email, address,
                    status != null ? status : OilMartClientStatus.ACTIVE);
        }
    }

    public record OilMartReceiptLineRequest(
            @NotNull UUID itemId,
            @NotNull @Positive BigDecimal quantityLitres,
            @NotNull @PositiveOrZero BigDecimal buyUnitPrice) {
    }

    public record RecordOilMartReceiptRequest(
            @NotNull UUID supplierId,
            @Size(max = 100) String referenceNo,
            @NotNull Instant receivedAt,
            @Size(max = 1000) String note,
            @NotEmpty @Valid List<OilMartReceiptLineRequest> lines) {

        public RecordOilMartReceiptCommand toCommand() {
            return new RecordOilMartReceiptCommand(supplierId, referenceNo, receivedAt, note,
                    lines.stream()
                            .map(line -> new RecordOilMartReceiptCommand.Line(
                                    line.itemId(), line.quantityLitres(), line.buyUnitPrice()))
                            .toList());
        }
    }

    public record AdjustOilMartStockRequest(
            @NotNull UUID itemId,
            @NotNull @Positive BigDecimal quantityLitres,
            @NotNull OilMartStockAdjustmentDirection direction,
            @NotBlank @Size(max = 1000) String reason) {

        public AdjustOilMartStockCommand toCommand() {
            return new AdjustOilMartStockCommand(itemId, quantityLitres, direction, reason);
        }
    }

    public record QuickAddOilMartClientRequest(@NotBlank @Size(max = 200) String name) {
    }

    public record OilMartQuotationLineRequest(
            @NotNull UUID itemId,
            @NotNull @Positive BigDecimal quantityLitres,
            @PositiveOrZero BigDecimal listUnitPrice,
            @PositiveOrZero BigDecimal unitPrice,
            @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal discountPercent) {
    }

    public record SaveOilMartQuotationRequest(
            @NotNull UUID clientId,
            @NotNull LocalDate issuedDate,
            @NotNull LocalDate validUntil,
            @Size(max = 1000) String note,
            @NotEmpty @Valid List<OilMartQuotationLineRequest> lines) {

        public SaveOilMartQuotationCommand toCommand() {
            return new SaveOilMartQuotationCommand(clientId, issuedDate, validUntil, note,
                    lines.stream()
                            .map(line -> new SaveOilMartQuotationCommand.Line(
                                    line.itemId(), line.quantityLitres(), line.listUnitPrice(),
                                    line.unitPrice(),
                                    line.discountPercent() != null
                                            ? line.discountPercent()
                                            : BigDecimal.ZERO))
                            .toList());
        }
    }

    public record ReviseOilMartQuotationRequest(
            @NotNull UUID clientId,
            @NotNull LocalDate issuedDate,
            @NotNull LocalDate validUntil,
            @Size(max = 1000) String note,
            @NotNull Instant expectedUpdatedAt,
            @NotEmpty @Valid List<OilMartQuotationLineRequest> lines) {

        public SaveOilMartQuotationCommand toCommand() {
            return new SaveOilMartQuotationRequest(clientId, issuedDate, validUntil, note, lines)
                    .toCommand();
        }
    }

    public record OilMartDocumentTokenRequest(@NotNull Instant expectedUpdatedAt) {
    }

    public record RejectOilMartDocumentRequest(
            @NotBlank @Size(max = 1000) String reason,
            @NotNull Instant expectedUpdatedAt) {
    }

    public record CancelOilMartDocumentRequest(
            @Size(max = 1000) String reason,
            @NotNull Instant expectedUpdatedAt) {
    }

    public record CreateOilMartInvoiceRequest(
            @NotNull UUID quotationId,
            LocalDate invoiceDate,
            @Size(max = 1000) String note) {

        public CreateOilMartInvoiceCommand toCommand() {
            return new CreateOilMartInvoiceCommand(quotationId, invoiceDate, note);
        }
    }

    public record ReselectOilMartQuotationRequest(
            @NotNull UUID quotationId,
            @NotNull Instant expectedUpdatedAt) {
    }

}

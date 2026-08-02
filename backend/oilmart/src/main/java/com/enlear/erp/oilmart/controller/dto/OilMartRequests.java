package com.enlear.erp.oilmart.controller.dto;

import com.enlear.erp.oilmart.model.OilMartClientStatus;
import com.enlear.erp.oilmart.model.OilMartItemStatus;
import com.enlear.erp.oilmart.model.OilMartPaymentMethod;
import com.enlear.erp.oilmart.model.OilMartSupplierStatus;
import com.enlear.erp.oilmart.model.OilType;
import com.enlear.erp.oilmart.service.command.AddOilMartItemPriceCommand;
import com.enlear.erp.oilmart.service.command.CreateOilMartSaleCommand;
import com.enlear.erp.oilmart.service.command.DispatchOilMartSaleCommand;
import com.enlear.erp.oilmart.service.command.RecordOilMartReceiptCommand;
import com.enlear.erp.oilmart.service.command.SaveOilMartClientCommand;
import com.enlear.erp.oilmart.service.command.SaveOilMartItemCommand;
import com.enlear.erp.oilmart.service.command.SaveOilMartSupplierCommand;
import jakarta.validation.Valid;
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
            @PositiveOrZero BigDecimal reorderLevelLitres,
            OilMartItemStatus status) {

        public SaveOilMartItemCommand toCommand() {
            return new SaveOilMartItemCommand(code, name, oilType, brand, grade, description,
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

    public record OilMartSaleLineRequest(
            @NotNull UUID itemId,
            @NotNull @Positive BigDecimal quantityLitres,
            @PositiveOrZero BigDecimal listUnitPrice,
            @PositiveOrZero BigDecimal unitPrice,
            @DecimalMin("0.00") BigDecimal discountPercent) {
    }

    public record CreateOilMartSaleRequest(
            @NotNull UUID clientId,
            @NotNull Instant quotedAt,
            LocalDate validUntil,
            @PositiveOrZero BigDecimal discountAmount,
            @Size(max = 1000) String note,
            @NotEmpty @Valid List<OilMartSaleLineRequest> lines) {

        public CreateOilMartSaleCommand toCommand() {
            return new CreateOilMartSaleCommand(clientId, quotedAt, validUntil,
                    discountAmount != null ? discountAmount : BigDecimal.ZERO, note,
                    lines.stream()
                            .map(line -> new CreateOilMartSaleCommand.Line(
                                    line.itemId(), line.quantityLitres(), line.listUnitPrice(),
                                    line.unitPrice(),
                                    line.discountPercent() != null ? line.discountPercent() : BigDecimal.ZERO))
                            .toList());
        }
    }

    public record RejectOilMartSaleRequest(@NotBlank @Size(max = 1000) String reason) {
    }

    public record CancelOilMartSaleRequest(@Size(max = 1000) String reason) {
    }

    public record DispatchOilMartSaleRequest(
            @NotBlank @Size(max = 50) String vehicleNo,
            @NotBlank @Size(max = 150) String driverName,
            @Size(max = 1000) String note) {

        public DispatchOilMartSaleCommand toCommand() {
            return new DispatchOilMartSaleCommand(vehicleNo, driverName, note);
        }
    }

    public record InvoiceOilMartSaleRequest(@NotNull OilMartPaymentMethod paymentMethod) {
    }
}

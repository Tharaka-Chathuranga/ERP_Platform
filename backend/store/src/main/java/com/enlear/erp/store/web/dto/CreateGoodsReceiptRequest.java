package com.enlear.erp.store.web.dto;

import com.enlear.erp.store.service.command.CreateGoodsReceiptCommand;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CreateGoodsReceiptRequest(
        @Size(max = 64) String poNumber,
        @Size(max = 64) String invoiceNumber,
        @NotNull UUID supplierId,
        @NotNull UUID storeKeeperId,
        Instant receivedAt,
        @NotEmpty @Valid List<Line> lines) {

    public record Line(
            @NotNull UUID itemId,
            @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal quantity,
            @DecimalMin("0.0") BigDecimal unitCost) {
    }

    public CreateGoodsReceiptCommand toCommand() {
        return new CreateGoodsReceiptCommand(poNumber, invoiceNumber, supplierId,
                storeKeeperId, receivedAt,
                lines.stream()
                        .map(l -> new CreateGoodsReceiptCommand.Line(l.itemId(), l.quantity(), l.unitCost()))
                        .toList());
    }
}

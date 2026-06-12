package com.enlear.erp.store.web.dto;

import com.enlear.erp.store.service.command.CreateReceivalCommand;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Request to record a receival. Supply exactly one of {@code supplierId}
 * (registered) or {@code supplierName} (unregistered) — the service enforces it.
 */
public record CreateReceivalRequest(
        @Size(max = 64) String poNumber,
        @Size(max = 64) String invoiceNumber,
        UUID supplierId,
        @Size(max = 200) String supplierName,
        boolean allReceivedForPo,
        @NotNull UUID storeKeeperId,
        Instant receivedAt,
        @NotEmpty @Valid List<Line> lines) {

    public record Line(
            @NotNull UUID itemId,
            @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal quantity,
            @DecimalMin("0.0") BigDecimal unitCost) {
    }

    public CreateReceivalCommand toCommand() {
        return new CreateReceivalCommand(poNumber, invoiceNumber, supplierId, supplierName,
                allReceivedForPo, storeKeeperId, receivedAt,
                lines.stream()
                        .map(l -> new CreateReceivalCommand.Line(l.itemId(), l.quantity(), l.unitCost()))
                        .toList());
    }
}

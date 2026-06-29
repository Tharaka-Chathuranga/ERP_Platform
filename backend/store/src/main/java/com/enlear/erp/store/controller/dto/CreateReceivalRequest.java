package com.enlear.erp.store.controller.dto;

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

public record CreateReceivalRequest(
        @Size(max = 64) String poNumber,
        @Size(max = 64) String invoiceNumber,
        UUID supplierId,
        @Size(max = 200) String supplierName,
        boolean allReceivedForPo,
        @NotNull UUID storeKeeperId,
        Instant receivedAt,
        @NotEmpty @Valid List<ReceivalItem> receivalItems) {

    public record ReceivalItem(
            @NotNull UUID itemId,
            @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal quantity,
            @DecimalMin("0.0") BigDecimal unitCost,
            @Size(max = 64) String rack,
            @Size(max = 64) String row,
            @Size(max = 64) String column) {
    }

    public CreateReceivalCommand toCommand() {
        return new CreateReceivalCommand(poNumber, invoiceNumber, supplierId, supplierName,
                allReceivedForPo, storeKeeperId, receivedAt,
                receivalItems.stream()
                        .map(l -> new CreateReceivalCommand.ReceivalItem(l.itemId(), l.quantity(),
                                l.unitCost(), l.rack(), l.row(), l.column()))
                        .toList());
    }
}

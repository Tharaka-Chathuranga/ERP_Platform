package com.enlear.erp.store.web.dto;

import com.enlear.erp.store.domain.Location;
import com.enlear.erp.store.domain.ValuationMethod;
import com.enlear.erp.store.service.command.CreateItemCommand;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record CreateItemRequest(
        @NotBlank @Size(max = 64) String itemCode,
        @NotBlank @Size(max = 200) String name,
        @Size(max = 1000) String description,
        @NotBlank @Size(max = 16) String unitOfMeasure,
        @DecimalMin("0.0") BigDecimal unitPrice,
        @Size(max = 100) String category,
        ValuationMethod valuationMethod,
        @DecimalMin("0.0") BigDecimal reorderLevel,
        boolean criticalItem,
        boolean approvalRequiredForIssue,
        List<Location> locations) {

    public CreateItemCommand toCommand() {
        return new CreateItemCommand(itemCode, name, description, unitOfMeasure, unitPrice, category,
                valuationMethod, reorderLevel, criticalItem, approvalRequiredForIssue, locations);
    }
}

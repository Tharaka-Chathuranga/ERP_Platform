package com.enlear.erp.store.controller.dto;

import com.enlear.erp.store.service.command.UpdateItemCommand;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record UpdateItemRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 1000) String description,
        @Size(max = 100) String category,
        @DecimalMin("0.0") BigDecimal reorderLevel,
        boolean criticalItem,
        boolean approvalRequiredForIssue) {

    public UpdateItemCommand toCommand() {
        return new UpdateItemCommand(name, description, category, reorderLevel,
                criticalItem, approvalRequiredForIssue);
    }
}

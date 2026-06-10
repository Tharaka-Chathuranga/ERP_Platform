package com.enlear.erp.store.web.dto;

import com.enlear.erp.store.service.command.CreateWarehouseCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateWarehouseRequest(
        @NotBlank @Size(max = 32) String code,
        @NotBlank @Size(max = 150) String name,
        @Size(max = 500) String address) {

    public CreateWarehouseCommand toCommand() {
        return new CreateWarehouseCommand(code, name, address);
    }
}

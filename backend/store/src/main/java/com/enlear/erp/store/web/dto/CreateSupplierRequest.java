package com.enlear.erp.store.web.dto;

import com.enlear.erp.store.service.command.CreateSupplierCommand;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSupplierRequest(
        @NotBlank @Size(max = 32) String code,
        @NotBlank @Size(max = 200) String name,
        @Size(max = 500) String address,
        @Size(max = 100) String country,
        @Email @Size(max = 200) String email,
        @Size(max = 50) String phone) {

    public CreateSupplierCommand toCommand() {
        return new CreateSupplierCommand(code, name, address, country, email, phone);
    }
}

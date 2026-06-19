package com.enlear.erp.user.controller.dto;

import com.enlear.erp.user.service.command.CreateUserCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank @Size(max = 100) String username,
        @NotBlank @Size(min = 8, max = 100) String password,
        @Size(max = 150) String displayName,
        @NotBlank @Pattern(regexp = "ADMIN|STORE_KEEPER|QUALITY_ASSURANCE",
                message = "role must be ADMIN, STORE_KEEPER or QUALITY_ASSURANCE") String role,
        @Size(max = 100) String department) {

    public CreateUserCommand toCommand() {
        return new CreateUserCommand(username, password, displayName, role, department);
    }
}

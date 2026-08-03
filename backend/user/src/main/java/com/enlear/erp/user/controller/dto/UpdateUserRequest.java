package com.enlear.erp.user.controller.dto;

import com.enlear.erp.user.service.command.UpdateUserCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(max = 150) String displayName,
        @NotBlank @Pattern(
                regexp = "ADMIN|STORE_KEEPER|QUALITY_ASSURANCE"
                        + "|OIL_MART_SALES_ASSISTANT|OIL_MART_SALES_MANAGER",
                message = "role must be ADMIN, STORE_KEEPER, QUALITY_ASSURANCE, "
                        + "OIL_MART_SALES_ASSISTANT or OIL_MART_SALES_MANAGER") String role,
        @Size(max = 100) String department) {

    public UpdateUserCommand toCommand() {
        return new UpdateUserCommand(displayName, role, department);
    }
}

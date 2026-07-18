package com.enlear.erp.store.controller.dto;

import com.enlear.erp.store.model.DispositionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

/** Request bodies for the nonconformity review transitions (deciding authority, ISO 8.7.2). */
public final class NonconformityReviewRequests {

    private NonconformityReviewRequests() {
    }

    public record DispositionRequest(
            @NotNull UUID authorityId,
            @NotNull DispositionType dispositionType,
            @NotBlank @Size(max = 1000) String note) {
    }

    public record RejectRequest(
            @NotNull UUID authorityId,
            @NotBlank @Size(max = 1000) String note) {
    }

    public record CloseRequest(
            @NotNull UUID closedByUserId,
            @NotBlank @Size(max = 1000) String verificationNote) {
    }
}

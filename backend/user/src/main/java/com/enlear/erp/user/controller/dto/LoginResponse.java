package com.enlear.erp.user.controller.dto;

import java.util.UUID;

public record LoginResponse(
        String accessToken,
        String tokenType,
        UUID userId,
        String username,
        String role) {

    public static LoginResponse bearer(String token, UUID userId, String username, String role) {
        return new LoginResponse(token, "Bearer", userId, username, role);
    }
}

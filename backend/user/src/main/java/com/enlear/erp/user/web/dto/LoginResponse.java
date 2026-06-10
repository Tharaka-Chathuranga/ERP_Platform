package com.enlear.erp.user.web.dto;

public record LoginResponse(
        String accessToken,
        String tokenType,
        String username,
        String role) {

    public static LoginResponse bearer(String token, String username, String role) {
        return new LoginResponse(token, "Bearer", username, role);
    }
}

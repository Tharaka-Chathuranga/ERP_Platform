package com.enlear.erp.iam.web.dto;

import java.util.List;

public record LoginResponse(
        String accessToken,
        String tokenType,
        String username,
        List<String> roles) {

    public static LoginResponse bearer(String token, String username, List<String> roles) {
        return new LoginResponse(token, "Bearer", username, roles);
    }
}

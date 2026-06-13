package com.enlear.erp.user.exposed.dto;

import java.util.UUID;

public record CurrentUser(
        UUID id, String username, String displayName, String role, String department) {
}

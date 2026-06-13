package com.enlear.erp.user.exposed.dto;

import java.util.UUID;

/** Read-only identity view safe to share across module boundaries. */
public record CurrentUser(UUID id, String username, String displayName, String role) {
}

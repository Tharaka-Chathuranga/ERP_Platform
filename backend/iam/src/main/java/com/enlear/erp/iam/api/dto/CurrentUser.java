package com.enlear.erp.iam.api.dto;

import java.util.Set;
import java.util.UUID;

/** Read-only identity view safe to share across module boundaries. */
public record CurrentUser(UUID id, String username, String displayName, Set<String> roles) {
}

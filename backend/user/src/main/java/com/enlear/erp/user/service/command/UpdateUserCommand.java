package com.enlear.erp.user.service.command;

/** Intent to update an existing user's profile (not their password or username). */
public record UpdateUserCommand(
        String displayName,
        String role,
        String department) {
}

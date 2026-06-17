package com.enlear.erp.user.service.command;

/** Intent to create a new user. The raw password is hashed in the service. */
public record CreateUserCommand(
        String username,
        String rawPassword,
        String displayName,
        String role,
        String department) {
}

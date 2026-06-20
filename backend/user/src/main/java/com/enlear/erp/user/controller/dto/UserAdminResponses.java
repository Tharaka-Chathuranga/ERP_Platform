package com.enlear.erp.user.controller.dto;

import com.enlear.erp.user.model.User;
import java.util.UUID;

/** Outbound representations for administrative user management. */
public final class UserAdminResponses {

    private UserAdminResponses() {
    }

    /** Full management view of a user, including the {@code enabled} flag. */
    public record UserAdminResponse(
            UUID id, String username, String displayName, String role, String department,
            boolean enabled) {

        public static UserAdminResponse from(User u) {
            return new UserAdminResponse(u.getId(), u.getUsername(), u.getDisplayName(),
                    u.getRole(), u.getDepartment(), u.isEnabled());
        }
    }
}

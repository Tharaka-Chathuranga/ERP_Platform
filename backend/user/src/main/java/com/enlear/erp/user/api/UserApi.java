package com.enlear.erp.user.api;

import com.enlear.erp.user.api.dto.CurrentUser;
import java.util.Optional;

/**
 * Public, cross-module entry point for the user module. Other modules resolve
 * user identity through this facade only — never through user's
 * {@code web}, {@code service}, {@code domain} or {@code repository} internals.
 */
public interface UserApi {

    /** Look up a user by username, returning a boundary-safe identity view. */
    Optional<CurrentUser> findByUsername(String username);
}

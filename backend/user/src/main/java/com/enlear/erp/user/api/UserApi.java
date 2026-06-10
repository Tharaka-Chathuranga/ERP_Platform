package com.enlear.erp.iam.api;

import com.enlear.erp.iam.api.dto.CurrentUser;
import java.util.Optional;

/**
 * Public, cross-module entry point for the iam module. Other modules resolve
 * user identity through this facade only — never through iam's
 * {@code web}, {@code service}, {@code domain} or {@code repository} internals.
 */
public interface IamApi {

    /** Look up a user by username, returning a boundary-safe identity view. */
    Optional<CurrentUser> findByUsername(String username);
}

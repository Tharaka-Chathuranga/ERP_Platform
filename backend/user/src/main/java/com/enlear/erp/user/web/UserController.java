package com.enlear.erp.user.web;

import com.enlear.erp.user.api.UserApi;
import com.enlear.erp.user.api.dto.CurrentUser;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Read-only directory of users, used by the SPA to populate person pickers
 * (borrowing user, approver, store keeper). Returns the boundary-safe
 * {@link CurrentUser} view — never password hashes or internal aggregates.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserApi users;

    public UserController(UserApi users) {
        this.users = users;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public List<CurrentUser> list() {
        return users.listAll();
    }
}

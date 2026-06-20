package com.enlear.erp.user.controller;

import com.enlear.erp.user.exposed.UserApi;
import com.enlear.erp.user.exposed.dto.CurrentUser;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserApi users;

    public UserController(UserApi users) {
        this.users = users;
    }

    /** All users, or — when {@code department} is given — only that department's. */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER','QUALITY_ASSURANCE')")
    public List<CurrentUser> list(@RequestParam(required = false) String department) {
        return StringUtils.hasText(department)
                ? users.listByDepartment(department)
                : users.listAll();
    }
}

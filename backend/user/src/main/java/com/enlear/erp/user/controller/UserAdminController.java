package com.enlear.erp.user.controller;

import com.enlear.erp.user.controller.dto.CreateUserRequest;
import com.enlear.erp.user.controller.dto.ResetPasswordRequest;
import com.enlear.erp.user.controller.dto.UpdateUserRequest;
import com.enlear.erp.user.controller.dto.UserAdminResponses.UserAdminResponse;
import com.enlear.erp.user.service.UserAdminService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Administrative user management. Distinct from {@link UserController} (the
 * read-only lookup at {@code /api/users} used for pickers) — this controller
 * owns the write operations and is restricted to administrators.
 */
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserAdminController {

    private final UserAdminService users;

    public UserAdminController(UserAdminService users) {
        this.users = users;
    }

    @GetMapping
    public List<UserAdminResponse> list() {
        return users.listAll().stream().map(UserAdminResponse::from).toList();
    }

    @GetMapping("/{id}")
    public UserAdminResponse get(@PathVariable UUID id) {
        return UserAdminResponse.from(users.get(id));
    }

    @PostMapping
    public ResponseEntity<UserAdminResponse> create(@Valid @RequestBody CreateUserRequest request) {
        var user = users.create(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/admin/users/" + user.getId()))
                .body(UserAdminResponse.from(user));
    }

    @PatchMapping("/{id}")
    public UserAdminResponse update(@PathVariable UUID id,
                                    @Valid @RequestBody UpdateUserRequest request) {
        return UserAdminResponse.from(users.update(id, request.toCommand()));
    }

    @PostMapping("/{id}/enable")
    public UserAdminResponse enable(@PathVariable UUID id) {
        return UserAdminResponse.from(users.setEnabled(id, true));
    }

    @PostMapping("/{id}/disable")
    public UserAdminResponse disable(@PathVariable UUID id) {
        return UserAdminResponse.from(users.setEnabled(id, false));
    }

    @PostMapping("/{id}/reset-password")
    public UserAdminResponse resetPassword(@PathVariable UUID id,
                                           @Valid @RequestBody ResetPasswordRequest request) {
        return UserAdminResponse.from(users.resetPassword(id, request.newPassword()));
    }
}

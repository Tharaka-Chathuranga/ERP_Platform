package com.enlear.erp.user.web;

import com.enlear.erp.user.service.AuthService;
import com.enlear.erp.user.web.dto.LoginRequest;
import com.enlear.erp.user.web.dto.LoginResponse;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /** Lightweight identity check used by the SPA to validate a stored token. */
    @GetMapping("/me")
    public ResponseEntity<Object> me(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(java.util.Map.of("username", principal.getName()));
    }
}

package com.enlear.erp.user.service;

import com.enlear.erp.user.repository.UserRepository;
import com.enlear.erp.user.web.dto.LoginRequest;
import com.enlear.erp.user.web.dto.LoginResponse;
import com.enlear.erp.shared.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authenticates a user against the configured {@link AuthenticationManager} and
 * issues a signed JWT carrying the user's role.
 */
@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository users;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       UserRepository users) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(a -> a.startsWith("ROLE_") ? a.substring(5) : a)
                .findFirst()
                .orElse(null);

        var user = users.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user not found: " + authentication.getName()));

        String token = jwtService.issueToken(authentication.getName(), role);
        return LoginResponse.bearer(token, user.getId(), authentication.getName(), role);
    }
}

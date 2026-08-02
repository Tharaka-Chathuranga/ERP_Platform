package com.enlear.erp.oilmart.controller;

import java.util.Set;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class OilMartProfitVisibility {

    private static final Set<String> ALLOWED_AUTHORITIES = Set.of("ROLE_ADMIN", "ROLE_STORES_MANAGER");

    public boolean isVisible() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(ALLOWED_AUTHORITIES::contains);
    }
}

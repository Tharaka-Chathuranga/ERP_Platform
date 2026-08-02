package com.enlear.erp.oilmart.service;

import com.enlear.erp.shared.error.BusinessException;
import com.enlear.erp.user.exposed.UserApi;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class OilMartCurrentUser {

    private final UserApi users;

    public OilMartCurrentUser(UserApi users) {
        this.users = users;
    }

    public UUID requireId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new NotAuthenticated();
        }
        return users.findByUsername(authentication.getName())
                .orElseThrow(NotAuthenticated::new)
                .id();
    }

    static class NotAuthenticated extends BusinessException {
        NotAuthenticated() {
            super(HttpStatus.UNAUTHORIZED, "OILMART_NOT_AUTHENTICATED",
                    "No signed-in user could be resolved for this request");
        }
    }
}

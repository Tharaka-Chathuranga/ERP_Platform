package com.enlear.erp.notification.controller;

import com.enlear.erp.notification.exposed.dto.NotificationView;
import com.enlear.erp.notification.service.NotificationService;
import com.enlear.erp.shared.web.PageResponse;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private static final String ROLE_PREFIX = "ROLE_";

    private final NotificationService notifications;

    public NotificationController(NotificationService notifications) {
        this.notifications = notifications;
    }

    @GetMapping
    public PageResponse<NotificationView> inbox(
            Authentication authentication,
            @PageableDefault(size = 20) Pageable pageable) {
        return PageResponse.of(
                notifications.inbox(username(authentication), role(authentication), pageable),
                view -> view);
    }

    @GetMapping("/unread-count")
    public UnreadCountResponse unreadCount(Authentication authentication) {
        long count = notifications.unreadCount(username(authentication), role(authentication));
        return new UnreadCountResponse(count);
    }

    @PostMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markRead(@PathVariable UUID id, Authentication authentication) {
        notifications.markRead(id, username(authentication), role(authentication));
    }

    private static String username(Authentication authentication) {
        return authentication.getName();
    }

    /** The caller's single role without the Spring {@code ROLE_} prefix, or null. */
    private static String role(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith(ROLE_PREFIX))
                .map(a -> a.substring(ROLE_PREFIX.length()))
                .findFirst()
                .orElse(null);
    }

    public record UnreadCountResponse(long unread) {
    }
}

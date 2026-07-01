package com.enlear.erp.notification.service;

import com.enlear.erp.notification.exposed.NotificationApi;
import com.enlear.erp.notification.exposed.dto.NotificationRequest;
import com.enlear.erp.notification.exposed.dto.NotificationView;
import com.enlear.erp.notification.model.Notification;
import com.enlear.erp.notification.repository.NotificationRepository;
import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import java.time.Instant;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Owns the notification inbox. Implements the cross-module {@link NotificationApi}
 * for producers and serves the SPA inbox reads/updates for the controller.
 */
@Service
@Transactional
public class NotificationService implements NotificationApi {

    private final NotificationRepository notifications;

    public NotificationService(NotificationRepository notifications) {
        this.notifications = notifications;
    }

    @Override
    public UUID raise(NotificationRequest request) {
        validate(request);

        String dedupeKey = request.dedupeKey();
        if (dedupeKey != null && !dedupeKey.isBlank()) {
            var existing = notifications.findByDedupeKey(dedupeKey);
            if (existing.isPresent()) {
                return existing.get().getId();
            }
        }

        Notification notification = new Notification(
                request.recipientUsername(), request.recipientRole(), request.type(),
                request.severity(), request.title(), request.body(), request.link(),
                request.sourceModule(), emptyToNull(dedupeKey));

        try {
            return notifications.save(notification).getId();
        } catch (DataIntegrityViolationException raced) {
            // A concurrent producer inserted the same dedupe_key first; adopt theirs.
            if (dedupeKey != null) {
                return notifications.findByDedupeKey(dedupeKey)
                        .map(Notification::getId)
                        .orElseThrow(() -> raced);
            }
            throw raced;
        }
    }

    /** One user's inbox: direct notifications plus broadcasts to their role. */
    @Transactional(readOnly = true)
    public Page<NotificationView> inbox(String username, String role, Pageable pageable) {
        return notifications.findInbox(username, role, pageable).map(NotificationService::toView);
    }

    @Transactional(readOnly = true)
    public long unreadCount(String username, String role) {
        return notifications.countUnread(username, role);
    }

    /** Mark one notification read, but only if it belongs to the caller. */
    public void markRead(UUID id, String username, String role) {
        Notification notification = notifications.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        if (!isRecipient(notification, username, role)) {
            throw new ResourceNotFoundException("Notification", id);
        }
        notification.markRead(Instant.now());
    }

    private void validate(NotificationRequest request) {
        boolean hasUser = request.recipientUsername() != null && !request.recipientUsername().isBlank();
        boolean hasRole = request.recipientRole() != null && !request.recipientRole().isBlank();
        if (!hasUser && !hasRole) {
            throw new BusinessRuleException("NOTIFICATION_NO_RECIPIENT",
                    "A notification must target a user, a role, or both");
        }
        if (request.type() == null || request.severity() == null) {
            throw new BusinessRuleException("NOTIFICATION_INCOMPLETE",
                    "Notification type and severity are required");
        }
        if (request.title() == null || request.title().isBlank()
                || request.body() == null || request.body().isBlank()) {
            throw new BusinessRuleException("NOTIFICATION_INCOMPLETE",
                    "Notification title and body are required");
        }
        if (request.sourceModule() == null || request.sourceModule().isBlank()) {
            throw new BusinessRuleException("NOTIFICATION_INCOMPLETE",
                    "Notification sourceModule is required");
        }
    }

    private static boolean isRecipient(Notification n, String username, String role) {
        return (n.getRecipientUsername() != null && n.getRecipientUsername().equals(username))
                || (n.getRecipientRole() != null && n.getRecipientRole().equals(role));
    }

    private static String emptyToNull(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }

    private static NotificationView toView(Notification n) {
        return new NotificationView(n.getId(), n.getType(), n.getSeverity(), n.getTitle(),
                n.getBody(), n.getLink(), n.getSourceModule(), n.isRead(), n.getCreatedAt());
    }
}

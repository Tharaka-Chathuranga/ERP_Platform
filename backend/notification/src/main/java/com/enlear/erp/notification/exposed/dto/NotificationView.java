package com.enlear.erp.notification.exposed.dto;

import com.enlear.erp.notification.exposed.NotificationSeverity;
import com.enlear.erp.notification.exposed.NotificationType;
import java.time.Instant;
import java.util.UUID;

/** Read model of a single notification, returned to the SPA inbox. */
public record NotificationView(
        UUID id,
        NotificationType type,
        NotificationSeverity severity,
        String title,
        String body,
        String link,
        String sourceModule,
        boolean read,
        Instant createdAt) {
}

package com.enlear.erp.notification.model;

import com.enlear.erp.notification.exposed.NotificationSeverity;
import com.enlear.erp.notification.exposed.NotificationType;
import com.enlear.erp.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * A single notification in the platform-wide inbox. Targets a user
 * ({@code recipientUsername}), a role ({@code recipientRole}), or both — at
 * least one is always set. Persisted directly via Spring Data, consistent with
 * the rest of the platform.
 */
@Entity
@Table(name = "notifications", schema = "notification")
@Getter
@NoArgsConstructor
public class Notification extends BaseEntity {

    @Column(name = "recipient_username", length = 100)
    private String recipientUsername;

    @Column(name = "recipient_role", length = 64)
    private String recipientRole;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 64)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private NotificationSeverity severity;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String body;

    @Column(length = 500)
    private String link;

    @Column(name = "source_module", nullable = false, length = 32)
    private String sourceModule;

    @Column(name = "dedupe_key", length = 200)
    private String dedupeKey;

    @Column(name = "read_at")
    private Instant readAt;

    public Notification(String recipientUsername, String recipientRole, NotificationType type,
                        NotificationSeverity severity, String title, String body, String link,
                        String sourceModule, String dedupeKey) {
        this.recipientUsername = recipientUsername;
        this.recipientRole = recipientRole;
        this.type = type;
        this.severity = severity;
        this.title = title;
        this.body = body;
        this.link = link;
        this.sourceModule = sourceModule;
        this.dedupeKey = dedupeKey;
    }

    public boolean isRead() {
        return readAt != null;
    }

    /** Mark as read at the given instant; idempotent (first read wins). */
    public void markRead(Instant when) {
        if (this.readAt == null) {
            this.readAt = when;
        }
    }
}

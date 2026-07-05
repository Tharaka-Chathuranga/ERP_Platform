package com.enlear.erp.notification.exposed.dto;

import com.enlear.erp.notification.exposed.NotificationSeverity;
import com.enlear.erp.notification.exposed.NotificationType;

/**
 * Instruction from any module to raise a notification. Built with the static
 * factories so producers only supply what a given target needs, then refined
 * with the {@code with*} helpers for optional fields.
 *
 * <p>A request must target a user, a role, or both — enforced when it reaches
 * {@link com.enlear.erp.notification.exposed.NotificationApi}.
 *
 * @param recipientUsername a specific user (matches the JWT subject); may be null
 * @param recipientRole     a role broadcast, e.g. {@code ADMIN}; may be null
 * @param type              category of the notification
 * @param severity          urgency
 * @param title             short headline shown in the inbox
 * @param body              full message text
 * @param link              optional deep link into the SPA, e.g. {@code /store/items/{id}}
 * @param sourceModule      the module raising it, e.g. {@code store}
 * @param dedupeKey         optional idempotency key; a second request with the
 *                          same key is ignored while the first still exists
 */
public record NotificationRequest(
        String recipientUsername,
        String recipientRole,
        NotificationType type,
        NotificationSeverity severity,
        String title,
        String body,
        String link,
        String sourceModule,
        String dedupeKey) {

    /** Target every user holding {@code role} (e.g. all ADMINs). */
    public static NotificationRequest toRole(String role, NotificationType type,
                                             NotificationSeverity severity, String title,
                                             String body, String sourceModule) {
        return new NotificationRequest(null, role, type, severity, title, body,
                null, sourceModule, null);
    }

    /** Target a single user by username. */
    public static NotificationRequest toUser(String username, NotificationType type,
                                             NotificationSeverity severity, String title,
                                             String body, String sourceModule) {
        return new NotificationRequest(username, null, type, severity, title, body,
                null, sourceModule, null);
    }

    /** Copy with a deep link attached. */
    public NotificationRequest withLink(String newLink) {
        return new NotificationRequest(recipientUsername, recipientRole, type, severity,
                title, body, newLink, sourceModule, dedupeKey);
    }

    /** Copy with an idempotency key attached. */
    public NotificationRequest withDedupeKey(String newDedupeKey) {
        return new NotificationRequest(recipientUsername, recipientRole, type, severity,
                title, body, link, sourceModule, newDedupeKey);
    }
}

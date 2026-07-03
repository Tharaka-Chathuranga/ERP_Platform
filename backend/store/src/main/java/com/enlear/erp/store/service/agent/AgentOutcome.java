package com.enlear.erp.store.service.agent;

import com.enlear.erp.notification.exposed.NotificationSeverity;
import com.enlear.erp.notification.exposed.NotificationType;
import com.enlear.erp.notification.exposed.dto.NotificationRequest;

/**
 * What a {@link StockManagementAgent} produces for a reorder situation: the
 * admin-facing message (title + body) and how urgent it is. The agent decides
 * the wording; turning it into a concrete {@link NotificationRequest} is fixed
 * here so every agent implementation routes/dedupes identically.
 */
public record AgentOutcome(String title, String body, NotificationSeverity severity) {

    /** Broadcast to all admins, deep-linked to the item, deduped per item. */
    public NotificationRequest toRequest(ReorderAssessment assessment) {
        return NotificationRequest
                .toRole("ADMIN", NotificationType.REORDER_ALERT, severity, title, body, "store")
                .withLink("/store/items/" + assessment.itemId())
                .withDedupeKey("reorder:" + assessment.itemId());
    }
}

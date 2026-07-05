package com.enlear.erp.store.model;

import com.enlear.erp.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Audit + idempotency record for the Stock Management Agent. One OPEN alert can
 * exist per item at a time (enforced by a partial unique index); it is RESOLVED
 * once stock recovers above the reorder level.
 */
@Entity
@Table(name = "reorder_alerts", schema = "store")
@Getter
@NoArgsConstructor
public class ReorderAlert extends BaseEntity {

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(name = "item_code", nullable = false, length = 64)
    private String itemCode;

    @Column(name = "on_hand_at_alert", nullable = false, precision = 19, scale = 4)
    private BigDecimal onHandAtAlert;

    @Column(name = "reorder_level", nullable = false, precision = 19, scale = 4)
    private BigDecimal reorderLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private ReorderAlertStatus status = ReorderAlertStatus.OPEN;

    @Column(name = "notification_id")
    private UUID notificationId;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    public ReorderAlert(UUID itemId, String itemCode, BigDecimal onHandAtAlert,
                        BigDecimal reorderLevel) {
        this.itemId = itemId;
        this.itemCode = itemCode;
        this.onHandAtAlert = onHandAtAlert;
        this.reorderLevel = reorderLevel;
        this.status = ReorderAlertStatus.OPEN;
    }

    /** Record which notification was raised for this alert. */
    public void linkNotification(UUID notificationId) {
        this.notificationId = notificationId;
    }

    /** Close the alert once stock is healthy again. Idempotent. */
    public void resolve(Instant when) {
        if (this.status == ReorderAlertStatus.OPEN) {
            this.status = ReorderAlertStatus.RESOLVED;
            this.resolvedAt = when;
        }
    }
}

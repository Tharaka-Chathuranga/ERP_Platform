package com.enlear.erp.store.model;

import com.enlear.erp.shared.model.BaseEntity;
import com.enlear.erp.shared.error.BusinessRuleException;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * A nonconformity report (NCR) — a multi-item record of nonconforming outputs raised by a
 * store keeper and dispositioned by a deciding authority, per ISO 9001:2015 clause 8.7
 * ("Control of nonconforming outputs") and 10.2 ("Nonconformity and corrective action").
 *
 * <p>Lifecycle: RAISED → UNDER_REVIEW → DISPOSITIONED → CLOSED, with a REJECTED branch off
 * review. {@code detectionStage} is an orthogonal classification of where the nonconformity
 * was detected. Clause 8.7.2 requires retaining the deciding authority and the action taken —
 * captured here as the review and disposition fields.
 */
@Entity
@Table(name = "nonconformity_reports", schema = "store")
@Getter
@NoArgsConstructor
public class NonconformityReport extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private NonconformityStatus status = NonconformityStatus.RAISED;

    @Enumerated(EnumType.STRING)
    @Column(name = "detection_stage", nullable = false, length = 16)
    private DetectionStage detectionStage = DetectionStage.INCOMING;

    @Column(length = 1000)
    private String description;

    @Column(name = "reported_by_user_id", nullable = false)
    private UUID reportedByUserId;

    @Column(name = "reported_at", nullable = false)
    private Instant reportedAt;

    @Column(name = "reviewed_by_user_id")
    private UUID reviewedByUserId;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "review_note", length = 1000)
    private String reviewNote;

    @Enumerated(EnumType.STRING)
    @Column(name = "disposition_type", length = 24)
    private DispositionType dispositionType;

    @Column(name = "closed_by_user_id")
    private UUID closedByUserId;

    @Column(name = "closed_at")
    private Instant closedAt;

    @Column(name = "verification_note", length = 1000)
    private String verificationNote;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "nonconformity_report_id", nullable = false)
    private List<NonconformityReportItem> items = new ArrayList<>();

    public NonconformityReport(String description, UUID reportedByUserId, DetectionStage detectionStage) {
        this.description = description;
        this.reportedByUserId = reportedByUserId;
        this.reportedAt = Instant.now();
        this.status = NonconformityStatus.RAISED;
        this.detectionStage = detectionStage != null ? detectionStage : DetectionStage.INCOMING;
    }

    public void addItem(UUID itemId, BigDecimal quantity) {
        items.add(new NonconformityReportItem(itemId, quantity));
    }

    /** Deciding authority opens the review: RAISED → UNDER_REVIEW. */
    public void startReview() {
        requireStatus(NonconformityStatus.RAISED, "put under review");
        this.status = NonconformityStatus.UNDER_REVIEW;
    }

    /** Deciding authority records a disposition: UNDER_REVIEW → DISPOSITIONED (ISO 8.7.1). */
    public void disposition(UUID authorityId, DispositionType type, String note) {
        requireStatus(NonconformityStatus.UNDER_REVIEW, "dispositioned");
        requireDecidingAuthority(authorityId);
        if (type == null) {
            throw new BusinessRuleException("STORE_NCR_DISPOSITION_REQUIRED",
                    "A disposition type is required");
        }
        requireNote(note, "disposition");
        this.status = NonconformityStatus.DISPOSITIONED;
        this.dispositionType = type;
        recordReview(authorityId, note);
    }

    /** Deciding authority rejects the report: UNDER_REVIEW → REJECTED. */
    public void reject(UUID authorityId, String note) {
        requireStatus(NonconformityStatus.UNDER_REVIEW, "rejected");
        requireDecidingAuthority(authorityId);
        requireNote(note, "rejection");
        this.status = NonconformityStatus.REJECTED;
        recordReview(authorityId, note);
    }

    /** Correction verified for conformity and the record closed: DISPOSITIONED → CLOSED (ISO 8.7.1). */
    public void close(UUID closedByUserId, String verificationNote) {
        requireStatus(NonconformityStatus.DISPOSITIONED, "closed");
        requireNote(verificationNote, "verification");
        this.status = NonconformityStatus.CLOSED;
        this.closedByUserId = closedByUserId;
        this.closedAt = Instant.now();
        this.verificationNote = verificationNote;
    }

    private void recordReview(UUID authorityId, String note) {
        this.reviewedByUserId = authorityId;
        this.reviewedAt = Instant.now();
        this.reviewNote = note;
    }

    private void requireStatus(NonconformityStatus expected, String action) {
        if (status != expected) {
            throw new BusinessRuleException("STORE_NCR_ILLEGAL_TRANSITION",
                    "Only a " + expected + " report can be " + action + " (current: " + status + ")");
        }
    }

    private void requireDecidingAuthority(UUID authorityId) {
        if (authorityId != null && authorityId.equals(reportedByUserId)) {
            throw new BusinessRuleException("STORE_NCR_SELF_REVIEW",
                    "The deciding authority must differ from the person who raised the report");
        }
    }

    private void requireNote(String note, String kind) {
        if (note == null || note.isBlank()) {
            throw new BusinessRuleException("STORE_NCR_NOTE_REQUIRED",
                    "A " + kind + " note is required");
        }
    }
}

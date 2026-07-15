package com.enlear.erp.store.model;

import com.enlear.erp.shared.model.BaseEntity;
import com.enlear.erp.shared.error.BusinessRuleException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;


@Entity
@Table(name = "items", schema = "store")
@Getter
@NoArgsConstructor
public class Item extends BaseEntity {

    @Column(name = "itemcode", nullable = false, unique = true, length = 64)
    private String itemCode;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(name = "unit_of_measure", nullable = false, length = 16)
    private String unitOfMeasure;

    @Column(name = "unit_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(length = 100)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(name = "valuation_method", nullable = false, length = 32)
    private ValuationMethod valuationMethod = ValuationMethod.WEIGHTED_AVERAGE;

    @Column(name = "reorder_level", nullable = false, precision = 19, scale = 4)
    private BigDecimal reorderLevel = BigDecimal.ZERO;

    @Column(name = "quantity_on_hand", nullable = false, precision = 19, scale = 4)
    private BigDecimal quantityOnHand = BigDecimal.ZERO;

    @Column(name = "is_critical_item", nullable = false)
    private boolean criticalItem = false;

    @Column(name = "is_approval_required_for_issue", nullable = false)
    private boolean approvalRequiredForIssue = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "locations", nullable = false, columnDefinition = "jsonb")
    private List<Location> locations = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ItemStatus status = ItemStatus.ACTIVE;

    public Item(String itemCode, String name, String description, String unitOfMeasure,
                BigDecimal unitPrice, String category, ValuationMethod valuationMethod,
                BigDecimal reorderLevel, boolean criticalItem, boolean approvalRequiredForIssue,
                List<Location> locations) {
        this.itemCode = itemCode;
        this.name = name;
        this.description = description;
        this.unitOfMeasure = unitOfMeasure;
        this.unitPrice = unitPrice != null ? unitPrice : BigDecimal.ZERO;
        this.category = category;
        this.valuationMethod = valuationMethod != null ? valuationMethod : ValuationMethod.WEIGHTED_AVERAGE;
        this.reorderLevel = reorderLevel != null ? reorderLevel : BigDecimal.ZERO;
        this.criticalItem = criticalItem;
        this.approvalRequiredForIssue = approvalRequiredForIssue;
        this.locations = locations != null ? new ArrayList<>(locations) : new ArrayList<>();
        this.status = ItemStatus.ACTIVE;
    }

    public void deactivate() {
        this.status = ItemStatus.INACTIVE;
    }

    public boolean isActive() {
        return status == ItemStatus.ACTIVE;
    }

    public void updateLocations(List<Location> newLocations) {
        this.locations = newLocations != null ? new ArrayList<>(newLocations) : new ArrayList<>();
    }

    /**
     * Applies a signed quantity change to a storage slot. Receiving (positive)
     * adds into the matching slot or creates it; issuing (negative) draws from
     * the slot and drops it once empty. Rejects drawing more than the slot holds.
     */
    public void applyLocationDelta(Location target, BigDecimal signedDelta) {
        List<Location> updated = new ArrayList<>();
        boolean found = false;
        for (Location slot : locations) {
            if (sameSlot(slot, target)) {
                found = true;
                BigDecimal current = slot.quantity() != null ? slot.quantity() : BigDecimal.ZERO;
                BigDecimal next = current.add(signedDelta);
                if (next.signum() < 0) {
                    throw insufficientAt(target, current, signedDelta.negate());
                }
                if (next.signum() > 0) {
                    updated.add(new Location(slot.rack(), slot.row(), slot.column(),
                            slot.primary(), slot.general(), next));
                }
                // next == 0 → drop the slot entirely
            } else {
                updated.add(slot);
            }
        }
        if (!found) {
            if (signedDelta.signum() < 0) {
                throw insufficientAt(target, BigDecimal.ZERO, signedDelta.negate());
            }
            updated.add(new Location(target.rack(), target.row(), target.column(),
                    target.primary(), target.general(), signedDelta));
        }
        this.locations = updated;
    }

    private static boolean sameSlot(Location a, Location b) {
        if (a.general() || b.general()) {
            return a.general() && b.general();
        }
        return normalize(a.rack()).equals(normalize(b.rack()))
                && normalize(a.row()).equals(normalize(b.row()))
                && normalize(a.column()).equals(normalize(b.column()));
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }

    private static String slotLabel(Location slot) {
        if (slot.general()) {
            return "General";
        }
        StringBuilder sb = new StringBuilder();
        for (String part : new String[] {slot.rack(), slot.row(), slot.column()}) {
            if (part != null && !part.isBlank()) {
                if (sb.length() > 0) {
                    sb.append('/');
                }
                sb.append(part.trim());
            }
        }
        return sb.length() > 0 ? sb.toString() : "(unspecified)";
    }

    private BusinessRuleException insufficientAt(Location slot, BigDecimal have, BigDecimal need) {
        return new BusinessRuleException("STORE_INSUFFICIENT_LOCATION_STOCK",
                "Insufficient stock of %s at location %s: have %s, need %s"
                        .formatted(itemCode, slotLabel(slot), have, need));
    }

    /** Update the editable master-data fields (identity, code and on-hand are not touched). */
    public void updateDetails(String name, String description, String category,
                              BigDecimal reorderLevel, boolean criticalItem,
                              boolean approvalRequiredForIssue) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.reorderLevel = reorderLevel != null ? reorderLevel : BigDecimal.ZERO;
        this.criticalItem = criticalItem;
        this.approvalRequiredForIssue = approvalRequiredForIssue;
    }

    public void adjustOnHand(BigDecimal signedDelta) {
        BigDecimal next = quantityOnHand.add(signedDelta);
        if (next.signum() < 0) {
            throw new BusinessRuleException("STORE_INSUFFICIENT_STOCK",
                    "Insufficient stock: on hand %s, requested change %s"
                            .formatted(quantityOnHand, signedDelta));
        }
        this.quantityOnHand = next;
    }
}

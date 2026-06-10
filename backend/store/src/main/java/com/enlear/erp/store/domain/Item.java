package com.enlear.erp.store.domain;

import com.enlear.erp.shared.domain.BaseEntity;
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

/**
 * A stock-keeping item (product/material). Identified to users by its unique
 * {@code sku}. Carries the master data needed for inventory control, a
 * {@code reorderLevel} used to flag low stock, control flags, and the storage
 * bins it occupies (embedded JSONB — see {@link Location}).
 *
 * <p>On-hand quantity is NOT stored here: it is the projection in
 * {@code StockLevel}, derived from the stock-movement ledger.
 */
@Entity
@Table(name = "items", schema = "store")
@Getter
@NoArgsConstructor
public class Item extends BaseEntity {

    @Column(nullable = false, unique = true, length = 64)
    private String sku;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 1000)
    private String description;

    /** Unit of measure, e.g. EACH, KG, LITRE, BOX. */
    @Column(name = "unit_of_measure", nullable = false, length = 16)
    private String unitOfMeasure;

    /** Standard unit price / valuation reference for the item. */
    @Column(name = "unit_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(length = 100)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(name = "valuation_method", nullable = false, length = 32)
    private ValuationMethod valuationMethod = ValuationMethod.WEIGHTED_AVERAGE;

    @Column(name = "reorder_level", nullable = false, precision = 19, scale = 4)
    private BigDecimal reorderLevel = BigDecimal.ZERO;

    /** Flags the item as critical (e.g. safety stock / heightened controls). */
    @Column(name = "is_critical_item", nullable = false)
    private boolean criticalItem = false;

    /** When true, issuing this item requires an approval step. */
    @Column(name = "is_approval_required_for_issue", nullable = false)
    private boolean approvalRequiredForIssue = false;

    /** Storage bins, persisted as a JSONB array. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "locations", nullable = false, columnDefinition = "jsonb")
    private List<Location> locations = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ItemStatus status = ItemStatus.ACTIVE;

    public Item(String sku, String name, String description, String unitOfMeasure,
                BigDecimal unitPrice, String category, ValuationMethod valuationMethod,
                BigDecimal reorderLevel, boolean criticalItem, boolean approvalRequiredForIssue,
                List<Location> locations) {
        this.sku = sku;
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
}

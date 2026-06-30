package com.enlear.erp.store.model;

import com.enlear.erp.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "item_receival_item", schema = "store")
@Getter
@NoArgsConstructor
public class ReceivalItem extends BaseEntity {

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal quantity;

    @Column(name = "unit_cost", precision = 19, scale = 4)
    private BigDecimal unitCost;

    /** Storage slot this line is put away into. */
    @Column(length = 64)
    private String rack;

    @Column(name = "`row`", length = 64)
    private String row;

    @Column(name = "`column`", length = 64)
    private String column;

    public ReceivalItem(UUID itemId, BigDecimal quantity, BigDecimal unitCost,
                        String rack, String row, String column) {
        this.itemId = itemId;
        this.quantity = quantity;
        this.unitCost = unitCost;
        this.rack = rack;
        this.row = row;
        this.column = column;
    }

    /** The slot this line was placed into, with this line's quantity. */
    public Location toLocation() {
        return new Location(rack, row, column, false, quantity);
    }
}

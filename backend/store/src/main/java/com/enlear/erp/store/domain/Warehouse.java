package com.enlear.erp.store.domain;

import com.enlear.erp.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * A physical store / warehouse that holds stock. Stock levels and movements are
 * always recorded against a specific warehouse, supporting multi-location
 * inventory from day one.
 */
@Entity
@Table(name = "warehouses", schema = "store")
@Getter
@NoArgsConstructor
public class Warehouse extends BaseEntity {

    @Column(nullable = false, unique = true, length = 32)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 500)
    private String address;

    @Column(nullable = false)
    private boolean active = true;

    public Warehouse(String code, String name, String address) {
        this.code = code;
        this.name = name;
        this.address = address;
        this.active = true;
    }

    public void deactivate() {
        this.active = false;
    }
}

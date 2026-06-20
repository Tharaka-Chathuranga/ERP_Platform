package com.enlear.erp.store.model;

import com.enlear.erp.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * A vendor from whom items are purchased. The items a supplier provides (and the
 * sourcing data for each) are modelled separately in {@link SupplierItem}, since
 * that is a many-to-many relationship carrying its own attributes.
 */
@Entity
@Table(name = "suppliers", schema = "store")
@Getter
@NoArgsConstructor
public class Supplier extends BaseEntity {

    @Column(nullable = false, unique = true, length = 32)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 500)
    private String address;

    @Column(length = 100)
    private String country;

    @Column(length = 200)
    private String email;

    @Column(length = 50)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private SupplierStatus status = SupplierStatus.ACTIVE;

    public Supplier(String code, String name, String address, String country,
                    String email, String phone) {
        this.code = code;
        this.name = name;
        this.address = address;
        this.country = country;
        this.email = email;
        this.phone = phone;
        this.status = SupplierStatus.ACTIVE;
    }

    public void deactivate() {
        this.status = SupplierStatus.INACTIVE;
    }

    public void activate() {
        this.status = SupplierStatus.ACTIVE;
    }
}

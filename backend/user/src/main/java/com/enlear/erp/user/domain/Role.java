package com.enlear.erp.user.domain;

import com.enlear.erp.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A named authority granted to users (e.g. {@code ADMIN}, {@code STORE_CLERK}).
 * Role names are stored without the {@code ROLE_} prefix; the prefix is added
 * when building Spring Security authorities.
 */
@Entity
@Table(name = "roles", schema = "users")
@Getter
@Setter
@NoArgsConstructor
public class Role extends BaseEntity {

    @Column(nullable = false, unique = true, length = 64)
    private String name;

    @Column(length = 255)
    private String description;

    public Role(String name, String description) {
        this.name = name;
        this.description = description;
    }
}

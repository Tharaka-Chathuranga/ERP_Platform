package com.enlear.erp.user.domain;

import com.enlear.erp.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * An application user. Stores a BCrypt password hash (never the plaintext) and a
 * single role (e.g. {@code ADMIN}, {@code STORE_KEEPER}) used to build the
 * security authority at login.
 */
@Entity
@Table(name = "users", schema = "users")
@Getter
@Setter
@NoArgsConstructor
public class User extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "display_name", length = 150)
    private String displayName;

    @Column(nullable = false, length = 64)
    private String role;

    @Column(nullable = false)
    private boolean enabled = true;
}

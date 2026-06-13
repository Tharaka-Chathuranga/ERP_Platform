package com.enlear.erp.user.model;

import com.enlear.erp.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    @Column(length = 100)
    private String department;

    @Column(nullable = false)
    private boolean enabled = true;
}

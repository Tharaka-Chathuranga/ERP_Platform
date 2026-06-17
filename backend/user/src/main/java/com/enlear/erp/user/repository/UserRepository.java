package com.enlear.erp.user.repository;

import com.enlear.erp.user.model.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    List<User> findByDepartmentOrderByUsername(String department);

    /** Number of enabled users holding the given role — used to protect the last admin. */
    long countByRoleAndEnabledTrue(String role);
}

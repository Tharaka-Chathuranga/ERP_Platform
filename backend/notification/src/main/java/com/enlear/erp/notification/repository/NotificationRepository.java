package com.enlear.erp.notification.repository;

import com.enlear.erp.notification.model.Notification;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    /**
     * The inbox for one user: everything addressed to them directly, plus every
     * broadcast to the role they hold. Newest first.
     */
    @Query("""
            SELECT n FROM Notification n
            WHERE n.recipientUsername = :username
               OR n.recipientRole = :role
            ORDER BY n.createdAt DESC
            """)
    Page<Notification> findInbox(@Param("username") String username,
                                 @Param("role") String role,
                                 Pageable pageable);

    /** Unread count for a user, across direct and role-broadcast notifications. */
    @Query("""
            SELECT COUNT(n) FROM Notification n
            WHERE (n.recipientUsername = :username OR n.recipientRole = :role)
              AND n.readAt IS NULL
            """)
    long countUnread(@Param("username") String username, @Param("role") String role);

    Optional<Notification> findByDedupeKey(String dedupeKey);
}

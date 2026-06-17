package com.enlear.erp.store.repository;

import com.enlear.erp.store.model.Item;
import jakarta.persistence.LockModeType;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ItemRepository extends JpaRepository<Item, UUID> {

    boolean existsByItemCode(String itemCode);

    Page<Item> findByNameContainingIgnoreCaseOrItemCodeContainingIgnoreCase(
            String name, String itemCode, Pageable pageable);

    @Query("select i.id from Item i where i.id in :ids")
    List<UUID> findExistingIds(Collection<UUID> ids);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from Item i where i.id = :id")
    Optional<Item> findByIdForUpdate(@Param("id") UUID id);
}

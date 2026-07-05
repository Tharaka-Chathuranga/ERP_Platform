package com.enlear.erp.store.repository;

import com.enlear.erp.store.model.Item;
import com.enlear.erp.store.model.ItemStatus;
import jakarta.persistence.LockModeType;
import java.math.BigDecimal;
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

    long countByStatus(ItemStatus status);

    /** Total value of active stock on hand (quantity × unit price). */
    @Query("select coalesce(sum(i.quantityOnHand * i.unitPrice), 0) from Item i "
            + "where i.status = com.enlear.erp.store.model.ItemStatus.ACTIVE")
    BigDecimal totalInventoryValue();

    @Query("select count(i) from Item i "
            + "where i.status = com.enlear.erp.store.model.ItemStatus.ACTIVE "
            + "and i.quantityOnHand < i.reorderLevel")
    long countLowStock();

    /** Active items below their reorder level, biggest shortfall first. */
    @Query("select i from Item i "
            + "where i.status = com.enlear.erp.store.model.ItemStatus.ACTIVE "
            + "and i.quantityOnHand < i.reorderLevel "
            + "order by (i.quantityOnHand - i.reorderLevel) asc")
    List<Item> findLowStock();

    /** Active items flagged critical, lowest stock first. */
    @Query("select i from Item i "
            + "where i.status = com.enlear.erp.store.model.ItemStatus.ACTIVE "
            + "and i.criticalItem = true "
            + "order by i.quantityOnHand asc")
    List<Item> findCriticalItems();

    /** Active items with healthy stock (at or above reorder level), least headroom first. */
    @Query("select i from Item i "
            + "where i.status = com.enlear.erp.store.model.ItemStatus.ACTIVE "
            + "and i.quantityOnHand >= i.reorderLevel "
            + "order by (i.quantityOnHand - i.reorderLevel) asc")
    List<Item> findNormalStock(Pageable pageable);

    /** Active items that are flagged critical AND below reorder level — highest priority. */
    @Query("select i from Item i "
            + "where i.status = com.enlear.erp.store.model.ItemStatus.ACTIVE "
            + "and i.criticalItem = true "
            + "and i.quantityOnHand < i.reorderLevel "
            + "order by (i.quantityOnHand - i.reorderLevel) asc")
    List<Item> findCriticalLowStock();

    /** Active items below reorder level that are NOT flagged critical, biggest shortfall first. */
    @Query("select i from Item i "
            + "where i.status = com.enlear.erp.store.model.ItemStatus.ACTIVE "
            + "and i.criticalItem = false "
            + "and i.quantityOnHand < i.reorderLevel "
            + "order by (i.quantityOnHand - i.reorderLevel) asc")
    List<Item> findNormalLowStock();

    @Query("select count(i) from Item i "
            + "where i.status = com.enlear.erp.store.model.ItemStatus.ACTIVE "
            + "and i.criticalItem = false "
            + "and i.quantityOnHand < i.reorderLevel")
    long countNormalLowStock();

    @Query("select count(i) from Item i "
            + "where i.status = com.enlear.erp.store.model.ItemStatus.ACTIVE "
            + "and i.criticalItem = true")
    long countCritical();

    @Query("select count(i) from Item i "
            + "where i.status = com.enlear.erp.store.model.ItemStatus.ACTIVE "
            + "and i.quantityOnHand >= i.reorderLevel")
    long countNormalStock();

    @Query("select count(i) from Item i "
            + "where i.status = com.enlear.erp.store.model.ItemStatus.ACTIVE "
            + "and i.criticalItem = true "
            + "and i.quantityOnHand < i.reorderLevel")
    long countCriticalLowStock();
}

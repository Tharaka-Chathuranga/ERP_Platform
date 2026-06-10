package com.enlear.erp.store.repository;

import com.enlear.erp.store.domain.Item;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Outbound persistence port for {@link Item}. Owned by the application layer;
 * Spring Data supplies the implementation at runtime (hexagonal-lite). Domain
 * classes never depend on it — only the application services do.
 */
public interface ItemRepository extends JpaRepository<Item, UUID> {

    Optional<Item> findBySku(String sku);

    boolean existsBySku(String sku);

    Page<Item> findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(
            String name, String sku, Pageable pageable);
}

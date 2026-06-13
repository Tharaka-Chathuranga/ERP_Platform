package com.enlear.erp.store.service.receival;

import static com.enlear.erp.store.service.receival.TextUtils.hasText;

import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import com.enlear.erp.store.repository.ItemRepository;
import com.enlear.erp.store.repository.SupplierRepository;
import com.enlear.erp.store.service.command.CreateReceivalCommand;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
class ReceivalValidator {

    private final SupplierRepository suppliers;
    private final ItemRepository items;

    ReceivalValidator(SupplierRepository suppliers, ItemRepository items) {
        this.suppliers = suppliers;
        this.items = items;
    }

    void validate(CreateReceivalCommand cmd) {
        validateHasItems(cmd);
        validateSupplier(cmd);
        validateItemsExist(cmd);
    }

    private void validateHasItems(CreateReceivalCommand cmd) {
        if (cmd.receivalItems() == null || cmd.receivalItems().isEmpty()) {
            throw new BusinessRuleException("STORE_RECEIVAL_EMPTY",
                    "A receival must have at least one line");
        }
    }

    private void validateSupplier(CreateReceivalCommand cmd) {
        boolean registered = cmd.supplierId() != null;
        boolean unregistered = hasText(cmd.supplierName());
        if (registered == unregistered) {
            throw new BusinessRuleException("STORE_RECEIVAL_SUPPLIER",
                    "Provide either a registered supplier or an unregistered supplier name, not both");
        }
        if (registered && !suppliers.existsById(cmd.supplierId())) {
            throw new ResourceNotFoundException("Supplier", cmd.supplierId());
        }
    }

    private void validateItemsExist(CreateReceivalCommand cmd) {
        Set<UUID> requestedItemIds = cmd.receivalItems().stream()
                .map(CreateReceivalCommand.ReceivalItem::itemId)
                .collect(Collectors.toSet());
        Set<UUID> existingItemIds = new HashSet<>(items.findExistingIds(requestedItemIds));
        for (CreateReceivalCommand.ReceivalItem item : cmd.receivalItems()) {
            if (!existingItemIds.contains(item.itemId())) {
                throw new ResourceNotFoundException("Item", item.itemId());
            }
        }
    }
}

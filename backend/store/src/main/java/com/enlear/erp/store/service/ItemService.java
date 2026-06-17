package com.enlear.erp.store.service;

import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import com.enlear.erp.store.service.command.CreateItemCommand;
import com.enlear.erp.store.service.command.UpdateItemCommand;
import com.enlear.erp.store.repository.ItemRepository;
import com.enlear.erp.store.model.Item;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional
public class ItemService {

    private final ItemRepository items;

    public ItemService(ItemRepository items) {
        this.items = items;
    }

    public Item createItem(CreateItemCommand cmd) {
        if (items.existsByItemCode(cmd.itemCode())) {
            throw new BusinessRuleException("STORE_DUPLICATE_ITEM_CODE",
                    "An item with item code '%s' already exists".formatted(cmd.itemCode()));
        }
        Item item = new Item(cmd.itemCode(), cmd.name(), cmd.description(), cmd.unitOfMeasure(),
                cmd.unitPrice(), cmd.category(), cmd.valuationMethod(), cmd.reorderLevel(),
                cmd.criticalItem(), cmd.approvalRequiredForIssue(), cmd.locations());
        return items.save(item);
    }

    @Transactional(readOnly = true)
    public Item getItem(UUID id) {
        return items.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item", id));
    }

    @Transactional(readOnly = true)
    public Page<Item> listItems(String search, Pageable pageable) {
        if (StringUtils.hasText(search)) {
            return items.findByNameContainingIgnoreCaseOrItemCodeContainingIgnoreCase(
                    search, search, pageable);
        }
        return items.findAll(pageable);
    }

    public Item updateItem(UUID id, UpdateItemCommand cmd) {
        Item item = getItem(id);
        item.updateDetails(cmd.name(), cmd.description(), cmd.category(), cmd.reorderLevel(),
                cmd.criticalItem(), cmd.approvalRequiredForIssue());
        return items.save(item);
    }

    public void deactivateItem(UUID id) {
        Item item = getItem(id);
        item.deactivate();
        items.save(item);
    }
}

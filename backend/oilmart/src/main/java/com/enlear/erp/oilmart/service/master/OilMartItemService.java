package com.enlear.erp.oilmart.service.master;

import com.enlear.erp.oilmart.model.OilMartItem;
import com.enlear.erp.oilmart.repository.OilMartItemRepository;
import com.enlear.erp.oilmart.service.command.SaveOilMartItemCommand;
import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OilMartItemService {

    private final OilMartItemRepository items;

    public OilMartItemService(OilMartItemRepository items) {
        this.items = items;
    }

    public OilMartItem create(SaveOilMartItemCommand cmd) {
        requireCode(cmd.code());
        if (items.existsByCodeIgnoreCase(cmd.code())) {
            throw new BusinessRuleException("OILMART_ITEM_CODE_TAKEN",
                    "An oil with code %s already exists".formatted(cmd.code()));
        }
        return items.save(new OilMartItem(cmd.code(), cmd.name(), cmd.oilType(), cmd.brand(),
                cmd.grade(), cmd.description(), cmd.unitOfMeasure(), cmd.reorderLevelLitres(),
                cmd.status()));
    }

    public OilMartItem update(UUID id, SaveOilMartItemCommand cmd) {
        requireCode(cmd.code());
        OilMartItem item = get(id);
        items.findByCodeIgnoreCase(cmd.code())
                .filter(other -> !other.getId().equals(id))
                .ifPresent(other -> {
                    throw new BusinessRuleException("OILMART_ITEM_CODE_TAKEN",
                            "An oil with code %s already exists".formatted(cmd.code()));
                });
        item.update(cmd.code(), cmd.name(), cmd.oilType(), cmd.brand(), cmd.grade(),
                cmd.description(), cmd.unitOfMeasure(), cmd.reorderLevelLitres(), cmd.status());
        return items.save(item);
    }

    @Transactional(readOnly = true)
    public OilMartItem get(UUID id) {
        return items.findById(id).orElseThrow(() -> new ResourceNotFoundException("OilMartItem", id));
    }

    @Transactional(readOnly = true)
    public List<OilMartItem> list(String search) {
        return search == null || search.isBlank()
                ? items.findAllByOrderByNameAsc()
                : items.search(search.trim());
    }

    private void requireCode(String code) {
        if (code == null || code.isBlank()) {
            throw new BusinessRuleException("OILMART_ITEM_CODE_REQUIRED", "An oil code is required");
        }
    }
}

package com.enlear.erp.store.service;

import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import com.enlear.erp.store.model.Supplier;
import com.enlear.erp.store.model.SupplierItem;
import com.enlear.erp.store.repository.ItemRepository;
import com.enlear.erp.store.repository.SupplierItemRepository;
import com.enlear.erp.store.repository.SupplierRepository;
import com.enlear.erp.store.service.command.AddSupplierItemCommand;
import com.enlear.erp.store.service.command.CreateSupplierCommand;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SupplierService {

    private final SupplierRepository suppliers;
    private final SupplierItemRepository supplierItems;
    private final ItemRepository items;

    public SupplierService(SupplierRepository suppliers, SupplierItemRepository supplierItems,
                           ItemRepository items) {
        this.suppliers = suppliers;
        this.supplierItems = supplierItems;
        this.items = items;
    }

    public Supplier createSupplier(CreateSupplierCommand cmd) {
        if (suppliers.existsByCode(cmd.code())) {
            throw new BusinessRuleException("STORE_DUPLICATE_SUPPLIER",
                    "A supplier with code '%s' already exists".formatted(cmd.code()));
        }
        return suppliers.save(new Supplier(cmd.code(), cmd.name(), cmd.address(),
                cmd.country(), cmd.email(), cmd.phone()));
    }

    @Transactional(readOnly = true)
    public List<Supplier> listSuppliers() {
        return suppliers.findAll(Sort.by("code"));
    }

    @Transactional(readOnly = true)
    public Supplier getSupplier(UUID id) {
        return suppliers.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
    }

    public SupplierItem addItem(AddSupplierItemCommand cmd) {
        if (!suppliers.existsById(cmd.supplierId())) {
            throw new ResourceNotFoundException("Supplier", cmd.supplierId());
        }
        if (!items.existsById(cmd.itemId())) {
            throw new ResourceNotFoundException("Item", cmd.itemId());
        }
        if (supplierItems.existsBySupplierIdAndItemId(cmd.supplierId(), cmd.itemId())) {
            throw new BusinessRuleException("STORE_DUPLICATE_SUPPLIER_ITEM",
                    "This item is already linked to the supplier");
        }
        return supplierItems.save(new SupplierItem(cmd.supplierId(), cmd.itemId(),
                cmd.supplierSku(), cmd.leadTimeDays(), cmd.lastPurchasePrice()));
    }

    @Transactional(readOnly = true)
    public List<SupplierItem> listItemsForSupplier(UUID supplierId) {
        return supplierItems.findBySupplierId(supplierId);
    }

    public Supplier activate(UUID id) {
        Supplier supplier = getSupplier(id);
        supplier.activate();
        return suppliers.save(supplier);
    }

    public Supplier deactivate(UUID id) {
        Supplier supplier = getSupplier(id);
        supplier.deactivate();
        return suppliers.save(supplier);
    }
}

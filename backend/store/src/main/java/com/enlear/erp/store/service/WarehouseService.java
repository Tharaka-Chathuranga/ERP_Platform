package com.enlear.erp.store.service;

import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.store.service.command.CreateWarehouseCommand;
import com.enlear.erp.store.repository.WarehouseRepository;
import com.enlear.erp.store.domain.Warehouse;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class WarehouseService {

    private final WarehouseRepository warehouses;

    public WarehouseService(WarehouseRepository warehouses) {
        this.warehouses = warehouses;
    }

    public Warehouse createWarehouse(CreateWarehouseCommand cmd) {
        if (warehouses.existsByCode(cmd.code())) {
            throw new BusinessRuleException("STORE_DUPLICATE_WAREHOUSE",
                    "A warehouse with code '%s' already exists".formatted(cmd.code()));
        }
        return warehouses.save(new Warehouse(cmd.code(), cmd.name(), cmd.address()));
    }

    @Transactional(readOnly = true)
    public List<Warehouse> listWarehouses() {
        return warehouses.findAll(Sort.by("code"));
    }
}

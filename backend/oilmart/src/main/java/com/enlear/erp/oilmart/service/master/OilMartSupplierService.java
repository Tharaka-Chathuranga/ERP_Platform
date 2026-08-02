package com.enlear.erp.oilmart.service.master;

import com.enlear.erp.oilmart.model.OilMartSupplier;
import com.enlear.erp.oilmart.repository.OilMartSupplierRepository;
import com.enlear.erp.oilmart.service.command.SaveOilMartSupplierCommand;
import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OilMartSupplierService {

    private final OilMartSupplierRepository suppliers;

    public OilMartSupplierService(OilMartSupplierRepository suppliers) {
        this.suppliers = suppliers;
    }

    public OilMartSupplier create(SaveOilMartSupplierCommand cmd) {
        if (suppliers.existsByCodeIgnoreCase(cmd.code())) {
            throw new BusinessRuleException("OILMART_SUPPLIER_CODE_TAKEN",
                    "A supplier with code %s already exists".formatted(cmd.code()));
        }
        return suppliers.save(new OilMartSupplier(cmd.code(), cmd.name(), cmd.contactPerson(),
                cmd.phone(), cmd.email(), cmd.address(), cmd.status()));
    }

    public OilMartSupplier update(UUID id, SaveOilMartSupplierCommand cmd) {
        OilMartSupplier supplier = get(id);
        supplier.update(cmd.code(), cmd.name(), cmd.contactPerson(), cmd.phone(),
                cmd.email(), cmd.address(), cmd.status());
        return suppliers.save(supplier);
    }

    @Transactional(readOnly = true)
    public OilMartSupplier get(UUID id) {
        return suppliers.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OilMartSupplier", id));
    }

    @Transactional(readOnly = true)
    public List<OilMartSupplier> list() {
        return suppliers.findAllByOrderByNameAsc();
    }
}

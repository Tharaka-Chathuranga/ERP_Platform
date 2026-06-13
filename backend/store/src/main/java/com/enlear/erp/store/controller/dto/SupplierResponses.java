package com.enlear.erp.store.controller.dto;

import com.enlear.erp.store.model.Supplier;
import com.enlear.erp.store.model.SupplierItem;
import com.enlear.erp.store.model.SupplierStatus;
import java.math.BigDecimal;
import java.util.UUID;

/** Outbound representations for suppliers and their item links. */
public final class SupplierResponses {

    private SupplierResponses() {
    }

    public record SupplierResponse(
            UUID id, String code, String name, String address, String country,
            String email, String phone, SupplierStatus status) {

        public static SupplierResponse from(Supplier s) {
            return new SupplierResponse(s.getId(), s.getCode(), s.getName(), s.getAddress(),
                    s.getCountry(), s.getEmail(), s.getPhone(), s.getStatus());
        }
    }

    public record SupplierItemResponse(
            UUID id, UUID supplierId, UUID itemId, String supplierSku,
            Integer leadTimeDays, BigDecimal lastPurchasePrice) {

        public static SupplierItemResponse from(SupplierItem si) {
            return new SupplierItemResponse(si.getId(), si.getSupplierId(), si.getItemId(),
                    si.getSupplierSku(), si.getLeadTimeDays(), si.getLastPurchasePrice());
        }
    }
}

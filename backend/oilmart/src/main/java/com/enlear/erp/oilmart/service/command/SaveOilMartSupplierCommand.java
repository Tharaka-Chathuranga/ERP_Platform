package com.enlear.erp.oilmart.service.command;

import com.enlear.erp.oilmart.model.OilMartSupplierStatus;

public record SaveOilMartSupplierCommand(
        String code,
        String name,
        String contactPerson,
        String phone,
        String email,
        String address,
        OilMartSupplierStatus status) {
}

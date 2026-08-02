package com.enlear.erp.oilmart.service.command;

import com.enlear.erp.oilmart.model.OilMartClientStatus;

public record SaveOilMartClientCommand(
        String code,
        String name,
        String contactPerson,
        String phone,
        String email,
        String address,
        OilMartClientStatus status) {
}

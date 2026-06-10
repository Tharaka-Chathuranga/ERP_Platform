package com.enlear.erp.store.service.command;

public record CreateSupplierCommand(
        String code,
        String name,
        String address,
        String country,
        String email,
        String phone) {
}

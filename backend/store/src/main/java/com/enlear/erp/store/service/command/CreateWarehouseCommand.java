package com.enlear.erp.store.service.command;

public record CreateWarehouseCommand(
        String code,
        String name,
        String address) {
}

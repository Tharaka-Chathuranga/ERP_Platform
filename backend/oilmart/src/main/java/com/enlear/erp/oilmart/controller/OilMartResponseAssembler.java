package com.enlear.erp.oilmart.controller;

import com.enlear.erp.oilmart.controller.dto.OilMartResponses.OilMartReceiptResponse;
import com.enlear.erp.oilmart.controller.dto.OilMartResponses.OilMartSaleResponse;
import com.enlear.erp.oilmart.model.OilMartItem;
import com.enlear.erp.oilmart.model.OilMartReceipt;
import com.enlear.erp.oilmart.model.OilMartSale;
import com.enlear.erp.oilmart.repository.OilMartClientRepository;
import com.enlear.erp.oilmart.repository.OilMartItemRepository;
import com.enlear.erp.oilmart.repository.OilMartSupplierRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Transactional(readOnly = true)
public class OilMartResponseAssembler {

    private final OilMartItemRepository items;
    private final OilMartClientRepository clients;
    private final OilMartSupplierRepository suppliers;

    public OilMartResponseAssembler(OilMartItemRepository items,
                                    OilMartClientRepository clients,
                                    OilMartSupplierRepository suppliers) {
        this.items = items;
        this.clients = clients;
        this.suppliers = suppliers;
    }

    public OilMartSaleResponse toResponse(OilMartSale sale) {
        return OilMartSaleResponse.from(sale, clientName(sale.getClientId()), itemsById());
    }

    public List<OilMartSaleResponse> toSaleResponses(List<OilMartSale> sales) {
        Map<UUID, OilMartItem> itemsById = itemsById();
        Map<UUID, String> clientNames = clientNames();
        return sales.stream()
                .map(sale -> OilMartSaleResponse.from(sale, clientNames.get(sale.getClientId()), itemsById))
                .toList();
    }

    public OilMartReceiptResponse toResponse(OilMartReceipt receipt) {
        return OilMartReceiptResponse.from(receipt, supplierName(receipt.getSupplierId()), itemsById());
    }

    public List<OilMartReceiptResponse> toReceiptResponses(List<OilMartReceipt> receipts) {
        Map<UUID, OilMartItem> itemsById = itemsById();
        Map<UUID, String> supplierNames = supplierNames();
        return receipts.stream()
                .map(receipt -> OilMartReceiptResponse.from(
                        receipt, supplierNames.get(receipt.getSupplierId()), itemsById))
                .toList();
    }

    private Map<UUID, OilMartItem> itemsById() {
        return items.findAll().stream()
                .collect(Collectors.toMap(OilMartItem::getId, Function.identity()));
    }

    private Map<UUID, String> clientNames() {
        return clients.findAll().stream()
                .collect(Collectors.toMap(client -> client.getId(), client -> client.getName()));
    }

    private Map<UUID, String> supplierNames() {
        return suppliers.findAll().stream()
                .collect(Collectors.toMap(supplier -> supplier.getId(), supplier -> supplier.getName()));
    }

    private String clientName(UUID clientId) {
        return clients.findById(clientId).map(client -> client.getName()).orElse(null);
    }

    private String supplierName(UUID supplierId) {
        return suppliers.findById(supplierId).map(supplier -> supplier.getName()).orElse(null);
    }
}

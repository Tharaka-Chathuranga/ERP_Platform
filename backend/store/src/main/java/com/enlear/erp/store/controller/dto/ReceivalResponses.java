package com.enlear.erp.store.controller.dto;

import com.enlear.erp.store.model.Receival;
import com.enlear.erp.store.model.ReceivalItem;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Outbound representations for receivals. */
public final class ReceivalResponses {

    private ReceivalResponses() {
    }

    public record ReceivalItemResponse(
            UUID id, UUID itemId, BigDecimal quantity, BigDecimal unitCost) {

        public static ReceivalItemResponse from(ReceivalItem l) {
            return new ReceivalItemResponse(l.getId(), l.getItemId(), l.getQuantity(), l.getUnitCost());
        }
    }

    public record ReceivalResponse(
            UUID id, String receivalNumber, String poNumber, String invoiceNumber,
            UUID supplierId, String supplierName, boolean allReceivedForPo, UUID storeKeeperId,
            UUID goodReceiveNoteId, Instant receivedAt, List<ReceivalItemResponse> lines) {

        public static ReceivalResponse from(Receival r) {
            return new ReceivalResponse(r.getId(), r.getReceivalNumber(), r.getPoNumber(),
                    r.getInvoiceNumber(), r.getSupplierId(), r.getSupplierName(),
                    r.isAllReceivedForPo(), r.getStoreKeeperId(), r.getGoodReceiveNoteId(),
                    r.getReceivedAt(),
                    r.getLines().stream().map(ReceivalItemResponse::from).toList());
        }
    }
}

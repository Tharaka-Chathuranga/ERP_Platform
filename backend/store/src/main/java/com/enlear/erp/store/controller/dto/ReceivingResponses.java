package com.enlear.erp.store.controller.dto;

import com.enlear.erp.store.model.GoodsReceipt;
import com.enlear.erp.store.model.GoodsReceiptLine;
import com.enlear.erp.store.model.GrnStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Outbound representations for goods receipts (GRN). */
public final class ReceivingResponses {

    private ReceivingResponses() {
    }

    public record GoodsReceiptLineResponse(
            UUID id, UUID itemId, BigDecimal quantity, BigDecimal unitCost) {

        public static GoodsReceiptLineResponse from(GoodsReceiptLine l) {
            return new GoodsReceiptLineResponse(l.getId(), l.getItemId(), l.getQuantity(),
                    l.getUnitCost());
        }
    }

    public record GoodsReceiptResponse(
            UUID id, String grnNumber, String poNumber, String invoiceNumber, UUID supplierId,
            String supplierName, UUID storeKeeperId, GrnStatus status, Instant receivedAt,
            List<GoodsReceiptLineResponse> lines) {

        public static GoodsReceiptResponse from(GoodsReceipt g) {
            return new GoodsReceiptResponse(g.getId(), g.getGrnNumber(), g.getPoNumber(),
                    g.getInvoiceNumber(), g.getSupplierId(), g.getSupplierName(),
                    g.getStoreKeeperId(), g.getStatus(), g.getReceivedAt(),
                    g.getLines().stream().map(GoodsReceiptLineResponse::from).toList());
        }
    }
}

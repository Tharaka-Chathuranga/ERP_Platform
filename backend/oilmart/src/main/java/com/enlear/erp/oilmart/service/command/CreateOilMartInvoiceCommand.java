package com.enlear.erp.oilmart.service.command;

import java.time.LocalDate;
import java.util.UUID;

public record CreateOilMartInvoiceCommand(
        UUID quotationId,
        LocalDate invoiceDate,
        String note) {
}

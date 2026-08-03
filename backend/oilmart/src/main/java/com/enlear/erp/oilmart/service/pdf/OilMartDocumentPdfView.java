package com.enlear.erp.oilmart.service.pdf;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record OilMartDocumentPdfView(
        String documentTitle,
        String documentNo,
        LocalDate issuedDate,
        LocalDate validUntil,
        String orderRef,
        String currencyCode,
        String accountCode,
        String salesRep,
        String logoUri,
        Party company,
        Party billTo,
        Party deliverTo,
        List<Line> lines,
        BigDecimal subtotal,
        BigDecimal gstRatePercent,
        BigDecimal gstAmount,
        BigDecimal grandTotal,
        Bank bank,
        String note) {

    public record Party(String name,
                        List<String> addressLines,
                        String phone,
                        String fax,
                        String email,
                        String taxNumber) {
    }

    public record Line(String itemCode,
                       String itemName,
                       List<String> descriptionLines,
                       String ordered,
                       String backOrdered,
                       String supplied,
                       String unitOfMeasure,
                       BigDecimal unitPrice,
                       BigDecimal discountPercent,
                       BigDecimal lineTotal) {
    }

    public record Bank(String accountName,
                       String bankName,
                       String branch,
                       String accountNumber,
                       String swiftCode) {
    }
}

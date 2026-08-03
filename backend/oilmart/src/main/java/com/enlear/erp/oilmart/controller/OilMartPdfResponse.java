package com.enlear.erp.oilmart.controller;

import org.springframework.http.ContentDisposition;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

final class OilMartPdfResponse {

    private OilMartPdfResponse() {
    }

    static ResponseEntity<byte[]> inline(byte[] pdf, String documentNo) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header("Content-Disposition", ContentDisposition.inline()
                        .filename(documentNo + ".pdf")
                        .build()
                        .toString())
                .body(pdf);
    }
}

package com.enlear.erp.oilmart.controller;

import com.enlear.erp.oilmart.controller.dto.OilMartRequests.RecordOilMartReceiptRequest;
import com.enlear.erp.oilmart.controller.dto.OilMartResponses.OilMartReceiptResponse;
import com.enlear.erp.oilmart.controller.dto.OilMartResponses.OilMartStockMovementResponse;
import com.enlear.erp.oilmart.service.receiving.OilMartReceiptService;
import com.enlear.erp.oilmart.service.stock.OilMartStockService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/oilmart/receipts")
public class OilMartReceiptController {

    private final OilMartReceiptService receipts;
    private final OilMartStockService stock;
    private final OilMartResponseAssembler assembler;

    public OilMartReceiptController(OilMartReceiptService receipts, OilMartStockService stock,
                                    OilMartResponseAssembler assembler) {
        this.receipts = receipts;
        this.stock = stock;
        this.assembler = assembler;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_SALES_ASSISTANT','OIL_MART_SALES_MANAGER')")
    public List<OilMartReceiptResponse> list(@RequestParam(required = false) UUID supplierId) {
        return assembler.toReceiptResponses(receipts.list(supplierId));
    }

    @GetMapping("/{receiptId}")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_SALES_ASSISTANT','OIL_MART_SALES_MANAGER')")
    public OilMartReceiptResponse get(@PathVariable UUID receiptId) {
        return assembler.toResponse(receipts.get(receiptId));
    }

    @GetMapping("/{receiptId}/movements")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_SALES_ASSISTANT','OIL_MART_SALES_MANAGER')")
    public List<OilMartStockMovementResponse> movements(@PathVariable UUID receiptId) {
        return stock.movementsForReference(receiptId).stream()
                .map(OilMartStockMovementResponse::from).toList();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_SALES_ASSISTANT')")
    public ResponseEntity<OilMartReceiptResponse> record(
            @Valid @RequestBody RecordOilMartReceiptRequest request) {
        var receipt = receipts.record(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/oilmart/receipts/" + receipt.getId()))
                .body(assembler.toResponse(receipt));
    }
}

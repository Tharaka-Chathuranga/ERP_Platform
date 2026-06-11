package com.enlear.erp.store.web;

import com.enlear.erp.shared.web.PageResponse;
import com.enlear.erp.store.service.GoodsReceiptService;
import com.enlear.erp.store.web.dto.CreateGoodsReceiptRequest;
import com.enlear.erp.store.web.dto.ReceivingResponses.GoodsReceiptResponse;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
@RequestMapping("/api/store/goods-receipts")
public class GoodsReceiptController {

    private final GoodsReceiptService receipts;

    public GoodsReceiptController(GoodsReceiptService receipts) {
        this.receipts = receipts;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public ResponseEntity<GoodsReceiptResponse> create(
            @Valid @RequestBody CreateGoodsReceiptRequest request) {
        var grn = receipts.createReceipt(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/store/goods-receipts/" + grn.getId()))
                .body(GoodsReceiptResponse.from(grn));
    }

    /** Posts a DRAFT GRN — records stock and locks the document. */
    @PostMapping("/{id}/post")
    @PreAuthorize("hasRole('ADMIN')")
    public GoodsReceiptResponse post(@PathVariable UUID id) {
        return GoodsReceiptResponse.from(receipts.postReceipt(id));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public GoodsReceiptResponse get(@PathVariable UUID id) {
        return GoodsReceiptResponse.from(receipts.getReceipt(id));
    }

    /** Lists goods receipts; filters by supplier when {@code supplierId} is given. */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public PageResponse<GoodsReceiptResponse> list(
            @RequestParam(required = false) UUID supplierId,
            @PageableDefault(size = 20) Pageable pageable) {
        var page = supplierId == null
                ? receipts.listAll(pageable)
                : receipts.listForSupplier(supplierId, pageable);
        return PageResponse.of(page, GoodsReceiptResponse::from);
    }
}

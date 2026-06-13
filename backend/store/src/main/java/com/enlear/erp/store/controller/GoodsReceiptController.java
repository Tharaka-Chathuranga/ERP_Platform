package com.enlear.erp.store.controller;

import com.enlear.erp.shared.web.PageResponse;
import com.enlear.erp.store.service.GoodsReceiptService;
import com.enlear.erp.store.controller.dto.ReceivingResponses.GoodsReceiptResponse;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Read access to generated GRNs. They are created by {@link
 * com.enlear.erp.store.service.ReceivalService} when items are received.
 */
@RestController
@RequestMapping("/api/store/goods-receipts")
public class GoodsReceiptController {

    private final GoodsReceiptService receipts;

    public GoodsReceiptController(GoodsReceiptService receipts) {
        this.receipts = receipts;
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

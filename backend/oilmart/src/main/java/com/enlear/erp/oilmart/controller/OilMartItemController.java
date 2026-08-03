package com.enlear.erp.oilmart.controller;

import com.enlear.erp.oilmart.controller.dto.OilMartRequests.AddOilMartItemPriceRequest;
import com.enlear.erp.oilmart.controller.dto.OilMartRequests.SaveOilMartItemRequest;
import com.enlear.erp.oilmart.controller.dto.OilMartResponses.OilMartItemPriceResponse;
import com.enlear.erp.oilmart.controller.dto.OilMartResponses.OilMartItemResponse;
import com.enlear.erp.oilmart.service.OilMartCurrentUser;
import com.enlear.erp.oilmart.service.master.OilMartItemService;
import com.enlear.erp.oilmart.service.master.OilMartPriceService;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/oilmart/items")
public class OilMartItemController {

    private final OilMartItemService items;
    private final OilMartPriceService prices;
    private final OilMartCurrentUser currentUser;

    public OilMartItemController(OilMartItemService items, OilMartPriceService prices,
                                 OilMartCurrentUser currentUser) {
        this.items = items;
        this.prices = prices;
        this.currentUser = currentUser;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_SALES_ASSISTANT','OIL_MART_SALES_MANAGER')")
    public List<OilMartItemResponse> list(@RequestParam(required = false) String search) {
        return items.list(search).stream().map(OilMartItemResponse::from).toList();
    }

    @GetMapping("/{itemId}")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_SALES_ASSISTANT','OIL_MART_SALES_MANAGER')")
    public OilMartItemResponse get(@PathVariable UUID itemId) {
        return OilMartItemResponse.from(items.get(itemId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_SALES_MANAGER')")
    public ResponseEntity<OilMartItemResponse> create(@Valid @RequestBody SaveOilMartItemRequest request) {
        var item = items.create(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/oilmart/items/" + item.getId()))
                .body(OilMartItemResponse.from(item));
    }

    @PutMapping("/{itemId}")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_SALES_MANAGER')")
    public OilMartItemResponse update(@PathVariable UUID itemId,
                                      @Valid @RequestBody SaveOilMartItemRequest request) {
        return OilMartItemResponse.from(items.update(itemId, request.toCommand()));
    }

    @GetMapping("/{itemId}/prices")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_SALES_ASSISTANT','OIL_MART_SALES_MANAGER')")
    public List<OilMartItemPriceResponse> priceHistory(@PathVariable UUID itemId) {
        return prices.history(itemId).stream().map(OilMartItemPriceResponse::from).toList();
    }

    @GetMapping("/{itemId}/price")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_SALES_ASSISTANT','OIL_MART_SALES_MANAGER')")
    public ResponseEntity<OilMartItemPriceResponse> effectivePrice(
            @PathVariable UUID itemId,
            @RequestParam(required = false) LocalDate on) {
        return prices.effectivePriceOn(itemId, on)
                .map(OilMartItemPriceResponse::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping("/{itemId}/prices")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_SALES_MANAGER')")
    public ResponseEntity<OilMartItemPriceResponse> addPrice(
            @PathVariable UUID itemId,
            @Valid @RequestBody AddOilMartItemPriceRequest request) {
        items.get(itemId);
        var price = prices.addPrice(request.toCommand(itemId, currentUser.requireId()));
        return ResponseEntity
                .created(URI.create("/api/oilmart/items/" + itemId + "/prices/" + price.getId()))
                .body(OilMartItemPriceResponse.from(price));
    }
}

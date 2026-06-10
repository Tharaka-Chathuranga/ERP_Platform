package com.enlear.erp.store.web;

import com.enlear.erp.shared.web.PageResponse;
import com.enlear.erp.store.web.dto.CreateItemRequest;
import com.enlear.erp.store.web.dto.StoreResponses.ItemResponse;
import com.enlear.erp.store.service.ItemService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/store/items")
public class ItemController {

    private final ItemService items;

    public ItemController(ItemService items) {
        this.items = items;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_MANAGER')")
    public ResponseEntity<ItemResponse> create(@Valid @RequestBody CreateItemRequest request) {
        var item = items.createItem(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/store/items/" + item.getId()))
                .body(ItemResponse.from(item));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STORE_MANAGER','STORE_CLERK')")
    public PageResponse<ItemResponse> list(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "sku") Pageable pageable) {
        return PageResponse.of(items.listItems(search, pageable), ItemResponse::from);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_MANAGER','STORE_CLERK')")
    public ItemResponse get(@PathVariable UUID id) {
        return ItemResponse.from(items.getItem(id));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN','STORE_MANAGER')")
    public void deactivate(@PathVariable UUID id) {
        items.deactivateItem(id);
    }
}

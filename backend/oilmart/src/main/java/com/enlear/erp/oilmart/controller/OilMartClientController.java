package com.enlear.erp.oilmart.controller;

import com.enlear.erp.oilmart.controller.dto.OilMartRequests.SaveOilMartClientRequest;
import com.enlear.erp.oilmart.controller.dto.OilMartResponses.OilMartClientResponse;
import com.enlear.erp.oilmart.controller.dto.OilMartResponses.OilMartSaleResponse;
import com.enlear.erp.oilmart.service.master.OilMartClientService;
import com.enlear.erp.oilmart.service.selling.OilMartSaleService;
import jakarta.validation.Valid;
import java.net.URI;
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
@RequestMapping("/api/oilmart/clients")
public class OilMartClientController {

    private final OilMartClientService clients;
    private final OilMartSaleService sales;
    private final OilMartResponseAssembler assembler;

    public OilMartClientController(OilMartClientService clients, OilMartSaleService sales,
                                   OilMartResponseAssembler assembler) {
        this.clients = clients;
        this.sales = sales;
        this.assembler = assembler;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT','STORES_MANAGER')")
    public List<OilMartClientResponse> list(@RequestParam(required = false) String search) {
        return clients.list(search).stream().map(OilMartClientResponse::from).toList();
    }

    @GetMapping("/{clientId}")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT','STORES_MANAGER')")
    public OilMartClientResponse get(@PathVariable UUID clientId) {
        return OilMartClientResponse.from(clients.get(clientId));
    }

    @GetMapping("/{clientId}/sales")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT','STORES_MANAGER')")
    public List<OilMartSaleResponse> sales(@PathVariable UUID clientId) {
        return assembler.toSaleResponses(sales.listByClient(clientId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT','STORES_MANAGER')")
    public ResponseEntity<OilMartClientResponse> create(
            @Valid @RequestBody SaveOilMartClientRequest request) {
        var client = clients.create(request.toCommand());
        return ResponseEntity
                .created(URI.create("/api/oilmart/clients/" + client.getId()))
                .body(OilMartClientResponse.from(client));
    }

    @PutMapping("/{clientId}")
    @PreAuthorize("hasAnyRole('ADMIN','OIL_MART_ASSISTANT','STORES_MANAGER')")
    public OilMartClientResponse update(@PathVariable UUID clientId,
                                        @Valid @RequestBody SaveOilMartClientRequest request) {
        return OilMartClientResponse.from(clients.update(clientId, request.toCommand()));
    }
}

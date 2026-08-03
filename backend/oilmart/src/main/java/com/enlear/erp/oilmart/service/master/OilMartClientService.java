package com.enlear.erp.oilmart.service.master;

import com.enlear.erp.oilmart.model.OilMartClient;
import com.enlear.erp.oilmart.model.OilMartClientStatus;
import com.enlear.erp.oilmart.repository.OilMartClientRepository;
import com.enlear.erp.oilmart.service.command.SaveOilMartClientCommand;
import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OilMartClientService {

    private static final int MAX_GENERATED_CODE_LENGTH = 56;

    private final OilMartClientRepository clients;

    public OilMartClientService(OilMartClientRepository clients) {
        this.clients = clients;
    }

    public OilMartClient create(SaveOilMartClientCommand cmd) {
        if (clients.existsByCodeIgnoreCase(cmd.code())) {
            throw new BusinessRuleException("OILMART_CLIENT_CODE_TAKEN",
                    "A client with code %s already exists".formatted(cmd.code()));
        }
        return clients.save(new OilMartClient(cmd.code(), cmd.name(), cmd.contactPerson(),
                cmd.phone(), cmd.email(), cmd.address(), cmd.status()));
    }

    public OilMartClient quickAdd(String name) {
        String trimmed = name == null ? "" : name.trim();
        if (trimmed.isEmpty()) {
            throw new BusinessRuleException("OILMART_CLIENT_NAME_REQUIRED",
                    "A client name is required");
        }
        return clients.findFirstByNameIgnoreCase(trimmed)
                .orElseGet(() -> clients.save(new OilMartClient(generateCode(trimmed), trimmed,
                        null, null, null, null, OilMartClientStatus.ACTIVE)));
    }

    public OilMartClient update(UUID id, SaveOilMartClientCommand cmd) {
        OilMartClient client = get(id);
        client.update(cmd.code(), cmd.name(), cmd.contactPerson(), cmd.phone(),
                cmd.email(), cmd.address(), cmd.status());
        return clients.save(client);
    }

    @Transactional(readOnly = true)
    public OilMartClient get(UUID id) {
        return clients.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OilMartClient", id));
    }

    @Transactional(readOnly = true)
    public List<OilMartClient> list(String search) {
        return search == null || search.isBlank()
                ? clients.findAllByOrderByNameAsc()
                : clients.search(search.trim());
    }

    private String generateCode(String name) {
        String base = name.toUpperCase(Locale.ROOT)
                .replaceAll("[^A-Z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        if (base.isEmpty()) {
            base = "CLIENT";
        }
        if (base.length() > MAX_GENERATED_CODE_LENGTH) {
            base = base.substring(0, MAX_GENERATED_CODE_LENGTH);
        }
        String candidate = base;
        int suffix = 2;
        while (clients.existsByCodeIgnoreCase(candidate)) {
            candidate = "%s-%d".formatted(base, suffix++);
        }
        return candidate;
    }
}

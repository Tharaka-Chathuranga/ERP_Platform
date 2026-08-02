package com.enlear.erp.oilmart.service.master;

import com.enlear.erp.oilmart.model.OilMartClient;
import com.enlear.erp.oilmart.repository.OilMartClientRepository;
import com.enlear.erp.oilmart.service.command.SaveOilMartClientCommand;
import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OilMartClientService {

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
}

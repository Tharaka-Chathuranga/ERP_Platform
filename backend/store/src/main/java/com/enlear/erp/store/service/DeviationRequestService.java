package com.enlear.erp.store.service;

import com.enlear.erp.shared.error.ResourceNotFoundException;
import com.enlear.erp.store.domain.DeviationRequest;
import com.enlear.erp.store.domain.DeviationStage;
import com.enlear.erp.store.repository.DeviationRequestRepository;
import com.enlear.erp.store.repository.ItemRepository;
import com.enlear.erp.store.service.command.CreateDeviationRequestCommand;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DeviationRequestService {

    private final DeviationRequestRepository requests;
    private final ItemRepository items;

    public DeviationRequestService(DeviationRequestRepository requests, ItemRepository items) {
        this.requests = requests;
        this.items = items;
    }

    public DeviationRequest create(CreateDeviationRequestCommand cmd) {
        DeviationRequest req = new DeviationRequest(cmd.reason(), cmd.requestedByUserId());
        for (CreateDeviationRequestCommand.Line line : cmd.items()) {
            if (!items.existsById(line.itemId())) {
                throw new ResourceNotFoundException("Item", line.itemId());
            }
            req.addItem(line.itemId(), line.quantity());
        }
        return requests.save(req);
    }

    public DeviationRequest approve(UUID id, UUID approverId) {
        DeviationRequest req = get(id);
        req.approve(approverId);
        return requests.save(req);
    }

    public DeviationRequest reject(UUID id, UUID approverId) {
        DeviationRequest req = get(id);
        req.reject(approverId);
        return requests.save(req);
    }

    public DeviationRequest advanceStage(UUID id, DeviationStage stage) {
        DeviationRequest req = get(id);
        req.advanceTo(stage);
        return requests.save(req);
    }

    @Transactional(readOnly = true)
    public DeviationRequest get(UUID id) {
        return requests.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeviationRequest", id));
    }

    @Transactional(readOnly = true)
    public List<DeviationRequest> listByStage(DeviationStage stage) {
        return requests.findByStageOrderByRequestedAtDesc(stage);
    }
}

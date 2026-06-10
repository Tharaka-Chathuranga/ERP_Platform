package com.enlear.erp.store.service;

import com.enlear.erp.shared.error.ResourceNotFoundException;
import com.enlear.erp.store.domain.BorrowRequest;
import com.enlear.erp.store.repository.BorrowRequestRepository;
import com.enlear.erp.store.repository.ItemRepository;
import com.enlear.erp.store.service.command.CreateBorrowRequestCommand;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BorrowRequestService {

    private final BorrowRequestRepository requests;
    private final ItemRepository items;

    public BorrowRequestService(BorrowRequestRepository requests, ItemRepository items) {
        this.requests = requests;
        this.items = items;
    }

    public BorrowRequest create(CreateBorrowRequestCommand cmd) {
        if (!items.existsById(cmd.itemId())) {
            throw new ResourceNotFoundException("Item", cmd.itemId());
        }
        return requests.save(new BorrowRequest(cmd.itemId(), cmd.quantity(), cmd.reason(),
                cmd.requestedByUserId()));
    }

    public BorrowRequest approve(UUID id, UUID approverId) {
        BorrowRequest req = get(id);
        req.approve(approverId);
        return requests.save(req);
    }

    public BorrowRequest reject(UUID id, UUID approverId) {
        BorrowRequest req = get(id);
        req.reject(approverId);
        return requests.save(req);
    }

    @Transactional(readOnly = true)
    public BorrowRequest get(UUID id) {
        return requests.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BorrowRequest", id));
    }

    @Transactional(readOnly = true)
    public List<BorrowRequest> listForUser(UUID userId) {
        return requests.findByRequestedByUserIdOrderByRequestedAtDesc(userId);
    }
}

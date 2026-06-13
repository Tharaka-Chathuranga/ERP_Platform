package com.enlear.erp.store.service;

import com.enlear.erp.shared.error.ResourceNotFoundException;
import com.enlear.erp.store.model.BorrowRequest;
import com.enlear.erp.store.repository.BorrowRequestRepository;
import com.enlear.erp.store.repository.IssueRepository;
import com.enlear.erp.store.service.command.CreateBorrowRequestCommand;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BorrowRequestService {

    private final BorrowRequestRepository requests;
    private final IssueRepository issues;

    public BorrowRequestService(BorrowRequestRepository requests, IssueRepository issues) {
        this.requests = requests;
        this.issues = issues;
    }

    public BorrowRequest create(CreateBorrowRequestCommand cmd) {
        if (!issues.existsById(cmd.issueId())) {
            throw new ResourceNotFoundException("Issue", cmd.issueId());
        }
        return requests.save(new BorrowRequest(cmd.issueId(), cmd.reason(),
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

    /** Borrow requests filtered by status, or all when {@code status} is null. */
    @Transactional(readOnly = true)
    public List<BorrowRequest> list(com.enlear.erp.store.model.BorrowRequestStatus status) {
        return status == null
                ? requests.findAll(org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.DESC, "requestedAt"))
                : requests.findByStatusOrderByRequestedAtDesc(status);
    }
}

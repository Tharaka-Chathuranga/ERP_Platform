package com.enlear.erp.store.service.receival;

import com.enlear.erp.shared.error.ResourceNotFoundException;
import com.enlear.erp.store.model.Receival;
import com.enlear.erp.store.repository.ReceivalRepository;
import com.enlear.erp.store.service.command.CreateReceivalCommand;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ReceivalService {

    private final ReceivalRepository receivals;
    private final ReceivalValidator validator;
    private final ReceivalCreator creator;
    private final ReceiptMovementCreator receiptMovementCreator;
    private final GrnCreator grnCreator;

    public ReceivalService(ReceivalRepository receivals, ReceivalValidator validator,
                           ReceivalCreator creator, ReceiptMovementCreator receiptMovementCreator,
                           GrnCreator grnCreator) {
        this.receivals = receivals;
        this.validator = validator;
        this.creator = creator;
        this.receiptMovementCreator = receiptMovementCreator;
        this.grnCreator = grnCreator;
    }

    public Receival create(CreateReceivalCommand cmd) {
        validator.validate(cmd);

        Receival receival = creator.build(cmd);
        receivals.save(receival);

        receiptMovementCreator.postFor(receival);
        grnCreator.generateIfApplicable(receival, cmd.allReceivedForPo());

        return receival;
    }

    @Transactional(readOnly = true)
    public Receival get(UUID id) {
        return receivals.findWithLinesById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receival", id));
    }

    @Transactional(readOnly = true)
    public Page<Receival> list(UUID supplierId, Pageable pageable) {
        return supplierId == null
                ? receivals.findAllByOrderByReceivedAtDesc(pageable)
                : receivals.findBySupplierIdOrderByReceivedAtDesc(supplierId, pageable);
    }
}

package com.enlear.erp.oilmart.service;

import com.enlear.erp.oilmart.model.OilMartDocumentCounter;
import com.enlear.erp.oilmart.model.OilMartDocumentType;
import com.enlear.erp.oilmart.repository.OilMartDocumentCounterRepository;
import java.time.LocalDate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OilMartDocumentNumberService {

    private final OilMartDocumentCounterRepository counters;

    public OilMartDocumentNumberService(OilMartDocumentCounterRepository counters) {
        this.counters = counters;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public String next(OilMartDocumentType docType) {
        int year = LocalDate.now().getYear();
        OilMartDocumentCounter counter = counters.findForUpdate(docType, year)
                .orElseGet(() -> counters.save(new OilMartDocumentCounter(docType, year)));
        String number = counter.allocate();
        counters.save(counter);
        return number;
    }
}

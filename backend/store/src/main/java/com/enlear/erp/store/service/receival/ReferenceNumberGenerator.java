package com.enlear.erp.store.service.receival;

import java.time.Instant;
import org.springframework.stereotype.Component;

@Component
class ReferenceNumberGenerator {

    String receivalNumber() {
        return "RCV-" + Instant.now().toEpochMilli();
    }

    String grnNumber() {
        return "GRN-" + Instant.now().toEpochMilli();
    }
}

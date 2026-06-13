package com.enlear.erp.store.service.issue;

import java.time.Instant;
import org.springframework.stereotype.Component;

@Component
class IssueNumberGenerator {

    String issueNumber() {
        return "ISS-" + Instant.now().toEpochMilli();
    }
}

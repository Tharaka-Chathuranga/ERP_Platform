package com.enlear.erp.fuel.service.delivery;

import java.time.Instant;
import org.springframework.stereotype.Component;

/** Produces the human-facing reference printed on a fuel delivery record. */
@Component
class FuelDeliveryReferenceGenerator {

    String deliveryReference() {
        return "FD-" + Instant.now().toEpochMilli();
    }
}

package com.enlear.erp.notification.exposed;

import com.enlear.erp.notification.exposed.dto.NotificationRequest;
import java.util.UUID;

public interface NotificationApi {

    UUID raise(NotificationRequest request);
}

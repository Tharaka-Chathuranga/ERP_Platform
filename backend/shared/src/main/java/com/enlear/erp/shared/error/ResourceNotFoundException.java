package com.enlear.erp.shared.error;

import org.springframework.http.HttpStatus;

/** Thrown when a referenced aggregate does not exist. Maps to HTTP 404. */
public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String resource, Object id) {
        super(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND",
                "%s not found: %s".formatted(resource, id));
    }
}

package com.enlear.erp.shared.error;

import org.springframework.http.HttpStatus;

/**
 * Thrown when an operation violates a domain invariant (e.g. issuing more
 * stock than is on hand). Maps to HTTP 409 Conflict.
 */
public class BusinessRuleException extends BusinessException {

    public BusinessRuleException(String code, String message) {
        super(HttpStatus.CONFLICT, code, message);
    }
}

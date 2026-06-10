package com.enlear.erp.shared.error;

import org.springframework.http.HttpStatus;

/**
 * Base type for domain/business-rule violations. Each subclass maps to an
 * HTTP status so the global handler can translate it into an RFC-7807 response
 * without leaking stack traces or framework details.
 */
public abstract class BusinessException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    protected BusinessException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public HttpStatus getStatus() {
        return status;
    }

    /** Stable machine-readable error code, e.g. {@code STORE_INSUFFICIENT_STOCK}. */
    public String getCode() {
        return code;
    }
}

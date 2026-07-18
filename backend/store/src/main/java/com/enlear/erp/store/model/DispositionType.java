package com.enlear.erp.store.model;

/**
 * Disposition of a nonconforming output — the decision the deciding authority
 * records under ISO 9001:2015 clause 8.7.1 (a)–(d).
 */
public enum DispositionType {
    USE_AS_IS,
    REWORK,
    SCRAP,
    RETURN_TO_SUPPLIER,
    REGRADE
}

package com.enlear.erp.store.service.receival;


final class TextUtils {

    private TextUtils() {
    }

    static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    static String trimToNull(String value) {
        return hasText(value) ? value.trim() : null;
    }
}

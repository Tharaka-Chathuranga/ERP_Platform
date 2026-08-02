package com.enlear.erp.notification.exposed;

/**
 * The kind of event a notification represents. Kept as an enum (not free text)
 * so producers and the UI agree on categories, filtering and icons. Add a new
 * constant when a module starts raising a new kind of notification.
 */
public enum NotificationType {

    /** Stock for an item has fallen to or below its reorder level. */
    REORDER_ALERT,

    /** A document was rejected at approval and needs its author to act. */
    DOCUMENT_REJECTED,

    /** A generic, uncategorised message. Prefer a specific type where one fits. */
    GENERAL
}

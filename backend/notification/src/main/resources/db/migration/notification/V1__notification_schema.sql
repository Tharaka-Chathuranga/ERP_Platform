-- ════════════════════════════════════════════════════════════════════
--  NOTIFICATION module schema: a single, platform-wide notification inbox.
--
--  Design notes:
--   * ONE common table for notifications raised by ANY module (store, fuel,
--     user, …). The raising module is recorded in source_module for audit.
--   * A notification targets EITHER a specific user (recipient_username, which
--     matches the JWT subject — no user-id resolution needed across modules)
--     OR a whole role (recipient_role, e.g. broadcast to every ADMIN). At least
--     one of the two is always present.
--   * recipient_username / recipient_role carry NO database FK: notification is
--     an independent module and must not reference users.users. Validated — if
--     at all — at the app layer, consistent with the rest of the platform.
--   * dedupe_key gives cheap idempotency: a producer that must not spam (e.g.
--     one open reorder alert per item) sets a stable key; a partial unique
--     index rejects duplicates while NULL keys stay unconstrained.
--   * read_at NULL means unread. No hard deletes — notifications are an audit
--     trail; the UI filters by read_at.
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE notification.notifications (
    id                 UUID PRIMARY KEY,
    version            BIGINT       NOT NULL DEFAULT 0,
    recipient_username VARCHAR(100),
    recipient_role     VARCHAR(64),
    type               VARCHAR(64)  NOT NULL,
    severity           VARCHAR(16)  NOT NULL
                       CONSTRAINT chk_notif_severity
                       CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    title              VARCHAR(200) NOT NULL,
    body               TEXT         NOT NULL,
    link               VARCHAR(500),
    source_module      VARCHAR(32)  NOT NULL,
    dedupe_key         VARCHAR(200),
    read_at            TIMESTAMPTZ,
    created_at         TIMESTAMPTZ,
    created_by         VARCHAR(100),
    updated_at         TIMESTAMPTZ,
    updated_by         VARCHAR(100),

    -- A notification must reach someone: a user, a role, or both.
    CONSTRAINT chk_notif_recipient
        CHECK (recipient_username IS NOT NULL OR recipient_role IS NOT NULL)
);

-- Idempotency for producers that opt in by supplying a dedupe_key.
CREATE UNIQUE INDEX uq_notif_dedupe
    ON notification.notifications (dedupe_key)
    WHERE dedupe_key IS NOT NULL;

-- Inbox lookups: unread-first per user and per role.
CREATE INDEX ix_notif_recipient_user
    ON notification.notifications (recipient_username, read_at);
CREATE INDEX ix_notif_recipient_role
    ON notification.notifications (recipient_role, read_at);

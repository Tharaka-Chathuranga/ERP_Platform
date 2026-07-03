-- ════════════════════════════════════════════════════════════════════
--  Reorder alerts — the Stock Management Agent's audit + idempotency record.
--
--  When an item's on-hand falls to/below its reorder level, the agent opens an
--  alert here and raises an admin notification. The partial unique index below
--  is the real idempotency guard: at most ONE open alert per item, enforced by
--  the database even under concurrent stock movements. When stock recovers above
--  the reorder level the alert is RESOLVED, so the next dip legitimately opens a
--  fresh one.
--
--  notification_id links to the notification module's row (no FK — separate
--  module/schema), purely for traceability.
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE store.reorder_alerts (
    id               UUID PRIMARY KEY,
    version          BIGINT        NOT NULL DEFAULT 0,
    item_id          UUID          NOT NULL,
    item_code        VARCHAR(64)   NOT NULL,
    on_hand_at_alert NUMERIC(19,4) NOT NULL,
    reorder_level    NUMERIC(19,4) NOT NULL,
    status           VARCHAR(24)   NOT NULL
                     CONSTRAINT chk_reorder_status
                     CHECK (status IN ('OPEN', 'RESOLVED')),
    notification_id  UUID,
    resolved_at      TIMESTAMPTZ,
    created_at       TIMESTAMPTZ,
    created_by       VARCHAR(100),
    updated_at       TIMESTAMPTZ,
    updated_by       VARCHAR(100)
);

-- At most one OPEN alert per item.
CREATE UNIQUE INDEX uq_reorder_open_per_item
    ON store.reorder_alerts (item_id)
    WHERE status = 'OPEN';

CREATE INDEX ix_reorder_item ON store.reorder_alerts (item_id);

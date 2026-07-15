-- ════════════════════════════════════════════════════════════════════
--  Fuel deliveries — a supplier delivery of fuel recorded the way the
--  station already does it on paper (the "Fuel Delivery Update Report"):
--   * ordered vs delivered litres (over/short-delivery control),
--   * discharge start/finish timing (operational/audit record),
--   * one line PER TANK the fuel was discharged into (a single delivery
--     may split across the big/small tank), each carrying the dip-stick
--     readings BEFORE and AFTER discharge.
--
--  A line adds its delivered litres to the tank's running level (same
--  write-lock path as refills/readings/vehicle issues). The dip readings
--  are stored for reconciliation only — the reconciliation variance
--  (dip_after - dip_before - litres_delivered) is DERIVED, never stored,
--  and surfaced so a mismatch (measurement error, spillage, theft) shows.
--
--  This supersedes the thin fuel_tank_refills record for new entries;
--  the refills table is kept for historical data.
--
--  *_user_id columns reference users.users but carry NO database FK.
--  Quantities use NUMERIC(19,4) — never floating point.
-- ════════════════════════════════════════════════════════════════════

-- ── Delivery header ─────────────────────────────────────────────────
CREATE TABLE fuel.fuel_deliveries (
    id                   UUID PRIMARY KEY,
    version              BIGINT        NOT NULL DEFAULT 0,
    delivery_reference   VARCHAR(32)   NOT NULL UNIQUE,
    supplier_name        VARCHAR(200),
    ordered_litres       NUMERIC(19,4) NOT NULL CHECK (ordered_litres > 0),
    delivered_litres     NUMERIC(19,4) NOT NULL CHECK (delivered_litres > 0),  -- sum of lines
    delivered_on         DATE          NOT NULL,
    discharge_started_at  TIMESTAMPTZ,
    discharge_finished_at TIMESTAMPTZ,
    recorded_by_user_id  UUID          NOT NULL,               -- users.users (no FK)
    note                 VARCHAR(1000),
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100),
    CONSTRAINT chk_fuel_delivery_discharge_order
        CHECK (discharge_finished_at IS NULL OR discharge_started_at IS NULL
               OR discharge_finished_at >= discharge_started_at)
);
CREATE INDEX idx_fuel_deliveries_delivered_on ON fuel.fuel_deliveries(delivered_on);

-- ── Delivery lines (one per tank) ───────────────────────────────────
CREATE TABLE fuel.fuel_delivery_lines (
    id                UUID PRIMARY KEY,
    version           BIGINT        NOT NULL DEFAULT 0,
    fuel_delivery_id  UUID          NOT NULL REFERENCES fuel.fuel_deliveries(id),
    tank_id           UUID          NOT NULL REFERENCES fuel.fuel_tanks(id),
    litres_delivered  NUMERIC(19,4) NOT NULL CHECK (litres_delivered > 0),
    dip_before_litres NUMERIC(19,4) CHECK (dip_before_litres >= 0),
    dip_after_litres  NUMERIC(19,4) CHECK (dip_after_litres >= 0),
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_fuel_delivery_lines_delivery ON fuel.fuel_delivery_lines(fuel_delivery_id);
CREATE INDEX idx_fuel_delivery_lines_tank     ON fuel.fuel_delivery_lines(tank_id);

-- ════════════════════════════════════════════════════════════════════
--  FUEL module schema (single consolidated migration).
--
--  Fuel is consumed continuously and is NOT a regular stock item, so it has
--  its own model rather than reusing store.items:
--   * Two physical tanks (seeded below):
--       - INTERNAL (big tank): no per-issue mechanism. Staff take timed level
--         READINGS (e.g. 8am / 8pm). Consumption is derived from reading deltas.
--       - VEHICLE  (small tank): fuel is ISSUED to vehicles; the level is
--         tracked from refills in minus vehicle issues out.
--   * fuel_tanks.current_litres is a maintained projection, adjusted in the
--     same transaction that records a refill / reading / vehicle issue.
--   * fuel_prices is APPEND-ONLY history — each row carries an explicit
--     [effective_from, effective_to] date range; older rows are never edited
--     or deleted, and ranges must not overlap.
--   * *_user_id columns reference users.users but carry NO database FK: fuel
--     and user are independent modules. Validate at the app layer.
--   * Monetary/quantity columns use NUMERIC(19,4) — never floating point.
-- ════════════════════════════════════════════════════════════════════

-- ── Tanks (exactly two, seeded) ─────────────────────────────────────
CREATE TABLE fuel.fuel_tanks (
    id              UUID PRIMARY KEY,
    version         BIGINT        NOT NULL DEFAULT 0,
    name            VARCHAR(100)  NOT NULL,
    purpose         VARCHAR(16)   NOT NULL UNIQUE,          -- INTERNAL | VEHICLE
    capacity_litres NUMERIC(19,4) NOT NULL DEFAULT 0,
    current_litres  NUMERIC(19,4) NOT NULL DEFAULT 0 CHECK (current_litres >= 0),
    status          VARCHAR(16)   NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);

INSERT INTO fuel.fuel_tanks (id, name, purpose, capacity_litres, current_litres)
VALUES
    (gen_random_uuid(), 'Internal tank (big)', 'INTERNAL', 0, 0),
    (gen_random_uuid(), 'Vehicle tank (small)', 'VEHICLE', 0, 0);

-- ── Refills (fuel delivered into a tank) ────────────────────────────
CREATE TABLE fuel.fuel_tank_refills (
    id                 UUID PRIMARY KEY,
    version            BIGINT        NOT NULL DEFAULT 0,
    tank_id            UUID          NOT NULL REFERENCES fuel.fuel_tanks(id),
    litres             NUMERIC(19,4) NOT NULL CHECK (litres > 0),
    refilled_at        TIMESTAMPTZ   NOT NULL,
    recorded_by_user_id UUID         NOT NULL,               -- users.users (no FK)
    note               VARCHAR(1000),
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_fuel_refills_tank     ON fuel.fuel_tank_refills(tank_id);
CREATE INDEX idx_fuel_refills_refilled ON fuel.fuel_tank_refills(refilled_at);

-- ── Timed tank readings (internal tank in practice) ─────────────────
CREATE TABLE fuel.fuel_tank_readings (
    id                  UUID PRIMARY KEY,
    version             BIGINT        NOT NULL DEFAULT 0,
    tank_id             UUID          NOT NULL REFERENCES fuel.fuel_tanks(id),
    litres_measured     NUMERIC(19,4) NOT NULL CHECK (litres_measured >= 0),
    reading_at          TIMESTAMPTZ   NOT NULL,
    recorded_by_user_id UUID          NOT NULL,              -- users.users (no FK)
    note                VARCHAR(1000),
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_fuel_readings_tank_time ON fuel.fuel_tank_readings(tank_id, reading_at);

-- ── Vehicle master ──────────────────────────────────────────────────
CREATE TABLE fuel.vehicles (
    id                        UUID PRIMARY KEY,
    version                   BIGINT        NOT NULL DEFAULT 0,
    vehicle_number            VARCHAR(64)   NOT NULL UNIQUE,
    full_tank_capacity_litres NUMERIC(19,4) NOT NULL CHECK (full_tank_capacity_litres > 0),
    description               VARCHAR(1000),
    driver_user_id            UUID,                          -- default receiving user (users.users, no FK)
    status                    VARCHAR(16)   NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_vehicles_status ON fuel.vehicles(status);

-- ── Vehicle fuel issues (from the vehicle tank) ─────────────────────
CREATE TABLE fuel.vehicle_fuel_issues (
    id                                UUID PRIMARY KEY,
    version                           BIGINT        NOT NULL DEFAULT 0,
    vehicle_id                        UUID          NOT NULL REFERENCES fuel.vehicles(id),
    vehicle_reading_before_issue_litres NUMERIC(19,4) NOT NULL CHECK (vehicle_reading_before_issue_litres >= 0),
    litres_issued                     NUMERIC(19,4) NOT NULL CHECK (litres_issued > 0),
    issuing_user_id                   UUID          NOT NULL,  -- store keeper (users.users, no FK)
    receiving_user_id                 UUID          NOT NULL,  -- driver (users.users, no FK)
    issued_at                         TIMESTAMPTZ   NOT NULL,
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100)
);
CREATE INDEX idx_vehicle_issues_vehicle ON fuel.vehicle_fuel_issues(vehicle_id);
CREATE INDEX idx_vehicle_issues_issued  ON fuel.vehicle_fuel_issues(issued_at);

-- ── Append-only fuel-price history ──────────────────────────────────
CREATE TABLE fuel.fuel_prices (
    id                  UUID PRIMARY KEY,
    version             BIGINT        NOT NULL DEFAULT 0,
    unit_price          NUMERIC(19,4) NOT NULL CHECK (unit_price >= 0),
    effective_from      DATE          NOT NULL,
    effective_to        DATE          NOT NULL,
    recorded_by_user_id UUID          NOT NULL,              -- users.users (no FK)
    note                VARCHAR(1000),
    created_at TIMESTAMPTZ, created_by VARCHAR(100),
    updated_at TIMESTAMPTZ, updated_by VARCHAR(100),
    CONSTRAINT chk_fuel_price_range CHECK (effective_to >= effective_from)
);
CREATE INDEX idx_fuel_prices_range ON fuel.fuel_prices(effective_from, effective_to);

-- ════════════════════════════════════════════════════════════════════
-- Fuel prices become open-ended. The newest price has no effective_to
-- (it is the "current" price) until a later price supersedes it, at which
-- point the previous price's effective_to is closed automatically to the
-- day before the new price's effective_from. effective_to is therefore
-- now optional.
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE fuel.fuel_prices ALTER COLUMN effective_to DROP NOT NULL;

ALTER TABLE fuel.fuel_prices DROP CONSTRAINT IF EXISTS chk_fuel_price_range;
ALTER TABLE fuel.fuel_prices ADD CONSTRAINT chk_fuel_price_range
    CHECK (effective_to IS NULL OR effective_to >= effective_from);

-- Add optional odometer reading to vehicle fuel issues.
-- Allows km/L (fuel efficiency) to be computed from consecutive readings.
ALTER TABLE fuel.vehicle_fuel_issues
    ADD COLUMN IF NOT EXISTS odometer_reading_km NUMERIC(10, 2) CHECK (odometer_reading_km >= 0);

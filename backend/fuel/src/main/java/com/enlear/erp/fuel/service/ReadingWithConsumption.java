package com.enlear.erp.fuel.service;

import com.enlear.erp.fuel.model.FuelTankReading;
import java.math.BigDecimal;

/**
 * A reading paired with the fuel consumed since the previous reading:
 * {@code previous.litres + refills in between - this.litres}. {@code null} for
 * the very first reading (no earlier baseline).
 */
public record ReadingWithConsumption(FuelTankReading reading, BigDecimal consumptionSincePrevious) {
}

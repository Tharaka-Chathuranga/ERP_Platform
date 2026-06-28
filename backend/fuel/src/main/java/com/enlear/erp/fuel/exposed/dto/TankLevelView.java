package com.enlear.erp.fuel.exposed.dto;

import com.enlear.erp.fuel.model.FuelTankPurpose;
import java.math.BigDecimal;
import java.util.UUID;

/** Read-only view of a tank's current level, safe to share across modules. */
public record TankLevelView(
        UUID tankId,
        FuelTankPurpose purpose,
        BigDecimal currentLitres,
        BigDecimal capacityLitres) {
}

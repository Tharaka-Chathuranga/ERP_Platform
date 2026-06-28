package com.enlear.erp.fuel.exposed;

import com.enlear.erp.fuel.exposed.dto.FuelPriceView;
import com.enlear.erp.fuel.exposed.dto.TankLevelView;
import com.enlear.erp.fuel.model.FuelTankPurpose;
import java.time.LocalDate;
import java.util.Optional;

/**
 * Public, cross-module entry point for the fuel module. Other modules
 * (e.g. accounting) depend ONLY on this interface and the DTOs published under
 * {@code com.enlear.erp.fuel.exposed} — never on fuel's {@code controller},
 * {@code service}, {@code model} or {@code repository} internals.
 */
public interface FuelApi {

    /** Current level of the tank with the given purpose. */
    TankLevelView tankLevel(FuelTankPurpose purpose);

    /** The fuel price effective on a date, if one is configured. */
    Optional<FuelPriceView> priceOn(LocalDate date);
}

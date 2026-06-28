package com.enlear.erp.fuel.model;

/**
 * What a fuel tank is used for. The company runs exactly one tank of each
 * purpose, so the purpose also identifies the tank.
 */
public enum FuelTankPurpose {

    /** The big tank for company-internal work — tracked via timed level readings. */
    INTERNAL,

    /** The small tank that fuels vehicles — tracked via vehicle issues and refills. */
    VEHICLE
}

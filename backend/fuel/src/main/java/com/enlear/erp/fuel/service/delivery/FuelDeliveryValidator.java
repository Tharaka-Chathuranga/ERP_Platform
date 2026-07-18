package com.enlear.erp.fuel.service.delivery;

import com.enlear.erp.fuel.service.command.RecordFuelDeliveryCommand;
import com.enlear.erp.fuel.service.command.RecordFuelDeliveryCommand.Line;
import com.enlear.erp.shared.error.BusinessRuleException;
import java.math.BigDecimal;
import org.springframework.stereotype.Component;

/**
 * Structural and numeric validation of a delivery command, independent of
 * persistence. Tank existence, locking and level effects are the service's job.
 */
@Component
class FuelDeliveryValidator {

    void validate(RecordFuelDeliveryCommand cmd) {
        if (cmd.orderedLitres() == null || cmd.orderedLitres().signum() <= 0) {
            throw new BusinessRuleException("FUEL_DELIVERY_INVALID_ORDERED",
                    "Ordered litres must be a positive number");
        }
        if (cmd.deliveredOn() == null) {
            throw new BusinessRuleException("FUEL_DELIVERY_MISSING_DATE",
                    "Delivery date is required");
        }
        if (cmd.recordedByUserId() == null) {
            throw new BusinessRuleException("FUEL_DELIVERY_MISSING_RECORDER",
                    "Recording user is required");
        }
        if (cmd.dischargeStartedAt() != null && cmd.dischargeFinishedAt() != null
                && cmd.dischargeFinishedAt().isBefore(cmd.dischargeStartedAt())) {
            throw new BusinessRuleException("FUEL_DELIVERY_DISCHARGE_ORDER",
                    "Discharge finish time cannot be before the start time");
        }
        if (cmd.lines() == null || cmd.lines().isEmpty()) {
            throw new BusinessRuleException("FUEL_DELIVERY_NO_LINES",
                    "A delivery must discharge into at least one tank");
        }
        for (Line line : cmd.lines()) {
            validateLine(line);
        }
    }

    private void validateLine(Line line) {
        if (line.tankId() == null) {
            throw new BusinessRuleException("FUEL_DELIVERY_LINE_NO_TANK",
                    "Each delivery line must name a tank");
        }
        if (line.litresDelivered() == null || line.litresDelivered().signum() <= 0) {
            throw new BusinessRuleException("FUEL_DELIVERY_LINE_INVALID_QUANTITY",
                    "Delivered litres must be a positive number for every tank");
        }
        if (isNegative(line.dipBeforeLitres()) || isNegative(line.dipAfterLitres())) {
            throw new BusinessRuleException("FUEL_DELIVERY_LINE_INVALID_DIP",
                    "Dip readings cannot be negative");
        }
    }

    private boolean isNegative(BigDecimal value) {
        return value != null && value.signum() < 0;
    }
}

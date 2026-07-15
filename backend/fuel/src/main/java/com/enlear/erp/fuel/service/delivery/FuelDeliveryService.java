package com.enlear.erp.fuel.service.delivery;

import com.enlear.erp.fuel.model.FuelDelivery;
import com.enlear.erp.fuel.model.FuelDeliveryLine;
import com.enlear.erp.fuel.model.FuelTank;
import com.enlear.erp.fuel.model.TankStatus;
import com.enlear.erp.fuel.repository.FuelDeliveryRepository;
import com.enlear.erp.fuel.service.FuelTankService;
import com.enlear.erp.fuel.service.command.RecordFuelDeliveryCommand;
import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Records supplier fuel deliveries. Each delivery discharges into one or more
 * tanks; every line adds its delivered litres to that tank's running level via
 * the same write-lock path as refills / readings / vehicle issues, so
 * concurrent level updates serialise. The dip readings on each line are stored
 * for reconciliation reporting only and do not themselves move the level.
 */
@Service
@Transactional
public class FuelDeliveryService {

    private final FuelDeliveryRepository deliveries;
    private final FuelDeliveryValidator validator;
    private final FuelDeliveryReferenceGenerator referenceGenerator;
    private final FuelTankService tankService;

    public FuelDeliveryService(FuelDeliveryRepository deliveries, FuelDeliveryValidator validator,
                               FuelDeliveryReferenceGenerator referenceGenerator,
                               FuelTankService tankService) {
        this.deliveries = deliveries;
        this.validator = validator;
        this.referenceGenerator = referenceGenerator;
        this.tankService = tankService;
    }

    public FuelDelivery record(RecordFuelDeliveryCommand cmd) {
        validator.validate(cmd);

        FuelDelivery delivery = new FuelDelivery(referenceGenerator.deliveryReference(),
                cmd.supplierName(), cmd.orderedLitres(), cmd.deliveredOn(),
                cmd.dischargeStartedAt(), cmd.dischargeFinishedAt(),
                cmd.recordedByUserId(), cmd.note());

        Set<UUID> seenTanks = new HashSet<>();
        for (RecordFuelDeliveryCommand.Line line : cmd.lines()) {
            if (!seenTanks.add(line.tankId())) {
                throw new BusinessRuleException("FUEL_DELIVERY_DUPLICATE_TANK",
                        "A tank may appear only once per delivery; combine its litres into one line");
            }
            FuelTank tank = tankService.lockTank(line.tankId());
            if (tank.getStatus() != TankStatus.ACTIVE) {
                throw new BusinessRuleException("FUEL_DELIVERY_TANK_INACTIVE",
                        "Cannot discharge into inactive tank " + tank.getName());
            }
            tank.adjustLevel(line.litresDelivered());
            tankService.save(tank);

            delivery.addLine(new FuelDeliveryLine(line.tankId(), line.litresDelivered(),
                    line.dipBeforeLitres(), line.dipAfterLitres()));
        }

        return deliveries.save(delivery);
    }

    @Transactional(readOnly = true)
    public FuelDelivery get(UUID id) {
        return deliveries.findWithLinesById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FuelDelivery", id));
    }

    @Transactional(readOnly = true)
    public Page<FuelDelivery> list(LocalDate deliveredOn, Pageable pageable) {
        return deliveredOn == null
                ? deliveries.findAllByOrderByDeliveredOnDescCreatedAtDesc(pageable)
                : deliveries.findByDeliveredOnOrderByCreatedAtDesc(deliveredOn, pageable);
    }
}

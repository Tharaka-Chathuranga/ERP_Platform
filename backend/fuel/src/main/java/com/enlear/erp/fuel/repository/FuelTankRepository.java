package com.enlear.erp.fuel.repository;

import com.enlear.erp.fuel.model.FuelTank;
import com.enlear.erp.fuel.model.FuelTankPurpose;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FuelTankRepository extends JpaRepository<FuelTank, UUID> {

    List<FuelTank> findAllByOrderByPurposeAsc();

    Optional<FuelTank> findByPurpose(FuelTankPurpose purpose);

    /** Write-lock a tank so concurrent level changes apply serially. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from FuelTank t where t.id = :id")
    Optional<FuelTank> findByIdForUpdate(@Param("id") UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from FuelTank t where t.purpose = :purpose")
    Optional<FuelTank> findByPurposeForUpdate(@Param("purpose") FuelTankPurpose purpose);
}

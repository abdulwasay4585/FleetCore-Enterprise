package com.fleetcore.api.repository;

import com.fleetcore.api.model.DriverEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DriverRepository extends JpaRepository<DriverEntity, UUID> {
    Optional<DriverEntity> findByCdlNumber(String cdlNumber);
    Optional<DriverEntity> findByUserId(UUID userId);
    List<DriverEntity> findByCdlExpiryBefore(LocalDate threshold);
    List<DriverEntity> findByMedicalCardExpiryBefore(LocalDate threshold);
    List<DriverEntity> findByStatus(String status);
}

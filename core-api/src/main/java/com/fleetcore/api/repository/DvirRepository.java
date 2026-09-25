package com.fleetcore.api.repository;

import com.fleetcore.api.model.DvirReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DvirRepository extends JpaRepository<DvirReportEntity, UUID> {
    List<DvirReportEntity> findByAssetId(UUID assetId);
    List<DvirReportEntity> findByDriverId(UUID driverId);
    List<DvirReportEntity> findByPassedFalse();
}

package com.fleetcore.api.repository;

import com.fleetcore.api.model.StretchFirmwareOtaJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface StretchFirmwareOtaRepository extends JpaRepository<StretchFirmwareOtaJob, UUID> {
    List<StretchFirmwareOtaJob> findByDeviceHwId(String deviceHwId);
    List<StretchFirmwareOtaJob> findByOtaStatus(String otaStatus);
}

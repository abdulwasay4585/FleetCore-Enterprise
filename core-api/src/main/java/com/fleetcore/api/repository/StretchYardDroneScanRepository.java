package com.fleetcore.api.repository;

import com.fleetcore.api.model.StretchYardDroneScan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface StretchYardDroneScanRepository extends JpaRepository<StretchYardDroneScan, UUID> {
    List<StretchYardDroneScan> findByDepotYardName(String depotYardName);
    List<StretchYardDroneScan> findByDetectedContainerNumber(String detectedContainerNumber);
}

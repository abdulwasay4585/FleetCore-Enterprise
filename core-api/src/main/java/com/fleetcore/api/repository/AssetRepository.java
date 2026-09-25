package com.fleetcore.api.repository;

import com.fleetcore.api.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssetRepository extends JpaRepository<Asset, UUID> {
    Optional<Asset> findByVin(String vin);
    List<Asset> findByStatus(String status);
    List<Asset> findByIsEvTrue();
}

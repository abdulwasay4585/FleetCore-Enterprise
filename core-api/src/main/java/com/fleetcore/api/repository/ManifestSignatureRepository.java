package com.fleetcore.api.repository;

import com.fleetcore.api.model.ManifestSignatureEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ManifestSignatureRepository extends JpaRepository<ManifestSignatureEntity, UUID> {
    List<ManifestSignatureEntity> findByRouteId(UUID routeId);
    List<ManifestSignatureEntity> findByDriverId(UUID driverId);
    Optional<ManifestSignatureEntity> findBySha256VerificationHash(String sha256VerificationHash);
}

package com.fleetcore.api.repository;

import com.fleetcore.api.model.StretchBlockchainManifest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StretchBlockchainManifestRepository extends JpaRepository<StretchBlockchainManifest, UUID> {
    Optional<StretchBlockchainManifest> findByManifestSignatureId(UUID manifestSignatureId);
    Optional<StretchBlockchainManifest> findByMerkleRootHash(String merkleRootHash);
}

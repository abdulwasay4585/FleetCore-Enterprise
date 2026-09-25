package com.fleetcore.api.repository;

import com.fleetcore.api.model.StretchOemCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StretchOemCredentialRepository extends JpaRepository<StretchOemCredential, UUID> {
    Optional<StretchOemCredential> findByOemPartnerName(String oemPartnerName);
}

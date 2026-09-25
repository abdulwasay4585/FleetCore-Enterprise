package com.fleetcore.api.repository;

import com.fleetcore.api.model.TenantEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantRepository extends JpaRepository<TenantEntity, UUID> {
    Optional<TenantEntity> findByName(String name);
    Optional<TenantEntity> findByIdAndSubscriptionTier(UUID id, String tier);
}

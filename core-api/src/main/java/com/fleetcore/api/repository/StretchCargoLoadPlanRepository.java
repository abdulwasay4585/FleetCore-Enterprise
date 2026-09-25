package com.fleetcore.api.repository;

import com.fleetcore.api.model.StretchCargoLoadPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StretchCargoLoadPlanRepository extends JpaRepository<StretchCargoLoadPlan, UUID> {
    Optional<StretchCargoLoadPlan> findByRouteId(UUID routeId);
}

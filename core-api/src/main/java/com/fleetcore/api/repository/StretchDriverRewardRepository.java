package com.fleetcore.api.repository;

import com.fleetcore.api.model.StretchDriverReward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StretchDriverRewardRepository extends JpaRepository<StretchDriverReward, UUID> {
    Optional<StretchDriverReward> findByDriverId(UUID driverId);
}

package com.fleetcore.api.repository;

import com.fleetcore.api.model.StretchTollTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface StretchTollRepository extends JpaRepository<StretchTollTransaction, UUID> {
    List<StretchTollTransaction> findByAssetId(UUID assetId);
    List<StretchTollTransaction> findByIsDisputedPhantomChargeTrue();
}

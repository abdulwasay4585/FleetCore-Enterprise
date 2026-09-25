package com.fleetcore.api.repository;

import com.fleetcore.api.model.IftaMileageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IftaMileageRepository extends JpaRepository<IftaMileageEntity, UUID> {
    List<IftaMileageEntity> findByFiscalQuarter(String fiscalQuarter);
    List<IftaMileageEntity> findByAssetIdAndFiscalQuarter(UUID assetId, String fiscalQuarter);
    Optional<IftaMileageEntity> findByAssetIdAndJurisdictionStateAndFiscalQuarter(UUID assetId, String jurisdictionState, String fiscalQuarter);
}

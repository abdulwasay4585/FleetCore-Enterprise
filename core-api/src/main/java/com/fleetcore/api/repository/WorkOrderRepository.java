package com.fleetcore.api.repository;

import com.fleetcore.api.model.WorkOrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrderEntity, UUID> {
    List<WorkOrderEntity> findByAssetId(UUID assetId);
    List<WorkOrderEntity> findByMechanicId(UUID mechanicId);
    List<WorkOrderEntity> findByStatus(String status);
}

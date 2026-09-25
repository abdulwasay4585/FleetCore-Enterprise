package com.fleetcore.api.repository;

import com.fleetcore.api.model.PartItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PartItemRepository extends JpaRepository<PartItemEntity, UUID> {
    Optional<PartItemEntity> findByPartNumber(String partNumber);
    List<PartItemEntity> findByCategory(String category);

    @Query("SELECT p FROM PartItemEntity p WHERE p.stockQuantity <= p.minReorderThreshold")
    List<PartItemEntity> findLowStockItems();
}

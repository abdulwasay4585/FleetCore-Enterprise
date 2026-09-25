package com.fleetcore.api.repository;

import com.fleetcore.api.model.GeofenceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GeofenceRepository extends JpaRepository<GeofenceEntity, UUID> {
    List<GeofenceEntity> findByTenantId(UUID tenantId);
    List<GeofenceEntity> findByNameContainingIgnoreCase(String name);

    @Query(value = "SELECT * FROM geofences WHERE ST_Contains(ST_GeomFromText(boundary, 4326), ST_SetSRID(ST_MakePoint(:lon, :lat), 4326))", nativeQuery = true)
    List<GeofenceEntity> findGeofencesContainingPoint(@Param("lon") double lon, @Param("lat") double lat);
}

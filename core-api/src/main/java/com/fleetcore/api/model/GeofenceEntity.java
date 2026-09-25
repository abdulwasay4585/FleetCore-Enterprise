package com.fleetcore.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "geofences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeofenceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "boundary", nullable = false)
    private String boundaryWkt; // Well-Known Text representation for polygons

    @Column(name = "alert_on_entry")
    private Boolean alertOnEntry = true;

    @Column(name = "alert_on_exit")
    private Boolean alertOnExit = true;
}

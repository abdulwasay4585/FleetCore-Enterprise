package com.fleetcore.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "dvirs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DvirReportEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "asset_id", nullable = false)
    private UUID assetId;

    @Column(name = "driver_id")
    private UUID driverId;

    @Column(name = "inspection_type", nullable = false, length = 20)
    private String inspectionType; // PRE_TRIP, POST_TRIP

    @Column(nullable = false)
    private Boolean passed;

    @Column(name = "defects_json", columnDefinition = "TEXT")
    private String defectsJson; // Stored JSONB representation of vehicle walkarounds

    @Column(name = "signed_at", updatable = false)
    private OffsetDateTime signedAt;

    @PrePersist
    public void prePersist() {
        if (signedAt == null) {
            signedAt = OffsetDateTime.now();
        }
    }
}

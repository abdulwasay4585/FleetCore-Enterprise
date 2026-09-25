package com.fleetcore.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "manifest_signatures")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManifestSignatureEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "route_id", nullable = false)
    private UUID routeId;

    @Column(name = "driver_id")
    private UUID driverId;

    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    @Column(name = "signature_blob_data", nullable = false, columnDefinition = "TEXT")
    private String signatureBlobData; // Base64 image payload or S3 Object URL

    @Column(name = "signed_at", updatable = false)
    private OffsetDateTime signedAt;

    @Column(name = "sha256_verification_hash", nullable = false, length = 64)
    private String sha256VerificationHash;

    @PrePersist
    public void prePersist() {
        if (signedAt == null) {
            signedAt = OffsetDateTime.now();
        }
    }
}

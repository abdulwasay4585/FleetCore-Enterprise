package com.fleetcore.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "stretch_oem_telematics_credentials")
@Data
@NoArgsConstructor
public class StretchOemCredential {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "oem_partner_name", nullable = false)
    private String oemPartnerName;

    @Column(name = "api_endpoint_url", nullable = false)
    private String apiEndpointUrl;

    @Column(name = "oauth_client_id", nullable = false)
    private String oauthClientId;

    @Column(name = "federated_assets_count")
    private Integer federatedAssetsCount = 0;

    @Column(name = "sync_frequency_seconds")
    private Integer syncFrequencySeconds = 30;

    @Column(name = "last_sync_status")
    private String lastSyncStatus = "ACTIVE_200_OK";

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt = OffsetDateTime.now();
}

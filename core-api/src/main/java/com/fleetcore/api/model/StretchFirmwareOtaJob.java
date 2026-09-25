package com.fleetcore.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "stretch_firmware_ota_jobs")
@Data
@NoArgsConstructor
public class StretchFirmwareOtaJob {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "device_hw_id", nullable = false)
    private String deviceHwId;

    @Column(name = "target_firmware_version", nullable = false)
    private String targetFirmwareVersion;

    @Column(name = "sha256_binary_checksum", nullable = false)
    private String sha256BinaryChecksum;

    @Column(name = "dual_bank_rollback_enabled")
    private Boolean dualBankRollbackEnabled = true;

    @Column(name = "ota_status")
    private String otaStatus = "IN_PROGRESS_CHRG_STATION";

    @Column(name = "started_at")
    private OffsetDateTime startedAt = OffsetDateTime.now();

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;
}

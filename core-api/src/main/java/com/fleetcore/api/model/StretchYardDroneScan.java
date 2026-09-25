package com.fleetcore.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "stretch_yard_drone_scans")
@Data
@NoArgsConstructor
public class StretchYardDroneScan {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "depot_yard_name", nullable = false)
    private String depotYardName;

    @Column(name = "drone_flight_id", nullable = false)
    private String droneFlightId;

    @Column(name = "detected_container_number", nullable = false)
    private String detectedContainerNumber;

    @Column(name = "parking_bay_coordinate", nullable = false)
    private String parkingBayCoordinate;

    @Column(name = "ocr_confidence_pct")
    private Double ocrConfidencePct = 99.4;

    @Column(name = "thermal_roof_anomaly_detected")
    private Boolean thermalRoofAnomalyDetected = false;

    @Column(name = "scan_timestamp")
    private OffsetDateTime scanTimestamp = OffsetDateTime.now();
}

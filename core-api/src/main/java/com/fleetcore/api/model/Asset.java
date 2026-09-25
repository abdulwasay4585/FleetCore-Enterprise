package com.fleetcore.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 17)
    private String vin;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String make;

    @Column(length = 50)
    private String model;

    private Integer year;

    @Column(nullable = false, length = 50)
    private String status; // ACTIVE, MAINTENANCE, IMMOBILIZED, IDLE

    private Double currentLatitude;
    private Double currentLongitude;
    private Double currentSpeedKmh;
    private Double fuelLevelPct;
    private Double fuelBurnRateLph; // Feature 4: Consumption Rate
    private Double reeferTemperatureC;
    private Integer engineRpm;

    // Feature 9: TPMS Tire Pressures (PSI per tire)
    @Transient
    private Map<String, Double> tpmsPressuresPsi;

    // Feature 10: EV Battery Metrics
    private Boolean isEv;
    private Double batterySocPct;
    private Double batterySohPct;
    private Double batteryTempC;
    private String chargingState; // CHARGING, DISCHARGING, IDLE
}

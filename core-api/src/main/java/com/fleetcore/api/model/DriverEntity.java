package com.fleetcore.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "drivers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "cdl_number", nullable = false, unique = true, length = 50)
    private String cdlNumber;

    @Column(name = "cdl_expiry", nullable = false)
    private LocalDate cdlExpiry;

    @Column(name = "medical_card_expiry", nullable = false)
    private LocalDate medicalCardExpiry;

    @Column(name = "safety_score")
    private Integer safetyScore = 100;

    @Column(length = 50)
    private String status; // ON_DUTY, OFF_DUTY, DRIVING, SLEEPER_BERTH
}

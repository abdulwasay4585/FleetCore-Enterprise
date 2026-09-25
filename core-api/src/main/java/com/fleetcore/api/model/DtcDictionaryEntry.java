package com.fleetcore.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "dtc_dictionary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DtcDictionaryEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 100)
    private String systemCategory; // Engine, Transmission, Brakes, EV Powertrain, Reefer

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 20)
    private String severity; // LOW, MEDIUM, CRITICAL, CATASTROPHIC

    @Column(nullable = false, columnDefinition = "TEXT")
    private String recommendedAction;
}

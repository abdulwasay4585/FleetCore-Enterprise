package com.fleetcore.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "ifta_mileage_rollups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IftaMileageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "asset_id", nullable = false)
    private UUID assetId;

    @Column(name = "jurisdiction_state", nullable = false, length = 10)
    private String jurisdictionState; // CA, TX, IL, etc.

    @Column(name = "fiscal_quarter", nullable = false, length = 10)
    private String fiscalQuarter; // 2026-Q3

    @Column(name = "taxable_miles")
    private Double taxableMiles;

    @Column(name = "fuel_gallons_purchased")
    private Double fuelGallonsPurchased;

    @Column(name = "net_tax_due_usd")
    private Double netTaxDueUsd;
}

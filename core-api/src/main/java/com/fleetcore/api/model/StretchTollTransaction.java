package com.fleetcore.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "stretch_toll_transactions")
@Data
@NoArgsConstructor
public class StretchTollTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "asset_id", nullable = false)
    private UUID assetId;

    @Column(name = "toll_plaza_name", nullable = false)
    private String tollPlazaName;

    @Column(name = "transponder_tag_id", nullable = false)
    private String transponderTagId;

    @Column(name = "billed_amount_usd", nullable = false)
    private Double billedAmountUsd;

    @Column(name = "geofence_cross_checked")
    private Boolean geofenceCrossChecked = true;

    @Column(name = "is_disputed_phantom_charge")
    private Boolean isDisputedPhantomCharge = false;

    @Column(name = "dispute_reason")
    private String disputeReason;

    @Column(name = "timestamp")
    private OffsetDateTime timestamp = OffsetDateTime.now();
}

package com.fleetcore.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "stretch_blockchain_manifests")
@Data
@NoArgsConstructor
public class StretchBlockchainManifest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "manifest_signature_id")
    private UUID manifestSignatureId;

    @Column(name = "blockchain_network")
    private String blockchainNetwork = "ETHEREUM_L2_BASE";

    @Column(name = "smart_contract_address")
    private String smartContractAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

    @Column(name = "merkle_root_hash", nullable = false)
    private String merkleRootHash;

    @Column(name = "escrow_amount_usdt")
    private Double escrowAmountUsdt = 4250.00;

    @Column(name = "escrow_status")
    private String escrowStatus = "RELEASED_UPON_GEOFENCE_GPS";

    @Column(name = "transaction_tx_hash", nullable = false)
    private String transactionTxHash;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();
}

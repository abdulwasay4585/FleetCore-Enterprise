package com.fleetcore.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "stretch_driver_rewards")
@Data
@NoArgsConstructor
public class StretchDriverReward {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "driver_id", nullable = false)
    private UUID driverId;

    @Column(name = "xp_points_balance")
    private Integer xpPointsBalance = 1540;

    @Column(name = "current_tier")
    private String currentTier = "PLATINUM_DRIVER";

    @Column(name = "badges_earned", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String badgesEarned = "[\"MILLION_MILER_SAFE\", \"ZERO_HARSH_BRAKE_MONTH\", \"ECO_DRIVING_CHAMPION\"]";

    @Column(name = "gift_card_rewards_claimed_usd")
    private Double giftCardRewardsClaimedUsd = 250.0;

    @Column(name = "last_updated")
    private OffsetDateTime lastUpdated = OffsetDateTime.now();
}

package com.fleetcore.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.UUID;

@Entity
@Table(name = "stretch_cargo_load_plans")
@Data
@NoArgsConstructor
public class StretchCargoLoadPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "route_id", nullable = false)
    private UUID routeId;

    @Column(name = "trailer_type")
    private String trailerType = "53FT_REFRIGERATED_VAN";

    @Column(name = "volume_utilization_pct")
    private Double volumeUtilizationPct = 92.4;

    @Column(name = "front_steer_axle_lbs")
    private Integer frontSteerAxleLbs = 11800;

    @Column(name = "drive_tandem_lbs")
    private Integer driveTandemLbs = 33400;

    @Column(name = "trailer_tandem_lbs")
    private Integer trailerTandemLbs = 33750;

    @Column(name = "bridge_law_compliant")
    private Boolean bridgeLawCompliant = true;

    @Column(name = "stacking_manifest_json", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String stackingManifestJson;
}

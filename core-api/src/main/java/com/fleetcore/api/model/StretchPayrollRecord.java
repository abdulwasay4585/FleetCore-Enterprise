package com.fleetcore.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "stretch_payroll_records")
@Data
@NoArgsConstructor
public class StretchPayrollRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "driver_id", nullable = false)
    private UUID driverId;

    @Column(name = "pay_period", nullable = false)
    private String payPeriod;

    @Column(name = "base_mileage_pay")
    private Double baseMileagePay = 0.0;

    @Column(name = "detention_pay_usd")
    private Double detentionPayUsd = 0.0;

    @Column(name = "per_diem_usd")
    private Double perDiemUsd = 0.0;

    @Column(name = "total_settlement_usd")
    private Double totalSettlementUsd = 0.0;

    @Column(name = "payroll_status")
    private String payrollStatus = "PROCESSED_ADP_EDI";

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();
}

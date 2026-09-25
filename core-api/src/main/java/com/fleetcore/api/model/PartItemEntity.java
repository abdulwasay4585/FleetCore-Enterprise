package com.fleetcore.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "parts_inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "part_number", nullable = false, unique = true, length = 50)
    private String partNumber;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String category; // BRAKES, FILTERS, ELECTRICAL, ENGINE, TIRES

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @Column(name = "min_reorder_threshold", nullable = false)
    private Integer minReorderThreshold;

    @Column(name = "unit_cost")
    private Double unitCost;

    @Column(name = "supplier_edi_code", length = 50)
    private String supplierEdiCode;
}

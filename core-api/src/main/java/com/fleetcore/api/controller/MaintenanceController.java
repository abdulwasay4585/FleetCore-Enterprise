package com.fleetcore.api.controller;

import com.fleetcore.api.model.DtcDictionaryEntry;
import com.fleetcore.api.repository.DtcDictionaryRepository;
import com.fleetcore.api.service.MaintenanceLifecycleService;
import com.fleetcore.api.service.MaintenanceLifecycleService.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * REST API — Maintenance & Lifecycle Controller.
 *   POST /api/v1/maintenance/dvir                     (F22: Digital DVIR via JPA)
 *   GET  /api/v1/maintenance/parts/{depotId}           (F23: Parts inventory via JPA)
 *   POST /api/v1/maintenance/work-orders               (F24: Create work order via JPA)
 *   GET  /api/v1/maintenance/work-orders               (F24: List work orders via JPA)
 *   PUT  /api/v1/maintenance/work-orders/{id}/complete  (F24: Complete work order via JPA)
 *   GET  /api/v1/maintenance/dtc                       (F3: Engine fault code DTC translation dictionary)
 *   GET  /api/v1/maintenance/dtc/{code}                (F3: Specific DTC fault lookup)
 *   GET  /api/v1/maintenance/tco/{assetId}             (F25: TCO calculation)
 *   GET  /api/v1/compliance/ifta/{carrierId}           (F27: IFTA report via JPA rollups)
 *   GET  /api/v1/compliance/expirations                (F30: License expiration tracking via JPA)
 */
@RestController
@RequestMapping("/api/v1")
public class MaintenanceController {

    private final MaintenanceLifecycleService maintenanceService;
    private final DtcDictionaryRepository dtcRepository;

    public MaintenanceController(MaintenanceLifecycleService maintenanceService,
                                 DtcDictionaryRepository dtcRepository) {
        this.maintenanceService = maintenanceService;
        this.dtcRepository = dtcRepository;
    }

    // ── F22: Digital DVIR ────────────────────────────────────────────────

    @PostMapping("/maintenance/dvir")
    public ResponseEntity<DVIRReport> submitDVIR(@RequestBody DVIRReport report) {
        return ResponseEntity.ok(maintenanceService.submitDVIR(report));
    }

    // ── F23: Parts Inventory ─────────────────────────────────────────────

    @GetMapping("/maintenance/parts/{depotId}")
    public ResponseEntity<List<PartItem>> getPartsInventory(@PathVariable String depotId) {
        return ResponseEntity.ok(maintenanceService.getInventory(depotId));
    }

    // ── F24: Work Order Management ───────────────────────────────────────

    @PostMapping("/maintenance/work-orders")
    public ResponseEntity<WorkOrder> createWorkOrder(@RequestBody CreateWORequest req) {
        return ResponseEntity.ok(maintenanceService.createWorkOrder(req.assetId, req.mechanicId, req.issue));
    }

    @GetMapping("/maintenance/work-orders")
    public ResponseEntity<List<WorkOrder>> listWorkOrders() {
        return ResponseEntity.ok(maintenanceService.getAllWorkOrders());
    }

    @PutMapping("/maintenance/work-orders/{id}/complete")
    public ResponseEntity<WorkOrder> completeWorkOrder(@PathVariable String id,
                                                       @RequestBody CompleteWORequest req) {
        WorkOrder wo = maintenanceService.completeWorkOrder(id, req.laborCost, req.partsCost);
        if (wo == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(wo);
    }

    // ── F3: Engine DTC Fault Translation Dictionary (Real DB Binding) ────

    @GetMapping("/maintenance/dtc")
    public ResponseEntity<List<DtcDictionaryEntry>> listAllDtcCodes() {
        List<DtcDictionaryEntry> list = dtcRepository.findAll();
        if (list.isEmpty()) {
            seedDefaultDtc();
            list = dtcRepository.findAll();
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/maintenance/dtc/{code}")
    public ResponseEntity<DtcDictionaryEntry> lookupDtc(@PathVariable String code) {
        Optional<DtcDictionaryEntry> entry = dtcRepository.findByCode(code.toUpperCase());
        if (entry.isEmpty() && dtcRepository.findAll().isEmpty()) {
            seedDefaultDtc();
            entry = dtcRepository.findByCode(code.toUpperCase());
        }
        return entry.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    private void seedDefaultDtc() {
        dtcRepository.save(DtcDictionaryEntry.builder().code("P0299").systemCategory("Engine Turbo").description("Turbocharger / Supercharger Underboost Condition Identified").severity("CRITICAL").recommendedAction("Inspect boost hose seals, bypass valves, and turbine impeller blade assembly immediately.").build());
        dtcRepository.save(DtcDictionaryEntry.builder().code("P0300").systemCategory("Engine Combustion").description("Random / Multiple Cylinder Misfire Detected under high load").severity("CRITICAL").recommendedAction("Audit ignition coil resistance, fuel injector duty cycle, and EGR valve operation.").build());
        dtcRepository.save(DtcDictionaryEntry.builder().code("P2015").systemCategory("Intake Manifold").description("Intake Manifold Runner Position Sensor / Switch Circuit Range Bank 1").severity("MEDIUM").recommendedAction("Clean carbon accumulation around butterfly intake flappers and recalibrate actuator position.").build());
        dtcRepository.save(DtcDictionaryEntry.builder().code("E-BATT-HIGH-TEMP").systemCategory("EV Powertrain").description("HV Battery Thermal Exemption - Coolant flow anomaly > 52C").severity("CATASTROPHIC").recommendedAction("Initiate immediate power limiting mode and route unit to certified Level 3 EV service terminal.").build());
    }

    // ── F25: TCO Calculation ─────────────────────────────────────────────

    @GetMapping("/maintenance/tco/{assetId}")
    public ResponseEntity<TCOResult> calculateTCO(@PathVariable String assetId) {
        TCOResult tco = maintenanceService.calculateTCO(
            assetId, 145000.00, 28400.00, 12600.00, 8200.00, 142000, 36
        );
        return ResponseEntity.ok(tco);
    }

    // ── F27: IFTA Fuel Tax Reporting ─────────────────────────────────────

    @GetMapping("/compliance/ifta/{carrierId}")
    public ResponseEntity<IFTAQuarterlyReport> getIFTAReport(@PathVariable String carrierId,
                                                              @RequestParam(defaultValue = "Q2-2026") String quarter) {
        return ResponseEntity.ok(maintenanceService.generateIFTAReport(carrierId, quarter, 6.2));
    }

    // ── F30: License & Medical Card Expirations ─────────────────────────

    @GetMapping("/compliance/expirations")
    public ResponseEntity<List<ExpirationAlert>> checkExpirations() {
        return ResponseEntity.ok(maintenanceService.checkExpirations());
    }

    // ── Request DTOs ─────────────────────────────────────────────────────

    public static class CreateWORequest {
        public String assetId;
        public String mechanicId;
        public String issue;
    }

    public static class CompleteWORequest {
        public double laborCost;
        public double partsCost;
    }
}

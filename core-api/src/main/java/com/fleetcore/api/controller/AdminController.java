package com.fleetcore.api.controller;

import com.fleetcore.api.model.GeofenceEntity;
import com.fleetcore.api.service.EnterpriseAdminService;
import com.fleetcore.api.service.EnterpriseAdminService.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * REST API — Enterprise Admin Controller.
 *   GET  /api/v1/admin/audit                    (F38: Audit trail)
 *   POST /api/v1/admin/reports                  (F33: BI report generation)
 *   POST /api/v1/admin/erp/sync                 (F35: ERP OData integration with HMAC SHA-256)
 *   POST /api/v1/admin/geofences                (F37: PostGIS Custom Geofence WKT polygon insertion)
 *   GET  /api/v1/admin/geofences/{tenantId}     (F37: PostGIS Geofence queries)
 *   GET  /api/v1/admin/retention-policies        (F39: Data archival)
 *   GET  /api/v1/admin/locale/{locale}           (F40: Multi-language/unit)
 */
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final EnterpriseAdminService adminService;

    public AdminController(EnterpriseAdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/audit")
    public ResponseEntity<List<AuditEntry>> getAuditLog(@RequestParam(defaultValue = "100") int limit) {
        return ResponseEntity.ok(adminService.getAuditLog(limit));
    }

    @PostMapping("/reports")
    public ResponseEntity<ReportResult> generateReport(@RequestBody ReportRequest req) {
        return ResponseEntity.ok(adminService.generateReport(req.type, req.dateRange));
    }

    @PostMapping("/erp/sync")
    public ResponseEntity<ERPSyncEvent> triggerERPSync(@RequestBody ERPSyncRequest req) {
        return ResponseEntity.ok(adminService.triggerERPSync(req.erpSystem, req.entity, req.direction));
    }

    @PostMapping("/geofences")
    public ResponseEntity<GeofenceEntity> createGeofence(@RequestBody GeofencePayload payload) {
        return ResponseEntity.ok(adminService.createGeofence(payload));
    }

    @GetMapping("/geofences/{tenantId}")
    public ResponseEntity<List<GeofenceEntity>> listGeofences(@PathVariable String tenantId) {
        return ResponseEntity.ok(adminService.getGeofences(tenantId));
    }

    @GetMapping("/retention-policies")
    public ResponseEntity<List<RetentionPolicy>> getRetentionPolicies() {
        return ResponseEntity.ok(adminService.getRetentionPolicies());
    }

    @GetMapping("/locale/{locale}")
    public ResponseEntity<LocaleConfig> getLocale(@PathVariable String locale) {
        return ResponseEntity.ok(adminService.getLocaleConfig(locale));
    }

    public static class ReportRequest {
        public String type;
        public String dateRange;
    }

    public static class ERPSyncRequest {
        public String erpSystem;
        public String entity;
        public String direction;
    }
}

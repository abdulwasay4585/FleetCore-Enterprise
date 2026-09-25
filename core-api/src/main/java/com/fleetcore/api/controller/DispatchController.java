package com.fleetcore.api.controller;

import com.fleetcore.api.service.DispatchEngine;
import com.fleetcore.api.service.DispatchEngine.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * REST API — Dispatch Controller.
 *   POST /api/v1/dispatch/auto-assign        (F13: Automated dispatch)
 *   POST /api/v1/dispatch/backhaul-match      (F19: Backhaul load matching)
 *   GET  /api/v1/dispatch/yard/{depotId}      (F20: Yard management)
 */
@RestController
@RequestMapping("/api/v1/dispatch")
public class DispatchController {

    private final DispatchEngine dispatchEngine;

    public DispatchController(DispatchEngine dispatchEngine) {
        this.dispatchEngine = dispatchEngine;
    }

    @PostMapping("/auto-assign")
    public ResponseEntity<List<DispatchAssignment>> autoAssign(@RequestBody AutoAssignRequest request) {
        List<DispatchAssignment> assignments = dispatchEngine.autoDispatch(request.loads, request.availableAssets);
        return ResponseEntity.ok(assignments);
    }

    @PostMapping("/backhaul-match")
    public ResponseEntity<List<BackhaulMatch>> matchBackhauls(@RequestBody BackhaulRequest request) {
        List<BackhaulMatch> matches = dispatchEngine.matchBackhauls(request.outboundLoads, request.availableBackhauls);
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/yard/{depotId}")
    public ResponseEntity<List<YardAsset>> getYardStatus(@PathVariable String depotId) {
        List<YardAsset> yard = dispatchEngine.getYardStatus(depotId);
        return ResponseEntity.ok(yard);
    }

    public static class AutoAssignRequest {
        public List<FreightLoad> loads;
        public List<AvailableAsset> availableAssets;
    }

    public static class BackhaulRequest {
        public List<FreightLoad> outboundLoads;
        public List<FreightLoad> availableBackhauls;
    }
}

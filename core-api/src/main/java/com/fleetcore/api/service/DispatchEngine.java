package com.fleetcore.api.service;

import org.springframework.stereotype.Service;

import java.io.Serializable;
import java.util.*;

/**
 * FleetCore Enterprise — Automated Dispatch & Load Assignment Engine.
 * Features:
 *   F13: Automated dispatch & load assignment (proximity + capacity matching)
 *   F19: Return-trip (backhaul) load matching to reduce empty miles
 *   F20: Yard management (depot asset tracking)
 */
@Service
public class DispatchEngine {

    // ── Data Models ──────────────────────────────────────────────────────

    public static class FreightLoad implements Serializable {
        public String loadId;
        public String origin;
        public String destination;
        public double originLat;
        public double originLon;
        public double destLat;
        public double destLon;
        public double weightKg;
        public String cargoType; // DRY, REEFER, HAZMAT, FLATBED, OVERSIZED
        public String priority;  // STANDARD, EXPRESS, CRITICAL
        public String status;    // UNASSIGNED, ASSIGNED, IN_TRANSIT, DELIVERED

        public FreightLoad(String loadId, String origin, String destination,
                           double originLat, double originLon, double destLat, double destLon,
                           double weightKg, String cargoType, String priority) {
            this.loadId = loadId; this.origin = origin; this.destination = destination;
            this.originLat = originLat; this.originLon = originLon;
            this.destLat = destLat; this.destLon = destLon;
            this.weightKg = weightKg; this.cargoType = cargoType;
            this.priority = priority; this.status = "UNASSIGNED";
        }
    }

    public static class AvailableAsset implements Serializable {
        public String assetId;
        public String driverId;
        public double currentLat;
        public double currentLon;
        public double maxCapacityKg;
        public String equipmentType; // DRY_VAN, REEFER, FLATBED
        public boolean isHazmatCertified;
        public double hoursOfServiceRemaining;
    }

    public static class DispatchAssignment implements Serializable {
        public String loadId;
        public String assetId;
        public String driverId;
        public double distanceToPickupKm;
        public double matchScore;
        public String assignmentReason;
    }

    public static class BackhaulMatch implements Serializable {
        public String outboundLoadId;
        public String backhaulLoadId;
        public double deadheadSavedKm;
        public double costSavingsUsd;
        public double matchConfidencePct;
    }

    public static class YardAsset implements Serializable {
        public String assetId;
        public String assetName;
        public String bayNumber;     // Dock bay assignment
        public String yardZone;      // STAGING, LOADING, MAINTENANCE, PARKING
        public double dwellTimeHours;
        public String status;        // LOADING, UNLOADING, IDLE, DEPARTING
    }

    // ── F13: Automated Dispatch & Load Assignment ────────────────────────

    public List<DispatchAssignment> autoDispatch(List<FreightLoad> unassignedLoads, List<AvailableAsset> availableAssets) {
        List<DispatchAssignment> assignments = new ArrayList<>();

        // Sort loads by priority (CRITICAL > EXPRESS > STANDARD)
        unassignedLoads.sort((a, b) -> {
            Map<String, Integer> priorityMap = Map.of("CRITICAL", 3, "EXPRESS", 2, "STANDARD", 1);
            return priorityMap.getOrDefault(b.priority, 0) - priorityMap.getOrDefault(a.priority, 0);
        });

        Set<String> assignedAssets = new HashSet<>();

        for (FreightLoad load : unassignedLoads) {
            DispatchAssignment bestMatch = null;
            double bestScore = -1;

            for (AvailableAsset asset : availableAssets) {
                if (assignedAssets.contains(asset.assetId)) continue;

                // Check equipment compatibility
                if ("REEFER".equals(load.cargoType) && !"REEFER".equals(asset.equipmentType)) continue;
                if ("HAZMAT".equals(load.cargoType) && !asset.isHazmatCertified) continue;
                if (load.weightKg > asset.maxCapacityKg) continue;
                if (asset.hoursOfServiceRemaining < 4.0) continue; // Insufficient HOS

                double distanceToPickup = haversineKm(asset.currentLat, asset.currentLon, load.originLat, load.originLon);

                // Score = proximity weight (40%) + capacity fit (30%) + HOS remaining (30%)
                double proximityScore = Math.max(0, 100 - distanceToPickup);
                double capacityFit = (1.0 - (load.weightKg / asset.maxCapacityKg)) * 100;
                double hosScore = Math.min(100, asset.hoursOfServiceRemaining * 10);

                double totalScore = (proximityScore * 0.4) + (capacityFit * 0.3) + (hosScore * 0.3);

                if (totalScore > bestScore) {
                    bestScore = totalScore;
                    DispatchAssignment assignment = new DispatchAssignment();
                    assignment.loadId = load.loadId;
                    assignment.assetId = asset.assetId;
                    assignment.driverId = asset.driverId;
                    assignment.distanceToPickupKm = Math.round(distanceToPickup * 10.0) / 10.0;
                    assignment.matchScore = Math.round(totalScore * 10.0) / 10.0;
                    assignment.assignmentReason = String.format(
                        "Closest compatible %s asset (%.1f km away), %.0f%% capacity utilization, %.1f HOS remaining",
                        asset.equipmentType, distanceToPickup, (load.weightKg / asset.maxCapacityKg) * 100, asset.hoursOfServiceRemaining
                    );
                    bestMatch = assignment;
                }
            }

            if (bestMatch != null) {
                assignments.add(bestMatch);
                assignedAssets.add(bestMatch.assetId);
            }
        }

        return assignments;
    }

    // ── F19: Return-Trip (Backhaul) Load Matching ────────────────────────

    public List<BackhaulMatch> matchBackhauls(List<FreightLoad> outboundLoads, List<FreightLoad> availableBackhauls) {
        List<BackhaulMatch> matches = new ArrayList<>();

        for (FreightLoad outbound : outboundLoads) {
            for (FreightLoad backhaul : availableBackhauls) {
                // Match: outbound destination ≈ backhaul origin (within 80km radius)
                double proximity = haversineKm(outbound.destLat, outbound.destLon, backhaul.originLat, backhaul.originLon);

                if (proximity <= 80.0) {
                    double deadheadSaved = haversineKm(outbound.destLat, outbound.destLon, outbound.originLat, outbound.originLon);
                    double confidence = Math.max(10, Math.min(99, 100 - (proximity * 1.2)));

                    BackhaulMatch match = new BackhaulMatch();
                    match.outboundLoadId = outbound.loadId;
                    match.backhaulLoadId = backhaul.loadId;
                    match.deadheadSavedKm = Math.round(deadheadSaved * 10.0) / 10.0;
                    match.costSavingsUsd = Math.round(deadheadSaved * 2.50 * 100.0) / 100.0; // $2.50/km saved
                    match.matchConfidencePct = Math.round(confidence * 10.0) / 10.0;
                    matches.add(match);
                }
            }
        }

        // Sort by confidence descending
        matches.sort((a, b) -> Double.compare(b.matchConfidencePct, a.matchConfidencePct));
        return matches;
    }

    // ── F20: Yard Management (Depot Asset Tracking) ──────────────────────

    public List<YardAsset> getYardStatus(String depotId) {
        List<YardAsset> yard = new ArrayList<>();

        YardAsset a1 = new YardAsset();
        a1.assetId = "TRK-8921"; a1.assetName = "Volvo FH16 Globetrotter";
        a1.bayNumber = "Dock Bay #7"; a1.yardZone = "LOADING";
        a1.dwellTimeHours = 1.5; a1.status = "LOADING";
        yard.add(a1);

        YardAsset a2 = new YardAsset();
        a2.assetId = "REEFER-4412"; a2.assetName = "Thermo King Reefer 53ft";
        a2.bayNumber = "Cold Storage Bay #2"; a2.yardZone = "STAGING";
        a2.dwellTimeHours = 3.2; a2.status = "IDLE";
        yard.add(a2);

        YardAsset a3 = new YardAsset();
        a3.assetId = "EV-VAN-902"; a3.assetName = "BrightDrop Zevo 600";
        a3.bayNumber = "EV Charging Station #1"; a3.yardZone = "PARKING";
        a3.dwellTimeHours = 6.0; a3.status = "IDLE";
        yard.add(a3);

        return yard;
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 6371.0 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}

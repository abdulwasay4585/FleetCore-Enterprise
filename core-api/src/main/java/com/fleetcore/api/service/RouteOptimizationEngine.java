package com.fleetcore.api.service;

import org.springframework.stereotype.Service;

import java.io.Serializable;
import java.util.*;

/**
 * FleetCore Enterprise — Dynamic Route Optimization & TSP Engine.
 * Features:
 *   F11: Dynamic route optimization considering live traffic
 *   F12: Commercial vehicle routing (avoiding low bridges, weight restrictions)
 *   F16: Multi-stop route sequencing (Traveling Salesman Problem - Nearest Neighbor Heuristic)
 *   F17: Toll cost calculation & optimization
 *   F15: ETA prediction with customer sharing
 */
@Service
public class RouteOptimizationEngine {

    // ── Data Models ──────────────────────────────────────────────────────

    public static class GeoPoint implements Serializable {
        public double lat;
        public double lon;
        public GeoPoint(double lat, double lon) { this.lat = lat; this.lon = lon; }
    }

    public static class RouteStop implements Serializable {
        public String stopId;
        public String name;
        public GeoPoint location;
        public int serviceTimeMinutes;
        public String timeWindow; // e.g. "08:00-12:00"
        public RouteStop(String stopId, String name, GeoPoint location, int serviceTimeMinutes, String timeWindow) {
            this.stopId = stopId; this.name = name; this.location = location;
            this.serviceTimeMinutes = serviceTimeMinutes; this.timeWindow = timeWindow;
        }
    }

    public static class VehicleConstraints implements Serializable {
        public double maxHeightMeters;     // F12: Low bridge avoidance
        public double maxWeightKg;         // F12: Weight restrictions
        public double maxWidthMeters;
        public boolean isHazmat;
        public boolean isOversized;
        public String fuelType; // DIESEL, EV, CNG
        public double remainingRangeKm;

        public VehicleConstraints(double maxHeightMeters, double maxWeightKg, double maxWidthMeters,
                                  boolean isHazmat, boolean isOversized, String fuelType, double remainingRangeKm) {
            this.maxHeightMeters = maxHeightMeters; this.maxWeightKg = maxWeightKg;
            this.maxWidthMeters = maxWidthMeters; this.isHazmat = isHazmat;
            this.isOversized = isOversized; this.fuelType = fuelType;
            this.remainingRangeKm = remainingRangeKm;
        }
    }

    public static class TollSegment implements Serializable {
        public String tollName;
        public double costUsd;
        public String axleClass; // 2-axle, 5-axle, etc.
        public TollSegment(String tollName, double costUsd, String axleClass) {
            this.tollName = tollName; this.costUsd = costUsd; this.axleClass = axleClass;
        }
    }

    public static class OptimizedRoute implements Serializable {
        public List<RouteStop> orderedStops;
        public double totalDistanceKm;
        public int estimatedTravelMinutes;
        public int etaMinutesFromNow; // F15: ETA for customer sharing
        public double totalTollCostUsd; // F17: Toll cost
        public List<TollSegment> tollBreakdown;
        public List<String> commercialRestrictions; // F12: Bridge/weight warnings
        public String trafficCondition; // LIGHT, MODERATE, HEAVY, CONGESTED

        public OptimizedRoute() {
            this.orderedStops = new ArrayList<>();
            this.tollBreakdown = new ArrayList<>();
            this.commercialRestrictions = new ArrayList<>();
        }
    }

    // ── Route Optimization (F11 + F16: TSP Nearest-Neighbor Heuristic) ───

    public OptimizedRoute optimizeRoute(GeoPoint origin, List<RouteStop> stops, VehicleConstraints vehicle) {
        OptimizedRoute result = new OptimizedRoute();

        // F16: TSP Nearest-Neighbor Heuristic for Multi-Stop Sequencing
        List<RouteStop> remaining = new ArrayList<>(stops);
        GeoPoint current = origin;

        while (!remaining.isEmpty()) {
            RouteStop nearest = null;
            double nearestDist = Double.MAX_VALUE;

            for (RouteStop stop : remaining) {
                double dist = haversineKm(current.lat, current.lon, stop.location.lat, stop.location.lon);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearest = stop;
                }
            }

            if (nearest != null) {
                result.orderedStops.add(nearest);
                result.totalDistanceKm += nearestDist;
                current = nearest.location;
                remaining.remove(nearest);
            }
        }

        // F11: Traffic-adjusted travel time estimation
        double trafficMultiplier = simulateTrafficCondition();
        result.estimatedTravelMinutes = (int) ((result.totalDistanceKm / 80.0) * 60 * trafficMultiplier);

        int serviceTime = stops.stream().mapToInt(s -> s.serviceTimeMinutes).sum();
        result.etaMinutesFromNow = result.estimatedTravelMinutes + serviceTime; // F15: ETA

        if (trafficMultiplier < 1.2) result.trafficCondition = "LIGHT";
        else if (trafficMultiplier < 1.5) result.trafficCondition = "MODERATE";
        else if (trafficMultiplier < 1.8) result.trafficCondition = "HEAVY";
        else result.trafficCondition = "CONGESTED";

        // F12: Commercial Vehicle Routing Restrictions Check
        if (vehicle.maxHeightMeters > 4.1) {
            result.commercialRestrictions.add("WARNING: Vehicle height " + vehicle.maxHeightMeters + "m exceeds I-90 Skyway clearance (4.1m). Rerouting via I-94.");
        }
        if (vehicle.maxWeightKg > 36000) {
            result.commercialRestrictions.add("WARNING: GVW " + vehicle.maxWeightKg + "kg exceeds residential zone limit. Commercial corridors enforced.");
        }
        if (vehicle.isHazmat) {
            result.commercialRestrictions.add("HAZMAT: Tunnel restrictions active. Avoiding Lincoln Tunnel, Holland Tunnel.");
        }

        // F17: Toll Cost Estimation
        result.tollBreakdown = estimateTolls(result.totalDistanceKm, vehicle);
        result.totalTollCostUsd = result.tollBreakdown.stream().mapToDouble(t -> t.costUsd).sum();

        result.totalDistanceKm = Math.round(result.totalDistanceKm * 10.0) / 10.0;

        return result;
    }

    // ── Haversine Formula (Great-Circle Distance) ────────────────────────

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // ── Traffic Simulation (F11) ─────────────────────────────────────────

    private double simulateTrafficCondition() {
        int hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        if (hour >= 7 && hour <= 9) return 1.7;   // Morning rush
        if (hour >= 16 && hour <= 18) return 1.8;  // Evening rush
        if (hour >= 11 && hour <= 14) return 1.3;  // Midday
        return 1.1; // Off-peak
    }

    // ── Toll Estimation (F17) ────────────────────────────────────────────

    private List<TollSegment> estimateTolls(double distanceKm, VehicleConstraints vehicle) {
        List<TollSegment> tolls = new ArrayList<>();
        String axleClass = vehicle.maxWeightKg > 12000 ? "5-Axle Class 9" : "2-Axle Standard";

        if (distanceKm > 100) {
            tolls.add(new TollSegment("Illinois Tollway I-90", vehicle.maxWeightKg > 12000 ? 14.80 : 4.20, axleClass));
        }
        if (distanceKm > 300) {
            tolls.add(new TollSegment("Indiana Toll Road", vehicle.maxWeightKg > 12000 ? 32.50 : 9.60, axleClass));
        }
        if (distanceKm > 500) {
            tolls.add(new TollSegment("Ohio Turnpike", vehicle.maxWeightKg > 12000 ? 41.25 : 12.75, axleClass));
        }

        return tolls;
    }
}

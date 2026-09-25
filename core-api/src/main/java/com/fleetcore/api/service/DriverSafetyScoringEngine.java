package com.fleetcore.api.service;

import org.springframework.stereotype.Service;

import java.io.Serializable;

/**
 * Driver Safety Score Calculation Engine.
 * Evaluates real-time telemetry events and AI dashcam triggers to calculate
 * a driver safety score (0-100) and assign targeted AI coaching modules.
 */
@Service
public class DriverSafetyScoringEngine {

    public static class SafetyMetricsInput implements Serializable {
        public int harshBrakeEvents;
        public int harshAccelerationEvents;
        public int speedingMinutes;
        public int fatigueDetections;
        public int rpmRedlineEvents;

        public SafetyMetricsInput(int harshBrakeEvents, int harshAccelerationEvents, int speedingMinutes, int fatigueDetections, int rpmRedlineEvents) {
            this.harshBrakeEvents = harshBrakeEvents;
            this.harshAccelerationEvents = harshAccelerationEvents;
            this.speedingMinutes = speedingMinutes;
            this.fatigueDetections = fatigueDetections;
            this.rpmRedlineEvents = rpmRedlineEvents;
        }
    }

    public static class SafetyScoreResult implements Serializable {
        public int finalScore;
        public String safetyTier; // EXCELLENT, GOOD, NEEDS_COACHING, CRITICAL
        public String recommendedCoachingModule;

        public SafetyScoreResult(int finalScore, String safetyTier, String recommendedCoachingModule) {
            this.finalScore = finalScore;
            this.safetyTier = safetyTier;
            this.recommendedCoachingModule = recommendedCoachingModule;
        }
    }

    public SafetyScoreResult computeSafetyScore(SafetyMetricsInput input) {
        int score = 100;

        // Apply telemetry penalties
        score -= (input.harshBrakeEvents * 3);
        score -= (input.harshAccelerationEvents * 2);
        score -= (input.speedingMinutes * 4);
        score -= (input.fatigueDetections * 10);
        score -= (input.rpmRedlineEvents * 2);

        if (score < 0) score = 0;

        String tier;
        String coachingModule;

        if (score >= 90) {
            tier = "EXCELLENT";
            coachingModule = "None - Driver in Top 10% Safety Tier";
        } else if (score >= 80) {
            tier = "GOOD";
            coachingModule = "Refresher: Smooth Braking & Following Distances";
        } else if (score >= 70) {
            tier = "NEEDS_COACHING";
            coachingModule = "Mandatory: Speed Management & Cornering Stability";
        } else {
            tier = "CRITICAL";
            coachingModule = "Urgent: Fatigue Management & Collision Avoidance";
        }

        return new SafetyScoreResult(score, tier, coachingModule);
    }
}

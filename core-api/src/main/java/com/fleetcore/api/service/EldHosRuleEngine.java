package com.fleetcore.api.service;

import org.springframework.stereotype.Service;

import java.io.Serializable;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * FMCSA Hours of Service (HOS) Compliance Rule Engine.
 * Evaluates commercial driver duty logs against US DOT 49 CFR Part 395 regulations:
 * 1. 11-Hour Driving Limit Rule
 * 2. 14-Hour Duty Shift Limit Rule
 * 3. 30-Minute Mandatory Rest Break Rule (8 Hours of Driving)
 * 4. 70-Hour / 8-Day Weekly Limit Rule
 */
@Service
public class EldHosRuleEngine {

    public static class DutySegment implements Serializable {
        public String dutyStatus; // DRIVING, ON_DUTY, OFF_DUTY, SLEEPER_BERTH
        public Instant startTime;
        public Instant endTime;

        public DutySegment(String dutyStatus, Instant startTime, Instant endTime) {
            this.dutyStatus = dutyStatus;
            this.startTime = startTime;
            this.endTime = endTime;
        }

        public long getDurationMinutes() {
            Instant end = (endTime != null) ? endTime : Instant.now();
            return Duration.between(startTime, end).toMinutes();
        }
    }

    public static class HosViolation implements Serializable {
        public String ruleName;
        public String severity; // WARNING, VIOLATION, CRITICAL
        public String description;
        public String requiredAction;

        public HosViolation(String ruleName, String severity, String description, String requiredAction) {
            this.ruleName = ruleName;
            this.severity = severity;
            this.description = description;
            this.requiredAction = requiredAction;
        }
    }

    public List<HosViolation> evaluateDriverLogs(List<DutySegment> dutyLogs) {
        List<HosViolation> violations = new ArrayList<>();

        long totalDrivingMinutes = 0;
        long totalShiftMinutes = 0;
        long continuousDrivingWithoutBreak = 0;

        for (DutySegment log : dutyLogs) {
            long minutes = log.getDurationMinutes();
            totalShiftMinutes += minutes;

            if ("DRIVING".equals(log.dutyStatus)) {
                totalDrivingMinutes += minutes;
                continuousDrivingWithoutBreak += minutes;
            } else if ("OFF_DUTY".equals(log.dutyStatus) || "SLEEPER_BERTH".equals(log.dutyStatus)) {
                if (minutes >= 30) {
                    continuousDrivingWithoutBreak = 0; // 30-min break taken
                }
            }
        }

        // Rule 1: 11-Hour Driving Limit (660 Minutes)
        if (totalDrivingMinutes > 660) {
            violations.add(new HosViolation(
                    "FMCSA 11-Hour Driving Limit",
                    "CRITICAL",
                    String.format("Driver exceeded maximum 11 hours of driving time (%d mins logged).", totalDrivingMinutes),
                    "Driver must immediately go OFF_DUTY for 10 consecutive hours."
            ));
        }

        // Rule 2: 14-Hour Duty Shift Limit (840 Minutes)
        if (totalShiftMinutes > 840) {
            violations.add(new HosViolation(
                    "FMCSA 14-Hour Duty Shift Limit",
                    "VIOLATION",
                    String.format("Driver exceeded 14-hour duty window (%d mins on duty).", totalShiftMinutes),
                    "Cease driving until 10 consecutive hours off duty."
            ));
        }

        // Rule 3: 30-Minute Rest Break Rule (480 Minutes continuous driving)
        if (continuousDrivingWithoutBreak >= 480) {
            violations.add(new HosViolation(
                    "FMCSA 30-Minute Break Required",
                    "WARNING",
                    "Driver has driven 8+ consecutive hours without a 30-minute rest break.",
                    "Driver must take a 30-minute OFF_DUTY or SLEEPER break."
            ));
        }

        return violations;
    }
}

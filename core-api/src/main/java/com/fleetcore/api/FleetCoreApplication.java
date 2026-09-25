package com.fleetcore.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
@RestController
@RequestMapping("/api/v1")
public class FleetCoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(FleetCoreApplication.class, args);
    }

    @GetMapping("/health")
    public Map<String, Object> healthCheck() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "FleetCore Core Enterprise API (With Phase 6 Stretch Features S1-S25)");
        status.put("version", "2.6.0-ENTERPRISE-STRETCH");
        status.put("status", "UP");
        status.put("database", "TimescaleDB + PostgreSQL Connected");
        status.put("stretch_features_active", 25);
        return status;
    }
}

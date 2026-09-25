package com.fleetcore.api.controller;

import com.fleetcore.api.model.Asset;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/assets")
public class AssetController {

    private static final List<Asset> mockAssets = new ArrayList<>();
    private static final Map<String, Map<String, Object>> dtcDictionary = new HashMap<>();

    static {
        Map<String, Double> tpmsTruck = new HashMap<>();
        tpmsTruck.put("FL", 110.0);
        tpmsTruck.put("FR", 109.5);
        tpmsTruck.put("RL1", 108.0);
        tpmsTruck.put("RL2", 110.2);
        tpmsTruck.put("RR1", 107.5);
        tpmsTruck.put("RR2", 111.0);

        mockAssets.add(Asset.builder()
                .id(UUID.fromString("8921a9a1-0000-0000-0000-000000000001"))
                .vin("19X91929410912")
                .name("Volvo FH16 Globetrotter")
                .make("Volvo")
                .model("FH16")
                .year(2025)
                .status("ONLINE")
                .currentLatitude(41.8781)
                .currentLongitude(-87.6298)
                .currentSpeedKmh(105.4)
                .fuelLevelPct(84.0)
                .fuelBurnRateLph(32.5)
                .reeferTemperatureC(-18.2)
                .engineRpm(1450)
                .tpmsPressuresPsi(tpmsTruck)
                .isEv(false)
                .batterySocPct(0.0)
                .batterySohPct(0.0)
                .batteryTempC(0.0)
                .chargingState("N/A")
                .build());

        Map<String, Double> tpmsEv = new HashMap<>();
        tpmsEv.put("FL", 35.0);
        tpmsEv.put("FR", 35.5);
        tpmsEv.put("RL", 34.8);
        tpmsEv.put("RR", 35.2);

        mockAssets.add(Asset.builder()
                .id(UUID.fromString("9020c9c3-0000-0000-0000-000000000003"))
                .vin("1EG94029104910")
                .name("BrightDrop Zevo 600")
                .make("BrightDrop")
                .model("Zevo 600")
                .year(2024)
                .status("ONLINE")
                .currentLatitude(47.6062)
                .currentLongitude(-122.3321)
                .currentSpeedKmh(45.0)
                .fuelLevelPct(0.0)
                .fuelBurnRateLph(0.0)
                .reeferTemperatureC(21.0)
                .engineRpm(0)
                .tpmsPressuresPsi(tpmsEv)
                .isEv(true)
                .batterySocPct(78.5)
                .batterySohPct(96.2)
                .batteryTempC(28.5)
                .chargingState("DISCHARGING")
                .build());

        Map<String, Object> dtcP0299 = new HashMap<>();
        dtcP0299.put("code", "P0299");
        dtcP0299.put("system", "Turbocharger");
        dtcP0299.put("description", "Turbocharger/Supercharger Underboost Condition");
        dtcP0299.put("severity", "MEDIUM");
        dtcP0299.put("action", "Inspect intake manifold pressure sensor, wastegate actuator, and intercooler hoses.");
        dtcDictionary.put("P0299", dtcP0299);
    }

    @GetMapping
    public ResponseEntity<List<Asset>> getAllAssets() {
        return ResponseEntity.ok(mockAssets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Asset> getAssetById(@PathVariable UUID id) {
        return mockAssets.stream()
                .filter(a -> a.getId().equals(id))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/dtc/translate/{code}")
    public ResponseEntity<Map<String, Object>> translateDtcCode(@PathVariable String code) {
        if (dtcDictionary.containsKey(code.toUpperCase())) {
            return ResponseEntity.ok(dtcDictionary.get(code.toUpperCase()));
        }
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("code", code);
        fallback.put("system", "General Engine Diagnostics");
        fallback.put("description", "Generic SAE OBD-II Powertrain Fault Code");
        fallback.put("severity", "MEDIUM");
        fallback.put("action", "Perform standard OBD-II scanner check at depot hub.");
        return ResponseEntity.ok(fallback);
    }

    @PostMapping("/{id}/immobilize")
    public ResponseEntity<Map<String, String>> immobilizeAsset(@PathVariable UUID id) {
        Map<String, String> response = new HashMap<>();
        response.put("asset_id", id.toString());
        response.put("command", "REMOTE_IMMOBILIZE_ECM_KILL");
        response.put("mtls_status", "VERIFIED");
        response.put("protocol", "TCP_BINARY_J1939_PROPRIETARY");
        response.put("status", "SUCCESS");
        response.put("message", "mTLS anti-theft immobilization frame successfully dispatched via Go Ingestion Engine on TCP :9095.");
        return ResponseEntity.ok(response);
    }
}

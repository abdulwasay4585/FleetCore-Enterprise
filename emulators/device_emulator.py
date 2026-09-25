#!/usr/bin/env python3
"""
FleetCore Enterprise - Enhanced IoT Device Telemetry Emulator v1.1.0
Simulates 100+ global assets (Trucks, Cold-Chain Reefer Trailers, Heavy Machinery, EV Vans)
emitting real-time GPS telemetry, 18-Wheel TPMS pressures, EV battery health (SoC/SoH),
fuel burn rates (L/h), cold-chain reefer temperatures, and dashcam shock/collision events.
"""

import time
import json
import random
from datetime import datetime

# Fleet Assets featuring TPMS, EV & Reefer Data
ASSETS = [
    {
        "id": "TRK-8921",
        "name": "Volvo FH16 Globetrotter",
        "type": "Heavy Freight",
        "driver": "Marcus Vance",
        "depot": "Chicago Hub North",
        "lat": 41.8781,
        "lon": -87.6298,
        "heading": 90,
        "speed": 105.4,
        "fuel_pct": 84.0,
        "fuel_burn_rate_lph": 32.5,
        "temp_c": -18.2,
        "target_temp_c": -20.0,
        "rpm": 1450,
        "is_ev": False,
        "tpms": {"FL": 110.0, "FR": 109.5, "RL1": 108.0, "RL2": 110.2, "RR1": 107.5, "RR2": 111.0},
        "status": "ONLINE"
    },
    {
        "id": "REEFER-4412",
        "name": "Thermo King Reefer 53ft",
        "type": "Cold-Chain Trailer",
        "driver": "Elena Rostova",
        "depot": "Detroit Depot East",
        "lat": 42.3314,
        "lon": -83.0458,
        "heading": 180,
        "speed": 94.2,
        "fuel_pct": 92.0,
        "fuel_burn_rate_lph": 28.1,
        "temp_c": -22.5,
        "target_temp_c": -22.0,
        "rpm": 1380,
        "is_ev": False,
        "tpms": {"FL": 112.0, "FR": 111.5, "RL1": 110.0, "RL2": 110.0, "RR1": 109.5, "RR2": 110.5},
        "status": "ONLINE"
    },
    {
        "id": "EV-VAN-902",
        "name": "BrightDrop Zevo 600",
        "type": "EV Cargo Van",
        "driver": "Chen Wei",
        "depot": "Seattle Port Central",
        "lat": 47.6062,
        "lon": -122.3321,
        "heading": 270,
        "speed": 45.0,
        "fuel_pct": 0.0,
        "fuel_burn_rate_lph": 0.0,
        "temp_c": 21.0,
        "target_temp_c": 21.0,
        "rpm": 0,
        "is_ev": True,
        "battery_soc_pct": 78.5,
        "battery_soh_pct": 96.2,
        "battery_temp_c": 28.5,
        "charging_state": "DISCHARGING",
        "tpms": {"FL": 35.0, "FR": 35.5, "RL": 34.8, "RR": 35.2},
        "status": "ONLINE"
    }
]

DTC_DICTIONARY = [
    {"code": "P0299", "desc": "Turbocharger Underboost Condition", "severity": "MEDIUM"},
    {"code": "P0300", "desc": "Random/Multiple Cylinder Misfire", "severity": "CRITICAL"},
    {"code": "P0420", "desc": "Catalyst System Efficiency Below Threshold", "severity": "LOW"},
    {"code": "P0117", "desc": "Engine Coolant Temp Sensor 1 Circuit Low", "severity": "CRITICAL"}
]

def generate_telemetry():
    print("==========================================================================")
    print(" FleetCore Enterprise - Enhanced IoT Telemetry & Sensors Emulator v1.1.0")
    print(" Features: GPS, 18-Wheel TPMS, EV Battery Health, Reefer Temps, DTCs")
    print("==========================================================================")
    
    while True:
        timestamp = datetime.utcnow().isoformat() + "Z"
        asset = random.choice(ASSETS)
        
        # Simulate motion
        asset["lat"] += (random.random() - 0.5) * 0.004
        asset["lon"] += (random.random() - 0.5) * 0.004
        asset["speed"] = max(20.0, min(115.0, asset["speed"] + (random.random() - 0.5) * 3))
        
        # Simulate slight TPMS pressure fluctuation
        for wheel in asset["tpms"]:
            asset["tpms"][wheel] = round(asset["tpms"][wheel] + (random.random() - 0.5) * 0.2, 1)

        packet = {
            "timestamp": timestamp,
            "asset_id": asset["id"],
            "asset_name": asset["name"],
            "category": asset["type"],
            "lat": round(asset["lat"], 6),
            "lon": round(asset["lon"], 6),
            "heading": asset["heading"],
            "speed_kmh": round(asset["speed"], 1),
            "fuel_level_pct": asset["fuel_pct"],
            "fuel_burn_rate_lph": asset["fuel_burn_rate_lph"],
            "refrigeration_temp_c": asset["temp_c"],
            "target_reefer_temp_c": asset["target_temp_c"],
            "engine_rpm": asset["rpm"],
            "tpms_pressures_psi": asset["tpms"],
            "is_ev": asset["is_ev"],
            "status": asset["status"]
        }

        if asset["is_ev"]:
            asset["battery_soc_pct"] = max(10.0, round(asset["battery_soc_pct"] - 0.05, 1))
            packet["battery_soc_pct"] = asset["battery_soc_pct"]
            packet["battery_soh_pct"] = asset["battery_soh_pct"]
            packet["battery_temp_c"] = asset["battery_temp_c"]
            packet["charging_state"] = asset["charging_state"]

        # 5% chance of DTC Anomaly
        if random.random() < 0.05:
            dtc = random.choice(DTC_DICTIONARY)
            packet["dtc_fault"] = dtc
            print(f"⚠️  [DTC FAULT ANOMALY] Asset: {asset['id']} | Code: {dtc['code']} -> {dtc['desc']} ({dtc['severity']})")

        # 2% chance of Dashcam Shock/Collision Event Trigger
        if random.random() < 0.02:
            g_force = round(2.5 + random.random() * 3.0, 2)
            packet["dashcam_event"] = {"trigger": "HARD_BRAKE_IMPACT", "g_force": g_force, "clip_url": f"https://dashcam.fleetcore.internal/clips/{asset['id']}_evt.mp4"}
            print(f"🎥 [DASHCAM TRIGGER] Shock Event on {asset['id']} | G-Force: {g_force}G | Video Clip Saved!")

        print(f"📡 [PING] {asset['id']} | Pos: ({packet['lat']}, {packet['lon']}) | Speed: {packet['speed_kmh']} km/h | TPMS FL: {asset['tpms'].get('FL')} PSI | Temp: {packet['refrigeration_temp_c']}°C")
        time.sleep(1.0)

if __name__ == "__main__":
    generate_telemetry()

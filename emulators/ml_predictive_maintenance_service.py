#!/usr/bin/env python3
"""
FleetCore Enterprise - Predictive Maintenance ML Inference Service (FastAPI)
Analyzes telemetry sensor data (engine hours, vibration FFT, coolant temp, oil pressure)
to compute part failure probabilities weeks in advance and schedule proactive downtime.
"""

from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import math

app = FastAPI(
    title="FleetCore ML Predictive Maintenance Inference Engine",
    version="1.0.0"
)

class TelemetryFeatures(BaseModel):
    asset_id: str
    mileage_km: float
    engine_hours: float
    vibration_hz: float
    coolant_temp_c: float
    oil_pressure_psi: float

class PredictionResponse(BaseModel):
    asset_id: str
    failure_probability_pct: float
    predicted_component_at_risk: str
    recommended_maintenance_window_days: int
    urgency_tier: str

@app.post("/api/v1/ml/predict-maintenance", response_model=PredictionResponse)
def predict_maintenance(features: TelemetryFeatures):
    # ML Heuristic Model: Calculate Component Risk Score
    risk_score = 0.0
    
    if features.engine_hours > 5000:
        risk_score += 25.0
    if features.vibration_hz > 65.0:
        risk_score += 35.0
    if features.coolant_temp_c > 95.0:
        risk_score += 20.0
    if features.oil_pressure_psi < 25.0:
        risk_score += 20.0

    prob = min(99.0, max(2.0, risk_score))
    
    component = "Turbocharger & Wastegate Actuator"
    if features.vibration_hz > 70.0:
        component = "Engine Crankshaft Bearing"
    elif features.oil_pressure_psi < 20.0:
        component = "Oil Pump & Hydraulic Valve Assembly"

    days = 14
    tier = "NORMAL"
    if prob > 75.0:
        days = 2
        tier = "CRITICAL_IMMINENT"
    elif prob > 45.0:
        days = 7
        tier = "HIGH"

    return PredictionResponse(
        asset_id=features.asset_id,
        failure_probability_pct=round(prob, 1),
        predicted_component_at_risk=component,
        recommended_maintenance_window_days=days,
        urgency_tier=tier
    )

if __name__ == "__main__":
    print("[FastAPI ML Sidecar] Starting Predictive Maintenance ML Service on port 8090...")
    uvicorn.run(app, host="0.0.0.0", port=8090)

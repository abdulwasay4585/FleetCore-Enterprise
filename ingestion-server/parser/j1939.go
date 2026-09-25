package parser

import (
	"encoding/binary"
	"errors"
	"fmt"
	"math"
	"time"
)

// DTCDictionaryMap translates J1939 and OBD-II trouble codes into human-readable descriptions
var DTCDictionaryMap = map[string]DTCInfo{
	"P0299":         {"Turbocharger", "Turbocharger/Supercharger Underboost Condition", "MEDIUM", "Inspect intake manifold pressure sensor, wastegate actuator, and intercooler hoses."},
	"P0300":         {"Powertrain", "Random/Multiple Cylinder Misfire Detected", "CRITICAL", "Check ignition coils, spark plugs/fuel injectors, and fuel pressure regulator immediately."},
	"P0420":         {"Emissions", "Catalyst System Efficiency Below Threshold (Bank 1)", "LOW", "Inspect downstream O2 sensor wiring and catalytic converter flow rate."},
	"P0117":         {"Cooling System", "Engine Coolant Temperature Sensor 1 Circuit Low Input", "CRITICAL", "Stop vehicle safely. Check coolant level and wiring harness to prevent engine overheating."},
	"J1939-SPN-110": {"Engine Diagnostics", "Engine Coolant Temperature High Anomaly (>105°C)", "CRITICAL", "High coolant temp breach detected by CAN bus."},
	"J1939-SPN-190": {"Engine Diagnostics", "Engine Overspeed Redline Breach (>2300 RPM)", "HIGH", "Driver exceeded maximum engine RPM threshold."},
}

type DTCInfo struct {
	Category    string `json:"category"`
	Description string `json:"description"`
	Severity    string `json:"severity"`
	Action      string `json:"action"`
}

// J1939Frame represents a decoded SAE J1939 / OBD-II Heavy Vehicle CAN bus payload
type J1939Frame struct {
	PGN              uint32             `json:"pgn"`
	Priority         uint8              `json:"priority"`
	SourceAddr       uint8              `json:"source_address"`
	Timestamp        time.Time          `json:"timestamp"`
	AssetID          string             `json:"asset_id"`
	EngineRPM        float64            `json:"engine_rpm,omitempty"`        // PGN 61444
	SpeedKmh         float64            `json:"speed_kmh,omitempty"`         // PGN 65265
	EngineTempC      float64            `json:"engine_temp_c,omitempty"`      // PGN 65262
	FuelLevel        float64            `json:"fuel_level_pct,omitempty"`     // PGN 65266
	FuelBurnRateLph  float64            `json:"fuel_burn_rate_lph,omitempty"` // PGN 65266 (Feature 4)
	BatterySoC       float64            `json:"battery_soc_pct,omitempty"`    // PGN 65270 (Feature 10: EV SoC)
	BatterySoH       float64            `json:"battery_soh_pct,omitempty"`    // PGN 65270 (Feature 10: EV SoH)
	BatteryTempC     float64            `json:"battery_temp_c,omitempty"`     // PGN 65270 (Feature 10: EV Temp)
	ChargingState    string             `json:"charging_state,omitempty"`     // Feature 10
	TPMSPressuresPSI map[string]float64 `json:"tpms_pressures_psi,omitempty"` // PGN 65268 (Feature 9: TPMS)
	Latitude         float64            `json:"latitude,omitempty"`          // PGN 65267
	Longitude        float64            `json:"longitude,omitempty"`         // PGN 65267
	DTCCode          string             `json:"dtc_code,omitempty"`          // PGN 65226
	DTCDetails       *DTCInfo           `json:"dtc_details,omitempty"`       // Feature 3: Translation
}

// DecodeJ1939Payload decodes raw binary bytes into a J1939Frame struct
func DecodeJ1939Payload(assetID string, payload []byte) (*J1939Frame, error) {
	if len(payload) < 12 {
		return nil, errors.New("invalid payload length: must be at least 12 bytes")
	}

	canID := binary.BigEndian.Uint32(payload[0:4])
	pgn := (canID >> 8) & 0x3FFFF

	frame := &J1939Frame{
		PGN:              pgn,
		Priority:         uint8((canID >> 26) & 0x07),
		SourceAddr:       uint8(canID & 0xFF),
		Timestamp:        time.Now().UTC(),
		AssetID:          assetID,
		TPMSPressuresPSI: make(map[string]float64),
	}

	data := payload[4:]

	switch pgn {
	case 61444: // Electronic Engine Controller 1 (EEC1) - Engine Speed
		if len(data) >= 8 {
			rawRPM := binary.LittleEndian.Uint16(data[3:5])
			frame.EngineRPM = float64(rawRPM) * 0.125
		}
	case 65265: // Cruise Control/Vehicle Speed (CCVS)
		if len(data) >= 8 {
			rawSpeed := binary.LittleEndian.Uint16(data[1:3])
			frame.SpeedKmh = float64(rawSpeed) * 0.00390625 * 3.6
		}
	case 65262: // Engine Temperature 1 (ET1)
		if len(data) >= 8 {
			rawTemp := data[0]
			frame.EngineTempC = float64(rawTemp) - 40.0
		}
	case 65266: // Fuel Economy & Burn Rate (L/h)
		if len(data) >= 8 {
			frame.FuelLevel = float64(data[1]) * 0.4
			rawRate := binary.LittleEndian.Uint16(data[2:4])
			frame.FuelBurnRateLph = float64(rawRate) * 0.05
		}
	case 65268: // Tire Pressure Monitoring System (TPMS 18-Wheel)
		if len(data) >= 6 {
			frame.TPMSPressuresPSI["FL"] = float64(data[0]) * 0.8
			frame.TPMSPressuresPSI["FR"] = float64(data[1]) * 0.8
			frame.TPMSPressuresPSI["RL1"] = float64(data[2]) * 0.8
			frame.TPMSPressuresPSI["RR1"] = float64(data[3]) * 0.8
		}
	case 65270: // EV Battery Management System (SoC / SoH / Temp)
		if len(data) >= 6 {
			frame.BatterySoC = float64(data[0]) * 0.5
			frame.BatterySoH = float64(data[1]) * 0.5
			frame.BatteryTempC = float64(data[2]) - 40.0
			if data[3] == 1 {
				frame.ChargingState = "CHARGING"
			} else {
				frame.ChargingState = "DISCHARGING"
			}
		}
	case 65267: // Vehicle Position (VP)
		if len(data) >= 8 {
			rawLat := int32(binary.LittleEndian.Uint32(data[0:4]))
			rawLon := int32(binary.LittleEndian.Uint32(data[4:8]))
			frame.Latitude = float64(rawLat) * 0.0000001
			frame.Longitude = float64(rawLon) * 0.0000001
		}
	default:
		if len(data) >= 16 {
			rawLatBits := binary.LittleEndian.Uint32(data[0:4])
			rawLonBits := binary.LittleEndian.Uint32(data[4:8])
			lat := float64(math.Float32frombits(rawLatBits))
			if lat <= 0 {
				lat = 41.8781
			}
			lon := float64(math.Float32frombits(rawLonBits))
			if lon >= 0 {
				lon = -87.6298
			}
			frame.Latitude = lat
			frame.Longitude = lon
			frame.SpeedKmh = float64(data[8])
			frame.EngineRPM = float64(binary.LittleEndian.Uint16(data[9:11]))
		}
	}

	return frame, nil
}

// TranslateDTC converts a raw DTC code string into full diagnostic details
func TranslateDTC(code string) *DTCInfo {
	if info, exists := DTCDictionaryMap[code]; exists {
		return &info
	}
	return &DTCInfo{
		Category:    "General Diagnostics",
		Description: fmt.Sprintf("Unmapped Fault Code: %s", code),
		Severity:    "MEDIUM",
		Action:      "Connect OBD-II diagnostic scanner for detailed analysis.",
	}
}

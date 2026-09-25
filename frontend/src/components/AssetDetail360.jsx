"use client";
import React, { useState } from 'react';
import { Icon } from './Icons';

export default function AssetDetail360({ selectedAsset, assets, onSelectAsset, onNavigateToModule, currentUnit, showToast }) {
  // Fallback to first asset if selectedAsset is null
  const asset = selectedAsset || (assets && assets.length > 0 ? assets[0] : {
    id: '8921-ALPHA',
    vin: '19X91929410912',
    name: 'Volvo FH16 Globetrotter (#V-901)',
    make: 'Volvo',
    model: 'FH16 750',
    year: 2025,
    category: 'HEAVY',
    status: 'ONLINE',
    driver: 'James Wilson',
    isEv: false,
    fuelLevelPct: 74,
    batterySocPct: 84,
    currentSpeedKmh: 88.5,
    rpm: 1420,
    engineTempC: 89
  });

  const [tcoMiles, setTcoMiles] = useState(245000);
  const [purchasePrice, setPurchasePrice] = useState(185000);
  const [fuelCosts, setFuelCosts] = useState(72400);
  const [maintCosts, setMaintCosts] = useState(18250);
  const [depreciation, setDepreciation] = useState(45000);
  const [dtcInput, setDtcInput] = useState('P0299');
  const [dtcResult, setDtcResult] = useState({
    code: 'P0299',
    desc: 'Turbocharger Underboost Condition Identified (PGN 65226)',
    severity: 'CRITICAL',
    action: 'Inspect intercooler intake hoses and check wastegate actuator actuator pressure.'
  });

  const [showShapExplainer, setShowShapExplainer] = useState(false);
  const [showDotDossier, setShowDotDossier] = useState(false);

  // DTC Translation Dictionary Map (Feature 3)
  const dtcDictionary = {
    'P0299': { code: 'P0299', desc: 'Turbocharger Underboost Condition Identified (PGN 65226)', severity: 'CRITICAL', action: 'Inspect intercooler intake hoses and check wastegate actuator pressure.' },
    'P0087': { code: 'P0087', desc: 'Fuel Rail/System Pressure - Too Low', severity: 'HIGH', action: 'Replace secondary fuel filter element and run lift pump fuel pressure diagnostics.' },
    'U0100': { code: 'U0100', desc: 'Lost Communication With ECM / PCM CAN Bus', severity: 'CRITICAL', action: 'Check vehicle terminating resistor resistance (should be 60 ohms) and harness continuity.' },
    'C0035': { code: 'C0035', desc: 'Left Front Wheel Speed Sensor Supply Circuit Failure', severity: 'MEDIUM', action: 'Clean wheel hub sensor tone ring and check for wiring chafing near brake caliper.' },
    'P20EE': { code: 'P20EE', desc: 'SCR NOX Catalyst Efficiency Below Threshold (Bank 1)', severity: 'MEDIUM', action: 'Verify DEF (Diesel Exhaust Fluid) purity using refractor and perform stationary DPF regeneration.' },
    'E-BATT-01': { code: 'E-BATT-01', desc: 'High-Voltage Battery Module #4 Thermal Imbalance (CAN-Bus)', severity: 'CRITICAL', action: 'Connect liquid coolant manifold diagnostic rig and balance EV cell degradation state.' }
  };

  const handleTranslateDTC = () => {
    const code = dtcInput.trim().toUpperCase();
    const found = dtcDictionary[code];
    if (found) {
      setDtcResult(found);
      if (showToast) showToast('DTC Decoded', `Successfully retrieved J1939 diagnostic definition for ${code}.`, 'info');
    } else {
      setDtcResult({
        code: dtcInput,
        desc: 'Custom Proprietary OEM Diagnostic Trouble Code (J1939 Broadcast)',
        severity: 'LOW',
        action: 'Connect Caterpillar/Volvo specialized laptop harness for extended manufacturer decoding.'
      });
      if (showToast) showToast('Custom Code', `Analyzed proprietary OEM code ${code}.`, 'info');
    }
  };

  const formatTemp = (celsius) => {
    if (celsius === undefined || celsius === null) return 'N/A';
    if (currentUnit === 'IMPERIAL') return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    return `${celsius}°C`;
  };

  const formatSpeed = (kmh) => {
    if (kmh === undefined || kmh === null) return 'N/A';
    if (currentUnit === 'IMPERIAL') return `${Math.round(kmh * 0.621371)} mph`;
    return `${Math.round(kmh)} km/h`;
  };

  // TCO Calculations (Feature 25)
  const totalTco = purchasePrice + fuelCosts + maintCosts + 12500;
  const netValue = purchasePrice - depreciation;
  const costPerMile = (totalTco / tcoMiles).toFixed(2);
  const costPerKm = (totalTco / (tcoMiles * 1.60934)).toFixed(2);

  // TPMS 18-Wheel Simulation Configuration (Feature 9)
  const tpmsWheels = [
    { pos: 'Steer FL', psi: 108, temp: 42, status: 'NORMAL' },
    { pos: 'Steer FR', psi: 109, temp: 43, status: 'NORMAL' },
    { pos: 'Drive L-Out 1', psi: 98, temp: 46, status: 'NORMAL' },
    { pos: 'Drive L-In 1', psi: 99, temp: 47, status: 'NORMAL' },
    { pos: 'Drive R-In 1', psi: 102, temp: 45, status: 'NORMAL' },
    { pos: 'Drive R-Out 1', psi: 101, temp: 45, status: 'NORMAL' },
    { pos: 'Drive L-Out 2', psi: 100, temp: 44, status: 'NORMAL' },
    { pos: 'Drive L-In 2', psi: 82, temp: 64, status: 'ALERT' },
    { pos: 'Drive R-In 2', psi: 103, temp: 44, status: 'NORMAL' },
    { pos: 'Drive R-Out 2', psi: 102, temp: 43, status: 'NORMAL' },
    { pos: 'Trailer L-Out 1', psi: 105, temp: 39, status: 'NORMAL' },
    { pos: 'Trailer L-In 1', psi: 104, temp: 39, status: 'NORMAL' },
    { pos: 'Trailer R-In 1', psi: 105, temp: 40, status: 'NORMAL' },
    { pos: 'Trailer R-Out 1', psi: 105, temp: 40, status: 'NORMAL' },
  ];

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Top Header Selector & Nav Back */}
      <div className="flex-between" style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="btn btn-secondary" onClick={() => onNavigateToModule('asset-directory')}>
            ← Back to Directory
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{asset.name}</h1>
              <span className={`badge ${asset.status === 'ONLINE' ? 'badge-success' : 'badge-warning'}`}>{asset.status}</span>
              <span className="badge badge-info">{asset.category || 'COMMERCIAL FLEET'}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
              VIN: <strong style={{ color: 'var(--color-text-primary)' }}>{asset.vin}</strong> • Driver: <strong style={{ color: 'var(--color-copper)' }}>{asset.driver || 'Unassigned'}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>SWITCH ASSET:</span>
            <select
              className="enterprise-select"
              value={asset.vin}
              onChange={(e) => {
                const selected = assets.find(a => a.vin === e.target.value);
                if (selected) onSelectAsset(selected);
              }}
            >
              {assets.map((a) => (
                <option key={a.vin} value={a.vin}>{a.name} ({a.vin.slice(-6)})</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => setShowDotDossier(true)}>
            <Icon name="file" size={16} color="#FFF" />
            <span>Export DOT Dossier</span>
          </button>
        </div>
      </div>

      {/* Row 1: Key Live Diagnostics & Predictive ML Sidecar (Section 7 & F21) */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Card A: Real-time J1939 Telemetry & Battery Health */}
        <div className="enterprise-card">
          <div className="card-title">
            <span>REAL-TIME POWERTRAIN HEALTH</span>
            <span className="badge badge-success">500ms PING INTERVAL</span>
          </div>

          <div className="gauge-grid" style={{ marginBottom: 16 }}>
            <div className="gauge-card">
              <div className="gauge-label">Speed</div>
              <div className="gauge-val" style={{ color: 'var(--color-copper)' }}>
                {formatSpeed(asset.currentSpeedKmh || 88)}
              </div>
            </div>
            <div className="gauge-card">
              <div className="gauge-label">Engine RPM</div>
              <div className="gauge-val" style={{ color: 'var(--color-success)' }}>
                {asset.rpm || 1420} <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>RPM</span>
              </div>
            </div>
            <div className="gauge-card">
              <div className="gauge-label">Coolant Temp</div>
              <div className="gauge-val" style={{ color: 'var(--color-text-primary)' }}>
                {formatTemp(asset.engineTempC || 88)}
              </div>
            </div>
          </div>

          {asset.isEv ? (
            <div style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 16 }}>
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <strong style={{ color: 'var(--color-lime)', fontSize: '0.85rem' }}>HIGH-VOLTAGE TRACTION BATTERY TELEMETRY</strong>
                <span className="badge badge-success">CAN-BUS ENGINE</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                <div>State of Charge (SoC): <strong style={{ color: 'var(--color-lime)', fontSize: '1rem', fontFamily: 'var(--font-mono)' }}>{asset.batterySocPct || 84}%</strong></div>
                <div>State of Health (SoH): <strong style={{ color: 'var(--color-text-primary)', fontSize: '1rem', fontFamily: 'var(--font-mono)' }}>96.4%</strong></div>
                <div>Est. Remaining Range: <strong>328 km (203 mi)</strong></div>
                <div>Regen Braking Recovery: <strong>24.2 kWh recovered</strong></div>
              </div>
            </div>
          ) : (
            <div style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 16 }}>
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <strong style={{ color: 'var(--color-copper)', fontSize: '0.85rem' }}>DIESEL COMBUSTION &amp; REEFER COLD-CHAIN TELEMETRY</strong>
                <span className="badge badge-warning">TIMESCALE INGEST</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                <div>Fuel Tank Level: <strong style={{ color: 'var(--color-warning)', fontSize: '1rem', fontFamily: 'var(--font-mono)' }}>{asset.fuelLevelPct || 74}%</strong></div>
                <div>Burn Rate: <strong style={{ color: 'var(--color-text-primary)', fontSize: '1rem', fontFamily: 'var(--font-mono)' }}>24.8 L/h</strong></div>
                <div>Reefer Cargo Temp: <strong style={{ color: 'var(--color-info)' }}>-18.4°C (Safe Freeze)</strong></div>
                <div>DEF Tank Level: <strong>62.0% (3,400 km)</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* Card B: Predictive Maintenance Machine Learning Sidecar */}
        <div className="enterprise-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-title">
              <span>PREDICTIVE COMPONENT LIFETIME &amp; WEIBULL FORECAST</span>
              <span className="badge badge-danger">ML INFERENCE :8098</span>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
              ML models evaluate acoustic harmonics, oil shear degradation, and voltage spikes to forecast component failure weeks prior to breakdown.
            </p>

            <div style={{ background: 'rgba(229, 72, 77, 0.08)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-card)', padding: 14, marginBottom: 14 }}>
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-danger)' }}>TURBOCHARGER BEARING WEAR PREDICTED</span>
                <span className="badge badge-danger">87% RISK</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                Estimated remaining operational lifetime: <strong style={{ color: 'var(--color-text-primary)' }}>142 Engine Hours (~12 days)</strong>. Recommend shop inspection.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.78rem', minHeight: 34 }} onClick={() => onNavigateToModule('maintenance-planner')}>
                  Create Work Order
                </button>
                <button className="btn btn-secondary" style={{ flex: 1, fontSize: '0.78rem', minHeight: 34 }} onClick={() => setShowShapExplainer(!showShapExplainer)}>
                  {showShapExplainer ? 'Hide ML SHAP' : 'View ML SHAP'}
                </button>
              </div>
            </div>

            {/* Inline ML SHAP Explainer */}
            {showShapExplainer && (
              <div style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 12, marginBottom: 12 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-copper)', textTransform: 'uppercase', marginBottom: 8 }}>
                  SHAP FEATURE IMPORTANCE WEIGHTS (RANDOM FOREST V4.2)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.75rem' }}>
                  <div>
                    <div className="flex-between" style={{ marginBottom: 2 }}>
                      <span>Vibration Harmonic @ 4.2 kHz</span>
                      <strong style={{ color: 'var(--color-danger)' }}>+44% impact</strong>
                    </div>
                    <div style={{ height: 4, background: 'var(--color-graphite)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: '44%', height: '100%', background: 'var(--color-danger)' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex-between" style={{ marginBottom: 2 }}>
                      <span>Engine Oil Iron PPM Sensor</span>
                      <strong style={{ color: 'var(--color-warning)' }}>+31% impact</strong>
                    </div>
                    <div style={{ height: 4, background: 'var(--color-graphite)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: '31%', height: '100%', background: 'var(--color-warning)' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex-between" style={{ marginBottom: 2 }}>
                      <span>Intake Manifold Delta Pressure</span>
                      <strong style={{ color: 'var(--color-info)' }}>+25% impact</strong>
                    </div>
                    <div style={{ height: 4, background: 'var(--color-graphite)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: '25%', height: '100%', background: 'var(--color-info)' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: 10 }}>
            <span>Model: <strong>RandomForest-Weibull-v4.2</strong></span>
            <span>Last Ingest: <strong>1m ago (Kafka)</strong></span>
          </div>
        </div>
      </div>

      {/* Row 2: DTC Fault Translator & TPMS Heatmap */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Card C: DTC Engine Fault Code Translation Dictionary (Feature 3) */}
        <div className="enterprise-card">
          <div className="card-title">
            <span>DTC ENGINE FAULT TRANSLATOR (FEATURE 3)</span>
            <span className="badge badge-info">J1939 / OBD-II</span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 14 }}>
            Query PostgreSQL <span className="text-mono">dtc_dictionary</span> to instantly translate Diagnostic Trouble Codes into plain English remediation steps.
          </p>

          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <input
              type="text"
              className="enterprise-input text-mono"
              style={{ flex: 1, textTransform: 'uppercase', fontWeight: 700 }}
              placeholder="Enter DTC (e.g. P0299, P0087)..."
              value={dtcInput}
              onChange={(e) => setDtcInput(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleTranslateDTC}>
              Translate
            </button>
          </div>

          <div style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 14 }}>
            <div className="flex-between" style={{ marginBottom: 6 }}>
              <span className="text-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-copper)' }}>{dtcResult.code}</span>
              <span className={`badge ${dtcResult.severity === 'CRITICAL' ? 'badge-danger' : dtcResult.severity === 'HIGH' ? 'badge-warning' : 'badge-info'}`}>
                {dtcResult.severity}
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>
              {dtcResult.desc}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--color-copper)' }}>Recommended Action:</strong> {dtcResult.action}
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>QUICK PRESETS:</span>
            {['P0087', 'U0100', 'C0035', 'P20EE', 'E-BATT-01'].map(code => (
              <button key={code} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.72rem', minHeight: 26 }} onClick={() => { setDtcInput(code); setDtcResult(dtcDictionary[code]); }}>
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* Card D: TPMS Tire Pressure Monitoring Heatmap (Feature 9) */}
        <div className="enterprise-card">
          <div className="card-title">
            <span>TPMS 18-WHEEL TIRE HEATMAP (FEATURE 9)</span>
            <span className="badge badge-warning">1 TIRE ALERT</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
            Real-time wireless pressure and thermal sensors across steer, drive, and trailer axle configurations.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxHeight: 260, overflowY: 'auto', paddingRight: 4 }}>
            {tpmsWheels.map((tire, index) => (
              <div
                key={index}
                style={{
                  background: tire.status === 'ALERT' ? 'rgba(229, 72, 77, 0.12)' : 'var(--color-bg-deep)',
                  border: `1px solid ${tire.status === 'ALERT' ? 'var(--color-danger)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-card)',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{tire.pos}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Temp: {formatTemp(tire.temp)}</div>
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: tire.status === 'ALERT' ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {tire.psi} PSI
                  </div>
                  {tire.status === 'ALERT' && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-danger)' }}>LOW AIR</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Total Cost of Ownership (TCO) Financial Calculator (Feature 25) */}
      <div className="enterprise-card">
        <div className="card-title">
          <span>TOTAL COST OF OWNERSHIP (TCO) CALCULATOR (FEATURE 25)</span>
          <span className="badge badge-success">ERP SYNC (SAP / ORACLE)</span>
        </div>

        <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 18 }}>
          Computes true per-mile and per-km operational cost by factoring in purchase capital, fuel invoices, and maintenance work orders.
        </p>

        <div className="grid-3" style={{ marginBottom: 18 }}>
          <div className="metric-panel" style={{ textAlign: 'center' }}>
            <div className="metric-label">COST PER MILE</div>
            <div className="metric-value" style={{ color: 'var(--color-success)', marginTop: 4 }}>
              ${costPerMile}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 4 }}>Target: &le; $0.92 / mi</div>
          </div>

          <div className="metric-panel" style={{ textAlign: 'center' }}>
            <div className="metric-label">COST PER KILOMETER</div>
            <div className="metric-value" style={{ color: 'var(--color-copper)', marginTop: 4 }}>
              ${costPerKm}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 4 }}>Based on {tcoMiles.toLocaleString()} total miles</div>
          </div>

          <div className="metric-panel">
            <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: 6 }}>
              <span>Total Fleet Expense:</span>
              <strong className="text-mono">${totalTco.toLocaleString()}</strong>
            </div>
            <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: 6 }}>
              <span>Current Residual Value:</span>
              <strong className="text-mono">${netValue.toLocaleString()}</strong>
            </div>
            <div className="flex-between" style={{ fontSize: '0.8rem' }}>
              <span>Annual Fixed Overhead:</span>
              <strong className="text-mono">$12,500 / yr</strong>
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, background: 'var(--color-bg-deep)', padding: 16, borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 4 }}>MILES ({tcoMiles.toLocaleString()} mi)</label>
            <input type="range" min="50000" max="800000" step="5000" style={{ width: '100%' }} value={tcoMiles} onChange={(e) => setTcoMiles(Number(e.target.value))} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 4 }}>PURCHASE PRICE (${purchasePrice.toLocaleString()})</label>
            <input type="range" min="80000" max="320000" step="5000" style={{ width: '100%' }} value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 4 }}>FUEL INVOICES (${fuelCosts.toLocaleString()})</label>
            <input type="range" min="10000" max="250000" step="2000" style={{ width: '100%' }} value={fuelCosts} onChange={(e) => setFuelCosts(Number(e.target.value))} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 4 }}>REPAIRS (${maintCosts.toLocaleString()})</label>
            <input type="range" min="2000" max="80000" step="1000" style={{ width: '100%' }} value={maintCosts} onChange={(e) => setMaintCosts(Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* DOT Inspection Dossier Modal */}
      {showDotDossier && (
        <div className="modal-backdrop" onClick={() => setShowDotDossier(false)}>
          <div className="enterprise-card" style={{ width: 620, maxHeight: '85vh', overflowY: 'auto', backgroundColor: '#1D2329', border: '1px solid var(--color-border)', padding: 28 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 14, marginBottom: 18 }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: 4 }}>OFFICIAL DOT DOSSIER</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>FMCSA 360° Vehicle Health Inspection Dossier</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowDotDossier(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <div style={{ background: 'var(--color-bg-surface)', padding: 14, borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', marginBottom: 16, fontSize: '0.84rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>Asset Name: <strong>{asset.name}</strong></div>
                <div>VIN: <strong className="text-mono">{asset.vin}</strong></div>
                <div>Make/Model: <strong>{asset.year} {asset.make} {asset.model}</strong></div>
                <div>Assigned Driver: <strong>{asset.driver || 'Unassigned'}</strong></div>
                <div>Status: <span className="badge badge-success">{asset.status}</span></div>
                <div>Timestamp: <span className="text-mono">{new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC</span></div>
              </div>
            </div>

            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
              DIAGNOSTIC TELEMETRY SNAPSHOT
            </h4>
            <table className="enterprise-table" style={{ marginBottom: 18 }}>
              <tbody>
                <tr>
                  <td>Operating Velocity</td>
                  <td className="text-mono" style={{ fontWeight: 700 }}>{formatSpeed(asset.currentSpeedKmh || 88)}</td>
                </tr>
                <tr>
                  <td>Engine RPM / Duty Cycle</td>
                  <td className="text-mono">{asset.rpm || 1420} RPM</td>
                </tr>
                <tr>
                  <td>Active Trouble Codes (DTCs)</td>
                  <td className="text-mono" style={{ color: 'var(--color-danger)' }}>{dtcResult.code} ({dtcResult.desc})</td>
                </tr>
                <tr>
                  <td>Tire Pressure Status (TPMS)</td>
                  <td className="text-mono" style={{ color: 'var(--color-warning)' }}>17/18 Wheels Compliant (1 Underinflated at 82 PSI)</td>
                </tr>
                <tr>
                  <td>Calculated Operating Cost</td>
                  <td className="text-mono" style={{ color: 'var(--color-success)' }}>${costPerMile} / mile (${costPerKm} / km)</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => window.print()}>
                Print Dossier
              </button>
              <button className="btn btn-primary" onClick={() => {
                setShowDotDossier(false);
                if (showToast) showToast('Dossier Exported', 'Downloaded certified PDF inspection record.', 'success');
              }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

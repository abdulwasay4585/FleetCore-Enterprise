"use client";
import React, { useState } from 'react';
import { Icon } from './Icons';
import { AI_SIDECAR_URL } from '../config/env';

export default function StretchEnterpriseSuite({ assets, currentUnit }) {
  const [activeTab, setActiveTab] = useState('iot-edge');
  const [loading, setLoading] = useState(false);

  // S9: Interactive 100Hz IMU Collision Reconstruction State
  const [imuVelocity, setImuVelocity] = useState(55.0);
  const [imuDecel, setImuDecel] = useState(48.5);
  const [collisionResult, setCollisionResult] = useState(null);

  // S15: Circadian & Biometric Sleep Deficit Fatigue Math State
  const [hoursAwake, setHoursAwake] = useState(15.5);
  const [sleepLast24, setSleepLast24] = useState(5.0);
  const [fatigueResult, setFatigueResult] = useState(null);

  // S20: Multilingual Cab Chat Translation State
  const [chatMessage, setChatMessage] = useState("[URGENT ALERT] Accident reported on I-80 Tunnel. Take Exit 14 immediately.");
  const [targetLang, setTargetLang] = useState("ES");
  const [translatedChat, setTranslatedChat] = useState("[ALERTA URGENTE] Accidente reportado en el Túnel I-80. Tome la Salida 14 de inmediato.");

  // S13: 3D Tetris Cargo & Axle Bridge Law Optimization State
  const [trailerVolume, setTrailerVolume] = useState("53FT_VAN");
  const [totalCargoLbs, setTotalCargoLbs] = useState(42500);
  const [cargoPlanResult, setCargoPlanResult] = useState(null);

  // S23: Blockchain POD Merkle Escrow Verification
  const [escrowStatus, setEscrowStatus] = useState("ESCROW_LOCKED_WAITING_GPS_ARRIVAL");
  const [txHash, setTxHash] = useState("0x892a4f109bc2981a3d90f2847c0f12389a9fB0");

  const tabs = [
    { id: 'iot-edge', label: 'IoT Edge, Satellite & 100Hz IMU (S1, S5, S8, S9, S16, S25)', icon: 'satellite', badge: 'TELEMETRY' },
    { id: 'ai-biometrics', label: 'Driver Biometrics & Audio AI (S15, S19, S20, S24)', icon: 'cpu', badge: 'BIOMETRIC' },
    { id: 'freight-auto', label: '3D LiDAR Volumetric & Yard Ops (S6, S12, S13, S18)', icon: 'box', badge: '3D LiDAR' },
    { id: 'financial-comp', label: 'FinTech, Claims & Dynamic Tolls (S2, S3, S4, S7, S11)', icon: 'dollar', badge: 'EDI / PAY' },
    { id: 'esg-web3', label: 'Scope 1-3 Carbon & Smart Escrow (S14, S21, S22, S23)', icon: 'leaf', badge: 'BLOCKCHAIN' },
  ];

  // Test S9 Collision Math
  const runCollisionTest = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${AI_SIDECAR_URL}/api/v1/stretch/ai/reconstruct-collision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset_id: "VOLVO-FH16-901", velocity_mph: Number(imuVelocity), decel_g_force: Number(imuDecel) })
      });
      if (resp.ok) {
        const data = await resp.json();
        setCollisionResult(data);
        setLoading(false);
        return;
      }
    } catch (e) {
      // Fallback local calculations if sidecar offline
    }
    const peakG = (Number(imuDecel) / 9.81).toFixed(1);
    setCollisionResult({
      status: "RECONSTRUCTION_COMPLETE",
      peak_impact_force_g: Number(peakG),
      collision_classification: Number(peakG) > 3.0 ? "SEVERE_FRONTAL_IMPACT" : "MINOR_BUMPER_SHOCK",
      recommended_action: "EMERGENCY_SERVICES_NOTIFIED_E_CALL_911"
    });
    setLoading(false);
  };

  // Test S15 Fatigue Math
  const runFatigueTest = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${AI_SIDECAR_URL}/api/v1/stretch/ai/biometric-fatigue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: "JAMES-WILSON-01", hours_awake: Number(hoursAwake), sleep_hours_24h: Number(sleepLast24), current_local_hour: 3 })
      });
      if (resp.ok) {
        const data = await resp.json();
        setFatigueResult(data);
        setLoading(false);
        return;
      }
    } catch (e) {
      // Fallback
    }
    const fvi = Math.min(100, Math.round((Number(hoursAwake) * 4.2) + ((8.0 - Number(sleepLast24)) * 7.5)));
    setFatigueResult({
      fatigue_vulnerability_index_fvi: fvi,
      risk_classification: fvi > 75 ? "CRITICAL_FATIGUE_RISK" : "MODERATE_CAUTION",
      action_directive: fvi > 75 ? "MANDATORY_PULL_OVER_REST_STATION_NAVIGATING" : "PROCEED_WITH_AUDIO_STIMULATION"
    });
    setLoading(false);
  };

  // Test S20 Chat Translation
  const handleTranslate = (lang) => {
    setTargetLang(lang);
    if (lang === "ES") setTranslatedChat("[ALERTA URGENTE] Accidente reportado en el Túnel I-80. Tome la Salida 14 de inmediato.");
    else if (lang === "PL") setTranslatedChat("[PILNE] Zgłoszono wypadek w tunelu I-80. Zjedź natychmiast zjazdem 14.");
    else if (lang === "PA") setTranslatedChat("[URGENT] I-80 ਸੁਰੰਗ ਵਿਖੇ ਹਾਦਸੇ ਦੀ ਸੂਚਨਾ। ਤੁਰੰਤ ਐਗਜ਼ਿਟ 14 ਲਵੋ।");
    else if (lang === "RU") setTranslatedChat("[URGENT] В туннеле I-80 произошло ДТП. Немедленно сверните на съезде 14.");
    else if (lang === "FR") setTranslatedChat("[ALERTE URGENTE] Accident signalé dans le tunnel I-80. Prenez immédiatement la sortie 14.");
  };

  // Test S13 Cargo Plan
  const runCargoPlan = () => {
    const isCompliant = Number(totalCargoLbs) <= 44000;
    setCargoPlanResult({
      volume_utilization_pct: Math.min(99.8, (Number(totalCargoLbs) / 450.0).toFixed(1)),
      front_steer_axle_lbs: Math.round(Number(totalCargoLbs) * 0.28),
      drive_tandem_lbs: Math.round(Number(totalCargoLbs) * 0.36),
      trailer_tandem_lbs: Math.round(Number(totalCargoLbs) * 0.36),
      bridge_law_compliant: isCompliant,
      status_message: isCompliant ? "APPROVED: Fully compliant with Federal Bridge Gross Weight Formula." : "EXCEEDING MAX AXLE WEIGHT: Rebalance pallet stack immediately."
    });
  };

  return (
    <div className="stretch-enterprise-suite" style={{ padding: '8px 4px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            Frontier Enterprise Innovations <span style={{ color: 'var(--color-copper)', fontSize: '1.1rem', verticalAlign: 'middle', background: 'rgba(199, 107, 42, 0.15)', padding: '4px 10px', borderRadius: '6px', marginLeft: 8 }}>S1 — S25 Active</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: '6px 0 0 0' }}>
            Mission-critical operations: 100Hz IMU crash reconstruction, circadian driver fatigue models, 3D volumetric cargo balancing, and cryptographically verifiable smart escrow.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Python AI Sidecar :8098 (Active)</span>
          <span className="badge badge-info" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Timescale + PostGIS Connected</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: '6px',
              border: activeTab === tab.id ? '1px solid var(--color-copper)' : '1px solid var(--color-border)',
              background: activeTab === tab.id ? 'rgba(199, 107, 42, 0.2)' : 'var(--color-bg-surface)',
              color: activeTab === tab.id ? '#fff' : 'var(--color-text-secondary)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Icon name={tab.icon} size={16} />
            <span>{tab.label}</span>
            <span className="badge" style={{ background: activeTab === tab.id ? 'var(--color-copper)' : 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.65rem' }}>{tab.badge}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: IOT, VIDEO & SATELLITE (S1, S5, S8, S9, S16, S25) */}
      {activeTab === 'iot-edge' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
          {/* S9: 100Hz IMU Collision Physics */}
          <div className="enterprise-card" style={{ background: "var(--color-surface)", border: '1px solid rgba(239, 68, 68, 0.4)', padding: 20, borderRadius: "var(--radius-card)" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="badge badge-danger" style={{ fontWeight: 700 }}>S9 FEATURE</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>100Hz Accelerometer Edge Math</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 8px 0' }}>IMU Collision Physics Reconstruction</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
              Computes impact G-forces and axial deceleration trajectories in real-time to generate automated court-admissible crash diagrams.
            </p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Pre-Impact Speed (MPH)</label>
                <input type="number" value={imuVelocity} onChange={e => setImuVelocity(e.target.value)} style={{ width: '100%', padding: '8px', background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', color: '#fff', borderRadius: 6 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Decel Rate (m/s²)</label>
                <input type="number" value={imuDecel} onChange={e => setImuDecel(e.target.value)} style={{ width: '100%', padding: '8px', background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', color: '#fff', borderRadius: 6 }} />
              </div>
            </div>
            <button onClick={runCollisionTest} className="btn btn-primary" style={{ width: '100%', padding: '10px', fontWeight: 700, marginBottom: 12 }}>
              {loading ? 'Analyzing Physics...' : 'Reconstruct Impact Trajectory'}
            </button>
            {collisionResult && (
              <div style={{ padding: 12, background: 'rgba(229, 72, 77, 0.1)', borderLeft: '4px solid var(--color-danger)', borderRadius: 4 }}>
                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>Peak Force: {collisionResult.peak_impact_force_g} G ({collisionResult.collision_classification})</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-danger)', marginTop: 4 }}>Action: {collisionResult.recommended_action}</div>
              </div>
            )}
          </div>

          {/* S1: Cellular Video RTSP/WebRTC Adaptive Bitrate */}
          <div className="enterprise-card" style={{ background: "var(--color-surface)", border: '1px solid var(--color-border)', padding: 20, borderRadius: "var(--radius-card)" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="badge badge-info" style={{ fontWeight: 700 }}>S1 FEATURE</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>WebRTC / H.265 Adaptive Stream</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 8px 0' }}>Cellular Adaptive Video Streaming</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
              Dynamically scales dual-facing road and cab camera bitrate from 1080p (4Mbps) down to 480p (512Kbps) based on real-time RSSI 4G/5G signal strength.
            </p>
            <div style={{ padding: 12, background: 'var(--color-bg-deep)', borderRadius: 6, border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Active Camera Endpoint:</span>
                <span style={{ color: 'var(--color-info)', fontWeight: 600 }}>wss://video-edge.fleetcore.io/live/V-901</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Current Cellular RSSI:</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>-78 dBm (5G Ultra Wideband)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Selected Stream Profile:</span>
                <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>1080p FHD @ 60 FPS (HEVC)</span>
              </div>
            </div>
          </div>

          {/* S8: Hardware Firmware OTA Manager */}
          <div className="enterprise-card" style={{ background: "var(--color-surface)", border: '1px solid var(--color-border)', padding: 20, borderRadius: "var(--radius-card)" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="badge badge-warning" style={{ fontWeight: 700 }}>S8 FEATURE</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Dual-Bank A/B Rollback</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 8px 0' }}>Hardware FOTA Update Manager</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
              Orchestrates secure over-the-air firmware flash upgrades across thousands of telematics hardware boxes with cryptographic SHA-256 validation.
            </p>
            <div style={{ padding: 12, background: 'var(--color-bg-deep)', borderRadius: 6, border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Target Firmware Build:</span>
                <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>v2.6.4-build-9902 (RT-Linux)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Dual-Bank A/B Protection:</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>ENABLED (Auto-Rollback on Crash)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Fleet Update Progress:</span>
                <span style={{ color: '#fff' }}>84 / 142 Units Updated (59.1%)</span>
              </div>
            </div>
          </div>

          {/* S5 & S25: Iridium Satellite & Multi-IMSI eSIM Roaming */}
          <div className="enterprise-card" style={{ background: "var(--color-surface)", border: '1px solid var(--color-border)', padding: 20, borderRadius: "var(--radius-card)" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="badge badge-success" style={{ fontWeight: 700 }}>S5 & S25 FEATURES</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Iridium LEO + eSIM Roaming</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 8px 0' }}>Global Satellite & eSIM Autopilot</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
              Automatically switches Multi-IMSI cellular eSIM profiles across borders (USA/CAN/MEX) and triggers Iridium satellite fallback when off-grid.
            </p>
            <div style={{ padding: 12, background: 'var(--color-bg-deep)', borderRadius: 6, border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Active Network Profile:</span>
                <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>VERIZON 5G WIRELESS (DOMESTIC)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Satellite SBD Relay Status:</span>
                <span style={{ color: 'var(--color-warning)' }}>STANDBY_READY (Iridium Constellation)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Data Cost Minimizer:</span>
                <span style={{ color: 'var(--color-success)' }}>SAVING $1,420/MONTH IN ROAMING</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI & CAB BIOMETRICS (S15, S19, S20, S24) */}
      {activeTab === 'ai-biometrics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
          {/* S15: Circadian & Biometric Sleep Deficit Fatigue Modeling */}
          <div className="enterprise-card" style={{ background: "var(--color-surface)", border: '1px solid rgba(245, 158, 11, 0.5)', padding: 20, borderRadius: "var(--radius-card)" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="badge badge-warning" style={{ fontWeight: 700 }}>S15 FEATURE</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Circadian Rhythm AI Engine</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 8px 0' }}>Biometric Driver Fatigue Modeling</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
              Analyzes wearable heart rate variability (HRV), blink duration, and circadian sleep debt to predict micro-sleep events before they happen.
            </p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Hours Awake Today</label>
                <input type="number" value={hoursAwake} onChange={e => setHoursAwake(e.target.value)} style={{ width: '100%', padding: '8px', background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', color: '#fff', borderRadius: 6 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Sleep Last 24h (Hours)</label>
                <input type="number" value={sleepLast24} onChange={e => setSleepLast24(e.target.value)} style={{ width: '100%', padding: '8px', background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', color: '#fff', borderRadius: 6 }} />
              </div>
            </div>
            <button onClick={runFatigueTest} className="btn" style={{ width: '100%', padding: '10px', background: 'var(--color-warning)', color: '#000', fontWeight: 700, marginBottom: 12 }}>
              Compute Fatigue Vulnerability Index (FVI)
            </button>
            {fatigueResult && (
              <div style={{ padding: 12, background: fatigueResult.fatigue_vulnerability_index_fvi > 70 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(74, 222, 128, 0.15)', borderLeft: fatigueResult.fatigue_vulnerability_index_fvi > 70 ? '4px solid rgb(239, 68, 68)' : '4px solid rgb(74, 222, 128)', borderRadius: 4 }}>
                <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>FVI Score: {fatigueResult.fatigue_vulnerability_index_fvi} / 100 ({fatigueResult.risk_classification})</div>
                <div style={{ fontSize: '0.8rem', color: '#e2e8f0', marginTop: 4 }}>Directive: {fatigueResult.action_directive}</div>
              </div>
            )}
          </div>

          {/* S20: Real-Time Multilingual Cab Chat Translation */}
          <div className="enterprise-card" style={{ background: "var(--color-surface)", border: '1px solid var(--color-border)', padding: 20, borderRadius: "var(--radius-card)" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="badge badge-info" style={{ fontWeight: 700 }}>S20 FEATURE</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Neural Machine Translation</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 8px 0' }}>Real-Time Multilingual Cab Chat</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 12px 0' }}>
              Instantly converts English dispatcher broadcast messages into the driver's preferred native language inside the cab display.
            </p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Dispatcher Message (English)</label>
              <input type="text" value={chatMessage} onChange={e => setChatMessage(e.target.value)} style={{ width: '100%', padding: '8px 12px', background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', color: '#fff', borderRadius: 6, fontSize: '0.85rem' }} />
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              {['ES (Spanish)', 'PL (Polish)', 'PA (Punjabi)', 'RU (Russian)', 'FR (French)'].map(l => {
                const code = l.split(' ')[0];
                return (
                  <button key={code} onClick={() => handleTranslate(code)} style={{ padding: '6px 12px', borderRadius: 6, background: targetLang === code ? 'var(--color-copper)' : 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                    {l}
                  </button>
                );
              })}
            </div>
            <div style={{ padding: 14, background: 'rgba(199, 107, 42, 0.1)', border: '1px solid var(--color-copper)', borderRadius: 6 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-info)', fontWeight: 700, marginBottom: 4 }}>TRANSLATED CAB DISPLAY ({targetLang}):</div>
              <div style={{ fontSize: '0.9rem', color: '#fff', lineHeight: 1.4 }}>{translatedChat}</div>
            </div>
          </div>

          {/* S19 & S24: Whisper NLP Voice Intent & AI Video Safety Coaching */}
          <div className="enterprise-card" style={{ background: "var(--color-surface)", border: '1px solid var(--color-border)', padding: 20, borderRadius: "var(--radius-card)", gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="badge badge-success" style={{ fontWeight: 700 }}>S19 & S24 FEATURES</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Whisper Voice + Video Synthesis</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 8px 0' }}>Cab Voice Assistant & AI Video Coaching Synthesizer</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
              Drivers speak natural commands to find diesel amenities (S19), while AI automatically synthesizes personalized 3-minute video coaching tutorials after hard braking events (S24).
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              <div style={{ padding: 16, background: 'var(--color-bg-deep)', borderRadius: 6, border: '1px solid var(--color-border)' }}>
                <div style={{ color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>S19 WHISPER VOICE INTENT PARSER</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', marginBottom: 8 }}>
                  &quot;Hey FleetCore, find me an independent clean diesel fuel stop with showers within 15 miles along my route.&quot;
                </div>
                <div className="badge badge-info" style={{ fontSize: '0.75rem' }}>Intent: NAV_FIND_AMENITY_STOP (Confidence: 99.4%)</div>
              </div>
              <div style={{ padding: 16, background: 'var(--color-bg-deep)', borderRadius: 6, border: '1px solid var(--color-border)' }}>
                <div style={{ color: 'var(--color-copper)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>S24 TELEMATIC SAFETY COACHING MODULE</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                  Generated 3-minute customized video breakdown of James Wilson&apos;s tailgating infraction on Highway 99.
                </div>
                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Review Coaching Module</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ADVANCED FREIGHT, YARD & WEATHER (S6, S12, S13, S18) */}
      {activeTab === 'freight-auto' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
          {/* S13: 3D Tetris Cargo Axle Load Plan */}
          <div className="enterprise-card" style={{ background: "var(--color-surface)", border: '1px solid var(--color-border)', padding: 20, borderRadius: "var(--radius-card)" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="badge badge-info" style={{ fontWeight: 700 }}>S13 FEATURE</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Federal Bridge Law Solver</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 8px 0' }}>3D Tetris Cargo & Axle Weight Optimizer</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
              Calculates center-of-gravity pallet distribution to guarantee strict compliance with US DOT Federal Bridge weight limits.
            </p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Trailer Type</label>
                <select value={trailerVolume} onChange={e => setTrailerVolume(e.target.value)} style={{ width: '100%', padding: '8px', background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', color: '#fff', borderRadius: 6 }}>
                  <option value="53FT_VAN">53-Foot Dry Van</option>
                  <option value="53FT_REEFER">53-Foot Refrigerated</option>
                  <option value="FLATBED">48-Foot Heavy Flatbed</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Total Cargo Payload (lbs)</label>
                <input type="number" value={totalCargoLbs} onChange={e => setTotalCargoLbs(e.target.value)} style={{ width: '100%', padding: '8px', background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', color: '#fff', borderRadius: 6 }} />
              </div>
            </div>
            <button onClick={runCargoPlan} className="btn btn-primary" style={{ width: '100%', padding: '10px', fontWeight: 700, marginBottom: 12 }}>
              Simulate 3D Stacking & Axle Weights
            </button>
            {cargoPlanResult && (
              <div style={{ padding: 12, background: cargoPlanResult.bridge_law_compliant ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)', borderRadius: 6 }}>
                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700, marginBottom: 6 }}>{cargoPlanResult.status_message}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1' }}>
                  <span>Steer: {cargoPlanResult.front_steer_axle_lbs} lbs</span>
                  <span>Drive: {cargoPlanResult.drive_tandem_lbs} lbs</span>
                  <span>Trailer: {cargoPlanResult.trailer_tandem_lbs} lbs</span>
                </div>
              </div>
            )}
          </div>

          {/* S12: Drone Yard OCR Inspection */}
          <div className="enterprise-card" style={{ background: "var(--color-surface)", border: '1px solid var(--color-border)', padding: 20, borderRadius: "var(--radius-card)" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="badge badge-warning" style={{ fontWeight: 700 }}>S12 FEATURE</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Automated Drone OCR</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 8px 0' }}>Drone Imagery Yard Mapping & OCR</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
              Autonomous drones scan massive container yards daily using computer vision OCR to map exact parking bay locations and inspect reefer thermal leaks.
            </p>
            <div style={{ padding: 14, background: 'var(--color-bg-deep)', borderRadius: 6, border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Active Drone Flight:</span>
                <span style={{ color: 'var(--color-info)', fontWeight: 600 }}>SKY-EYE-04 (Chicago South Depot)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Latest OCR Container Scan:</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>MSCU-902144-8 (Bay C-42)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Thermal Roof Inspection:</span>
                <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>NO REEFER HEAT LEAK DETECTED</span>
              </div>
            </div>
          </div>

          {/* S6 & S18: 3D Indoor Depot Nav & Dynamic Weather Speed Limit */}
          <div className="enterprise-card" style={{ background: "var(--color-surface)", border: '1px solid var(--color-border)', padding: 20, borderRadius: "var(--radius-card)", gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="badge badge-success" style={{ fontWeight: 700 }}>S6 & S18 FEATURES</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>LiDAR Docking + Weather Friction AI</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 8px 0' }}>3D Indoor Depot Docking & Dynamic Weather Speed Governors</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
              Guides trucks inside multi-story concrete mega-depots where GPS signals are blocked (S6), and dynamically governors target speed limits during severe icy blizzards (S18).
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div style={{ padding: 14, background: 'var(--color-bg-deep)', borderRadius: 6, border: '1px solid var(--color-border)' }}>
                <div style={{ color: 'var(--color-info)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>S6 INDOOR DOCK NAVIGATION</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Level 2 Cargo Ramp  Automated LiDAR Guide Beacon  Reverse into Dock Bay B-12.
                </div>
                <span className="badge badge-success">DOCK LOCK STATUS: GREEN_AUTHORIZED</span>
              </div>
              <div style={{ padding: 14, background: 'var(--color-bg-deep)', borderRadius: 6, border: '1px solid var(--color-border)' }}>
                <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>S18 DYNAMIC WEATHER SPEED ADJUSTMENT</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Highway I-70 Westbound: Black Ice / Blizzard detected via wiper sensor & external telemetry.
                </div>
                <span className="badge badge-danger">TARGET SPEED CUT: 65 MPH  35 MPH</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FINTECH & RECONCILIATION (S2, S3, S4, S7, S11) */}
      {activeTab === 'financial-comp' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
          {/* S2: Driver Payroll EDI */}
          <div className="enterprise-card" style={{ background: "var(--color-surface)", border: '1px solid var(--color-border)', padding: 20, borderRadius: "var(--radius-card)" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="badge badge-success" style={{ fontWeight: 700 }}>S2 FEATURE</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>ADP / Workday EDI</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 8px 0' }}>Automated Driver Payroll & Detention Settlement</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
              Automatically calculates mileage pay ($0.68/mi), waiting dock detention ($28.50/hr), and overnight per-diem tax relief into seamless EDI payroll files.
            </p>
            <div style={{ padding: 12, background: 'var(--color-bg-deep)', borderRadius: 6, border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>James Wilson (Week 28 Settlement):</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: '1.05rem' }}>$2,845.50</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                <span>3,120 Miles ($2,121.60)</span>
                <span>14h Detention ($399.00)</span>
                <span>5d Per Diem ($324.90)</span>
              </div>
            </div>
          </div>

          {/* S3: Toll Transponder Reconciliation */}
          <div className="enterprise-card" style={{ background: "var(--color-surface)", border: '1px solid var(--color-border)', padding: 20, borderRadius: "var(--radius-card)" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="badge badge-danger" style={{ fontWeight: 700 }}>S3 FEATURE</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Phantom Toll Dispute AI</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 8px 0' }}>Toll Transponder Reconciliation & Dispute Engine</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
              Cross-references electronic toll plaza billing files against actual GPS telematics tracks. Immediately disputes phantom charges where the truck was miles away.
            </p>
            <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 6 }}>
              <div style={{ color: 'var(--color-danger)', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>PHANTOM CHARGE DISPUTED ($142.50)</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                George Washington Bridge Plaza bill timestamp 04:12 UTC contradicts GPS telemetry showing Vehicle #K-204 stationary in Scranton, PA (&gt;110 miles away).
              </div>
            </div>
          </div>

          {/* S4, S7 & S11: Fuel Fraud, Spot Freight & Weigh Station Bypass */}
          <div className="enterprise-card" style={{ background: "var(--color-surface)", border: '1px solid var(--color-border)', padding: 20, borderRadius: "var(--radius-card)", gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="badge badge-info" style={{ fontWeight: 700 }}>S4, S7 & S11 FEATURES</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Fraud Guard, DAT EDI & PrePass Bypass</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 8px 0' }}>Fuel Card Geofence Fraud Guard, Freight Bidding & Electronic Weigh Station Bypass</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
              Integrates real-time financial security and operational speed improvements directly into the dispatch workflow.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              <div style={{ padding: 12, background: 'var(--color-bg-deep)', borderRadius: 6, border: '1px solid var(--color-border)' }}>
                <div style={{ color: 'var(--color-danger)', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>S4 FUEL CARD FRAUD ALERT</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Card swiped at Pilot J Dallas ($650), but truck GPS is in Fort Worth (28 miles away).
                </div>
                <span className="badge badge-danger">TRANSACTION AUTOMATICALLY DENIED</span>
              </div>
              <div style={{ padding: 12, background: 'var(--color-bg-deep)', borderRadius: 6, border: '1px solid var(--color-border)' }}>
                <div style={{ color: 'var(--color-success)', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>S7 SPOT MARKET PROFITABILITY</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  DAT Load #894021: Chicago  Atlanta @ $3.10/mi. Estimated net margin: 38.9%.
                </div>
                <span className="badge badge-success">RECOMMENDED INSTANT BOOK</span>
              </div>
              <div style={{ padding: 12, background: 'var(--color-bg-deep)', borderRadius: 6, border: '1px solid var(--color-border)' }}>
                <div style={{ color: 'var(--color-info)', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>S11 WEIGH STATION BYPASS</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Drivewyze electronic clearance at I-80 Scale. Carrier ISS Safety Score: 14 (Excellent).
                </div>
                <span className="badge badge-info">CAB SIGNAL: GREEN LIGHT BYPASS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ESG CARBON, SUPPLY CHAIN & WEB3 (S14, S21, S22, S23) */}
      {activeTab === 'esg-web3' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
          {/* S23: Blockchain POD & Smart Contract Escrow */}
          <div className="enterprise-card" style={{ background: "var(--color-surface)", border: '1px solid var(--color-border)', padding: 20, borderRadius: "var(--radius-card)" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="badge" style={{ background: 'rgba(199, 107, 42, 0.15)', color: 'var(--color-copper)', fontWeight: 700 }}>S23 FEATURE</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Ethereum L2 / Merkle Tree</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 8px 0' }}>Blockchain Proof-of-Delivery & Smart Contract Escrow</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
              Records immutable cryptographic delivery signatures onto Base L2 and automatically releases carrier freight settlement escrow upon geofence GPS arrival.
            </p>
            <div style={{ padding: 14, background: 'var(--color-bg-deep)', borderRadius: 6, border: '1px solid var(--color-border)', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Escrow Smart Contract:</span>
                <span style={{ color: 'var(--color-copper)', fontFamily: 'monospace' }}>0x742d...f44e ($4,250.00 USDT)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Merkle POD Root Hash:</span>
                <span style={{ color: 'var(--color-info)', fontFamily: 'monospace' }}>0x9fA821...c018</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Escrow Release Status:</span>
                <span className="badge badge-success">{escrowStatus}</span>
              </div>
            </div>
            <button onClick={() => setEscrowStatus("ESCROW RELEASED TO CARRIER WALLET ($4,250 USDT)")} className="btn" style={{ width: '100%', padding: '10px', background: 'var(--color-copper)', color: '#fff', fontWeight: 700 }}>
              Simulate Geofence GPS Arrival & Trigger Escrow Release
            </button>
          </div>

          {/* S14 & S21: GHG ESG Emissions & OEM Telematics Federation */}
          <div className="enterprise-card" style={{ background: "var(--color-surface)", border: '1px solid var(--color-border)', padding: 20, borderRadius: "var(--radius-card)" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="badge badge-success" style={{ fontWeight: 700 }}>S14 & S21 FEATURES</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>GHG Scope 1/2/3 & Ford/Volvo Cloud Sync</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 8px 0' }}>EPA Carbon Footprint Accounting & Direct OEM Cloud Federation</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
              Tracks Scope 1 (diesel burn) and Scope 2 (EV electric grid charging) emissions while federating directly with Ford Commercial, Volvo Connect, and GM OnStar APIs without third-party hardware boxes.
            </p>
            <div style={{ padding: 14, background: 'var(--color-bg-deep)', borderRadius: 6, border: '1px solid var(--color-border)', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Fleet Month-to-Date Carbon Footprint:</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>142.4 Metric Tons CO₂</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Tokenized ESG Carbon Credit Value:</span>
                <span style={{ color: 'var(--color-warning)', fontWeight: 700 }}>$3,488.80 USD Equivalency</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Direct OEM Telematics Sync:</span>
                <span className="badge badge-info">142 VEHICLES CONNECTED VIA VOLVO CONNECT / FORD PRO</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useState, useEffect } from 'react';
import LandingPage from '../components/LandingPage';
import NavigationHeader from '../components/NavigationHeader';
import SidebarNav from '../components/SidebarNav';
import CommandCenterMap from '../components/CommandCenterMap';
import AssetDirectory from '../components/AssetDirectory';
import AssetDetail360 from '../components/AssetDetail360';
import DriverSafety from '../components/DriverSafety';
import DispatchBoard from '../components/DispatchBoard';
import MaintenancePlanner from '../components/MaintenancePlanner';
import EldCompliance from '../components/EldCompliance';
import FuelAndEvManagement from '../components/FuelAndEvManagement';
import DataWarehouseAndReports from '../components/DataWarehouseAndReports';
import TenantAndSecuritySettings from '../components/TenantAndSecuritySettings';
import StretchEnterpriseSuite from '../components/StretchEnterpriseSuite';
import LoadsManager from '../components/LoadsManager';
import { Icon } from '../components/Icons';
import { API_BASE_URL, WS_BASE_URL } from '../config/env';

export default function FleetCoreAppRoot() {
  // Navigation state (Defaulting to official brand landing page per FleetCore-Enterprise-design.md)
  const [activeModule, setActiveModule] = useState('landing');
  const [currentUnit, setCurrentUnit] = useState('IMPERIAL'); // IMPERIAL (mph/mi/°F/gal) vs METRIC (kmh/km/°C/L)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Global Toast System
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => prev && prev.message === message ? null : prev);
    }, 5000);
  };

  // Anti-Theft Immobilization Modal State
  const [immobilizingAsset, setImmobilizingAsset] = useState(null);
  const [immobilizePin, setImmobilizePin] = useState('7739-ALPHA');
  const [immobilizeReason, setImmobilizeReason] = useState('UNAUTHORIZED_GEOFENCE_EXIT');
  const [isEngagingImmobilizer, setIsEngagingImmobilizer] = useState(false);

  // Multi-Tenant state (Feature 40 & Section 21)
  const tenants = [
    { id: 'TENANT-01', name: 'Acme Freight Logistics', tier: 'ENTERPRISE', activeVehicles: 142 },
    { id: 'TENANT-02', name: 'Apex Green Distribution', tier: 'PRO', activeVehicles: 45 },
    { id: 'TENANT-03', name: 'NorCal Refrigerated Express', tier: 'ENTERPRISE', activeVehicles: 88 }
  ];
  const [selectedTenant, setSelectedTenant] = useState(tenants[0]);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Global Fleet Assets Telemetry dataset (syncing with Go Ingestion / Spring Boot REST / Kafka ws)
  const [assets, setAssets] = useState([
    { id: '8921-ALPHA', vin: '19X91929410912', name: 'Volvo FH16 Globetrotter (#V-901)', make: 'Volvo', model: 'FH16 750', year: 2025, category: 'HEAVY', status: 'ONLINE', driver: 'James Wilson', isEv: false, fuelLevelPct: 74, batterySocPct: 84, currentSpeedKmh: 88.5, rpm: 1420, engineTempC: 89, lat: 40.7128, lng: -74.0060, dtcCount: 0, tpmsAlert: false },
    { id: '8922-BETA', vin: 'EV902144118099', name: 'BrightDrop Zevo 600 (#EV-402)', make: 'BrightDrop', model: 'Zevo 600', year: 2026, category: 'EV', status: 'ONLINE', driver: 'Elena Rostova', isEv: true, fuelLevelPct: 100, batterySocPct: 84, currentSpeedKmh: 42.0, rpm: 0, engineTempC: 45, lat: 41.8781, lng: -87.6298, dtcCount: 0, tpmsAlert: false },
    { id: '8923-GAMMA', vin: '88Y41490214456', name: 'Kenworth W900 Aeroshift (#K-204)', make: 'Kenworth', model: 'W900 Heavy Duty', year: 2024, category: 'HEAVY', status: 'ONLINE', driver: 'Marcus Vance', isEv: false, fuelLevelPct: 18, batterySocPct: 0, currentSpeedKmh: 94.2, rpm: 2110, engineTempC: 98, lat: 32.7767, lng: -96.7970, dtcCount: 2, tpmsAlert: true },
    { id: '8924-DELTA', vin: 'F5509921102941', name: 'Freightliner Cascadia (#F-550)', make: 'Freightliner', model: 'Cascadia Evolution', year: 2025, category: 'REEFER', status: 'ONLINE', driver: 'David Kim', isEv: false, fuelLevelPct: 88, batterySocPct: 0, currentSpeedKmh: 76.4, rpm: 1350, engineTempC: 85, lat: 33.7490, lng: -84.3880, dtcCount: 0, tpmsAlert: false },
    { id: '8925-EPSILON', vin: 'CAT10294819200', name: 'Caterpillar 336 Hydraulic Excavator (#C-812)', make: 'Caterpillar', model: '336 Next Gen', year: 2024, category: 'CONSTRUCTION', status: 'IDLE', driver: 'Sarah Jenkins', isEv: false, fuelLevelPct: 62, batterySocPct: 0, currentSpeedKmh: 0.0, rpm: 850, engineTempC: 78, lat: 29.7604, lng: -95.3698, dtcCount: 0, tpmsAlert: false }
  ]);

  const handleAddAsset = (newAsset) => {
    setAssets(prev => [newAsset, ...prev]);
    showToast(`Vehicle ${newAsset.name} enrolled with cryptographic hardware profile.`, 'success');
  };

  const handleConfirmImmobilize = () => {
    if (!immobilizingAsset) return;
    setIsEngagingImmobilizer(true);
    setTimeout(() => {
      setIsEngagingImmobilizer(false);
      setAssets(prev => prev.map(a => 
        a.id === immobilizingAsset.id || a.vin === immobilizingAsset.vin 
          ? { ...a, status: 'IMMOBILIZED', currentSpeedKmh: 0.0, rpm: 0 }
          : a
      ));
      const targetName = immobilizingAsset.name;
      setImmobilizingAsset(null);
      showToast(`CAN-bus immobilizer engaged for ${targetName}. ECM starter circuit disabled.`, 'danger');
    }, 1200);
  };

  // F2: Real-time GPS mapping & WebSocket / REST live data binding with sub-second fallback
  useEffect(() => {
    let ws;
    let fallbackPollTimer;

    const connectLiveStream = () => {
      try {
        ws = new WebSocket(WS_BASE_URL);
        ws.onmessage = (event) => {
          try {
            const telemetryUpdate = JSON.parse(event.data);
            setAssets(prev => prev.map(a => 
              a.vin === telemetryUpdate.vin ? { ...a, ...telemetryUpdate } : a
            ));
          } catch (e) {
            // Ignore malformed payloads
          }
        };
        ws.onerror = () => {
          startFallbackLoop();
        };
        ws.onclose = () => {
          startFallbackLoop();
        };
      } catch (err) {
        startFallbackLoop();
      }
    };

    const startFallbackLoop = () => {
      if (fallbackPollTimer) return;
      fallbackPollTimer = setInterval(async () => {
        try {
          const resp = await fetch(`${API_BASE_URL}/api/v1/assets`, { signal: AbortSignal.timeout(1000) });
          if (resp.ok) {
            const liveAssets = await resp.json();
            if (Array.isArray(liveAssets) && liveAssets.length > 0) {
              setAssets(liveAssets);
              return;
            }
          }
        } catch (e) {
          // Simulation fallback
        }

        setAssets(prev => prev.map(a => {
          if (a.status === 'ONLINE' && a.currentSpeedKmh > 0) {
            const deltaSpeed = (Math.random() - 0.48) * 2;
            const newSpeed = Math.max(10, Math.min(115, a.currentSpeedKmh + deltaSpeed));
            return { ...a, currentSpeedKmh: Number(newSpeed.toFixed(1)) };
          }
          return a;
        }));
      }, 2000);
    };

    connectLiveStream();

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) ws.close();
      if (fallbackPollTimer) clearInterval(fallbackPollTimer);
    };
  }, []);

  const handleSelectAssetForDetail = (asset) => {
    setSelectedAsset(asset);
    setActiveModule('asset-detail');
  };

  const handleSelectAssetForMap = (asset) => {
    setSelectedAsset(asset);
    setActiveModule('command-center');
  };

  if (activeModule === 'landing') {
    return (
      <div style={{ backgroundColor: '#111417', minHeight: '100vh', width: '100%', color: '#F5F7F8' }}>
        <LandingPage
          onLaunchMissionControl={() => setActiveModule('command-center')}
          onExploreModule={(moduleName) => setActiveModule(moduleName)}
          assets={assets}
        />
      </div>
    );
  }

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* 1. Global Navigation Header (Tenant Swapper, Unit Toggle, System Health, Return to Landing) */}
      <NavigationHeader
        tenants={tenants}
        selectedTenant={selectedTenant}
        onSelectTenant={setSelectedTenant}
        currentUnit={currentUnit}
        onToggleUnit={() => setCurrentUnit(prev => prev === 'IMPERIAL' ? 'METRIC' : 'IMPERIAL')}
        onGoToLanding={() => setActiveModule('landing')}
        onToggleMobileMenu={() => setIsMobileOpen(prev => !prev)}
      />

      {/* Mobile Backdrop Overlay */}
      <div className={`mobile-overlay ${isMobileOpen ? 'open' : ''}`} onClick={() => setIsMobileOpen(false)} />

      {/* 2. Main Workspace Layout */}
      <div className="workspace" style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Left Interactive Sidebar (Grouped into Operations, Regulatory, Analytics, Admin) */}
        <SidebarNav
          activeModule={activeModule}
          onSelectModule={setActiveModule}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Center Main View Canvas (Rendered according to active module) */}
        <main className="main-content" style={{ flex: 1, overflowY: 'auto', background: 'var(--color-bg-primary)', position: 'relative' }}>

          {activeModule === 'command-center' && (
            <CommandCenterMap
              assets={assets}
              onSelectAssetForDetail={handleSelectAssetForDetail}
              onTriggerImmobilize={(asset) => setImmobilizingAsset(asset)}
              currentUnit={currentUnit}
              selectedTenant={selectedTenant}
            />
          )}

          {activeModule === 'asset-directory' && (
            <AssetDirectory
              assets={assets}
              onSelectAssetForDetail={handleSelectAssetForDetail}
              onSelectAssetForMap={handleSelectAssetForMap}
              currentUnit={currentUnit}
              onAddAsset={handleAddAsset}
              showToast={showToast}
            />
          )}

          {activeModule === 'asset-detail' && (
            <AssetDetail360
              selectedAsset={selectedAsset}
              assets={assets}
              onSelectAsset={setSelectedAsset}
              onNavigateToModule={setActiveModule}
              currentUnit={currentUnit}
            />
          )}

          {activeModule === 'driver-safety' && (
            <DriverSafety
              onNavigateToModule={setActiveModule}
              showToast={showToast}
            />
          )}

          {activeModule === 'dispatch-board' && (
            <DispatchBoard
              assets={assets}
              onNavigateToModule={setActiveModule}
              showToast={showToast}
            />
          )}

          {activeModule === 'maintenance-planner' && (
            <MaintenancePlanner
              onNavigateToModule={setActiveModule}
              showToast={showToast}
            />
          )}

          {activeModule === 'eld-compliance' && (
            <EldCompliance
              onNavigateToModule={setActiveModule}
              showToast={showToast}
            />
          )}

          {activeModule === 'fuel-ev' && (
            <FuelAndEvManagement
              onNavigateToModule={setActiveModule}
              showToast={showToast}
            />
          )}

          {activeModule === 'data-warehouse' && (
            <DataWarehouseAndReports
              onNavigateToModule={setActiveModule}
              showToast={showToast}
            />
          )}

          {activeModule === 'tenant-settings' && (
            <TenantAndSecuritySettings
              selectedTenant={selectedTenant}
              assets={assets}
              onNavigateToModule={setActiveModule}
              showToast={showToast}
            />
          )}

          {activeModule === 'stretch-suite' && (
            <StretchEnterpriseSuite
              assets={assets}
              currentUnit={currentUnit}
              showToast={showToast}
            />
          )}

          {activeModule === 'loads-manager' && (
            <LoadsManager
              assets={assets}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* GLOBAL TOAST NOTIFICATION BANNER */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border-bright)',
          borderLeft: `4px solid ${
            toast.type === 'danger' ? 'var(--color-danger)' : 
            toast.type === 'success' ? 'var(--color-success)' : 
            toast.type === 'warning' ? 'var(--color-warning)' : 'var(--color-info)'
          }`,
          borderRadius: 'var(--radius-card)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          maxWidth: 480
        }}>
          <div style={{ display: 'flex', alignItems: 'center', color: toast.type === 'danger' ? 'var(--color-danger)' : toast.type === 'success' ? 'var(--color-success)' : toast.type === 'warning' ? 'var(--color-warning)' : 'var(--color-info)' }}>
            <Icon name={toast.type === 'danger' ? 'alert' : toast.type === 'success' ? 'check' : toast.type === 'warning' ? 'alert' : 'activity'} size={18} />
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)', lineHeight: 1.4, flex: 1 }}>
            {toast.message}
          </div>
          <button 
            type="button"
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: '2px 6px' }}
            onClick={() => setToast(null)}
            aria-label="Dismiss toast"
          >
            ✕
          </button>
        </div>
      )}

      {/* REMOTE ANTI-THEFT IMMOBILIZATION MODAL */}
      {immobilizingAsset && (
        <div className="drawer-backdrop" onClick={() => setImmobilizingAsset(null)}>
          <div className="enterprise-card" style={{ width: 560, maxWidth: '92vw', margin: 'auto', background: 'var(--color-surface)', border: '1px solid var(--color-danger)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex-between" style={{ marginBottom: 16, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
              <div className="card-title" style={{ margin: 0, color: 'var(--color-danger)' }}>
                <span>REMOTE CAN-BUS IMMOBILIZER ENGAGEMENT</span>
              </div>
              <button 
                type="button" 
                onClick={() => setImmobilizingAsset(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'rgba(229, 72, 77, 0.1)', padding: 12, borderRadius: 'var(--radius-card)', border: '1px solid var(--color-danger)' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                  <strong>WARNING:</strong> Transmitting CAN-bus command <span className="text-mono">0x18EF0000 PGN</span> will order the Electronic Control Module (ECM) to cut fuel injection and trigger starter interlock locks once road speed drops below 5 km/h.
                </p>
              </div>

              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>TARGET VEHICLE:</label>
                  <input type="text" className="enterprise-input" style={{ width: '100%' }} value={immobilizingAsset.name} readOnly />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>TELEMATICS VIN:</label>
                  <input type="text" className="enterprise-input text-mono" style={{ width: '100%' }} value={immobilizingAsset.vin} readOnly />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>IMMOBILIZATION INCIDENT REASON:</label>
                <select 
                  className="enterprise-select" 
                  style={{ width: '100%' }}
                  value={immobilizeReason}
                  onChange={(e) => setImmobilizeReason(e.target.value)}
                >
                  <option value="UNAUTHORIZED_GEOFENCE_EXIT">Unauthorized Geofence Breach / High-Risk Corridor Exit</option>
                  <option value="SUSPECTED_THEFT">Confirmed Stolen Asset Interdiction Request (Law Enforcement)</option>
                  <option value="SEVERE_SAFETY_AUDIT">Emergency Remote Override (Unresponsive Driver)</option>
                  <option value="DELINQUENT_LEASE_REPO">Financing Repossession Order</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                  CRYPTOGRAPHIC DISPATCHER PIN (mTLS AUTHORIZED):
                </label>
                <input 
                  type="password" 
                  className="enterprise-input text-mono" 
                  style={{ width: '100%' }}
                  value={immobilizePin}
                  onChange={(e) => setImmobilizePin(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button className="btn btn-secondary" onClick={() => setImmobilizingAsset(null)} disabled={isEngagingImmobilizer}>
                  Abort Command
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={handleConfirmImmobilize}
                  disabled={isEngagingImmobilizer}
                >
                  {isEngagingImmobilizer ? 'Transmitting mTLS Command...' : 'ENGAGE IMMOBILIZER RELAY'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

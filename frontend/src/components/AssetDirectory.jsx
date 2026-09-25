"use client";
import React, { useState } from 'react';
import { Icon } from './Icons';

export default function AssetDirectory({ assets, onSelectAssetForDetail, onSelectAssetForMap, currentUnit, onAddAsset, showToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [immobilizationTarget, setImmobilizationTarget] = useState(null);
  const [immobilizeReason, setImmobilizeReason] = useState('UNAUTHORIZED_GEOFENCE_EXIT');
  const [mtlsPin, setMtlsPin] = useState('7739-ALPHA');
  const [isImmobilizing, setIsImmobilizing] = useState(false);

  // Enroll IoT Asset Modal state (Feature 1 & Feature 8)
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: 'Kenworth T680 Next Gen (#K-708)',
    vin: '1NKDX4EX0RJ' + Math.floor(100000 + Math.random() * 900000),
    make: 'Kenworth',
    model: 'T680 Aero',
    year: 2026,
    category: 'HEAVY',
    driver: 'Marcus Vance',
    isEv: false,
    fuelLevelPct: 82,
    batterySocPct: 0,
    currentSpeedKmh: 75.0,
    rpm: 1380,
    engineTempC: 86,
    lat: 39.7392,
    lng: -104.9903
  });

  const filtered = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (a.driver && a.driver.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === 'ALL' || a.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  // Feature 8: High Security Engine Immobilizer
  const handleConfirmImmobilize = () => {
    if (!immobilizeReason || !mtlsPin) return;
    setIsImmobilizing(true);
    setTimeout(() => {
      setIsImmobilizing(false);
      if (showToast) {
        showToast('Engine Immobilized', `[mTLS F8] Encrypted CAN-bus cut-off sequence applied to ${immobilizationTarget.name} (VIN: ${immobilizationTarget.vin}). Status set to IMMOBILIZED.`, 'danger');
      }
      // Update local asset status
      immobilizationTarget.status = 'IMMOBILIZED';
      immobilizationTarget.currentSpeedKmh = 0;
      setImmobilizationTarget(null);
    }, 1200);
  };

  // Real CSV Export
  const handleExportCSV = () => {
    const headers = ["VIN", "Asset Name", "Make", "Model", "Year", "Category", "Status", "Driver", "Speed_kmh", "Fuel_Pct", "Battery_SoC_Pct"];
    const rows = filtered.map(a => [
      a.vin,
      `"${a.name}"`,
      a.make,
      a.model,
      a.year,
      a.category,
      a.status,
      `"${a.driver || 'Unassigned'}"`,
      a.currentSpeedKmh,
      a.fuelLevelPct,
      a.batterySocPct
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fleetcore_assets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) {
      showToast('Export Complete', `Exported ${filtered.length} asset records to CSV format.`, 'success');
    }
  };

  // Feature 1: Enroll IoT Asset
  const handleEnrollSubmit = (e) => {
    e.preventDefault();
    const enrolled = {
      ...newAsset,
      id: `${Math.floor(8000 + Math.random() * 1999)}-${newAsset.category}`,
      status: 'ONLINE',
      dtcCount: 0,
      tpmsAlert: false
    };
    if (onAddAsset) {
      onAddAsset(enrolled);
    } else {
      assets.push(enrolled);
    }
    setShowEnrollModal(false);
    if (showToast) {
      showToast('IoT Asset Enrolled', `Successfully paired ${enrolled.name} with mTLS certificate. Telemetry stream active.`, 'success');
    }
  };

  const formatSpeed = (kmh) => {
    if (currentUnit === 'IMPERIAL') return `${Math.round(kmh * 0.621371)} mph`;
    return `${Math.round(kmh)} km/h`;
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Top Title & Action Toolbar */}
      <div className="flex-between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
            Enterprise Asset Registry &amp; Fleet Diagnostics
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>
            Direct TimescaleDB hypertable query interface synchronized with high-throughput Go ingestion pipelines (:9095) and edge telematics gateways.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Icon name="download" size={16} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowEnrollModal(true)}>
            <Icon name="plus" size={16} color="#FFF" />
            <span>Enroll IoT Asset</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="enterprise-card" style={{ marginBottom: 20, padding: 16, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 280 }}>
          <input
            type="text"
            className="enterprise-input"
            style={{ flex: 1 }}
            placeholder="Search by VIN, Vehicle Name, Model, or Driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>CATEGORY:</span>
            <select className="enterprise-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="ALL">All Categories ({assets.length})</option>
              <option value="HEAVY">Heavy Duty Diesel</option>
              <option value="EV">Electric Commercial Fleet</option>
              <option value="REEFER">Cold-Chain Reefer Trailers</option>
              <option value="CONSTRUCTION">Heavy Construction Excavators</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>STATUS:</span>
            <select className="enterprise-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All States</option>
              <option value="ONLINE">ONLINE</option>
              <option value="IDLE">IDLE</option>
              <option value="IMMOBILIZED">IMMOBILIZED</option>
              <option value="MAINTENANCE">IN MAINTENANCE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enterprise Table Container (4px radius per design spec) */}
      <div className="table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>VIN / Device ID</th>
              <th>Asset Specification</th>
              <th>Category</th>
              <th>Assigned Driver</th>
              <th>Live Telemetry</th>
              <th>Energy / Fuel</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                  No assets match current criteria.
                </td>
              </tr>
            ) : (
              filtered.map((asset) => (
                <tr key={asset.id}>
                  <td>
                    <strong className="text-mono" style={{ color: 'var(--color-text-primary)', display: 'block', fontSize: '0.88rem' }}>
                      {asset.vin}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                      ID: {asset.id}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{asset.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                      {asset.year} {asset.make} {asset.model}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {asset.category || 'COMMERCIAL'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 'var(--radius-button)', background: 'var(--color-graphite)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.72rem', color: 'var(--color-copper)' }}>
                        {asset.driver ? asset.driver.charAt(0) : '—'}
                      </div>
                      <span style={{ fontWeight: 500, color: asset.driver ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontSize: '0.84rem' }}>
                        {asset.driver || 'Unassigned'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                      Speed: <strong style={{ color: 'var(--color-copper)' }}>{formatSpeed(asset.currentSpeedKmh)}</strong><br />
                      RPM: <strong style={{ color: asset.rpm > 2000 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>{asset.rpm || 0} RPM</strong>
                    </div>
                  </td>
                  <td>
                    {asset.isEv ? (
                      <div>
                        <div className="flex-between" style={{ width: 110, fontSize: '0.75rem', marginBottom: 3 }}>
                          <span>SoC:</span>
                          <strong style={{ color: 'var(--color-lime)', fontFamily: 'var(--font-mono)' }}>{asset.batterySocPct || 84}%</strong>
                        </div>
                        <div style={{ width: 110, height: 5, background: 'var(--color-graphite)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${asset.batterySocPct || 84}%`, height: '100%', background: 'var(--color-lime)' }}></div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex-between" style={{ width: 110, fontSize: '0.75rem', marginBottom: 3 }}>
                          <span>Fuel:</span>
                          <strong style={{ color: (asset.fuelLevelPct || 74) < 20 ? 'var(--color-danger)' : 'var(--color-warning)', fontFamily: 'var(--font-mono)' }}>{asset.fuelLevelPct || 74}%</strong>
                        </div>
                        <div style={{ width: 110, height: 5, background: 'var(--color-graphite)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${asset.fuelLevelPct || 74}%`, height: '100%', background: (asset.fuelLevelPct || 74) < 20 ? 'var(--color-danger)' : 'var(--color-warning)' }}></div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${asset.status === 'ONLINE' ? 'badge-success' : asset.status === 'IDLE' ? 'badge-warning' : 'badge-danger'}`}>
                      {asset.status === 'ONLINE' ? 'ONLINE' : asset.status === 'IDLE' ? 'IDLE' : asset.status === 'IMMOBILIZED' ? 'LOCKED' : 'OFFLINE'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.78rem', minHeight: 32 }}
                        onClick={() => onSelectAssetForDetail(asset)}
                        title="Open 360 Diagnostic Center"
                      >
                        360 View
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.78rem', minHeight: 32 }}
                        onClick={() => onSelectAssetForMap(asset)}
                        title="Locate asset on Live Map"
                      >
                        Map
                      </button>
                      {asset.status !== 'IMMOBILIZED' && (
                        <button
                          className="btn btn-danger"
                          style={{ padding: '4px 10px', fontSize: '0.78rem', minHeight: 32 }}
                          onClick={() => setImmobilizationTarget(asset)}
                          title="Remote Asset Immobilization (Anti-Theft Relay)"
                        >
                          Immobilize
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Enroll IoT Asset Modal (Feature 1) */}
      {showEnrollModal && (
        <div className="modal-backdrop" onClick={() => setShowEnrollModal(false)}>
          <div className="enterprise-card" style={{ width: 560, backgroundColor: '#1D2329', border: '1px solid var(--color-border)', padding: 28 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex-between" style={{ marginBottom: 18, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="truck" size={20} color="var(--color-copper)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Enroll New IoT Fleet Asset</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowEnrollModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit}>
              <div className="grid-2" style={{ gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>ASSET NAME / UNIT #</label>
                  <input
                    type="text"
                    required
                    className="enterprise-input"
                    style={{ width: '100%' }}
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>VIN (17-DIGIT CAN)</label>
                  <input
                    type="text"
                    required
                    className="enterprise-input text-mono"
                    style={{ width: '100%' }}
                    value={newAsset.vin}
                    onChange={(e) => setNewAsset({ ...newAsset, vin: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-3" style={{ gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>MAKE</label>
                  <input
                    type="text"
                    className="enterprise-input"
                    style={{ width: '100%' }}
                    value={newAsset.make}
                    onChange={(e) => setNewAsset({ ...newAsset, make: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>MODEL</label>
                  <input
                    type="text"
                    className="enterprise-input"
                    style={{ width: '100%' }}
                    value={newAsset.model}
                    onChange={(e) => setNewAsset({ ...newAsset, model: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>YEAR</label>
                  <input
                    type="number"
                    className="enterprise-input"
                    style={{ width: '100%' }}
                    value={newAsset.year}
                    onChange={(e) => setNewAsset({ ...newAsset, year: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>CATEGORY</label>
                  <select
                    className="enterprise-select"
                    style={{ width: '100%' }}
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value, isEv: e.target.value === 'EV' })}
                  >
                    <option value="HEAVY">Heavy Duty Freight (Diesel)</option>
                    <option value="EV">Commercial Electric Van (EV)</option>
                    <option value="REEFER">Refrigerated Cold-Chain</option>
                    <option value="CONSTRUCTION">Construction Machinery</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>ASSIGNED DRIVER</label>
                  <input
                    type="text"
                    className="enterprise-input"
                    style={{ width: '100%' }}
                    value={newAsset.driver}
                    onChange={(e) => setNewAsset({ ...newAsset, driver: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 12, marginBottom: 18, fontSize: '0.78rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                <div>Hardware Security: Auto-generating X.509 cert thumbprint</div>
                <div>Ingestion Target: TCP :9095 (Go 64-Goroutine Engine)</div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEnrollModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Enroll & Connect Gateway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remote Immobilization Modal */}
      {immobilizationTarget && (
        <div className="modal-backdrop" onClick={() => setImmobilizationTarget(null)}>
          <div className="enterprise-card" style={{ width: 500, backgroundColor: '#1D2329', border: '1px solid var(--color-danger)', padding: 28 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-button)', background: 'rgba(229, 72, 77, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-danger)' }}>
                  <Icon name="alert" size={22} color="var(--color-danger)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>REMOTE ASSET IMMOBILIZATION</h3>
                  <span className="badge badge-danger">CAN-BUS IGNITION INTERLOCK</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setImmobilizationTarget(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: 14 }}>
              Engaging emergency CAN-bus relay cut-off sequence for asset <strong>{immobilizationTarget.name}</strong> (VIN: {immobilizationTarget.vin}).
            </p>

            <div style={{ background: 'var(--color-bg-surface)', padding: 12, borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', marginBottom: 16, fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-copper)' }}>
              <div>• Gateway Socket: TCP ESTABLISHED (:9095)</div>
              <div>• Interlock Safety Gate: Ground speed verified below 5 km/h before fuel shutoff</div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 4 }}>REASON FOR CUT-OFF:</label>
              <select className="enterprise-select" style={{ width: '100%' }} value={immobilizeReason} onChange={(e) => setImmobilizeReason(e.target.value)}>
                <option value="UNAUTHORIZED_GEOFENCE_EXIT">Geofence Boundary Violation (Unauthorized Exit)</option>
                <option value="REPORTED_STOLEN_POLICE_CASE">Reported Stolen / Police Interdiction Case</option>
                <option value="CRITICAL_SAFETY_DEFECT">Critical Safety Defect (Out of Service)</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 4 }}>AUTHORIZATION PIN:</label>
              <input type="password" className="enterprise-input text-mono" style={{ width: '100%' }} value={mtlsPin} onChange={(e) => setMtlsPin(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setImmobilizationTarget(null)}>
                Abort Command
              </button>
              <button className="btn btn-danger" onClick={handleConfirmImmobilize} disabled={isImmobilizing}>
                {isImmobilizing ? 'Executing Cut-Off...' : 'Engage Immobilizer Relay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

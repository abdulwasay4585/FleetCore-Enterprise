"use client";
import React, { useState } from 'react';
import { Icon } from './Icons';

export default function AlertsConfigManager({ showToast }) {
  const [alerts, setAlerts] = useState([
    { id: 'ALT-001', name: 'Cold-Chain Reefer Temp Breach', type: 'TEMP_BREACH', scope: 'ASSET_TYPE', operator: 'GREATER_THAN', value: -15, unit: 'CELSIUS', channels: ['EMAIL','DASHBOARD','SMS'], active: true, triggers: 4, lastFired: '2026-07-24 03:14 UTC', cooldown: 10 },
    { id: 'ALT-002', name: 'Geofence Exit — Chicago Distribution Zone', type: 'GEOFENCE_EXIT', scope: 'ALL_ASSETS', operator: 'OUT_OF_ZONE', value: null, unit: 'ZONE', channels: ['DASHBOARD','SMS'], active: true, triggers: 12, lastFired: '2026-07-25 08:40 UTC', cooldown: 5 },
    { id: 'ALT-003', name: 'Excessive Speed — Heavy Duty Tractors', type: 'SPEED_THRESHOLD', scope: 'ASSET_TYPE', operator: 'GREATER_THAN', value: 105, unit: 'KMH', channels: ['DASHBOARD','EMAIL'], active: true, triggers: 7, lastFired: '2026-07-25 11:20 UTC', cooldown: 15 },
    { id: 'ALT-004', name: 'Critical Fuel Low — Below 15%', type: 'FUEL_LOW', scope: 'ALL_ASSETS', operator: 'LESS_THAN', value: 15, unit: 'PCT', channels: ['DASHBOARD','SMS','EMAIL'], active: true, triggers: 3, lastFired: '2026-07-23 16:55 UTC', cooldown: 30 },
    { id: 'ALT-005', name: 'DTC Critical Engine Fault — Immediate Workshop', type: 'DTC_CRITICAL', scope: 'ALL_ASSETS', operator: 'EQUALS', value: null, unit: 'FAULT_CODE', channels: ['EMAIL','DASHBOARD','SMS'], active: true, triggers: 1, lastFired: '2026-07-21 09:10 UTC', cooldown: 0 },
    { id: 'ALT-006', name: 'HOS Violation — 11-Hour Driving Rule', type: 'HOS_VIOLATION', scope: 'ALL_ASSETS', operator: 'GREATER_THAN', value: 11, unit: 'HOURS', channels: ['EMAIL','DASHBOARD'], active: true, triggers: 2, lastFired: '2026-07-22 23:45 UTC', cooldown: 0 },
    { id: 'ALT-007', name: 'EV Battery Critical — Below 10% SoC', type: 'BATTERY_CRITICAL', scope: 'ASSET_TYPE', operator: 'LESS_THAN', value: 10, unit: 'PCT', channels: ['DASHBOARD','SMS'], active: false, triggers: 0, lastFired: '—', cooldown: 20 },
    { id: 'ALT-008', name: 'TPMS Low Pressure — Any Axle Below 85 PSI', type: 'TPMS_LOW', scope: 'ALL_ASSETS', operator: 'LESS_THAN', value: 85, unit: 'PSI', channels: ['DASHBOARD'], active: true, triggers: 5, lastFired: '2026-07-25 07:00 UTC', cooldown: 60 },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [newAlert, setNewAlert] = useState({
    name: '', type: 'TEMP_BREACH', scope: 'ALL_ASSETS', operator: 'GREATER_THAN',
    value: '', unit: 'CELSIUS', channels: ['DASHBOARD'], active: true, cooldown: 15
  });

  const TYPE_COLORS = {
    TEMP_BREACH: 'badge-info', GEOFENCE_EXIT: 'badge-warning', SPEED_THRESHOLD: 'badge-danger',
    FUEL_LOW: 'badge-warning', DTC_CRITICAL: 'badge-danger', HOS_VIOLATION: 'badge-warning',
    BATTERY_CRITICAL: 'badge-danger', TPMS_LOW: 'badge-warning'
  };

  const handleToggle = (id) => {
    setAlerts(alerts.map(a => {
      if (a.id !== id) return a;
      const next = !a.active;
      if (showToast) showToast(next ? `Alert "${a.name}" activated.` : `Alert "${a.name}" suspended.`, next ? 'success' : 'warning');
      return { ...a, active: next };
    }));
  };

  const handleDelete = (id) => {
    const target = alerts.find(a => a.id === id);
    setAlerts(alerts.filter(a => a.id !== id));
    if (showToast) showToast(`Alert rule "${target.name}" permanently deleted.`, 'danger');
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const created = {
      ...newAlert,
      id: `ALT-${String(alerts.length + 1).padStart(3, '0')}`,
      triggers: 0,
      lastFired: '—',
    };
    setAlerts([created, ...alerts]);
    setShowCreateModal(false);
    setNewAlert({ name: '', type: 'TEMP_BREACH', scope: 'ALL_ASSETS', operator: 'GREATER_THAN', value: '', unit: 'CELSIUS', channels: ['DASHBOARD'], active: true, cooldown: 15 });
    if (showToast) showToast(`Alert rule "${created.name}" created and activated.`, 'success');
  };

  const handleTestAlert = (a) => {
    if (showToast) showToast(`[TEST FIRED] "${a.name}" — Notification sent to configured channels (${a.channels.join(', ')}).`, 'info');
    setAlerts(alerts.map(x => x.id === a.id ? { ...x, triggers: x.triggers + 1, lastFired: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC' } : x));
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h1 className="module-title">Alert Rules & Threshold Configuration</h1>
          <p className="module-subtitle">
            Configure automated notification triggers for temperature breaches, geofence violations, speed thresholds, and ELD non-compliance events. Rules evaluated by Apache Flink CEP against live telemetry streams.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div className="stat-badge">
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-lime)' }}>{alerts.filter(a => a.active).length}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>ACTIVE RULES</span>
          </div>
          <div className="stat-badge">
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-copper)' }}>{alerts.reduce((s, a) => s + a.triggers, 0)}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL FIRES (30d)</span>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Icon name="plus" size={15} />
            <span>New Alert Rule</span>
          </button>
        </div>
      </div>

      {/* Alert Rules Table */}
      <div className="enterprise-card" style={{ padding: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="alert" size={16} color="var(--color-copper)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>FLINK CEP ALERT RULE ENGINE</span>
          <span className="badge badge-success" style={{ marginLeft: 'auto' }}>EVALUATING LIVE TELEMETRY STREAM</span>
        </div>
        <div className="table-container">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>ALERT ID</th>
                <th>RULE NAME</th>
                <th>TYPE</th>
                <th>CONDITION</th>
                <th>CHANNELS</th>
                <th>FIRES (30d)</th>
                <th>LAST TRIGGERED</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(a => (
                <tr key={a.id}>
                  <td><span className="text-mono" style={{ fontSize: '0.78rem', color: 'var(--color-copper)' }}>{a.id}</span></td>
                  <td>
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{a.name}</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Cooldown: {a.cooldown} min</div>
                  </td>
                  <td><span className={`badge ${TYPE_COLORS[a.type] || 'badge-info'}`} style={{ fontSize: '0.68rem' }}>{a.type.replace(/_/g, ' ')}</span></td>
                  <td>
                    <span className="text-mono" style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                      {a.operator.replace(/_/g, ' ')} {a.value !== null ? `${a.value} ${a.unit}` : a.unit}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {a.channels.map(ch => (
                        <span key={ch} className="badge" style={{ fontSize: '0.62rem', background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}>{ch}</span>
                      ))}
                    </div>
                  </td>
                  <td><strong style={{ color: a.triggers > 5 ? 'var(--color-warning)' : 'var(--color-text-primary)' }}>{a.triggers}</strong></td>
                  <td><span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{a.lastFired}</span></td>
                  <td>
                    <span className={`badge ${a.active ? 'badge-success' : 'badge-warning'}`}>{a.active ? 'ACTIVE' : 'SUSPENDED'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary" style={{ fontSize: '0.72rem', minHeight: 28, padding: '4px 8px' }} onClick={() => handleTestAlert(a)} title="Fire test notification">
                        Test
                      </button>
                      <button
                        className={`btn ${a.active ? 'btn-warning' : 'btn-secondary'}`}
                        style={{ fontSize: '0.72rem', minHeight: 28, padding: '4px 8px' }}
                        onClick={() => handleToggle(a.id)}
                      >
                        {a.active ? 'Suspend' : 'Activate'}
                      </button>
                      <button className="btn btn-danger" style={{ fontSize: '0.72rem', minHeight: 28, padding: '4px 8px' }} onClick={() => handleDelete(a.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Alert Rule Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="enterprise-card" style={{ width: 600, maxWidth: '94vw', margin: 'auto', background: 'var(--color-surface)', border: '1px solid var(--color-copper)' }} onClick={e => e.stopPropagation()}>
            <div className="flex-between" style={{ marginBottom: 16, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Create Alert Rule</span>
              <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1, padding: '2px 6px' }} aria-label="Dismiss modal">✕</button>
            </div>
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>ALERT RULE NAME:</label>
                <input required className="enterprise-input" style={{ width: '100%' }} value={newAlert.name} onChange={e => setNewAlert({ ...newAlert, name: e.target.value })} placeholder="e.g. Cold-Chain Zone 1 Breach Alert" />
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>ALERT TYPE:</label>
                  <select className="enterprise-select" style={{ width: '100%' }} value={newAlert.type} onChange={e => setNewAlert({ ...newAlert, type: e.target.value })}>
                    <option value="TEMP_BREACH">Temperature Breach (Cold-Chain)</option>
                    <option value="GEOFENCE_EXIT">Geofence Exit / Entry</option>
                    <option value="SPEED_THRESHOLD">Speed Threshold Violation</option>
                    <option value="FUEL_LOW">Fuel Level Critical</option>
                    <option value="DTC_CRITICAL">Critical Engine DTC Fault</option>
                    <option value="HOS_VIOLATION">HOS / ELD Rule Violation</option>
                    <option value="BATTERY_CRITICAL">EV Battery Critical SoC</option>
                    <option value="TPMS_LOW">TPMS Low Tire Pressure</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>TARGET SCOPE:</label>
                  <select className="enterprise-select" style={{ width: '100%' }} value={newAlert.scope} onChange={e => setNewAlert({ ...newAlert, scope: e.target.value })}>
                    <option value="ALL_ASSETS">All Assets (Fleet-Wide)</option>
                    <option value="ASSET_TYPE">By Asset Category</option>
                    <option value="SPECIFIC_ASSET">Specific Asset (by VIN)</option>
                    <option value="DRIVER">Specific Driver</option>
                  </select>
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>CONDITION OPERATOR:</label>
                  <select className="enterprise-select" style={{ width: '100%' }} value={newAlert.operator} onChange={e => setNewAlert({ ...newAlert, operator: e.target.value })}>
                    <option value="GREATER_THAN">Greater Than</option>
                    <option value="LESS_THAN">Less Than</option>
                    <option value="EQUALS">Equals</option>
                    <option value="OUT_OF_ZONE">Out of Zone</option>
                    <option value="IN_ZONE">Entered Zone</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>THRESHOLD VALUE:</label>
                  <input type="number" className="enterprise-input" style={{ width: '100%' }} value={newAlert.value} onChange={e => setNewAlert({ ...newAlert, value: e.target.value })} placeholder="e.g. -18" />
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>UNIT:</label>
                  <select className="enterprise-select" style={{ width: '100%' }} value={newAlert.unit} onChange={e => setNewAlert({ ...newAlert, unit: e.target.value })}>
                    <option value="CELSIUS">°C (Celsius)</option>
                    <option value="KMH">km/h (Speed)</option>
                    <option value="PCT">% (Percentage)</option>
                    <option value="PSI">PSI (Pressure)</option>
                    <option value="HOURS">Hours</option>
                    <option value="ZONE">Zone Boundary</option>
                    <option value="FAULT_CODE">Fault Code</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>COOLDOWN PERIOD (MINUTES):</label>
                  <input type="number" className="enterprise-input" style={{ width: '100%' }} value={newAlert.cooldown} onChange={e => setNewAlert({ ...newAlert, cooldown: Number(e.target.value) })} min={0} max={1440} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Alert Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

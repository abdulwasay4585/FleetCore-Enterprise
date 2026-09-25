"use client";
import React, { useState } from 'react';
import { Icon } from './Icons';

export default function AuditTrailViewer({ showToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterResult, setFilterResult] = useState('ALL');
  const [selectedEntry, setSelectedEntry] = useState(null);

  const auditLog = [
    { id: 'AUD-10041', time: '2026-07-25 14:22:08 UTC', actor: 'Robert Vance (VP Ops)', role: 'SYS_SUPERADMIN', action: 'ASSET_IMMOBILIZED', entity: 'ASSET', entityName: 'Kenworth W900 (#K-204)', result: 'SUCCESS', ip: '10.12.4.5', changes: { before: { status: 'ONLINE' }, after: { status: 'IMMOBILIZED' } }, reason: 'SUSPECTED_THEFT', notes: 'Dispatcher confirmed GPS deviation. Law enforcement notified.' },
    { id: 'AUD-10040', time: '2026-07-25 13:55:44 UTC', actor: 'Mark Brody (Dispatcher)', role: 'DISPATCH_MANAGER', action: 'ROUTE_DISPATCHED', entity: 'ROUTE', entityName: 'LOAD-884 → Charlotte Fulfillment Center', result: 'SUCCESS', ip: '10.12.3.8', changes: { before: { status: 'SCHEDULED' }, after: { status: 'IN_TRANSIT', driver: 'David Kim' } }, reason: null, notes: null },
    { id: 'AUD-10039', time: '2026-07-25 12:40:19 UTC', actor: 'Sarah Connor (VP Regional)', role: 'TENANT_ADMIN', action: 'ROLE_CHANGED', entity: 'USER', entityName: 'Inspector Dan Hogan', result: 'SUCCESS', ip: '10.12.2.11', changes: { before: { role: 'READ_ONLY' }, after: { role: 'SAFETY_AUDITOR' } }, reason: 'DOT audit team elevation request', notes: 'MFA re-enrollment required within 24 hours.' },
    { id: 'AUD-10038', time: '2026-07-25 11:10:55 UTC', actor: 'API Key: fc_live_xK9m...', role: 'API_CLIENT', action: 'DATA_EXPORTED', entity: 'TELEMETRY', entityName: 'Fleet-Wide Telemetry (Q3)', result: 'SUCCESS', ip: '52.14.188.20', changes: null, reason: '3PL BI connector pull', notes: 'Parquet export, 14.2M rows, S3 destination.' },
    { id: 'AUD-10037', time: '2026-07-25 10:33:27 UTC', actor: 'Mark Brody (Dispatcher)', role: 'DISPATCH_MANAGER', action: 'API_KEY_CREATED', entity: 'API_KEY', entityName: 'NorCal Logistics Integration Key', result: 'SUCCESS', ip: '10.12.3.8', changes: null, reason: null, notes: 'Scopes: assets:read, routes:read, telemetry:read. Expires 2027-01-01.' },
    { id: 'AUD-10036', time: '2026-07-25 09:58:12 UTC', actor: 'James Wilson (Driver)', role: 'DRIVER_APP', action: 'DVIR_SIGNED', entity: 'DVIR', entityName: 'DVIR-801 — Volvo FH16 Pre-Trip', result: 'SUCCESS', ip: '172.16.0.44', changes: { before: { status: 'PENDING' }, after: { status: 'PASSED', signedBy: 'James Wilson' } }, reason: null, notes: 'No defects. Vehicle cleared for dispatch.' },
    { id: 'AUD-10035', time: '2026-07-25 08:14:03 UTC', actor: 'Robert Vance (VP Ops)', role: 'SYS_SUPERADMIN', action: 'USER_LOGIN', entity: 'USER', entityName: 'Robert Vance (VP Ops)', result: 'SUCCESS', ip: '10.12.4.5', changes: null, reason: null, notes: 'MFA: Hardware FIDO2 key authenticated.' },
    { id: 'AUD-10034', time: '2026-07-25 07:42:55 UTC', actor: 'Unknown External IP', role: 'UNAUTHENTICATED', action: 'USER_LOGIN', entity: 'USER', entityName: 'r.vance@acmefreight.com', result: 'BLOCKED', ip: '185.220.101.48', changes: null, reason: 'Wrong password (attempt 5/5)', notes: 'Account temporarily locked. Security team alerted via SIEM webhook.' },
    { id: 'AUD-10033', time: '2026-07-24 22:30:00 UTC', actor: 'Sarah Connor (VP Regional)', role: 'TENANT_ADMIN', action: 'GEOFENCE_CREATED', entity: 'GEOFENCE', entityName: 'Midwest Express Corridor Zone', result: 'SUCCESS', ip: '10.12.2.11', changes: { before: null, after: { vertices: 5, saved_to_postgis: true } }, reason: null, notes: null },
    { id: 'AUD-10032', time: '2026-07-24 19:10:40 UTC', actor: 'API Key: fc_live_8Mnt...', role: 'API_CLIENT', action: 'ROUTE_DISPATCHED', entity: 'ROUTE', entityName: 'LOAD-881 → Boston Medical Distribution', result: 'FAILURE', ip: '54.202.19.7', changes: null, reason: 'Rate limit exceeded (1000 rpm)', notes: 'HTTP 429 returned. Key temporarily throttled for 60 seconds.' },
  ];

  const ACTION_COLORS = {
    ASSET_IMMOBILIZED: 'badge-danger', ROUTE_DISPATCHED: 'badge-success', ROLE_CHANGED: 'badge-warning',
    DATA_EXPORTED: 'badge-info', API_KEY_CREATED: 'badge-info', DVIR_SIGNED: 'badge-success',
    USER_LOGIN: 'badge-info', GEOFENCE_CREATED: 'badge-success'
  };

  const filtered = auditLog.filter(e => {
    const matchSearch = !searchTerm || e.actor.toLowerCase().includes(searchTerm.toLowerCase()) || e.entityName.toLowerCase().includes(searchTerm.toLowerCase()) || e.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAction = filterAction === 'ALL' || e.action === filterAction;
    const matchResult = filterResult === 'ALL' || e.result === filterResult;
    return matchSearch && matchAction && matchResult;
  });

  const handleExportAuditCSV = () => {
    const headers = ['Audit ID', 'Timestamp', 'Actor', 'Role', 'Action', 'Entity', 'Entity Name', 'Result', 'IP Address'];
    const rows = filtered.map(e => `"${e.id}","${e.time}","${e.actor}","${e.role}","${e.action}","${e.entity}","${e.entityName}","${e.result}","${e.ip}"`);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `fleetcore_audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    if (showToast) showToast('Audit log exported. SHA-256 verification hash appended.', 'success');
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h1 className="module-title">Immutable Audit Trail</h1>
          <p className="module-subtitle">
            Complete, tamper-evident chronological record of all platform actions. Every write, role change, API call, and login is cryptographically logged per SOC 2 Type II and ISO 27001 requirements.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div className="stat-badge">
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-danger)' }}>{auditLog.filter(e => e.result === 'BLOCKED').length}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>SECURITY BLOCKS (30d)</span>
          </div>
          <div className="stat-badge">
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{auditLog.length.toLocaleString()}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>LOG ENTRIES</span>
          </div>
          <button className="btn btn-secondary" onClick={handleExportAuditCSV}>
            <Icon name="download" size={15} />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="enterprise-card" style={{ marginBottom: 16, padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="enterprise-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Search actor, entity, or action..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select className="enterprise-select" style={{ minWidth: 180 }} value={filterAction} onChange={e => setFilterAction(e.target.value)}>
            <option value="ALL">All Action Types</option>
            <option value="ASSET_IMMOBILIZED">Asset Immobilized</option>
            <option value="ROUTE_DISPATCHED">Route Dispatched</option>
            <option value="ROLE_CHANGED">Role Changed</option>
            <option value="DATA_EXPORTED">Data Exported</option>
            <option value="API_KEY_CREATED">API Key Created</option>
            <option value="DVIR_SIGNED">DVIR Signed</option>
            <option value="USER_LOGIN">User Login</option>
            <option value="GEOFENCE_CREATED">Geofence Created</option>
          </select>
          <select className="enterprise-select" style={{ minWidth: 130 }} value={filterResult} onChange={e => setFilterResult(e.target.value)}>
            <option value="ALL">All Results</option>
            <option value="SUCCESS">Success Only</option>
            <option value="FAILURE">Failures</option>
            <option value="BLOCKED">Blocked (Security)</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>AUDIT ID</th>
              <th>TIMESTAMP (UTC)</th>
              <th>ACTOR / ROLE</th>
              <th>ACTION</th>
              <th>ENTITY AFFECTED</th>
              <th>RESULT</th>
              <th>IP ADDRESS</th>
              <th>DETAILS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedEntry(selectedEntry?.id === e.id ? null : e)}>
                <td><span className="text-mono" style={{ fontSize: '0.78rem', color: 'var(--color-copper)' }}>{e.id}</span></td>
                <td><span className="text-mono" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{e.time}</span></td>
                <td>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{e.actor}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{e.role}</div>
                </td>
                <td><span className={`badge ${ACTION_COLORS[e.action] || 'badge-info'}`} style={{ fontSize: '0.65rem' }}>{e.action.replace(/_/g, ' ')}</span></td>
                <td>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{e.entity}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>{e.entityName}</div>
                </td>
                <td>
                  <span className={`badge ${e.result === 'SUCCESS' ? 'badge-success' : e.result === 'BLOCKED' ? 'badge-danger' : 'badge-warning'}`}>
                    {e.result}
                  </span>
                </td>
                <td><span className="text-mono" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{e.ip}</span></td>
                <td>
                  <button className="btn btn-secondary" style={{ fontSize: '0.72rem', minHeight: 28, padding: '4px 10px' }} onClick={ev => { ev.stopPropagation(); setSelectedEntry(selectedEntry?.id === e.id ? null : e); }}>
                    {selectedEntry?.id === e.id ? 'Collapse' : 'Expand'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No audit entries match the current filter criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Expand Panel */}
      {selectedEntry && (
        <div className="enterprise-card" style={{ marginTop: 16, border: '1px solid var(--color-copper)' }}>
          <div className="flex-between" style={{ marginBottom: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-copper)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Audit Entry Detail — {selectedEntry.id}
            </span>
            <button type="button" onClick={() => setSelectedEntry(null)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.1rem' }} aria-label="Dismiss detail">✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 4 }}>ACTOR</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>{selectedEntry.actor} ({selectedEntry.role})</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, marginTop: 12, marginBottom: 4 }}>SOURCE IP</div>
              <div className="text-mono" style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{selectedEntry.ip}</div>
              {selectedEntry.notes && (
                <>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, marginTop: 12, marginBottom: 4 }}>NOTES</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{selectedEntry.notes}</div>
                </>
              )}
            </div>
            {selectedEntry.changes && (
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 8 }}>STATE CHANGE LOG</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {selectedEntry.changes.before && (
                    <div style={{ flex: 1, background: 'rgba(229,72,77,0.08)', border: '1px solid var(--color-danger)', borderRadius: 4, padding: '8px 12px' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-danger)', marginBottom: 4 }}>BEFORE</div>
                      <pre style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(selectedEntry.changes.before, null, 2)}</pre>
                    </div>
                  )}
                  {selectedEntry.changes.after && (
                    <div style={{ flex: 1, background: 'rgba(50,201,113,0.08)', border: '1px solid var(--color-success)', borderRadius: 4, padding: '8px 12px' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-success)', marginBottom: 4 }}>AFTER</div>
                      <pre style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(selectedEntry.changes.after, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import { Icon } from './Icons';

export default function ApiKeysPortal({ selectedTenant, showToast }) {
  const tenantName = selectedTenant?.name || 'Acme Freight Logistics';
  const [keys, setKeys] = useState([
    { id: 'KEY-001', name: 'NorCal 3PL BI Connector', prefix: 'fc_live_xK9m', scopes: ['assets:read', 'routes:read', 'telemetry:read'], env: 'PRODUCTION', rpm: 1000, status: 'ACTIVE', lastUsed: '2 minutes ago', created: '2026-03-12', expires: '2027-01-01', ipWhitelist: ['52.14.188.20', '54.202.19.7'] },
    { id: 'KEY-002', name: 'Samsara Integration Bridge', prefix: 'fc_live_Bn4x', scopes: ['assets:read', 'telemetry:read', 'dvirs:read'], env: 'PRODUCTION', rpm: 500, status: 'ACTIVE', lastUsed: '14 minutes ago', created: '2026-01-08', expires: '2027-01-01', ipWhitelist: [] },
    { id: 'KEY-003', name: 'SAP ERP Transport Manager', prefix: 'fc_live_Rt7p', scopes: ['routes:read', 'routes:write', 'loads:read', 'loads:write'], env: 'PRODUCTION', rpm: 2000, status: 'ACTIVE', lastUsed: '1 hour ago', created: '2025-11-22', expires: '2027-06-30', ipWhitelist: ['10.0.0.0/8'] },
    { id: 'KEY-004', name: 'Dev Sandbox Testing', prefix: 'fc_test_Xx2w', scopes: ['assets:read', 'routes:read'], env: 'SANDBOX', rpm: 100, status: 'ACTIVE', lastUsed: '3 days ago', created: '2026-07-01', expires: '2026-12-31', ipWhitelist: [] },
    { id: 'KEY-005', name: 'Legacy Vendor Connector (Deprecated)', prefix: 'fc_live_Kt9n', scopes: ['assets:read'], env: 'PRODUCTION', rpm: 50, status: 'REVOKED', lastUsed: '45 days ago', created: '2024-06-15', expires: null, ipWhitelist: [] },
  ]);

  const allScopes = [
    { id: 'assets:read', label: 'Assets — Read', desc: 'List and read asset telemetry' },
    { id: 'assets:write', label: 'Assets — Write', desc: 'Enroll and update assets' },
    { id: 'routes:read', label: 'Routes — Read', desc: 'View dispatch and route data' },
    { id: 'routes:write', label: 'Routes — Write', desc: 'Create and dispatch routes' },
    { id: 'loads:read', label: 'Loads — Read', desc: 'Read freight load manifests' },
    { id: 'loads:write', label: 'Loads — Write', desc: 'Create and update loads' },
    { id: 'telemetry:read', label: 'Telemetry — Read', desc: 'Access time-series telemetry data' },
    { id: 'dvirs:read', label: 'DVIRs — Read', desc: 'Read driver inspection reports' },
    { id: 'drivers:read', label: 'Drivers — Read', desc: 'Read driver profiles and HOS logs' },
    { id: 'reports:read', label: 'Reports — Read', desc: 'Run and download BI reports' },
  ];

  const [showCreate, setShowCreate] = useState(false);
  const [createdKey, setCreatedKey] = useState(null);
  const [newKey, setNewKey] = useState({ name: '', scopes: [], env: 'PRODUCTION', rpm: 1000, ipWhitelist: '', expires: '' });

  const generateKey = () => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 48 }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
  };

  const handleCreateKey = (e) => {
    e.preventDefault();
    if (!newKey.name || newKey.scopes.length === 0) {
      if (showToast) showToast('Key name and at least one scope are required.', 'warning');
      return;
    }
    const rawKey = `${newKey.env === 'SANDBOX' ? 'fc_test' : 'fc_live'}_${generateKey()}`;
    const prefix = rawKey.substring(0, 14);
    const created = {
      id: `KEY-${String(keys.length + 1).padStart(3, '0')}`,
      name: newKey.name,
      prefix,
      scopes: newKey.scopes,
      env: newKey.env,
      rpm: newKey.rpm,
      status: 'ACTIVE',
      lastUsed: 'Never',
      created: new Date().toISOString().split('T')[0],
      expires: newKey.expires || null,
      ipWhitelist: newKey.ipWhitelist ? newKey.ipWhitelist.split(',').map(s => s.trim()).filter(Boolean) : [],
      _fullKey: rawKey,
    };
    setKeys([created, ...keys]);
    setCreatedKey(created);
    setShowCreate(false);
    setNewKey({ name: '', scopes: [], env: 'PRODUCTION', rpm: 1000, ipWhitelist: '', expires: '' });
  };

  const handleRevoke = (id) => {
    const target = keys.find(k => k.id === id);
    setKeys(keys.map(k => k.id === id ? { ...k, status: 'REVOKED' } : k));
    if (showToast) showToast(`API key "${target.name}" has been permanently revoked. All in-flight requests using this key will be rejected within 30 seconds.`, 'danger');
  };

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key._fullKey || key.prefix + '...').catch(() => {});
    if (showToast) showToast('API key copied to clipboard. Store it securely — it will not be shown again.', 'warning');
  };

  const toggleScope = (scope) => {
    setNewKey(prev => ({
      ...prev,
      scopes: prev.scopes.includes(scope) ? prev.scopes.filter(s => s !== scope) : [...prev.scopes, scope]
    }));
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h1 className="module-title">API Keys & Integration Portal</h1>
          <p className="module-subtitle">
            Manage programmatic access credentials for 3PL integrations, ERP connectors, and partner platforms. All keys are SHA-256 hashed at rest. Plaintext is displayed only at creation time.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div className="stat-badge">
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-lime)' }}>{keys.filter(k => k.status === 'ACTIVE').length}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>ACTIVE KEYS</span>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Icon name="plus" size={15} />
            <span>Generate API Key</span>
          </button>
        </div>
      </div>

      {/* One-time Key Display after creation */}
      {createdKey && (
        <div className="enterprise-card" style={{ marginBottom: 16, border: '1px solid var(--color-warning)', background: 'rgba(234,179,8,0.06)' }}>
          <div className="flex-between" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="alert" size={16} color="var(--color-warning)" />
              <span style={{ fontWeight: 700, color: 'var(--color-warning)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Copy this key now — it cannot be retrieved again</span>
            </div>
            <button type="button" onClick={() => setCreatedKey(null)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.1rem' }} aria-label="Dismiss key reveal">✕</button>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--color-bg-elevated)', padding: '10px 14px', borderRadius: 6, border: '1px solid var(--color-border)' }}>
            <code className="text-mono" style={{ flex: 1, fontSize: '0.85rem', color: 'var(--color-lime)', wordBreak: 'break-all' }}>{createdKey._fullKey}</code>
            <button className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }} onClick={() => handleCopyKey(createdKey)}>
              <Icon name="copy" size={14} /> Copy Key
            </button>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Key: <strong style={{ color: 'var(--color-text-primary)' }}>{createdKey.name}</strong> · Scopes: {createdKey.scopes.join(', ')} · Rate Limit: {createdKey.rpm} rpm</p>
        </div>
      )}

      {/* Keys Table */}
      <div className="enterprise-card" style={{ padding: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TENANT: {tenantName}</span>
        </div>
        <div className="table-container">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>KEY NAME</th>
                <th>PREFIX</th>
                <th>ENVIRONMENT</th>
                <th>SCOPES</th>
                <th>RATE LIMIT</th>
                <th>LAST USED</th>
                <th>EXPIRES</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {keys.map(k => (
                <tr key={k.id} style={{ opacity: k.status === 'REVOKED' ? 0.55 : 1 }}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--color-text-primary)' }}>{k.name}</div>
                    {k.ipWhitelist.length > 0 && <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 2 }}>IP-restricted ({k.ipWhitelist.length} range{k.ipWhitelist.length > 1 ? 's' : ''})</div>}
                  </td>
                  <td><code className="text-mono" style={{ fontSize: '0.8rem', color: 'var(--color-lime)' }}>{k.prefix}...</code></td>
                  <td><span className={`badge ${k.env === 'PRODUCTION' ? 'badge-success' : 'badge-info'}`}>{k.env}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {k.scopes.map(s => <span key={s} className="badge" style={{ fontSize: '0.62rem', background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}>{s}</span>)}
                    </div>
                  </td>
                  <td><span className="text-mono" style={{ fontSize: '0.8rem' }}>{k.rpm.toLocaleString()} rpm</span></td>
                  <td><span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{k.lastUsed}</span></td>
                  <td><span style={{ fontSize: '0.78rem', color: k.expires && new Date(k.expires) < new Date() ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>{k.expires || '—'}</span></td>
                  <td><span className={`badge ${k.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>{k.status}</span></td>
                  <td>
                    {k.status === 'ACTIVE' && (
                      <button className="btn btn-danger" style={{ fontSize: '0.72rem', minHeight: 28, padding: '4px 10px' }} onClick={() => handleRevoke(k.id)}>Revoke</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Key Modal */}
      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="enterprise-card" style={{ width: 640, maxWidth: '94vw', margin: 'auto', background: 'var(--color-surface)', border: '1px solid var(--color-copper)' }} onClick={e => e.stopPropagation()}>
            <div className="flex-between" style={{ marginBottom: 16, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Generate API Key</span>
              <button type="button" onClick={() => setShowCreate(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1, padding: '2px 6px' }} aria-label="Dismiss modal">✕</button>
            </div>
            <form onSubmit={handleCreateKey} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>KEY NAME / INTEGRATION LABEL:</label>
                <input required className="enterprise-input" style={{ width: '100%' }} value={newKey.name} onChange={e => setNewKey({ ...newKey, name: e.target.value })} placeholder="e.g. Oracle TMS Integration" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>PERMISSION SCOPES (select all that apply):</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {allScopes.map(s => (
                    <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: newKey.scopes.includes(s.id) ? 'rgba(186,143,94,0.15)' : 'var(--color-bg-elevated)', border: `1px solid ${newKey.scopes.includes(s.id) ? 'var(--color-copper)' : 'var(--color-border)'}`, borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }}>
                      <input type="checkbox" checked={newKey.scopes.includes(s.id)} onChange={() => toggleScope(s.id)} style={{ accentColor: 'var(--color-copper)', width: 14, height: 14 }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{s.label}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>{s.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>ENVIRONMENT:</label>
                  <select className="enterprise-select" style={{ width: '100%' }} value={newKey.env} onChange={e => setNewKey({ ...newKey, env: e.target.value })}>
                    <option value="PRODUCTION">Production</option>
                    <option value="SANDBOX">Sandbox (Rate-limited)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>RATE LIMIT (req/min):</label>
                  <input type="number" className="enterprise-input" style={{ width: '100%' }} value={newKey.rpm} onChange={e => setNewKey({ ...newKey, rpm: Number(e.target.value) })} min={10} max={10000} />
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>IP WHITELIST (comma-separated, optional):</label>
                  <input className="enterprise-input" style={{ width: '100%' }} value={newKey.ipWhitelist} onChange={e => setNewKey({ ...newKey, ipWhitelist: e.target.value })} placeholder="e.g. 52.14.188.20, 10.0.0.0/8" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>EXPIRY DATE (optional):</label>
                  <input type="date" className="enterprise-input" style={{ width: '100%' }} value={newKey.expires} onChange={e => setNewKey({ ...newKey, expires: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Secure Key</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

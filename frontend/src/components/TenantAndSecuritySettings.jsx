"use client";
import React, { useState } from 'react';
import { Icon } from './Icons';
import AuditTrailViewer from './AuditTrailViewer';
import ApiKeysPortal from './ApiKeysPortal';
import AlertsConfigManager from './AlertsConfigManager';

export default function TenantAndSecuritySettings({ selectedTenant, currentTenant, onNavigateToModule, showToast }) {
  const activeTenant = selectedTenant || currentTenant || { 
    name: 'Acme Freight Logistics', 
    id: 'TENANT_ACME_01', 
    tier: 'ENTERPRISE' 
  };

  const [activeTab, setActiveTab] = useState('RBAC');
  const [notification, setNotification] = useState(null);

  // RBAC Roles (Feature 37 & Section 15)
  const [users, setUsers] = useState([
    { id: 'USR-01', name: 'Robert Vance (VP Ops)', email: 'r.vance@acmefreight.com', role: 'SYS_SUPERADMIN', tenant: 'GLOBAL_SYSTEM_ROOT', mfa: 'ENABLED (Hardware Key)', status: 'ACTIVE' },
    { id: 'USR-02', name: 'Sarah Connor (Regional VP)', email: 's.connor@acmefreight.com', role: 'TENANT_ADMIN', tenant: 'Acme Freight Logistics', mfa: 'ENABLED (TOTP)', status: 'ACTIVE' },
    { id: 'USR-03', name: 'Mark Brody (Chief Dispatcher)', email: 'm.brody@acmefreight.com', role: 'DISPATCH_MANAGER', tenant: 'Acme Freight Logistics', mfa: 'ENABLED (TOTP)', status: 'ACTIVE' },
    { id: 'USR-04', name: 'Inspector Dan Hogan', email: 'd.hogan@dot-state.gov', role: 'SAFETY_AUDITOR', tenant: 'Acme Freight Logistics', mfa: 'ENABLED (SMS)', status: 'READ_ONLY_AUDIT' },
    { id: 'USR-05', name: 'James Wilson (Cab Tablet)', email: 'j.wilson-cab@acmefreight.com', role: 'DRIVER_APP', tenant: 'Acme Freight Logistics', mfa: 'EXEMPT_DEVICE_BIND', status: 'ACTIVE' }
  ]);

  // Zero-Trust mTLS IoT X.509 Certificates (Feature 38 & Section 16)
  const [certs, setCerts] = useState([
    { thumbprint: 'SHA-256:4E:91:A8:F2:70:01', vin: '19X91929410912 (Volvo FH16)', issued: '2025-01-15', expires: '2028-01-15', socket: 'TCP :9095 ESTABLISHED', status: 'VERIFIED_ACTIVE' },
    { thumbprint: 'SHA-256:88:Y4:14:90:21:44', vin: '88Y41490214456 (Kenworth W900)', issued: '2025-02-10', expires: '2028-02-10', socket: 'TCP :9095 ESTABLISHED', status: 'VERIFIED_ACTIVE' },
    { thumbprint: 'SHA-256:EV:90:21:44:11:80', vin: 'EV902144118099 (BrightDrop Zevo)', issued: '2026-03-01', expires: '2029-03-01', socket: 'TCP :9095 ESTABLISHED', status: 'VERIFIED_ACTIVE' },
    { thumbprint: 'SHA-256:99:AA:82:11:00:19', vin: 'ROGUE-DEVICE-UNNAMED-IP', issued: '2026-07-20', expires: '2027-07-20', socket: 'REJECTED_SSL_HANDSHAKE', status: 'REVOKED_BY_SECURITY' }
  ]);

  // Webhook ERP Integrations (Feature 39)
  const [webhooks, setWebhooks] = useState([
    { id: 'WH-801', name: 'SAP ERP Financial Fuel clearing', url: 'https://erp-gateway.acme-logistics.internal/webhooks/fuel-burn', events: ['FUEL_TRANSACTION', 'IFTA_MILEAGE'], status: 'ENABLED', failures: 0, lastPing: 'HTTP 200 OK (38ms)' },
    { id: 'WH-802', name: 'Oracle NetSuite Fleet Work Orders', url: 'https://netsuite.acme.com/api/v2/fleet-repairs', events: ['MAINTENANCE_TICKET_OPEN', 'PARTS_REORDER_EDI'], status: 'ENABLED', failures: 0, lastPing: 'HTTP 200 OK (52ms)' },
    { id: 'WH-803', name: 'State Police stolen Vehicle Notification', url: 'https://dispatch.statepatrol.gov/api/v1/interdictions', events: ['THEFT_IMMOBILIZE_TRIGGERED', 'UNAUTHORIZED_GEOFENCE_EXIT'], status: 'ENABLED', failures: 0, lastPing: 'HTTP 200 OK (24ms)' }
  ]);

  // Modal States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'DISPATCH_MANAGER',
    tenant: activeTenant.name,
    mfa: 'ENABLED (TOTP)'
  });

  const [showCertModal, setShowCertModal] = useState(false);
  const [newCertForm, setNewCertForm] = useState({
    vin: '1FDWF5HT9KEC28910 (Freightliner Cascadia)',
    algo: 'RSA-2048 (SHA-256)',
    validity: '3_YEARS',
    caSubject: 'CN=FleetCore Internal Hardware Intermediate CA 01'
  });

  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [newWebhookForm, setNewWebhookForm] = useState({
    name: '',
    url: '',
    events: ['FUEL_TRANSACTION', 'MAINTENANCE_TICKET_OPEN'],
    secret: 'whsec_' + (typeof window !== 'undefined' ? Math.random().toString(36).substring(2, 15) : 'dynamic_key')
  });

  const [editingPermissionsUser, setEditingPermissionsUser] = useState(null);

  const showBanner = (text) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleRevokeCert = (thumbprint) => {
    setCerts(certs.map(c => c.thumbprint === thumbprint ? { ...c, status: 'REVOKED_BY_SECURITY', socket: 'SOCKET_FORCE_CLOSED' } : c));
    showBanner(`mTLS Certificate ${thumbprint} added to Certificate Revocation List (CRL). Ingestion socket closed.`);
  };

  const handleCreateUserSubmit = (e) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) return;
    const created = {
      id: `USR-0${users.length + 1}`,
      name: newUserForm.name,
      email: newUserForm.email,
      role: newUserForm.role,
      tenant: newUserForm.tenant,
      mfa: newUserForm.mfa,
      status: 'ACTIVE'
    };
    setUsers([...users, created]);
    setShowAddUserModal(false);
    setNewUserForm({ name: '', email: '', role: 'DISPATCH_MANAGER', tenant: activeTenant.name, mfa: 'ENABLED (TOTP)' });
    showBanner(`Employee account provisioned for ${created.name} (${created.role}).`);
  };

  const handleCreateCertSubmit = (e) => {
    e.preventDefault();
    const newThumb = `SHA-256:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:99:A1`;
    const newCert = {
      thumbprint: newThumb,
      vin: newCertForm.vin,
      issued: '2026-09-24',
      expires: '2029-09-24',
      socket: 'TCP :9095 AWAITING_CONN',
      status: 'VERIFIED_ACTIVE'
    };
    setCerts([newCert, ...certs]);
    setShowCertModal(false);
    showBanner(`Issued X.509 Client Certificate (${newThumb}) for ${newCertForm.vin}.`);
  };

  const handleCreateWebhookSubmit = (e) => {
    e.preventDefault();
    if (!newWebhookForm.name || !newWebhookForm.url) return;
    const wh = {
      id: `WH-80${webhooks.length + 1}`,
      name: newWebhookForm.name,
      url: newWebhookForm.url,
      events: newWebhookForm.events,
      status: 'ENABLED',
      failures: 0,
      lastPing: 'HTTP 200 OK (New)'
    };
    setWebhooks([...webhooks, wh]);
    setShowWebhookModal(false);
    setNewWebhookForm({ name: '', url: '', events: ['FUEL_TRANSACTION'], secret: 'whsec_' + Math.random().toString(36).substring(7) });
    showBanner(`Registered ERP webhook endpoint: ${wh.name}.`);
  };

  const handlePingWebhook = (whId) => {
    setWebhooks(webhooks.map(wh => {
      if (wh.id === whId) {
        const pingMs = Math.floor(22 + Math.random() * 30);
        return { ...wh, lastPing: `HTTP 200 OK (${pingMs}ms)` };
      }
      return wh;
    }));
    showBanner(`Dispatched mock signed HMAC payload to ${whId}. Received HTTP 200 OK response.`);
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Top Header */}
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
            Tenant Administration & Zero-Trust Cryptography
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Multi-tenant role-based access control (RBAC), X.509 hardware certificate provisioning, ERP webhook registries, and enterprise organization governance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className={`btn ${activeTab === 'RBAC' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('RBAC')}>
            RBAC Role Hierarchy
          </button>
          <button className={`btn ${activeTab === 'MTLS' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('MTLS')}>
            Zero-Trust mTLS Vault
          </button>
          <button className={`btn ${activeTab === 'WEBHOOKS' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('WEBHOOKS')}>
            ERP Webhook Registry
          </button>
          <button className={`btn ${activeTab === 'AUDIT' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('AUDIT')}>
            <Icon name="activity" size={14} />
            Audit Trail
          </button>
          <button className={`btn ${activeTab === 'APIKEYS' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('APIKEYS')}>
            <Icon name="key" size={14} />
            API Keys
          </button>
          <button className={`btn ${activeTab === 'ALERTS' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('ALERTS')}>
            <Icon name="alert" size={14} />
            Alert Rules
          </button>
          <button className={`btn ${activeTab === 'TENANT' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('TENANT')}>
            Organization Settings
          </button>
        </div>
      </div>

      {/* Dynamic Action Notification Banner */}
      {notification && (
        <div style={{
          padding: '12px 18px',
          background: 'rgba(50, 201, 113, 0.12)',
          border: '1px solid var(--color-success)',
          borderRadius: 'var(--radius-card)',
          color: 'var(--color-text-primary)',
          fontSize: '0.88rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20
        }}>
          <div><strong>Security Control Engine:</strong> {notification}</div>
          <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setNotification(null)}>Dismiss</button>
        </div>
      )}

      {/* Security Status Ribbon */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="enterprise-card" style={{ padding: '14px 18px', borderLeft: '4px solid var(--color-success)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>ZERO-TRUST INGEST SOCKET</div>
          <div className="text-mono" style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--color-success)', margin: '4px 0' }}>
            TLS 1.3 <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>mTLS Active</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>X.509 mutual client validation enforced</div>
        </div>

        <div className="enterprise-card" style={{ padding: '14px 18px', borderLeft: '4px solid var(--color-info)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>ACTIVE RBAC IDENTITIES</div>
          <div className="text-mono" style={{ fontSize: '1.7rem', fontWeight: 800, color: '#FFF', margin: '4px 0' }}>
            {users.length} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Accounts</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>100% MFA Two-Factor Adherence</div>
        </div>

        <div className="enterprise-card" style={{ padding: '14px 18px', borderLeft: '4px solid var(--color-warning)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>ENTERPRISE ERP WEBHOOKS</div>
          <div className="text-mono" style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--color-warning)', margin: '4px 0' }}>
            {webhooks.length} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Connected</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>0 Delivery failures over last 30 days</div>
        </div>

        <div className="enterprise-card" style={{ padding: '14px 18px', borderLeft: '4px solid var(--color-lime)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>ORGANIZATION TENANT TIER</div>
          <div className="text-mono" style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--color-lime)', margin: '4px 0' }}>
            {activeTenant.tier || 'ENTERPRISE'} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Tier</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Unlimited Assets & Edge Telematics Enabled</div>
        </div>
      </div>

      {/* TAB 1: RBAC ROLE MANAGEMENT */}
      {activeTab === 'RBAC' && (
        <div className="enterprise-card">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>
              <span>RBAC IDENTITIES &amp; ROLE PERMISSION MATRIX</span>
              <span className="badge badge-info">SPRING SECURITY JWT ENFORCED</span>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAddUserModal(true)}>
              Provision New Account
            </button>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginBottom: 20 }}>
            Granular access control defined by Section 15 hierarchy. From unrestricted root <span className="text-mono">SYS_SUPERADMIN</span> down to read-only DOT <span className="text-mono">SAFETY_AUDITOR</span> roles, every Spring Boot API endpoint verifies JWT role payloads.
          </p>

          <div className="table-container">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Account Identifier</th>
                  <th>Employee Full Name & Email</th>
                  <th>RBAC Privilege Role (Sec 15)</th>
                  <th>Organization Tenant Binding</th>
                  <th>MFA / Two-Factor Protocol</th>
                  <th>Account Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="text-mono" style={{ fontWeight: 700, color: 'var(--color-info)' }}>{u.id}</td>
                    <td>
                      <strong style={{ color: '#FFF', display: 'block' }}>{u.name}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{u.email}</span>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'SYS_SUPERADMIN' ? 'badge-danger' : u.role === 'TENANT_ADMIN' ? 'badge-warning' : 'badge-info'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--color-copper)', fontWeight: 600 }}>
                      {u.tenant}
                    </td>
                    <td className="text-mono" style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                      {u.mfa}
                    </td>
                    <td>
                      <span className="badge badge-success">{u.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setEditingPermissionsUser(u)}>
                        Edit Permissions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ZERO-TRUST mTLS CERTIFICATE REVOCATION VAULT */}
      {activeTab === 'MTLS' && (
        <div className="enterprise-card">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>
              <span>ZERO-TRUST mTLS HARDWARE CERTIFICATE VAULT</span>
              <span className="badge badge-danger">TLS 1.3 MUTUAL AUTHENTICATION</span>
            </div>
            <button className="btn btn-primary" onClick={() => setShowCertModal(true)}>
              Issue X.509 Certificate
            </button>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginBottom: 20 }}>
            Physical telematics hardware gateways must present an active X.509 mutual client certificate during the TLS handshake to connect to Go ingestion streams (:9095). Revoking a certificate immediately terminates the session and rejects unverified datagrams.
          </p>

          <div className="table-container">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>X.509 Cryptographic Thumbprint</th>
                  <th>Bound Vehicle VIN / IMEI Modem</th>
                  <th>Issuance Date</th>
                  <th>Expiration Stamp</th>
                  <th>Live Go Ingestion Socket State</th>
                  <th>Cert Authorization State</th>
                  <th style={{ textAlign: 'right' }}>Security Override</th>
                </tr>
              </thead>
              <tbody>
                {certs.map((c, idx) => (
                  <tr key={idx} style={{ background: c.status.includes('REVOKED') ? 'rgba(229, 72, 77, 0.08)' : 'transparent' }}>
                    <td className="text-mono" style={{ color: 'var(--color-info)', fontWeight: 700 }}>
                      {c.thumbprint}
                    </td>
                    <td>
                      <strong style={{ color: '#FFF', display: 'block' }}>{c.vin}</strong>
                    </td>
                    <td className="text-mono" style={{ fontSize: '0.82rem' }}>{c.issued}</td>
                    <td className="text-mono" style={{ fontSize: '0.82rem' }}>{c.expires}</td>
                    <td className="text-mono" style={{ fontSize: '0.82rem', color: c.socket.includes('ESTABLISHED') ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 700 }}>
                      {c.socket}
                    </td>
                    <td>
                      <span className={`badge ${c.status.includes('ACTIVE') ? 'badge-success' : 'badge-danger'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {c.status.includes('ACTIVE') ? (
                        <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleRevokeCert(c.thumbprint)}>
                          Revoke Certificate
                        </button>
                      ) : (
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} disabled>
                          Revoked
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WEBHOOK ERP REGISTRY */}
      {activeTab === 'WEBHOOKS' && (
        <div className="enterprise-card">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>
              <span>ENTERPRISE ERP WEBHOOK REGISTRY &amp; CUSTOM ENDPOINTS</span>
              <span className="badge badge-success">SHA-256 HMAC SIGNED</span>
            </div>
            <button className="btn btn-primary" onClick={() => setShowWebhookModal(true)}>
              Register ERP Endpoint
            </button>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginBottom: 20 }}>
            Real-time HTTP/HTTPS JSON webhook notification deliveries triggered by Kafka telemetry event consumers. Enables bidirectional event synchronisation with SAP S/4HANA, Oracle NetSuite, and Salesforce enterprise resource clusters.
          </p>

          <div className="table-container">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Webhook ID</th>
                  <th>Integration Description</th>
                  <th>Destination HTTP Endpoint URL</th>
                  <th>Subscribed Telemetry Trigger Events</th>
                  <th>Last Ping Response</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Test Payload</th>
                </tr>
              </thead>
              <tbody>
                {webhooks.map((wh) => (
                  <tr key={wh.id}>
                    <td className="text-mono" style={{ fontWeight: 700, color: 'var(--color-info)' }}>{wh.id}</td>
                    <td><strong style={{ color: '#FFF' }}>{wh.name}</strong></td>
                    <td className="text-mono" style={{ fontSize: '0.8rem', color: 'var(--color-copper)' }}>{wh.url}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {wh.events.map((e, idx) => (
                          <span key={idx} className="badge badge-info" style={{ fontSize: '0.68rem' }}>{e}</span>
                        ))}
                      </div>
                    </td>
                    <td className="text-mono" style={{ fontSize: '0.8rem', color: 'var(--color-success)' }}>
                      {wh.lastPing}
                    </td>
                    <td>
                      <span className="badge badge-success">{wh.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handlePingWebhook(wh.id)}>
                        Ping Endpoint
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: TENANT BRANDING & ISOLATION */}
      {activeTab === 'TENANT' && (
        <div className="enterprise-card">
          <div className="card-title">
            <span>MULTI-TENANT ORGANIZATION &amp; GOVERNANCE</span>
            <span className="badge badge-info">CURRENT TENANT: {activeTenant.name.toUpperCase()}</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginBottom: 24 }}>
            Customize corporate branding, theme color palettes, and invoice billing parameters for tenant <span className="text-mono">{activeTenant.name}</span>. Data isolation enforced natively across PostgreSQL <span className="text-mono">tenant_id</span> schemas and TimescaleDB partitions.
          </p>

          <div className="grid-2" style={{ gap: 24, background: 'var(--color-dark-bg)', padding: 22, borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>ORGANIZATION COMPANY NAME:</label>
              <input type="text" className="enterprise-input" style={{ width: '100%', marginBottom: 16 }} defaultValue={activeTenant.name} />

              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>PRIMARY ACCENT THEME COLOR:</label>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                {['var(--color-copper)', 'var(--color-lime)', 'var(--color-info)', 'var(--color-warning)'].map(color => (
                  <div key={color} style={{ width: 34, height: 34, borderRadius: 'var(--radius-card)', background: color, border: '2px solid var(--color-border-bright)', cursor: 'pointer' }}></div>
                ))}
              </div>

              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>TENANT BILLING TIER:</label>
              <select className="enterprise-select" style={{ width: '100%' }} defaultValue={activeTenant.tier}>
                <option value="ENTERPRISE">Enterprise Mission Control (Unlimited Vehicles + ML Sidecar)</option>
                <option value="PRO">Professional Fleet (Up to 100 Commercial Vehicles)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--color-surface)', padding: 20, borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#FFF', marginBottom: 10 }}> TENANT DATABASE SCHEMA ISOLATION</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                  All API requests under this tenant automatically append <span className="text-mono">WHERE tenant_id = '{activeTenant.id || 'TENANT_ACME_01'}'</span> to JPA repositories and Flink streaming evaluation topics.
                </p>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-lime)', fontWeight: 600 }}>
                   Cross-tenant leakage protection: PASSED (SOC 2 Type II Verified)
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={() => showBanner('Tenant branding and billing configuration successfully saved.')}>
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT TRAIL */}
      {activeTab === 'AUDIT' && (
        <AuditTrailViewer showToast={showToast} />
      )}

      {/* TAB 6: API KEYS PORTAL */}
      {activeTab === 'APIKEYS' && (
        <ApiKeysPortal selectedTenant={selectedTenant || currentTenant} showToast={showToast} />
      )}

      {/* TAB 7: ALERT RULES CONFIG */}
      {activeTab === 'ALERTS' && (
        <AlertsConfigManager showToast={showToast} />
      )}

      {/* PROVISION USER MODAL */}
      {showAddUserModal && (
        <div className="modal-backdrop" onClick={() => setShowAddUserModal(false)}>
          <div 
            className="enterprise-card" 
            style={{ 
              width: 520, 
              maxWidth: '92vw', 
              backgroundColor: '#1D2329', 
              background: '#1D2329', 
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)', 
              border: '1px solid var(--color-border)', 
              padding: 24,
              position: 'relative',
              zIndex: 1000
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-between" style={{ marginBottom: 16, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
              <div className="card-title" style={{ margin: 0 }}>
                <span>PROVISION NEW ENTERPRISE IDENTITY</span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddUserModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>EMPLOYEE FULL NAME:</label>
                  <input 
                    type="text" 
                    className="enterprise-input" 
                    style={{ width: '100%' }}
                    placeholder="e.g. David Miller"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>CORPORATE EMAIL ADDRESS:</label>
                  <input 
                    type="email" 
                    className="enterprise-input" 
                    style={{ width: '100%' }}
                    placeholder="d.miller@acmefreight.com"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="grid-2" style={{ gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>RBAC PRIVILEGE ROLE:</label>
                    <select 
                      className="enterprise-select" 
                      style={{ width: '100%' }}
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    >
                      <option value="DISPATCH_MANAGER">DISPATCH_MANAGER</option>
                      <option value="TENANT_ADMIN">TENANT_ADMIN</option>
                      <option value="SAFETY_AUDITOR">SAFETY_AUDITOR (Read-only)</option>
                      <option value="SYS_SUPERADMIN">SYS_SUPERADMIN</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>MFA AUTHENTICATION:</label>
                    <select 
                      className="enterprise-select" 
                      style={{ width: '100%' }}
                      value={newUserForm.mfa}
                      onChange={(e) => setNewUserForm({ ...newUserForm, mfa: e.target.value })}
                    >
                      <option value="ENABLED (TOTP)">TOTP App (Google/Authy)</option>
                      <option value="ENABLED (Hardware Key)">FIDO2 / WebAuthn Key</option>
                      <option value="ENABLED (SMS)">SMS Fallback Code</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddUserModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Provision Identity</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE CERTIFICATE MODAL */}
      {showCertModal && (
        <div className="modal-backdrop" onClick={() => setShowCertModal(false)}>
          <div 
            className="enterprise-card" 
            style={{ 
              width: 560, 
              maxWidth: '92vw', 
              backgroundColor: '#1D2329', 
              background: '#1D2329', 
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)', 
              border: '1px solid var(--color-border)', 
              padding: 24,
              position: 'relative',
              zIndex: 1000
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-between" style={{ marginBottom: 16, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
              <div className="card-title" style={{ margin: 0 }}>
                <span>ISSUE X.509 HARDWARE GATEWAY CERTIFICATE</span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCertModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCertSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>VEHICLE VIN / GATEWAY IMEI:</label>
                  <input 
                    type="text" 
                    className="enterprise-input" 
                    style={{ width: '100%' }}
                    value={newCertForm.vin}
                    onChange={(e) => setNewCertForm({ ...newCertForm, vin: e.target.value })}
                    required
                  />
                </div>

                <div className="grid-2" style={{ gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>CRYPTO KEY ALGORITHM:</label>
                    <select 
                      className="enterprise-select" 
                      style={{ width: '100%' }}
                      value={newCertForm.algo}
                      onChange={(e) => setNewCertForm({ ...newCertForm, algo: e.target.value })}
                    >
                      <option value="RSA-2048 (SHA-256)">RSA-2048 (SHA-256)</option>
                      <option value="ECDSA P-256 (SHA-256)">ECDSA NIST P-256</option>
                      <option value="Ed25519">Ed25519 (High Performance)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>VALIDITY LIFESPAN:</label>
                    <select 
                      className="enterprise-select" 
                      style={{ width: '100%' }}
                      value={newCertForm.validity}
                      onChange={(e) => setNewCertForm({ ...newCertForm, validity: e.target.value })}
                    >
                      <option value="3_YEARS">3 Years (Standard OEM Modem)</option>
                      <option value="1_YEAR">1 Year (High Security Audit)</option>
                      <option value="5_YEARS">5 Years (Long-haul Asset)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>SIGNING CA AUTHORITY:</label>
                  <input 
                    type="text" 
                    className="enterprise-input text-mono" 
                    style={{ width: '100%', fontSize: '0.78rem' }}
                    value={newCertForm.caSubject}
                    readOnly
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCertModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Sign &amp; Issue Certificate</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER WEBHOOK MODAL */}
      {showWebhookModal && (
        <div className="modal-backdrop" onClick={() => setShowWebhookModal(false)}>
          <div 
            className="enterprise-card" 
            style={{ 
              width: 560, 
              maxWidth: '92vw', 
              backgroundColor: '#1D2329', 
              background: '#1D2329', 
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)', 
              border: '1px solid var(--color-border)', 
              padding: 24,
              position: 'relative',
              zIndex: 1000
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-between" style={{ marginBottom: 16, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
              <div className="card-title" style={{ margin: 0 }}>
                <span>REGISTER ERP WEBHOOK INTEGRATION</span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowWebhookModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWebhookSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>INTEGRATION NAME / SYSTEM:</label>
                  <input 
                    type="text" 
                    className="enterprise-input" 
                    style={{ width: '100%' }}
                    placeholder="e.g. Workday Payroll Driver Hours"
                    value={newWebhookForm.name}
                    onChange={(e) => setNewWebhookForm({ ...newWebhookForm, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>DESTINATION HTTPS WEBHOOK URL:</label>
                  <input 
                    type="url" 
                    className="enterprise-input text-mono" 
                    style={{ width: '100%', fontSize: '0.82rem' }}
                    placeholder="https://api.workday.com/webhooks/fleetcore-events"
                    value={newWebhookForm.url}
                    onChange={(e) => setNewWebhookForm({ ...newWebhookForm, url: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>HMAC SHA-256 SIGNING SECRET:</label>
                  <input 
                    type="text" 
                    className="enterprise-input text-mono" 
                    style={{ width: '100%', fontSize: '0.78rem' }}
                    value={newWebhookForm.secret}
                    readOnly
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowWebhookModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Register Endpoint</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PERMISSIONS MODAL */}
      {editingPermissionsUser && (
        <div className="modal-backdrop" onClick={() => setEditingPermissionsUser(null)}>
          <div 
            className="enterprise-card" 
            style={{ 
              width: 500, 
              maxWidth: '92vw', 
              backgroundColor: '#1D2329', 
              background: '#1D2329', 
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)', 
              border: '1px solid var(--color-border)', 
              padding: 24,
              position: 'relative',
              zIndex: 1000
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-between" style={{ marginBottom: 16, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
              <div className="card-title" style={{ margin: 0 }}>
                <span>RBAC PERMISSION MATRIX: {editingPermissionsUser.name}</span>
              </div>
              <button className="btn btn-ghost" style={{ minHeight: 28, padding: '2px 8px' }} onClick={() => setEditingPermissionsUser(null)}></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Granular Spring Security endpoint scopes for account <strong>{editingPermissionsUser.email}</strong>:
              </p>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', color: 'var(--color-text-primary)' }}>
                <input type="checkbox" defaultChecked /> Can trigger remote anti-theft immobilization (PIN required)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', color: 'var(--color-text-primary)' }}>
                <input type="checkbox" defaultChecked /> Can edit and certify FMCSA ELD driver duty logs
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', color: 'var(--color-text-primary)' }}>
                <input type="checkbox" defaultChecked /> Can approve maintenance work orders &amp; purchase orders
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', color: 'var(--color-text-primary)' }}>
                <input type="checkbox" defaultChecked /> Access to export raw telemetry datasets to CSV/Parquet
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button className="btn btn-secondary" onClick={() => setEditingPermissionsUser(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => {
                  setEditingPermissionsUser(null);
                  showBanner(`Permissions updated for ${editingPermissionsUser.name}.`);
                }}>Save Scopes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

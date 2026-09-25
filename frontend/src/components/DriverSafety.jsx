"use client";
import React, { useState } from 'react';
import { Icon } from './Icons';

export default function DriverSafety({ onNavigateToModule, showToast }) {
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showCoachingModal, setShowCoachingModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [selectedDriverForAction, setSelectedDriverForAction] = useState(null);

  const initialDrivers = [
    { id: 'DRV-101', name: 'James Wilson', asset: 'Volvo FH16 (#V-901)', score: 94, harshBrakes: 1, overspeedMins: 3, fatigueEvents: 0, cdlExpires: '2027-11-14', medExpires: '2027-08-20', cdlStatus: 'NORMAL', coaching: 'None (Up To Date)' },
    { id: 'DRV-102', name: 'Elena Rostova', asset: 'BrightDrop Zevo (#EV-402)', score: 98, harshBrakes: 0, overspeedMins: 0, fatigueEvents: 0, cdlExpires: '2026-09-01', medExpires: '2026-08-15', cdlStatus: 'NORMAL', coaching: 'None (Honor Roll)' },
    { id: 'DRV-103', name: 'Marcus Vance', asset: 'Kenworth W900 (#K-204)', score: 68, harshBrakes: 6, overspeedMins: 42, fatigueEvents: 2, cdlExpires: '2026-08-10', medExpires: '2026-08-04', cdlStatus: 'CRITICAL', coaching: 'MOD-04: Speed Control & Space Management (OVERDUE)' },
    { id: 'DRV-104', name: 'David Kim', asset: 'Freightliner Cascadia (#F-550)', score: 82, harshBrakes: 2, overspeedMins: 12, fatigueEvents: 0, cdlExpires: '2026-09-18', medExpires: '2026-10-10', cdlStatus: 'WARNING', coaching: 'MOD-01: Eco-Driving & Smooth Deceleration (Assigned)' },
    { id: 'DRV-105', name: 'Sarah Jenkins', asset: 'Caterpillar 336 Excavator (#C-812)', score: 91, harshBrakes: 1, overspeedMins: 5, fatigueEvents: 0, cdlExpires: '2028-02-19', medExpires: '2027-12-01', cdlStatus: 'NORMAL', coaching: 'None (Up To Date)' },
  ];

  const [drivers, setDrivers] = useState(initialDrivers);
  const [selectedCoachingMod, setSelectedCoachingMod] = useState('MOD-07: Advanced Defensive Driving & Following Distance');

  const filtered = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLevel === 'ALL' ||
                          (filterLevel === 'RISK' && d.score < 75) ||
                          (filterLevel === 'EXPIRE' && (d.cdlStatus === 'CRITICAL' || d.cdlStatus === 'WARNING'));
    return matchesSearch && matchesFilter;
  });

  const handleOpenCoachingModal = (driver) => {
    setSelectedDriverForAction(driver);
    setShowCoachingModal(true);
  };

  const handleAssignCoachingSubmit = (e) => {
    e.preventDefault();
    if (!selectedDriverForAction) return;
    setDrivers(drivers.map(d => {
      if (d.id === selectedDriverForAction.id) {
        return { ...d, coaching: `${selectedCoachingMod} (Assigned Today)` };
      }
      return d;
    }));
    setShowCoachingModal(false);
    if (showToast) {
      showToast('Coaching Dispatched', `Transmitted training video payload to Driver ${selectedDriverForAction.name} mobile cab tablet.`, 'success');
    }
  };

  const handleOpenDocsModal = (driver) => {
    setSelectedDriverForAction(driver);
    setShowDocsModal(true);
  };

  const handleExportSafetyDossier = () => {
    const headers = ["driver_id", "driver_name", "assigned_asset", "safety_score", "harsh_brakes", "overspeed_mins", "cdl_expiration", "med_card_expiration", "cdl_status", "coaching_status"];
    const rows = drivers.map(d => `"${d.id}","${d.name}","${d.asset}","${d.score}","${d.harshBrakes}","${d.overspeedMins}","${d.cdlExpires}","${d.medExpires}","${d.cdlStatus}","${d.coaching}"`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fmcsa_driver_qualification_dossier_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowDossierModal(true);
    if (showToast) {
      showToast('Safety Dossier Exported', 'Certified FMCSA Driver Qualification File downloaded.', 'success');
    }
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Page Title & Overview */}
      <div className="flex-between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
            Driver Performance, Safety Scoring &amp; FMCSA Qualifications
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>
            Multi-factor behavioral telemetry scoring, automated vision-based remedial training pipelines, and FMCSA CDL/medical certification compliance.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={handleExportSafetyDossier}>
            <Icon name="file" size={14} />
            <span>Export Safety Dossier</span>
          </button>
          <button className="btn btn-primary" onClick={() => setFilterLevel('RISK')}>
            <Icon name="alert" size={14} color="#FFF" />
            <span>High-Risk Drivers ({drivers.filter(d => d.score < 75).length})</span>
          </button>
        </div>
      </div>

      {/* Top AI Telematics Summary Cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="enterprise-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <div className="metric-label">FLEET AVERAGE SAFETY SCORE</div>
          <div className="metric-value" style={{ color: 'var(--color-success)', margin: '6px 0 2px' }}>
            86.6 <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>/ 100</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>+2.4 pts from previous 30-day evaluation</div>
        </div>

        <div className="enterprise-card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
          <div className="metric-label">ACTIVE REMEDIAL COACHING</div>
          <div className="metric-value" style={{ color: 'var(--color-warning)', margin: '6px 0 2px' }}>
            2 Modules
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Triggered automatically when driver score &lt; 75</div>
        </div>

        <div className="enterprise-card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
          <div className="metric-label">CRITICAL QUALIFICATION ALERTS</div>
          <div className="metric-value" style={{ color: 'var(--color-danger)', margin: '6px 0 2px' }}>
            1 Critical
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Marcus Vance (DRV-103) CDL expires in 15 days</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="enterprise-card" style={{ marginBottom: 20, padding: 14, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="enterprise-input"
          style={{ flex: 1, minWidth: 260 }}
          placeholder="Search Driver Name, Employee ID, or Assigned Truck..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn ${filterLevel === 'ALL' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => setFilterLevel('ALL')}>
            All ({drivers.length})
          </button>
          <button className={`btn ${filterLevel === 'RISK' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => setFilterLevel('RISK')}>
            At-Risk ({drivers.filter(d => d.score < 75).length})
          </button>
          <button className={`btn ${filterLevel === 'EXPIRE' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => setFilterLevel('EXPIRE')}>
            Expiring Credentials ({drivers.filter(d => d.cdlStatus !== 'NORMAL').length})
          </button>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>Assigned Asset</th>
              <th>Safety Score</th>
              <th>Harsh Brakes</th>
              <th>Overspeed Mins</th>
              <th>Fatigue (Dashcam)</th>
              <th>CDL / Medical Expiration</th>
              <th>Remedial Coaching</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((driver) => (
              <tr key={driver.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-button)', background: 'var(--color-graphite)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: 'var(--color-copper)' }}>
                      {driver.name.charAt(0)}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--color-text-primary)', display: 'block', fontSize: '0.88rem' }}>{driver.name}</strong>
                      <span className="text-mono" style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>ID: {driver.id}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: 'var(--color-copper)' }}>{driver.asset}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="text-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: driver.score >= 90 ? 'var(--color-success)' : driver.score >= 75 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
                      {driver.score}
                    </span>
                    <span className={`badge ${driver.score >= 90 ? 'badge-success' : driver.score >= 75 ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                      {driver.score >= 90 ? 'ELITE' : driver.score >= 75 ? 'AVG' : 'RISK'}
                    </span>
                  </div>
                </td>
                <td className="text-mono" style={{ color: driver.harshBrakes > 3 ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
                  {driver.harshBrakes} events
                </td>
                <td className="text-mono" style={{ color: driver.overspeedMins > 20 ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
                  {driver.overspeedMins} min
                </td>
                <td>
                  {driver.fatigueEvents > 0 ? (
                    <span className="badge badge-danger">{driver.fatigueEvents} SLEEP ALERTS</span>
                  ) : (
                    <span className="badge badge-success">0 EVENTS</span>
                  )}
                </td>
                <td>
                  <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                    CDL: <strong style={{ color: driver.cdlStatus === 'CRITICAL' ? 'var(--color-danger)' : driver.cdlStatus === 'WARNING' ? 'var(--color-warning)' : 'var(--color-text-primary)' }}>{driver.cdlExpires}</strong><br />
                    Med: <span>{driver.medExpires}</span>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '0.78rem', color: driver.score < 75 ? 'var(--color-danger)' : 'var(--color-text-secondary)', maxWidth: 220, lineHeight: 1.3 }}>
                    {driver.coaching}
                  </div>
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.74rem', minHeight: 28, marginRight: 6 }}
                    onClick={() => handleOpenCoachingModal(driver)}
                  >
                    Assign Coaching
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.74rem', minHeight: 28 }}
                    onClick={() => handleOpenDocsModal(driver)}
                  >
                    Docs
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Driver Qualification Documents Modal */}
      {showDocsModal && selectedDriverForAction && (
        <div className="modal-backdrop" onClick={() => setShowDocsModal(false)}>
          <div className="enterprise-card" style={{ width: 540, backgroundColor: '#1D2329', border: '1px solid var(--color-border)', padding: 26 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: 4 }}>DOT QUALIFICATION VAULT</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{selectedDriverForAction.name} Credentials</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowDocsModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              <div className="flex-between" style={{ background: 'var(--color-bg-surface)', padding: 12, borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
                <div>
                  <strong style={{ fontSize: '0.84rem', color: 'var(--color-text-primary)' }}>Commercial Driver&apos;s License (CDL-A)</strong>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Expires: {selectedDriverForAction.cdlExpires}</div>
                </div>
                <span className={`badge ${selectedDriverForAction.cdlStatus === 'CRITICAL' ? 'badge-danger' : 'badge-success'}`}>
                  {selectedDriverForAction.cdlStatus === 'CRITICAL' ? 'EXPIRING SOON' : 'VALID'}
                </span>
              </div>

              <div className="flex-between" style={{ background: 'var(--color-bg-surface)', padding: 12, borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
                <div>
                  <strong style={{ fontSize: '0.84rem', color: 'var(--color-text-primary)' }}>DOT Medical Examiner&apos;s Certificate</strong>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Expires: {selectedDriverForAction.medExpires}</div>
                </div>
                <span className="badge badge-success">CERTIFIED</span>
              </div>

              <div className="flex-between" style={{ background: 'var(--color-bg-surface)', padding: 12, borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
                <div>
                  <strong style={{ fontSize: '0.84rem', color: 'var(--color-text-primary)' }}>FMCSA Drug &amp; Alcohol Clearinghouse</strong>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Annual query completed 2026-04-12</div>
                </div>
                <span className="badge badge-success">CLEARED</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setShowDocsModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Coaching Modal */}
      {showCoachingModal && selectedDriverForAction && (
        <div className="modal-backdrop" onClick={() => setShowCoachingModal(false)}>
          <div className="enterprise-card" style={{ width: 500, backgroundColor: '#1D2329', border: '1px solid var(--color-border)', padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 14 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Assign Remedial AI Coaching</h3>
              <button 
                type="button" 
                onClick={() => setShowCoachingModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignCoachingSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>RECIPIENT DRIVER</label>
                <input type="text" disabled className="enterprise-input" style={{ width: '100%', opacity: 0.7 }} value={`${selectedDriverForAction.name} (${selectedDriverForAction.id})`} />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>SELECT AI COACHING CURRICULUM</label>
                <select
                  className="enterprise-select"
                  style={{ width: '100%' }}
                  value={selectedCoachingMod}
                  onChange={(e) => setSelectedCoachingMod(e.target.value)}
                >
                  <option value="MOD-07: Advanced Defensive Driving & Following Distance">MOD-07: Defensive Driving &amp; Following Distance</option>
                  <option value="MOD-04: Speed Control & Space Management">MOD-04: Speed Control &amp; Space Management</option>
                  <option value="MOD-01: Eco-Driving & Smooth Deceleration">MOD-01: Eco-Driving &amp; Smooth Deceleration</option>
                  <option value="MOD-09: Adverse Weather & Winter Blizzard Skid Recovery">MOD-09: Adverse Weather &amp; Skid Recovery</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCoachingModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Transmit Video to In-Cab Display</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official FMCSA Driver Safety Dossier Modal */}
      {showDossierModal && (
        <div className="modal-backdrop" onClick={() => setShowDossierModal(false)}>
          <div 
            className="enterprise-card" 
            style={{ 
              width: 820, 
              maxWidth: '94vw', 
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
            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <span className="badge badge-info">FMCSA 49 CFR PART 391 AUDIT READY</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: 4 }}>
                  Driver Qualification &amp; Safety History Dossier
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowDossierModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 16 }}>
              Certified snapshot of driver commercial credentials, 30-day telematics safety scores, harsh driving telemetry violations, and clearinghouse audit clearance.
            </p>

            <div className="table-container" style={{ maxHeight: '42vh', overflowY: 'auto', marginBottom: 16 }}>
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Driver &amp; ID</th>
                    <th>Assigned Vehicle</th>
                    <th>Safety Score</th>
                    <th>Harsh Braking</th>
                    <th>Overspeeding</th>
                    <th>CDL Expire</th>
                    <th>Med Card</th>
                    <th>Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map(d => (
                    <tr key={d.id}>
                      <td>
                        <strong style={{ color: 'var(--color-text-primary)' }}>{d.name}</strong>
                        <div className="text-mono" style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{d.id}</div>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{d.asset}</td>
                      <td>
                        <span className="text-mono" style={{ 
                          fontWeight: 800, 
                          color: d.score >= 85 ? 'var(--color-success)' : d.score >= 75 ? 'var(--color-warning)' : 'var(--color-danger)' 
                        }}>
                          {d.score} / 100
                        </span>
                      </td>
                      <td className="text-mono">{d.harshBrakes}</td>
                      <td className="text-mono">{d.overspeedMins} min</td>
                      <td className="text-mono" style={{ fontSize: '0.78rem', color: d.cdlStatus === 'CRITICAL' ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
                        {d.cdlExpires}
                      </td>
                      <td className="text-mono" style={{ fontSize: '0.78rem' }}>{d.medExpires}</td>
                      <td>
                        <span className={`badge ${d.cdlStatus === 'CRITICAL' ? 'badge-danger' : d.cdlStatus === 'WARNING' ? 'badge-warning' : 'badge-success'}`}>
                          {d.cdlStatus === 'CRITICAL' ? 'AUDIT ALERT' : 'VERIFIED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex-between" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--color-lime)', fontWeight: 600 }}>
                &bull; Cryptographic SHA-256 Stamp: 0x892a4f109bc2981a3d90f2847c0f12389a9fB0
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => window.print()}>
                  Print Official Dossier
                </button>
                <button className="btn btn-primary" onClick={() => setShowDossierModal(false)}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

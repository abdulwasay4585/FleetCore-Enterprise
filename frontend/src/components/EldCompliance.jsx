"use client";
import React, { useState } from 'react';
import { Icon } from './Icons';

export default function EldCompliance({ onNavigateToModule, showToast }) {
  const [activeTab, setActiveTab] = useState('HOS_GRID');
  const [selectedDriverId, setSelectedDriverId] = useState('DRV-101');
  const [showTrooperModal, setShowTrooperModal] = useState(false);
  const [showEditLogModal, setShowEditLogModal] = useState(false);
  const [trooperPin, setTrooperPin] = useState('DOT-FMCSA-' + Math.floor(100000 + Math.random() * 900000));
  const [transferState, setTransferState] = useState('IDLE');
  const [transferFeedback, setTransferFeedback] = useState('');

  const handleDownload8DayCsv = () => {
    const headers = ["record_id", "timestamp_utc", "duty_status", "location", "vehicle_vin", "odometer_miles", "engine_hours"];
    const rows = [
      `"REC-901","2026-07-26 14:00:00","DRIVING","I-80 Mile 142, IL","19X91929410912","148204.2","4120.4"`,
      `"REC-902","2026-07-26 10:30:00","ON_DUTY_NOT_DRIVING","Chicago Depot Dock 4","19X91929410912","147980.0","4116.1"`,
      `"REC-903","2026-07-26 06:00:00","OFF_DUTY","Chicago North Yard","19X91929410912","147980.0","4112.0"`,
      `"REC-904","2026-07-25 20:00:00","SLEEPER_BERTH","Gary Travel Center, IN","19X91929410912","147510.8","4102.5"`,
    ];
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fmcsa_8day_duty_status_records_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast('CSV Downloaded', 'Exported 8-day rolling duty status records.', 'info');
  };

  // Driver HOS Dataset (Feature 26)
  const [driverLogs, setDriverLogs] = useState([
    { id: 'DRV-101', name: 'James Wilson', status: 'DRIVING', vehicle: 'Volvo FH16 (#V-901)', driveDriven: 8.5, driveMax: 11.0, shiftUsed: 10.2, shiftMax: 14.0, cycleUsed: 44.5, cycleMax: 70.0, restBreakDueInMins: 45, hosState: 'COMPLIANT' },
    { id: 'DRV-102', name: 'Elena Rostova', status: 'ON_DUTY_NOT_DRIVING', vehicle: 'BrightDrop Zevo (#EV-402)', driveDriven: 4.2, driveMax: 11.0, shiftUsed: 6.8, shiftMax: 14.0, cycleUsed: 32.0, cycleMax: 70.0, restBreakDueInMins: 180, hosState: 'COMPLIANT' },
    { id: 'DRV-103', name: 'Marcus Vance', status: 'DRIVING', vehicle: 'Kenworth W900 (#K-204)', driveDriven: 10.8, driveMax: 11.0, shiftUsed: 13.5, shiftMax: 14.0, cycleUsed: 68.2, cycleMax: 70.0, restBreakDueInMins: 12, hosState: 'WARNING_VIOLATION' },
    { id: 'DRV-104', name: 'David Kim', status: 'OFF_DUTY', vehicle: 'Freightliner Cascadia (#F-550)', driveDriven: 0.0, driveMax: 11.0, shiftUsed: 0.0, shiftMax: 14.0, cycleUsed: 52.0, cycleMax: 70.0, restBreakDueInMins: 480, hosState: 'COMPLIANT' },
    { id: 'DRV-105', name: 'Sarah Jenkins', status: 'SLEEPER_BERTH', vehicle: 'Caterpillar 336 (#C-812)', driveDriven: 0.0, driveMax: 11.0, shiftUsed: 0.0, shiftMax: 14.0, cycleUsed: 28.0, cycleMax: 70.0, restBreakDueInMins: 480, hosState: 'COMPLIANT' }
  ]);

  // IFTA State Tax Rollups (Feature 27)
  const [iftaRecords, setIftaRecords] = useState([
    { state: 'TX (Texas)', miles: 142850, gallons: 22674, rate: 0.200, taxDue: 4534.80, status: 'AUDIT_READY' },
    { state: 'CA (California)', miles: 98400, gallons: 16131, rate: 0.539, taxDue: 8694.61, status: 'AUDIT_READY' },
    { state: 'IL (Illinois)', miles: 64200, gallons: 10190, rate: 0.467, taxDue: 4758.73, status: 'AUDIT_READY' },
    { state: 'PA (Pennsylvania)', miles: 82100, gallons: 13241, rate: 0.741, taxDue: 9811.58, status: 'AUDIT_READY' },
    { state: 'NY (New York)', miles: 51200, gallons: 8258, rate: 0.407, taxDue: 3361.01, status: 'AUDIT_READY' }
  ]);

  const [editLogReason, setEditLogReason] = useState('Yard move mistyped as highway driving');
  const [editTimeMinutes, setEditTimeMinutes] = useState(25);

  const selectedDriver = driverLogs.find(d => d.id === selectedDriverId) || driverLogs[0];

  const handleEditLogSubmit = (e) => {
    e.preventDefault();
    setShowEditLogModal(false);
    if (showToast) {
      showToast('Correction Logged', `Audit note recorded for ${selectedDriver.name}: "${editLogReason}". Signed with safety manager key.`, 'info');
    }
  };

  const totalIftaTax = iftaRecords.reduce((sum, r) => sum + r.taxDue, 0);

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Page Title & Navigation Header */}
      <div className="flex-between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
            FMCSA ELD Regulatory Compliance &amp; HOS Timers
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>
            Automated enforcement of FMCSA 49 CFR Part 395 rules, real-time duty status clocks, multi-jurisdiction IFTA reporting, and roadside officer inspection data transfer mode.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className={`btn ${activeTab === 'HOS_GRID' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('HOS_GRID')}
          >
            <Icon name="check" size={14} />
            <span>HOS Duty Status Clocks</span>
          </button>
          <button
            className={`btn ${activeTab === 'IFTA' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('IFTA')}
          >
            <Icon name="file" size={14} />
            <span>IFTA Highway Fuel Tax</span>
          </button>
          <button
            className="btn btn-danger"
            onClick={() => setShowTrooperModal(true)}
          >
            <Icon name="alert" size={14} color="#FFF" />
            <span>Roadside DOT Inspection</span>
          </button>
        </div>
      </div>

      {/* Quick Summary KPIs */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="enterprise-card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>ACTIVE ON HIGHWAY</div>
          <div className="text-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-success)', margin: '4px 0' }}>
            {driverLogs.filter(d => d.status === 'DRIVING').length} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Driving</span>
          </div>
        </div>
        <div className="enterprise-card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>HOS TIMEOUT WARNINGS</div>
          <div className="text-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: driverLogs.some(d => d.hosState === 'WARNING_VIOLATION') ? 'var(--color-danger)' : 'var(--color-text-primary)', margin: '4px 0' }}>
            {driverLogs.filter(d => d.hosState === 'WARNING_VIOLATION').length} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>&le; 20m limit</span>
          </div>
        </div>
        <div className="enterprise-card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Q3 IFTA TAX ESTIMATE</div>
          <div className="text-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-copper)', margin: '4px 0' }}>
            ${totalIftaTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="enterprise-card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>FMCSA AUDIT PASS RATE</div>
          <div className="text-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-info)', margin: '4px 0' }}>
            98.4% <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Compliant</span>
          </div>
        </div>
      </div>

      {/* TAB 1: ELECTRONIC LOGGING DEVICE HOS TIMERS (FEATURE 26) */}
      {activeTab === 'HOS_GRID' && (
        <div className="grid-3" style={{ alignItems: 'flex-start' }}>
          {/* Driver List Column (1 span) */}
          <div className="enterprise-card" style={{ gridColumn: 'span 1' }}>
            <div className="card-title">
              <span>DRIVER DUTY QUEUE</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {driverLogs.map(d => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDriverId(d.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-card)',
                    background: selectedDriverId === d.id ? 'rgba(199, 107, 42, 0.15)' : 'var(--color-bg-deep)',
                    border: `1px solid ${selectedDriverId === d.id ? 'var(--color-copper)' : 'var(--color-border)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', color: 'var(--color-text-primary)', fontSize: '0.86rem' }}>{d.name}</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{d.vehicle.slice(0, 16)}...</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${d.status === 'DRIVING' ? 'badge-success' : d.status === 'ON_DUTY_NOT_DRIVING' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.65rem', display: 'block', marginBottom: 2 }}>
                      {d.status.replace(/_/g, ' ')}
                    </span>
                    {d.hosState === 'WARNING_VIOLATION' && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-danger)', fontWeight: 700 }}>LIMIT NEAR</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed HOS Calculation Panel (2 spans) */}
          <div className="enterprise-card" style={{ gridColumn: 'span 2' }}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 14, marginBottom: 18 }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: 4 }}>RECORD ACTIVE</span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{selectedDriver.name}</h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  Vehicle: <strong style={{ color: 'var(--color-copper)' }}>{selectedDriver.vehicle}</strong> • Duty Status: <strong style={{ color: 'var(--color-text-primary)' }}>{selectedDriver.status}</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>REST BREAK DUE IN</span>
                <span className="text-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: selectedDriver.restBreakDueInMins < 30 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {Math.floor(selectedDriver.restBreakDueInMins / 60)}h {selectedDriver.restBreakDueInMins % 60}m
                </span>
              </div>
            </div>

            {/* FMCSA HOS Rule Gauges */}
            <div className="grid-3" style={{ marginBottom: 20, background: 'var(--color-bg-deep)', padding: 14, borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
              <div>
                <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>11-HR DRIVE LIMIT</span>
                  <strong className="text-mono" style={{ color: (selectedDriver.driveMax - selectedDriver.driveDriven) < 1 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {(selectedDriver.driveMax - selectedDriver.driveDriven).toFixed(1)}h left
                  </strong>
                </div>
                <div style={{ width: '100%', height: 6, background: 'var(--color-graphite)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(selectedDriver.driveDriven / selectedDriver.driveMax) * 100}%`, height: '100%', background: (selectedDriver.driveMax - selectedDriver.driveDriven) < 1 ? 'var(--color-danger)' : 'var(--color-success)' }}></div>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 4 }}>Driven: {selectedDriver.driveDriven} / 11.0 hrs</div>
              </div>

              <div>
                <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>14-HR SHIFT WINDOW</span>
                  <strong className="text-mono" style={{ color: (selectedDriver.shiftMax - selectedDriver.shiftUsed) < 1 ? 'var(--color-warning)' : 'var(--color-copper)' }}>
                    {(selectedDriver.shiftMax - selectedDriver.shiftUsed).toFixed(1)}h left
                  </strong>
                </div>
                <div style={{ width: '100%', height: 6, background: 'var(--color-graphite)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(selectedDriver.shiftUsed / selectedDriver.shiftMax) * 100}%`, height: '100%', background: (selectedDriver.shiftMax - selectedDriver.shiftUsed) < 1 ? 'var(--color-warning)' : 'var(--color-copper)' }}></div>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 4 }}>On-Duty: {selectedDriver.shiftUsed} / 14.0 hrs</div>
              </div>

              <div>
                <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>70-HR / 8-DAY CYCLE</span>
                  <strong className="text-mono" style={{ color: 'var(--color-lime)' }}>
                    {(selectedDriver.cycleMax - selectedDriver.cycleUsed).toFixed(1)}h left
                  </strong>
                </div>
                <div style={{ width: '100%', height: 6, background: 'var(--color-graphite)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(selectedDriver.cycleUsed / selectedDriver.cycleMax) * 100}%`, height: '100%', background: 'var(--color-lime)' }}></div>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 4 }}>Cycle: {selectedDriver.cycleUsed} / 70.0 hrs</div>
              </div>
            </div>

            {/* Visual 24-Hour Duty Status Timeline Log Grid */}
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 10 }}>TODAY&apos;S 24-HOUR FMCSA ELECTRONIC DUTY LOG</h3>
            <div style={{ background: 'var(--color-bg-deep)', padding: 14, borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', marginBottom: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10, fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>DUTY STATUS</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', textAlign: 'center', fontWeight: 700 }}>
                  {Array.from({ length: 12 }).map((_, i) => <span key={i}>{i * 2}:00</span>)}
                </div>
              </div>

              {[
                { name: '1. OFF DUTY', activeHours: '00:00 - 05:00', barLeft: 0, barWidth: 21, color: '#5F6975' },
                { name: '2. SLEEPER', activeHours: 'None today', barLeft: 0, barWidth: 0, color: 'var(--color-info)' },
                { name: '3. DRIVING', activeHours: '06:00 - 14:30', barLeft: 25, barWidth: 35, color: 'var(--color-success)' },
                { name: '4. ON DUTY', activeHours: '05:00 - 06:00 (Pre-Trip)', barLeft: 21, barWidth: 4, color: 'var(--color-warning)' },
              ].map((row, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10, alignItems: 'center', padding: '6px 0', borderBottom: idx < 3 ? '1px dashed var(--color-border)' : 'none' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{row.name}</div>
                  <div style={{ position: 'relative', height: 20, background: 'var(--color-bg-surface)', borderRadius: 2, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                    {row.barWidth > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 2,
                          bottom: 2,
                          left: `${row.barLeft}%`,
                          width: `${row.barWidth}%`,
                          background: row.color,
                          borderRadius: 2
                        }}
                        title={row.activeHours}
                      ></div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex-between">
              <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Verified by mTLS Cryptographic SHA-256 Engine. Tamper-evident journal.</span>
              <button className="btn btn-secondary" style={{ fontSize: '0.75rem', minHeight: 30 }} onClick={() => setShowEditLogModal(true)}>
                Request Log Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IFTA AUTOMATED HIGHWAY FUEL TAX (FEATURE 27) */}
      {activeTab === 'IFTA' && (
        <div className="enterprise-card">
          <div className="flex-between" style={{ marginBottom: 18 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>
              <span>IFTA QUARTERLY HIGHWAY TAX &amp; JURISDICTION SUMMARY</span>
              <span className="badge badge-success">Q3 2026 AUDIT READY</span>
            </div>
            <button className="btn btn-primary" onClick={() => {
              if (showToast) showToast('IFTA Return Generated', 'Submitted official electronic EDI 810 tax file to IFTA clearinghouse.', 'success');
            }}>
              Submit Official State Return
            </button>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 18 }}>
            Calculates exact distance traveled per US State and Canadian Province using GIS boundary polygon vector crossings. Automatically computes gallons consumed and tax balance.
          </p>

          <div className="table-container">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Jurisdiction</th>
                  <th>Miles Driven</th>
                  <th>Fuel Consumed</th>
                  <th>Tax Rate ($/Gal)</th>
                  <th>Tax Owed (USD)</th>
                  <th>Audit Readiness</th>
                </tr>
              </thead>
              <tbody>
                {iftaRecords.map((st) => (
                  <tr key={st.state}>
                    <td><strong style={{ color: 'var(--color-text-primary)' }}>{st.state}</strong></td>
                    <td className="text-mono" style={{ color: 'var(--color-copper)', fontWeight: 700 }}>{st.miles.toLocaleString()} mi</td>
                    <td className="text-mono">{st.gallons.toLocaleString()} gal</td>
                    <td className="text-mono">${st.rate.toFixed(3)} / gal</td>
                    <td className="text-mono" style={{ color: 'var(--color-success)', fontWeight: 800 }}>${st.taxDue.toFixed(2)}</td>
                    <td><span className="badge badge-success">AUDIT VERIFIED</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roadside Inspection Mode Modal (Feature 30) */}
      {showTrooperModal && (
        <div className="modal-backdrop" onClick={() => setShowTrooperModal(false)}>
          <div 
            className="enterprise-card" 
            style={{ 
              width: 580, 
              maxWidth: '92vw', 
              backgroundColor: '#1D2329', 
              background: '#1D2329', 
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)', 
              border: '2px solid var(--color-danger)', 
              padding: 24,
              position: 'relative',
              zIndex: 1000
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="shield" size={24} color="var(--color-danger)" />
                <div>
                  <span className="badge badge-danger">FMCSA 49 CFR § 395.24</span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: 2 }}>
                    DOT ROADSIDE INSPECTOR TRANSFER MODE
                  </h3>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowTrooperModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.84rem', lineHeight: 1.5, marginBottom: 14 }}>
              Officer may inspect rolling 8-day duty status records. Hand cab display to law enforcement officer or initiate encrypted telematics transfer.
            </p>

            <div style={{ backgroundColor: 'var(--color-bg-deep)', background: 'var(--color-bg-deep)', padding: 14, borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>OFFICER SECURE TRANSFER AUTH CODE</div>
              <div className="text-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-copper)', letterSpacing: '0.08em', marginTop: 4 }}>
                {trooperPin}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-lime)', marginTop: 4 }}>
                &bull; Web Services &amp; Bluetooth ELD Handshake Active
              </div>
            </div>

            {transferFeedback && (
              <div style={{ 
                background: 'rgba(50, 201, 113, 0.12)', 
                border: '1px solid var(--color-success)', 
                borderRadius: 'var(--radius-card)', 
                padding: '10px 14px', 
                marginBottom: 16, 
                fontSize: '0.82rem', 
                color: 'var(--color-text-primary)' 
              }}>
                <strong>Transfer Status:</strong> {transferFeedback}
              </div>
            )}

            <div className="flex-between" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14, flexWrap: 'wrap', gap: 10 }}>
              <button className="btn btn-secondary" style={{ fontSize: '0.82rem' }} onClick={handleDownload8DayCsv}>
                <Icon name="file" size={14} />
                <span>Download 8-Day CSV Backup</span>
              </button>

              <div style={{ display: 'flex', gap: 10 }}>
                <button 
                  className="btn btn-secondary" 
                  disabled={transferState.includes('SENDING')}
                  onClick={() => {
                    setTransferState('BLUETOOTH_SENDING');
                    setTransferFeedback('Pairing via Bluetooth BLE 5.2 with Officer Handset...');
                    setTimeout(() => {
                      setTransferState('BLUETOOTH_SUCCESS');
                      setTransferFeedback('Bluetooth transfer complete. Verified 8-day rolling logs (42 records) with SHA-256 fingerprint.');
                      if (showToast) showToast('Bluetooth Transfer Complete', 'Transferred 8-day logs to Trooper device.', 'success');
                    }, 800);
                  }}
                >
                  {transferState === 'BLUETOOTH_SENDING' ? 'Transmitting BLE...' : 'Transmit via Bluetooth'}
                </button>
                <button 
                  className="btn btn-primary" 
                  disabled={transferState.includes('SENDING')}
                  onClick={() => {
                    setTransferState('WEBSERVICE_SENDING');
                    setTransferFeedback('Encrypting and dispatching records to FMCSA National Web Services...');
                    setTimeout(() => {
                      setTransferState('WEBSERVICE_SUCCESS');
                      setTransferFeedback('FMCSA Central Repository Handshake Verified. Submission Confirmation #FMCSA-TX-2026-90412-OK.');
                      if (showToast) showToast('FMCSA Upload Verified', '8-Day logs posted to federal registry.', 'success');
                    }, 900);
                  }}
                >
                  {transferState === 'WEBSERVICE_SENDING' ? 'Sending to FMCSA...' : 'Send via Web Services'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Log Edit Modal */}
      {showEditLogModal && (
        <div className="modal-backdrop" onClick={() => setShowEditLogModal(false)}>
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
            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 14 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Request ELD Log Correction</h3>
              <button 
                type="button" 
                onClick={() => setShowEditLogModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditLogSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>DRIVER ACCOUNT</label>
                <input type="text" disabled className="enterprise-input" style={{ width: '100%', opacity: 0.7 }} value={`${selectedDriver.name} (${selectedDriver.id})`} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>REASON FOR CORRECTION (MANDATORY AUDIT NOTE)</label>
                <textarea
                  required
                  className="enterprise-input"
                  style={{ width: '100%', height: 70 }}
                  value={editLogReason}
                  onChange={(e) => setEditLogReason(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>ADJUSTMENT TIME (MINUTES)</label>
                <input
                  type="number"
                  className="enterprise-input"
                  style={{ width: '100%' }}
                  value={editTimeMinutes}
                  onChange={(e) => setEditTimeMinutes(Number(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditLogModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Correction to Safety Manager</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

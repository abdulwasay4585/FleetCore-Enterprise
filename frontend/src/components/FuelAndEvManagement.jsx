"use client";
import React, { useState } from 'react';
import { Icon } from './Icons';

export default function FuelAndEvManagement({ onNavigateToModule, showToast }) {
  const [activeTab, setActiveTab] = useState('FRAUD');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showTariffModal, setShowTariffModal] = useState(false);
  const [selectedBorderState, setSelectedBorderState] = useState(null);

  // Fuel Card Transactions with Anomaly Detection (Feature 17)
  const [transactions, setTransactions] = useState([
    { id: 'TX-8812', date: '2026-07-25 08:14', vehicle: 'Volvo FH16 (#V-901)', cardHolder: 'James Wilson', station: 'Pilot Flying J - Newark Depot NJ', volumeGal: 140.2, amountUsd: 532.76, gpsDiscrepancyKm: 0.1, status: 'VERIFIED_VALID', anomalyDesc: 'None. Truck GPS inside fuel canopy.' },
    { id: 'TX-8813', date: '2026-07-24 18:40', vehicle: 'Kenworth W900 (#K-204)', cardHolder: 'Marcus Vance', station: 'Love’s Travel Stop - Dallas TX #402', volumeGal: 185.0, amountUsd: 703.00, gpsDiscrepancyKm: 42.8, status: 'FRAUD_ALERT_SKIMMING', anomalyDesc: 'CRITICAL ANOMALY: Fuel card swiped in Dallas, but telemetry GPS proves truck was located 42.8 km away on I-35 in Hillsboro TX!' },
    { id: 'TX-8814', date: '2026-07-24 12:10', vehicle: 'Freightliner Cascadia (#F-550)', cardHolder: 'David Kim', station: 'TA Travel Plaza - Atlanta GA', volumeGal: 110.5, amountUsd: 419.90, gpsDiscrepancyKm: 0.2, status: 'VERIFIED_VALID', anomalyDesc: 'Verified. Tank level jump in telematics matches billed 110.5 gallons.' }
  ]);

  // IFTA Tax Jurisdiction Rollups (Feature 18)
  const iftaStates = [
    { state: 'TX (Texas)', milesDriven: 142850, galConsumed: 22674, taxRatePerGal: 0.200, taxOwedUsd: 4534.80, status: 'AUDIT_READY', crossings: 142 },
    { state: 'CA (California)', milesDriven: 98400, galConsumed: 16131, taxRatePerGal: 0.539, taxOwedUsd: 8694.61, status: 'AUDIT_READY', crossings: 98 },
    { state: 'IL (Illinois)', milesDriven: 64200, galConsumed: 10190, taxRatePerGal: 0.467, taxOwedUsd: 4758.73, status: 'AUDIT_READY', crossings: 64 },
    { state: 'PA (Pennsylvania)', milesDriven: 82100, galConsumed: 13241, taxRatePerGal: 0.741, taxOwedUsd: 9811.58, status: 'AUDIT_READY', crossings: 82 },
    { state: 'NY (New York)', milesDriven: 51200, galConsumed: 8258, taxRatePerGal: 0.407, taxOwedUsd: 3361.01, status: 'AUDIT_READY', crossings: 51 },
  ];

  // EV Smart Charging Depot Schedule (Feature 20)
  const [evChargers, setEvChargers] = useState([
    { id: 'EVSE-01 (Depot Dock A)', vehicle: 'BrightDrop Zevo (#EV-402)', type: 'DC Fast Charge (350kW)', currentKw: 180, socStart: 22, socCurrent: 84, targetSoc: 100, schedComplete: '14:30', status: 'CHARGING_ACTIVE' },
    { id: 'EVSE-02 (Depot Dock B)', vehicle: 'BrightDrop Zevo (#EV-405)', type: 'AC Level 2 (22kW)', currentKw: 18, socStart: 60, socCurrent: 78, targetSoc: 90, schedComplete: '05:00 AM (Peak Shaved)', status: 'PEAK_SHAVING_DELAYED' },
    { id: 'EVSE-03 (Depot Dock C)', vehicle: 'Unassigned', type: 'DC Fast Charge (350kW)', currentKw: 0, socStart: 0, socCurrent: 0, targetSoc: 0, schedComplete: '—', status: 'AVAILABLE_IDLE' }
  ]);

  const [peakRate, setPeakRate] = useState(0.28);
  const [offPeakRate, setOffPeakRate] = useState(0.08);

  const handleResolveFraud = (id) => {
    setTransactions(transactions.map(t => t.id === id ? { ...t, status: 'INVESTIGATING_DISPUTED', anomalyDesc: 'Dispute submitted to WEX Security. Card placed on temporary hold.' } : t));
    if (showToast) {
      showToast('Card Frozen', `Temporary hold placed on card for transaction ${id}. Chargeback dispute opened with merchant bank.`, 'danger');
    }
  };

  const handleOverridePeak = (chargerId) => {
    setEvChargers(evChargers.map(c => c.id === chargerId ? { ...c, status: 'CHARGING_ACTIVE', currentKw: 350, schedComplete: '11:15 AM' } : c));
    if (showToast) {
      showToast('Peak Shaving Overridden', `Charger ${chargerId} boosted to maximum 350kW DC power.`, 'warning');
    }
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Top Header */}
      <div className="flex-between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
            Fuel Reconciliation, IFTA Tax &amp; EV Depot Charging
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>
            Automated transaction-to-CANbus GPS telemetry cross-referencing, multi-jurisdiction IFTA fuel tax ledger, Scope 1 GHG emissions tracking, and EV smart depot peak-shaving control.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className={`btn ${activeTab === 'FRAUD' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('FRAUD')}>
            <Icon name="alert" size={14} />
            <span>Fuel Card Reconciliation</span>
          </button>
          <button className={`btn ${activeTab === 'IFTA' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('IFTA')}>
            <Icon name="file" size={14} />
            <span>IFTA Tax Vault</span>
          </button>
          <button className={`btn ${activeTab === 'EV_CHARGE' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('EV_CHARGE')}>
            <Icon name="zap" size={14} />
            <span>EV Depot Grid</span>
          </button>
          <button className={`btn ${activeTab === 'CO2' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('CO2')}>
            <Icon name="activity" size={14} />
            <span>Scope 1 CO2</span>
          </button>
        </div>
      </div>

      {/* Top KPI Ribbon */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="enterprise-card" style={{ padding: '14px 18px', borderLeft: '4px solid var(--color-danger)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>DETECTED FUEL FRAUD</div>
          <div className="text-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-danger)', margin: '4px 0' }}>
            $703.00 <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Disputed</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>1 Critical GPS mismatch event today</div>
        </div>

        <div className="enterprise-card" style={{ padding: '14px 18px', borderLeft: '4px solid var(--color-copper)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>ESTIMATED Q3 IFTA TAX</div>
          <div className="text-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-copper)', margin: '4px 0' }}>
            $31,160 <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Owed</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Rollup across 5 US regulatory states</div>
        </div>

        <div className="enterprise-card" style={{ padding: '14px 18px', borderLeft: '4px solid var(--color-lime)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>EV DEPOT GRID LOAD</div>
          <div className="text-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-lime)', margin: '4px 0' }}>
            198 kW <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>/ 500kW Cap</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Peak shaving engaged to avoid demand tariffs</div>
        </div>

        <div className="enterprise-card" style={{ padding: '14px 18px', borderLeft: '4px solid var(--color-success)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>CO2 EMISSIONS OFFSET</div>
          <div className="text-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-success)', margin: '4px 0' }}>
            -42.4 <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>MT CO2e</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Month-to-date reduction via electric fleet</div>
        </div>
      </div>

      {/* TAB 1: FUEL CARD FRAUD ANOMALY DETECTION */}
      {activeTab === 'FRAUD' && (
        <div className="enterprise-card">
          <div className="flex-between" style={{ marginBottom: 18 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>
              <span>FUEL CARD TRANSACTIONS vs. GPS CROSS-REFERENCE</span>
              <span className="badge badge-danger">STATISTICAL ANOMALY ENGINE</span>
            </div>
            <button className="btn btn-secondary" onClick={() => {
              if (showToast) showToast('Gateway Synchronized', 'Polled last 24 hours of commercial card clearing records.', 'info');
            }}>
              Sync Card Gateway
            </button>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 18 }}>
            Card purchase timestamps are cross-referenced with TimescaleDB high-frequency GPS vehicle tracks. Any transaction with &gt; 5 km coordinate separation triggers immediate fraud flagging.
          </p>

          <div className="table-container">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Vehicle &amp; Driver</th>
                  <th>Fuel Station Plaza</th>
                  <th>Billed Amount</th>
                  <th>GPS Mismatch</th>
                  <th>Evaluation State</th>
                  <th>Security Analysis</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} style={{ background: t.status.includes('FRAUD') ? 'rgba(229, 72, 77, 0.05)' : 'transparent' }}>
                    <td className="text-mono" style={{ fontWeight: 700, color: 'var(--color-copper)' }}>
                      {t.id}<br />
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{t.date}</span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--color-text-primary)', display: 'block' }}>{t.vehicle}</strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}> {t.cardHolder}</span>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{t.station}</td>
                    <td className="text-mono" style={{ fontWeight: 700 }}>
                      {t.volumeGal} gal<br />
                      <span style={{ color: 'var(--color-success)', fontSize: '0.85rem' }}>${t.amountUsd.toFixed(2)}</span>
                    </td>
                    <td className="text-mono" style={{ fontWeight: 800, color: t.gpsDiscrepancyKm > 5 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                      {t.gpsDiscrepancyKm} km
                    </td>
                    <td>
                      <span className={`badge ${t.status.includes('VALID') ? 'badge-success' : t.status.includes('FRAUD') ? 'badge-danger' : 'badge-warning'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ maxWidth: 260, fontSize: '0.78rem', color: t.status.includes('FRAUD') ? 'var(--color-danger)' : 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                      {t.anomalyDesc}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {t.status.includes('FRAUD') ? (
                        <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.74rem', minHeight: 30 }} onClick={() => handleResolveFraud(t.id)}>
                          Freeze Card
                        </button>
                      ) : (
                        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.74rem', minHeight: 30 }} onClick={() => setSelectedReceipt(t)}>
                          View Receipt
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

      {/* TAB 2: IFTA AUTOMATED TAX ROLLUPS (FEATURE 18) */}
      {activeTab === 'IFTA' && (
        <div className="enterprise-card">
          <div className="flex-between" style={{ marginBottom: 18 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>
              <span>IFTA HIGHWAY FUEL TAX &amp; JURISDICTION ROLLUPS</span>
              <span className="badge badge-success">AUDIT READY</span>
            </div>
            <button className="btn btn-primary" onClick={() => {
              if (showToast) showToast('IFTA Filed', 'Exported electronic EDI 810 return to State Revenue Department.', 'success');
            }}>
              Submit Official Return
            </button>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 18 }}>
            Calculates exact distance traveled per US State and Canadian Province using GIS boundary polygon vector crossings.
          </p>

          <div className="table-container">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Jurisdiction</th>
                  <th>GPS Mileage</th>
                  <th>Taxable Diesel</th>
                  <th>Tax Rate ($/Gal)</th>
                  <th>Total Owed</th>
                  <th>Crossings</th>
                  <th style={{ textAlign: 'right' }}>Border Logs</th>
                </tr>
              </thead>
              <tbody>
                {iftaStates.map((st) => (
                  <tr key={st.state}>
                    <td><strong style={{ color: 'var(--color-text-primary)' }}>{st.state}</strong></td>
                    <td className="text-mono" style={{ color: 'var(--color-copper)', fontWeight: 700 }}>{st.milesDriven.toLocaleString()} mi</td>
                    <td className="text-mono">{st.galConsumed.toLocaleString()} gal</td>
                    <td className="text-mono">${st.taxRatePerGal.toFixed(3)} / gal</td>
                    <td className="text-mono" style={{ color: 'var(--color-success)', fontWeight: 800 }}>${st.taxOwedUsd.toFixed(2)}</td>
                    <td className="text-mono">{st.crossings} crossings</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.74rem', minHeight: 30 }} onClick={() => setSelectedBorderState(st)}>
                        Inspect Crossings
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EV SMART DEPOT CHARGING (FEATURE 20) */}
      {activeTab === 'EV_CHARGE' && (
        <div className="enterprise-card">
          <div className="flex-between" style={{ marginBottom: 18 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>
              <span>EV SMART CHARGING DEPOT &amp; PEAK LOAD SHAVING</span>
              <span className="badge badge-success">500kW GRID CAP ACTIVE</span>
            </div>
            <button className="btn btn-secondary" onClick={() => setShowTariffModal(true)}>
              Configure Tariff Schedule
            </button>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 18 }}>
            Regulates EVSE charging power to avoid expensive peak demand utility penalties. Vehicles not scheduled for immediate morning dispatch are postponed to super-off-peak overnight hours.
          </p>

          <div className="grid-3">
            {evChargers.map((ev, index) => (
              <div key={index} style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="flex-between" style={{ marginBottom: 10 }}>
                    <strong style={{ color: 'var(--color-text-primary)', fontSize: '0.88rem' }}>{ev.id}</strong>
                    <span className={`badge ${ev.status === 'CHARGING_ACTIVE' ? 'badge-success' : ev.status === 'PEAK_SHAVING_DELAYED' ? 'badge-warning' : 'badge-info'}`}>
                      {ev.status === 'CHARGING_ACTIVE' ? 'ACTIVE' : ev.status === 'PEAK_SHAVING_DELAYED' ? 'PEAK SHAVE' : 'IDLE'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-copper)', marginBottom: 4 }}>Connected: <strong>{ev.vehicle}</strong></div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginBottom: 14 }}>Charger Spec: {ev.type}</div>

                  {ev.vehicle !== 'Unassigned' && (
                    <>
                      <div className="flex-between" style={{ fontSize: '0.78rem', marginBottom: 4 }}>
                        <span>Battery SoC:</span>
                        <strong style={{ color: 'var(--color-lime)', fontFamily: 'var(--font-mono)' }}>{ev.socCurrent}%  Target {ev.targetSoc}%</strong>
                      </div>
                      <div style={{ width: '100%', height: 6, background: 'var(--color-graphite)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
                        <div style={{ width: `${ev.socCurrent}%`, height: '100%', background: 'var(--color-lime)' }}></div>
                      </div>
                      <div className="flex-between text-mono" style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
                        <span>Power: <strong style={{ color: 'var(--color-copper)' }}>{ev.currentKw} kW</strong></span>
                        <span>Ready: <strong>{ev.schedComplete}</strong></span>
                      </div>
                    </>
                  )}
                </div>

                {ev.vehicle !== 'Unassigned' && ev.status === 'PEAK_SHAVING_DELAYED' && (
                  <button className="btn btn-secondary" style={{ width: '100%', marginTop: 14, fontSize: '0.76rem', minHeight: 32 }} onClick={() => handleOverridePeak(ev.id)}>
                    Override Peak Shaving (Max Boost)
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SCOPE 1 CO2 EMISSIONS LEDGER (FEATURE 19) */}
      {activeTab === 'CO2' && (
        <div className="enterprise-card">
          <div className="flex-between" style={{ marginBottom: 18 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>
              <span>GHG PROTOCOL SCOPE 1 CO2 &amp; ESG LEDGER</span>
              <span className="badge badge-success">2.68 KG CO2 / L DIESEL</span>
            </div>
            <button className="btn btn-primary" onClick={() => {
              if (showToast) showToast('ESG Report Exported', 'Downloaded certified carbon accounting disclosure document.', 'success');
            }}>
              Download SEC ESG Report
            </button>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 18 }}>
            Continuous fuel telemetry rollups converted into verified carbon dioxide equivalent (CO2e) emissions.
          </p>

          <div className="grid-3" style={{ marginBottom: 20 }}>
            <div className="metric-panel" style={{ textAlign: 'center' }}>
              <div className="metric-label">MONTH-TO-DATE CO2 EMISSIONS</div>
              <div className="metric-value" style={{ color: 'var(--color-text-primary)', marginTop: 4 }}>
                412.8 <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>MT</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-success)', marginTop: 4 }}>&darr; 14.5% reduction compared to last quarter</div>
            </div>

            <div className="metric-panel" style={{ textAlign: 'center' }}>
              <div className="metric-label">EV FLEET CARBON OFFSET</div>
              <div className="metric-value" style={{ color: 'var(--color-success)', marginTop: 4 }}>
                42.4 <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>MT CO2e</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 4 }}>Zero tailpipe emission contribution</div>
            </div>

            <div className="metric-panel">
              <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: 6 }}>
                <span>Diesel Volume:</span>
                <strong className="text-mono">154,029 Liters</strong>
              </div>
              <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: 6 }}>
                <span>GHG Factor:</span>
                <strong className="text-mono">2.68 kg CO2/L</strong>
              </div>
              <div className="flex-between" style={{ fontSize: '0.8rem' }}>
                <span>2030 ESG Milestone:</span>
                <strong className="text-mono" style={{ color: 'var(--color-lime)' }}>ON TRACK</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fuel Receipt Viewer Modal */}
      {selectedReceipt && (
        <div className="modal-backdrop" onClick={() => setSelectedReceipt(null)}>
          <div className="enterprise-card" style={{ width: 480, backgroundColor: '#1D2329', border: '1px solid var(--color-border)', padding: 26 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: 4 }}>LEVEL-3 MERCHANT RECEIPT</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{selectedReceipt.id}</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedReceipt(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <div style={{ background: 'var(--color-bg-surface)', padding: 14, borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', marginBottom: 16, fontSize: '0.82rem' }}>
              <div style={{ marginBottom: 6 }}>Plaza: <strong>{selectedReceipt.station}</strong></div>
              <div style={{ marginBottom: 6 }}>Cardholder: <strong>{selectedReceipt.cardHolder}</strong></div>
              <div style={{ marginBottom: 6 }}>Vehicle: <strong>{selectedReceipt.vehicle}</strong></div>
              <div style={{ marginBottom: 6 }}>Date/Time: <strong>{selectedReceipt.date}</strong></div>
              <div style={{ marginBottom: 6 }}>Volume: <strong>{selectedReceipt.volumeGal} Gallons (ULSD #2)</strong></div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-success)', marginTop: 8 }}>Total Paid: ${selectedReceipt.amountUsd.toFixed(2)} USD</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setSelectedReceipt(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Border Crossings Drilldown Modal */}
      {selectedBorderState && (
        <div className="modal-backdrop" onClick={() => setSelectedBorderState(null)}>
          <div className="enterprise-card" style={{ width: 540, backgroundColor: '#1D2329', border: '1px solid var(--color-border)', padding: 26 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: 4 }}>GIS BOUNDARY INTERCEPTS</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{selectedBorderState.state} Border Log</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedBorderState(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: 14 }}>
              TimescaleDB PostGIS geofence boundary events for Interstate crossings into {selectedBorderState.state}.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto', marginBottom: 16 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ background: 'var(--color-bg-surface)', padding: 10, borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', fontSize: '0.78rem' }}>
                  <div className="flex-between">
                    <strong>Crossing Point #{i + 1}: I-80 / State Line Intercept</strong>
                    <span className="text-mono" style={{ color: 'var(--color-copper)' }}>2026-07-2{4-i} 0{i+3}:15 UTC</span>
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', marginTop: 2 }}>Coordinate: [41.2291, -80.5189] • Odometer: 142,{i * 320 + 100} mi</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setSelectedBorderState(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Configure Tariff Modal */}
      {showTariffModal && (
        <div className="modal-backdrop" onClick={() => setShowTariffModal(false)}>
          <div className="enterprise-card" style={{ width: 480, backgroundColor: '#1D2329', border: '1px solid var(--color-border)', padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 14 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Configure Utility Electric Tariff</h3>
              <button 
                type="button" 
                onClick={() => setShowTariffModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>PEAK HOUR TARIFF ($/kWh)</label>
              <input
                type="number"
                step="0.01"
                className="enterprise-input text-mono"
                style={{ width: '100%' }}
                value={peakRate}
                onChange={(e) => setPeakRate(Number(e.target.value))}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>OFF-PEAK OVERNIGHT TARIFF ($/kWh)</label>
              <input
                type="number"
                step="0.01"
                className="enterprise-input text-mono"
                style={{ width: '100%' }}
                value={offPeakRate}
                onChange={(e) => setOffPeakRate(Number(e.target.value))}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowTariffModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                setShowTariffModal(false);
                if (showToast) showToast('Tariff Updated', 'Electric charging optimizer updated with new utility rate schedule.', 'success');
              }}>
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

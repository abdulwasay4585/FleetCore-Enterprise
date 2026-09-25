"use client";
import React, { useState } from 'react';
import { Icon } from './Icons';

export default function DataWarehouseAndReports({ onNavigateToModule, showToast }) {
  const [activeTab, setActiveTab] = useState('FLINK');
  const [sqlQuery, setSqlQuery] = useState(`SELECT 
  asset_id, 
  DATE_TRUNC('hour', recorded_at) as hour_window,
  AVG(speed_kmh) as avg_speed,
  MAX(engine_rpm) as peak_rpm,
  SUM(fuel_burn_liters) as total_fuel_consumed
FROM timescale_telemetry_raw
WHERE recorded_at >= NOW() - INTERVAL '24 HOURS'
GROUP BY 1, 2
ORDER BY hour_window DESC LIMIT 10;`);
  
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryStats, setQueryStats] = useState({
    rows: 4,
    executionMs: 14.2,
    scannedMb: 84.6,
    engine: 'TimescaleDB Columnar (ZSTD chunk bypass)'
  });

  // Query Result Sets
  const [queryResults, setQueryResults] = useState([
    { asset_id: 'V-901 (Volvo FH16)', window: '2026-07-25 14:00:00', avg_speed: '84.2 km/h', peak_rpm: '1,580 RPM', fuel_consumed: '24.1 L' },
    { asset_id: 'K-204 (Kenworth W900)', window: '2026-07-25 14:00:00', avg_speed: '92.5 km/h', peak_rpm: '2,110 RPM', fuel_consumed: '34.8 L' },
    { asset_id: 'EV-402 (BrightDrop Zevo)', window: '2026-07-25 14:00:00', avg_speed: '41.0 km/h', peak_rpm: '0 RPM (EV)', fuel_consumed: '0.0 L (12.4 kWh)' },
    { asset_id: 'F-550 (Freightliner)', window: '2026-07-25 14:00:00', avg_speed: '88.1 km/h', peak_rpm: '1,490 RPM', fuel_consumed: '26.3 L' },
  ]);

  // Timescale Chunk Partition States
  const [chunks, setChunks] = useState([
    { name: '_hyper_1_42_chunk', range: 'Last 24 Hours (Active Ingest)', rawSize: '14.8 GB', compressedSize: '—', savedPct: '0.0% (Hot Storage)', state: 'HOT ACTIVE CHUNK', badge: 'badge-warning', canCompress: false },
    { name: '_hyper_1_41_chunk', range: 'Days 2 through 7 (Warm Ingest)', rawSize: '88.4 GB', compressedSize: '—', savedPct: '0.0% (Warm Storage)', state: 'WARM QUERY CHUNK', badge: 'badge-info', canCompress: true },
    { name: '_hyper_1_40_chunk', range: 'Days 8 through 14 (Archived)', rawSize: '104.2 GB', compressedSize: '6.1 GB', savedPct: '94.1% SAVED', state: 'ZSTD COMPRESSED', badge: 'badge-success', canCompress: false },
    { name: '_hyper_1_39_chunk', range: 'Days 15 through 21 (Archived)', rawSize: '98.6 GB', compressedSize: '5.7 GB', savedPct: '94.2% SAVED', state: 'ZSTD COMPRESSED', badge: 'badge-success', canCompress: false }
  ]);

  // Modals and feedback state
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState({
    name: 'Executive Fleet Reliability & Fuel Summary',
    cadence: 'MONDAY_0600',
    format: 'CSV_AND_PDF',
    recipients: 'executive-ops@acmefreight.com, cfo-desk@acmefreight.com',
    metrics: ['TOTAL_FUEL_BURN', 'IFTA_TAX_SUMMARY', 'CRITICAL_DTC_FAULTS', 'DRIVER_HOURS_VIOLATIONS']
  });
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);

  const [inspectingChunk, setInspectingChunk] = useState(null);
  const [compactionNotice, setCompactionNotice] = useState(null);

  const handleRunQuery = () => {
    setIsQuerying(true);
    setTimeout(() => {
      setIsQuerying(false);
      const isHarsh = sqlQuery.toLowerCase().includes('harsh');
      const isCo2 = sqlQuery.toLowerCase().includes('co2') || sqlQuery.toLowerCase().includes('fuel_burned');

      if (isHarsh) {
        setQueryResults([
          { asset_id: 'K-204 (Kenworth W900)', window: 'Past 7 Days Aggregated', avg_speed: '96.2 km/h Peak', peak_rpm: '2,240 RPM', fuel_consumed: '7 Harsh Braking Incidents' },
          { asset_id: 'F-550 (Freightliner)', window: 'Past 7 Days Aggregated', avg_speed: '91.0 km/h Peak', peak_rpm: '1,980 RPM', fuel_consumed: '3 Harsh Braking Incidents' },
          { asset_id: 'V-901 (Volvo FH16)', window: 'Past 7 Days Aggregated', avg_speed: '86.4 km/h Peak', peak_rpm: '1,620 RPM', fuel_consumed: '1 Harsh Braking Incident' },
          { asset_id: 'EV-402 (BrightDrop Zevo)', window: 'Past 7 Days Aggregated', avg_speed: '54.0 km/h Peak', peak_rpm: '0 RPM (EV)', fuel_consumed: '0 Incidents (Flawless)' },
        ]);
        setQueryStats({ rows: 4, executionMs: 8.4, scannedMb: 42.1, engine: 'Apache Flink CEP Stream Aggregator' });
      } else if (isCo2) {
        setQueryResults([
          { asset_id: 'TENANT_ACME_01 (Heavy Diesel)', window: 'Q3-2026 Rolling', avg_speed: '72.4 km/h Avg', peak_rpm: '1,640 RPM', fuel_consumed: '124,820 kg CO2 (46,575 L)' },
          { asset_id: 'TENANT_ACME_01 (Medium Duty)', window: 'Q3-2026 Rolling', avg_speed: '58.2 km/h Avg', peak_rpm: '1,710 RPM', fuel_consumed: '42,100 kg CO2 (15,708 L)' },
          { asset_id: 'TENANT_ACME_01 (Electric ZEV)', window: 'Q3-2026 Rolling', avg_speed: '44.8 km/h Avg', peak_rpm: '0 RPM', fuel_consumed: '0 kg CO2 Direct (Scope 1 Zero)' },
        ]);
        setQueryStats({ rows: 3, executionMs: 11.2, scannedMb: 118.0, engine: 'Timescale Continuous Aggregate Materialized View' });
      } else {
        setQueryResults([
          { asset_id: 'V-901 (Volvo FH16)', window: '2026-07-25 14:00:00', avg_speed: '84.2 km/h', peak_rpm: '1,580 RPM', fuel_consumed: '24.1 L' },
          { asset_id: 'K-204 (Kenworth W900)', window: '2026-07-25 14:00:00', avg_speed: '92.5 km/h', peak_rpm: '2,110 RPM', fuel_consumed: '34.8 L' },
          { asset_id: 'EV-402 (BrightDrop Zevo)', window: '2026-07-25 14:00:00', avg_speed: '41.0 km/h', peak_rpm: '0 RPM (EV)', fuel_consumed: '0.0 L (12.4 kWh)' },
          { asset_id: 'F-550 (Freightliner)', window: '2026-07-25 14:00:00', avg_speed: '88.1 km/h', peak_rpm: '1,490 RPM', fuel_consumed: '26.3 L' },
        ]);
        setQueryStats({ rows: 4, executionMs: 14.2, scannedMb: 84.6, engine: 'TimescaleDB Columnar (ZSTD chunk bypass)' });
      }
      if (showToast) {
        showToast('Query Executed', `Returned continuous aggregate window in ${queryStats.executionMs} ms.`, 'info');
      }
    }, 500);
  };

  const handleExportCSV = () => {
    const headers = ["asset_id", "time_window", "avg_speed", "peak_rpm", "fuel_consumed"];
    const rows = queryResults.map(r => `"${r.asset_id}","${r.window}","${r.avg_speed}","${r.peak_rpm}","${r.fuel_consumed}"`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fleetcore_analytics_query_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) {
      showToast('Export Complete', 'Analytical query dataset downloaded as CSV.', 'success');
    }
  };

  const handleTriggerCompaction = (chunkName) => {
    setChunks(prev => prev.map(c => {
      if (c.name === chunkName) {
        return {
          ...c,
          rawSize: '88.4 GB',
          compressedSize: '5.2 GB',
          savedPct: '94.1% SAVED',
          state: 'ZSTD COMPRESSED',
          badge: 'badge-success',
          canCompress: false
        };
      }
      return c;
    }));
    setCompactionNotice(`ZSTD Columnar Compaction worker completed for ${chunkName}. Reduced 88.4 GB to 5.2 GB (94.1% storage saved).`);
    if (showToast) {
      showToast('Compaction Finished', `${chunkName} compressed into columnar format.`, 'success');
    }
    setTimeout(() => setCompactionNotice(null), 6000);
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Top Page Header */}
      <div className="flex-between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
            TimescaleDB Analytics &amp; Apache Flink Streaming
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>
            Sub-second continuous query execution across TimescaleDB hypertables, Apache Flink CEP stream windows, ZSTD columnar chunk compression, and automated BI subscriptions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className={`btn ${activeTab === 'FLINK' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('FLINK')}>
            <Icon name="activity" size={14} />
            <span>Flink Stream SQL</span>
          </button>
          <button className={`btn ${activeTab === 'TIMESCALE' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('TIMESCALE')}>
            <Icon name="layers" size={14} />
            <span>Columnar Partition Chunks</span>
          </button>
          <button className="btn btn-secondary" onClick={() => setShowSubscriptionModal(true)}>
            <Icon name="calendar" size={14} />
            <span>Scheduled Subscriptions</span>
          </button>
        </div>
      </div>

      {compactionNotice && (
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
          <div><strong>Compaction Worker:</strong> {compactionNotice}</div>
          <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem' }} onClick={() => setCompactionNotice(null)}>Dismiss</button>
        </div>
      )}

      {/* Quick Infrastructure KPIs */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="enterprise-card" style={{ borderLeft: '4px solid var(--color-info)' }}>
          <div className="metric-label">TIMESCALE HYPERTABLE INGESTION RATE</div>
          <div className="metric-value" style={{ color: 'var(--color-info)', margin: '6px 0 2px' }}>
            14,820 <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>rows / sec</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Zero lock degradation across 42 active partitioned chunks</div>
        </div>

        <div className="enterprise-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <div className="metric-label">ZSTD COLUMNAR COMPRESSION RATIO</div>
          <div className="metric-value" style={{ color: 'var(--color-success)', margin: '6px 0 2px' }}>
            94.2% <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Storage Saved</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Raw dataset: 4.8 TB &rarr; Compacting to 278 GB on SSD</div>
        </div>

        <div className="enterprise-card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
          <div className="metric-label">FLINK STREAM WINDOW ALERTS</div>
          <div className="metric-value" style={{ color: 'var(--color-text-primary)', margin: '6px 0 2px' }}>
            4 Active <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Stream Jobs</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Real-time geofence ray-casting &amp; harsh braking aggregators</div>
        </div>
      </div>

      {/* TAB 1: FLINK SQL & TIMESCALEDB QUERY STUDIO (FEATURE 33) */}
      {activeTab === 'FLINK' && (
        <div className="enterprise-card">
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>
              <span>APACHE FLINK &amp; TIMESCALEDB ANALYTICAL STUDIO</span>
              <span className="badge badge-info">ZSTD CHUNK BYPASS ACTIVE</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '0.8rem' }} 
                onClick={() => setSqlQuery("SELECT vehicle_vin, COUNT(*) as harsh_events FROM telemetry_events WHERE event_type = 'HARSH_BRAKE' AND recorded_at >= NOW() - INTERVAL '7 DAYS' GROUP BY 1 ORDER BY 2 DESC;")}
              >
                Load Harsh Brake Query
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '0.8rem' }} 
                onClick={() => setSqlQuery("SELECT tenant_id, SUM(fuel_burned_liters) * 2.68 as total_kg_co2 FROM fuel_ledger WHERE quarter = 'Q3_2026' GROUP BY 1;")}
              >
                Load CO2 Ledger Query
              </button>
            </div>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 16 }}>
            Execute ANSI SQL and streaming continuous aggregate window queries directly against live hypertable storage. Designed for sub-second fleet data engineering and DOT custom reporting.
          </p>

          {/* SQL Editor Input Box */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="enterprise-input text-mono"
              style={{
                width: '100%',
                height: 170,
                backgroundColor: 'var(--color-bg-deep)',
                color: 'var(--color-lime)',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                padding: 16,
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={handleExportCSV}>
                <Icon name="file" size={14} />
                <span>Export Query Results (CSV)</span>
              </button>
              <button
                className="btn btn-primary"
                style={{ padding: '10px 24px', fontSize: '0.9rem' }}
                onClick={handleRunQuery}
                disabled={isQuerying}
              >
                {isQuerying ? 'Executing Columnar Query...' : 'Run Analytical Query'}
              </button>
            </div>
          </div>

          {/* Table of Query Results */}
          <div className="flex-between" style={{ marginBottom: 12 }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text-secondary)', margin: 0 }}>
              QUERY EXECUTION OUTPUT ({queryStats.rows} records in {queryStats.executionMs} ms)
            </h4>
            <span className="text-mono" style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Engine: <strong style={{ color: 'var(--color-info)' }}>{queryStats.engine}</strong> &bull; Scanned: {queryStats.scannedMb} MB
            </span>
          </div>

          <div className="table-container">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>asset_id (Identifier)</th>
                  <th>time_window (Continuous Aggregate)</th>
                  <th>avg_speed (Mean Velocity)</th>
                  <th>peak_rpm (Engine Ceiling)</th>
                  <th>metric_value (Total Volume / Incidents)</th>
                </tr>
              </thead>
              <tbody>
                {queryResults.map((row, index) => (
                  <tr key={index}>
                    <td><strong style={{ color: 'var(--color-text-primary)' }}>{row.asset_id}</strong></td>
                    <td className="text-mono" style={{ color: 'var(--color-info)' }}>{row.window}</td>
                    <td className="text-mono">{row.avg_speed}</td>
                    <td className="text-mono" style={{ color: row.peak_rpm.includes('2,110') || row.peak_rpm.includes('2,240') ? 'var(--color-warning)' : 'var(--color-text-primary)' }}>{row.peak_rpm}</td>
                    <td className="text-mono" style={{ fontWeight: 700, color: 'var(--color-success)' }}>{row.fuel_consumed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TIMESCALEDB COMPRESSION & RETENTION VAULT (FEATURE 34) */}
      {activeTab === 'TIMESCALE' && (
        <div className="enterprise-card">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>
              <span>TIMESCALEDB COLUMNAR ZSTD COMPRESSION VAULT</span>
              <span className="badge badge-success">7-DAY COMPACTION ACTIVE</span>
            </div>
            <button className="btn btn-secondary" onClick={() => handleTriggerCompaction('_hyper_1_41_chunk')}>
              <Icon name="layers" size={14} />
              <span>Run Compaction Task</span>
            </button>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 20 }}>
            TimescaleDB native columnar ZSTD compression automatically converts historical row-oriented GPS logs older than 7 days into compressed blocks, saving up to 95% storage while speeding up multi-year analytical scanning.
          </p>

          <div className="table-container">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Hypertable Chunk Partition Name</th>
                  <th>Time Range &amp; Window Scope</th>
                  <th>Uncompressed Raw Size</th>
                  <th>Compressed ZSTD Size</th>
                  <th>Storage Reduction %</th>
                  <th>Chunk State &amp; Policy</th>
                  <th style={{ textAlign: 'right' }}>Management</th>
                </tr>
              </thead>
              <tbody>
                {chunks.map((c) => (
                  <tr key={c.name}>
                    <td className="text-mono" style={{ color: 'var(--color-info)', fontWeight: 700 }}>{c.name}</td>
                    <td>{c.range}</td>
                    <td className="text-mono" style={{ textDecoration: c.compressedSize !== '—' ? 'line-through' : 'none', color: c.compressedSize !== '—' ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>
                      {c.rawSize}
                    </td>
                    <td className="text-mono" style={{ color: c.compressedSize !== '—' ? 'var(--color-success)' : 'var(--color-text-muted)', fontWeight: 700 }}>
                      {c.compressedSize}
                    </td>
                    <td className="text-mono" style={{ color: c.compressedSize !== '—' ? 'var(--color-success)' : 'inherit', fontWeight: c.compressedSize !== '—' ? 800 : 400 }}>
                      {c.savedPct}
                    </td>
                    <td><span className={`badge ${c.badge}`}>{c.state}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      {c.canCompress ? (
                        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => handleTriggerCompaction(c.name)}>
                          Compress Early
                        </button>
                      ) : (
                        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setInspectingChunk(c)}>
                          Inspect Index
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

      {/* SCHEDULED EXECUTIVE SUBSCRIPTIONS MODAL — Opaque, Non-Bleed */}
      {showSubscriptionModal && (
        <div className="modal-backdrop" onClick={() => setShowSubscriptionModal(false)}>
          <div 
            className="enterprise-card" 
            style={{ 
              width: 580, 
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
                <span>CONFIGURE EXECUTIVE REPORT SUBSCRIPTION</span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowSubscriptionModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            {subscriptionSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 'var(--radius-card)', 
                  background: 'rgba(50, 201, 113, 0.15)', 
                  border: '1px solid var(--color-success)', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: 16 
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 8 }}>
                  Scheduled Automation Active
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.86rem', lineHeight: 1.5, marginBottom: 20 }}>
                  Automated dispatch profile configured: <strong>{subscriptionForm.name}</strong> will be compiled and distributed every Monday at 06:00 UTC to <strong>{subscriptionForm.recipients}</strong>.
                </p>
                <button className="btn btn-primary" onClick={() => { setSubscriptionSuccess(false); setShowSubscriptionModal(false); }}>
                  Done
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                  Scheduled reports compile continuous aggregates across TimescaleDB hypertables and deliver signed executive PDF &amp; CSV dossiers without manual intervention.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                      REPORT PROFILE TITLE:
                    </label>
                    <input 
                      type="text" 
                      className="enterprise-input" 
                      style={{ width: '100%' }}
                      value={subscriptionForm.name}
                      onChange={(e) => setSubscriptionForm({ ...subscriptionForm, name: e.target.value })}
                    />
                  </div>

                  <div className="grid-2" style={{ gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                        DISPATCH FREQUENCY:
                      </label>
                      <select 
                        className="enterprise-select" 
                        style={{ width: '100%' }}
                        value={subscriptionForm.cadence}
                        onChange={(e) => setSubscriptionForm({ ...subscriptionForm, cadence: e.target.value })}
                      >
                        <option value="MONDAY_0600">Weekly (Every Monday 06:00 UTC)</option>
                        <option value="DAILY_MIDNIGHT">Daily (Every Midnight 00:00 UTC)</option>
                        <option value="MONTHLY_FIRST">Monthly (1st of Every Month)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                        DELIVERY FORMAT:
                      </label>
                      <select 
                        className="enterprise-select" 
                        style={{ width: '100%' }}
                        value={subscriptionForm.format}
                        onChange={(e) => setSubscriptionForm({ ...subscriptionForm, format: e.target.value })}
                      >
                        <option value="CSV_AND_PDF">Executive PDF Dossier + Raw CSV</option>
                        <option value="PDF_ONLY">PDF Executive Summary Only</option>
                        <option value="PARQUET_S3">Apache Parquet Export to S3 / Cloud</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                      RECIPIENT EMAIL ADDRESSES (COMMA-SEPARATED):
                    </label>
                    <input 
                      type="text" 
                      className="enterprise-input" 
                      style={{ width: '100%' }}
                      value={subscriptionForm.recipients}
                      onChange={(e) => setSubscriptionForm({ ...subscriptionForm, recipients: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                    <button className="btn btn-secondary" onClick={() => setShowSubscriptionModal(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => {
                      setSubscriptionSuccess(true);
                      if (showToast) showToast('Subscription Saved', 'Automated executive dispatch cadence configured.', 'success');
                    }}>
                      Save Scheduled Subscription
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INSPECT CHUNK INDEX MODAL — Opaque, Non-Bleed */}
      {inspectingChunk && (
        <div className="modal-backdrop" onClick={() => setInspectingChunk(null)}>
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
                <span>PARTITION CHUNK METADATA: {inspectingChunk.name}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setInspectingChunk(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid-2" style={{ gap: 12 }}>
                <div style={{ background: 'var(--color-bg-deep)', padding: 14, borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>UNCOMPRESSED ROWS</div>
                  <div className="text-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>31,440,000</div>
                </div>
                <div style={{ background: 'var(--color-bg-deep)', padding: 14, borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>ZSTD COMPRESSION LEVEL</div>
                  <div className="text-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-success)' }}>Level 3 (Stream)</div>
                </div>
              </div>

              <div style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, background: 'var(--color-bg-deep)', padding: 14, borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
                <div><strong>Temporal Window:</strong> <span style={{ color: 'var(--color-text-primary)' }}>{inspectingChunk.range}</span></div>
                <div><strong>Raw Volume:</strong> <span style={{ color: 'var(--color-text-primary)' }}>{inspectingChunk.rawSize}</span></div>
                <div><strong>Current Disk Footprint:</strong> <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>{inspectingChunk.compressedSize}</span></div>
                <div><strong>Timescale Hypertable:</strong> <span className="text-mono">telemetry_events</span></div>
                <div><strong>LSM Tree Levels:</strong> Level 0: 4 SSTs, Level 1: 18 SSTs</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn btn-primary" onClick={() => setInspectingChunk(null)}>Done</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import { Icon } from './Icons';

export default function DispatchBoard({ assets, onNavigateToModule, showToast }) {
  const [activeTab, setActiveTab] = useState('GANTT');
  const [tspRunning, setTspRunning] = useState(false);
  const [routeOptimized, setRouteOptimized] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(101);

  // F11 & F13: Load Schedules
  const [schedules, setSchedules] = useState([
    { id: 101, vehicle: 'Volvo FH16 (#V-901)', driver: 'James Wilson', load: 'LOAD-881: Cold-Chain Pharmaceuticals', startHour: 6, duration: 8, status: 'IN_TRANSIT', startLocation: 'Port of Newark Depot', endLocation: 'Boston Medical Distribution', pallets: 18, bolNumber: 'BOL-99021-US' },
    { id: 102, vehicle: 'BrightDrop Zevo (#EV-402)', driver: 'Elena Rostova', load: 'LOAD-882: Urban Grocery Fulfillment (14 Drops)', startHour: 8, duration: 6, status: 'IN_TRANSIT', startLocation: 'Chicago Central EV Hub', endLocation: 'North Shore Retail District', pallets: 12, bolNumber: 'BOL-99022-US' },
    { id: 103, vehicle: 'Kenworth W900 (#K-204)', driver: 'Marcus Vance', load: 'LOAD-883: Industrial Steel Pipe Coils', startHour: 10, duration: 9, status: 'DELAYED', startLocation: 'Dallas Steel Foundry', endLocation: 'Austin Highway Construction', pallets: 24, bolNumber: 'BOL-99023-US' },
    { id: 104, vehicle: 'Freightliner Cascadia (#F-550)', driver: 'David Kim', load: 'LOAD-884: E-Commerce Air Freight Pallets', startHour: 4, duration: 10, status: 'COMPLETED', startLocation: 'Atlanta Amazon Gateway', endLocation: 'Charlotte Fulfillment Center', pallets: 20, bolNumber: 'BOL-99024-US' },
  ]);

  // Modal States
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showGeofenceModal, setShowGeofenceModal] = useState(false);

  // New Freight Order Form State
  const [newOrder, setNewOrder] = useState({
    vehicle: 'Volvo FH16 (#V-901)',
    driver: 'James Wilson',
    load: 'LOAD-885: Electronics & High-Value Freight',
    startHour: 7,
    duration: 6,
    startLocation: 'Chicago South Depot',
    endLocation: 'Detroit Assembly Plant',
    pallets: 16
  });

  // F18: Bidirectional Messaging State
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Dispatcher Brody', text: 'Accident reported at Exit 14 on I-80. Reroute via US-6.', time: '08:14 UTC', fromCab: false },
    { id: 2, sender: 'James Wilson (In-Cab)', text: 'Acknowledged dispatch, taking US-6 bypass. ETA unchanged.', time: '08:16 UTC', fromCab: true }
  ]);
  const [msgInput, setMsgInput] = useState('');

  // F19: Backhaul Matching State
  const [backhauls, setBackhauls] = useState([
    { id: 'BH-401', origin: 'Boston Medical', dest: 'Port of Newark', freight: 'Medical Waste Packaging (Empty)', revenue: 1450, emptyMilesSaved: 215, matchPct: 98 },
    { id: 'BH-402', origin: 'Austin Highway', dest: 'Dallas Foundry', freight: 'Machinery Scrap Metal', revenue: 2100, emptyMilesSaved: 195, matchPct: 92 },
    { id: 'BH-403', origin: 'Charlotte Gateway', dest: 'Atlanta Hub', freight: 'Retail Return Pallets', revenue: 1850, emptyMilesSaved: 240, matchPct: 95 }
  ]);

  // F20: Depot Yard Management State
  const [yardBays, setYardBays] = useState([
    { bay: 'Bay A-01', type: 'REEFER PLUG (480V)', asset: 'Freightliner (#F-550)', status: 'CHARGING_COOLING', temp: '-18.2°C' },
    { bay: 'Bay A-02', type: 'HEAVY DIESEL DOCK', asset: 'Volvo FH16 (#V-901)', status: 'UNLOADING', temp: 'N/A' },
    { bay: 'Bay B-01', type: 'EV FAST CHARGER (350kW)', asset: 'BrightDrop (#EV-402)', status: 'PLUGGED_IN', temp: 'N/A' },
    { bay: 'Bay B-02', type: 'STAGED EMPTY TRAILER', asset: 'Trailer #TR-994', status: 'READY_TO_HAUL', temp: 'N/A' }
  ]);

  // Geofence Engine State (F13 & Section 7)
  const [geofences, setGeofences] = useState([
    { id: 'GF-01', name: 'Port of Newark Terminal Hub', type: 'EXCLUSION_ENTRY', dwellLimitMins: 45, currentVehicles: 4, alertsToday: 0, status: 'ACTIVE' },
    { id: 'GF-02', name: 'Dallas Central Distribution Yard', type: 'GATED_YARD', dwellLimitMins: 120, currentVehicles: 12, alertsToday: 1, status: 'ACTIVE' },
    { id: 'GF-03', name: 'Customer Retail Gate #4 (Curfew Zone)', type: 'CURFEW_ZONE', dwellLimitMins: 30, currentVehicles: 0, alertsToday: 2, status: 'ALERT' },
    { id: 'GF-04', name: 'Chicago EV Hyper-Charging Hub', type: 'CHARGING_ZONE', dwellLimitMins: 60, currentVehicles: 3, alertsToday: 0, status: 'ACTIVE' }
  ]);
  const [newGf, setNewGf] = useState({ name: 'Denver Western Crossdock', type: 'CUSTOM_ZONE', dwellLimitMins: 60 });

  // Handle TSP Route Optimization
  const handleRunTSPOptimization = () => {
    setTspRunning(true);
    setTimeout(() => {
      setTspRunning(false);
      setRouteOptimized(true);
      if (showToast) {
        showToast('Route Optimized', 'Clarke-Wright algorithm re-ordered waypoints. Avoided low bridges under 13ft 6in. Saved 14.2% fuel.', 'success');
      }
    }, 1200);
  };

  // Handle New Freight Order
  const handleCreateOrderSubmit = (e) => {
    e.preventDefault();
    const created = {
      ...newOrder,
      id: Math.floor(100 + Math.random() * 900),
      status: 'IN_TRANSIT',
      bolNumber: `BOL-${Math.floor(10000 + Math.random() * 90000)}-US`
    };
    setSchedules([...schedules, created]);
    setShowOrderModal(false);
    if (showToast) {
      showToast('Dispatch Created', `Assigned ${created.load} to ${created.vehicle}. Driver HOS verified compliant.`, 'success');
    }
  };

  // Handle Send In-Cab Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    const now = new Date();
    const timeStr = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')} UTC`;
    setMessages([...messages, {
      id: messages.length + 1,
      sender: 'Dispatcher (Command)',
      text: msgInput.trim(),
      time: timeStr,
      fromCab: false
    }]);
    setMsgInput('');
    if (showToast) {
      showToast('Message Transmitted', 'Payload dispatched to In-Cab tablet display with audio chime.', 'info');
    }
  };

  // Handle Add Geofence
  const handleSaveGeofence = (e) => {
    e.preventDefault();
    setGeofences([...geofences, {
      id: `GF-0${geofences.length + 1}`,
      name: newGf.name,
      type: newGf.type,
      dwellLimitMins: Number(newGf.dwellLimitMins),
      currentVehicles: 0,
      alertsToday: 0,
      status: 'ACTIVE'
    }]);
    setShowGeofenceModal(false);
    if (showToast) {
      showToast('Geofence Created', `Added PostGIS spatial perimeter for ${newGf.name}.`, 'success');
    }
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Page Title & Navigation Header */}
      <div className="flex-between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
            Autonomous Freight Dispatch &amp; TSP Route Optimization
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>
            Deterministic multi-stop TSP routing, FMCSA HOS compliance gates, low-clearance hazard avoidance, bidirectional in-cab data links, and continuous deadhead backhaul matching.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className={`btn ${activeTab === 'GANTT' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('GANTT')}
          >
            <Icon name="zap" size={14} />
            <span>Gantt Schedule</span>
          </button>
          <button
            className={`btn ${activeTab === 'TSP' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('TSP')}
          >
            <Icon name="map" size={14} />
            <span>TSP &amp; Clearance</span>
          </button>
          <button
            className={`btn ${activeTab === 'MESSAGES' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('MESSAGES')}
          >
            <Icon name="shield" size={14} />
            <span>In-Cab Data Link</span>
          </button>
          <button
            className={`btn ${activeTab === 'BACKHAUL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('BACKHAUL')}
          >
            <Icon name="truck" size={14} />
            <span>Backhaul Matching</span>
          </button>
          <button
            className={`btn ${activeTab === 'YARD' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('YARD')}
          >
            <Icon name="activity" size={14} />
            <span>Depot Yard Operations</span>
          </button>
          <button
            className={`btn ${activeTab === 'GEOFENCE' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('GEOFENCE')}
          >
            <Icon name="settings" size={14} />
            <span>Spatial Geofence Engine</span>
          </button>
        </div>
      </div>

      {/* TAB 1: GANTT DISPATCH SCHEDULER (FEATURE 11 & F15) */}
      {activeTab === 'GANTT' && (
        <div className="enterprise-card">
          <div className="flex-between" style={{ marginBottom: 18 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>
              <span>24-HOUR FLEET FREIGHT & DISPATCH GANTT TIMELINE</span>
              <span className="badge badge-success">HOS COLLISION PROTECTED</span>
            </div>
            <button className="btn btn-primary" onClick={() => setShowOrderModal(true)}>
              <Icon name="plus" size={14} color="#FFF" />
              <span>Create Freight Order</span>
            </button>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 20 }}>
            Real-time visual schedule across active tenanted tractors and delivery vans. High-contrast indicators reflect on-road status. Click any shipment bar to inspect Bill of Lading (BOL).
          </p>

          {/* Gantt Header Timeline (04:00 to 20:00) */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, borderBottom: '1px solid var(--color-border)', paddingBottom: 8, marginBottom: 14, fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
            <div>ASSIGNED RESOURCE / DRIVER</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', textAlign: 'center', background: 'var(--color-bg-deep)', padding: '6px 0', borderRadius: '4px' }}>
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} style={{ borderRight: i < 15 ? '1px solid var(--color-border)' : 'none' }}>{`${(i + 4).toString().padStart(2, '0')}:00`}</div>
              ))}
            </div>
          </div>

          {/* Gantt Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {schedules.map((item) => {
              const startCol = Math.max(0, item.startHour - 4);
              const leftPct = (startCol / 16) * 100;
              const widthPct = (Math.min(item.duration, 16 - startCol) / 16) * 100;

              const barBg = item.status === 'COMPLETED' ? 'var(--color-success)' :
                            item.status === 'DELAYED' ? 'var(--color-danger)' :
                            'var(--color-copper)';

              return (
                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, alignItems: 'center', background: 'var(--color-bg-deep)', padding: '10px 14px', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--color-text-primary)', fontSize: '0.86rem' }}>{item.vehicle}</strong>
                    <span style={{ fontSize: '0.76rem', color: 'var(--color-copper)', fontWeight: 600 }}> {item.driver}</span>
                  </div>

                  <div style={{ position: 'relative', height: 38, background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                    {/* Time background grid lines */}
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', pointerEvents: 'none' }}>
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} style={{ borderRight: '1px solid rgba(52, 59, 68, 0.4)' }}></div>
                      ))}
                    </div>

                    {/* Active Gantt Shipment Bar — flat solid color per design system */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 4,
                        bottom: 4,
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        backgroundColor: barBg,
                        borderRadius: '4px',
                        padding: '0 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: '#FFFFFF',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      onClick={() => setSelectedShipment(item)}
                      title="Click to view Bill of Lading (BOL)"
                    >
                      <span>{item.load}</span>
                      <span style={{ fontSize: '0.68rem', opacity: 0.9 }}>{item.startHour}:00 - {item.startHour + item.duration}:00</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            <span>Active Shipments: <strong>{schedules.length} Loads</strong></span>
            <span>On-Time Fleet Rate: <strong style={{ color: 'var(--color-success)' }}>94.2%</strong></span>
          </div>
        </div>
      )}

      {/* TAB 2: TSP ROUTE & LOW BRIDGE RESTRICTIONS (FEATURE 12) */}
      {activeTab === 'TSP' && (
        <div className="grid-2">
          <div className="enterprise-card">
            <div className="card-title">
              <span>COMMERCIAL ROUTING & LOW BRIDGE CLEARANCE (F12)</span>
              <span className="badge badge-info">CLARKE-WRIGHT HEURISTIC</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 16 }}>
              Evaluates height clearances (&lt; 13ft 6in), gross bridge weight formulas, and hazardous material bans before dispatching heavy tractors.
            </p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>TARGET ROUTE ASSIGNMENT:</label>
              <select className="enterprise-select" style={{ width: '100%' }} value={selectedRoute} onChange={(e) => setSelectedRoute(Number(e.target.value))}>
                <option value="101">LOAD-881: Port of Newark → Boston (Refrigerated Medical)</option>
                <option value="102">LOAD-882: Chicago Urban Grocery Fulfillment (14 Drops)</option>
                <option value="103">LOAD-883: Dallas Steel Foundry → Austin Construction</option>
              </select>
            </div>

            <div style={{ background: 'var(--color-bg-deep)', padding: 14, borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', marginBottom: 18 }}>
              <div className="flex-between" style={{ marginBottom: 8, borderBottom: '1px solid var(--color-border)', paddingBottom: 6 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>Baseline Highway Distance:</span>
                <strong className="text-mono" style={{ color: 'var(--color-text-primary)' }}>148.4 miles (Unoptimized)</strong>
              </div>
              <div className="flex-between" style={{ marginBottom: 8, borderBottom: '1px solid var(--color-border)', paddingBottom: 6 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>Transit Duration:</span>
                <strong className="text-mono" style={{ color: 'var(--color-text-primary)' }}>4 hrs 20 mins</strong>
              </div>
              <div className="flex-between">
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>Bridge Clearance Verification:</span>
                <strong className="text-mono" style={{ color: 'var(--color-lime)' }}>13 FT 6 IN APPROVED</strong>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
              onClick={handleRunTSPOptimization}
              disabled={tspRunning}
            >
              {tspRunning ? 'Computing Clarke-Wright Savings Matrix...' : 'Run AI Route Optimization'}
            </button>
          </div>

          <div className="enterprise-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'var(--color-bg-deep)' }}>
            {routeOptimized ? (
              <div style={{ width: '100%' }}>
                <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-button)', background: 'rgba(50, 201, 113, 0.15)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <Icon name="check" size={28} color="var(--color-success)" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-success)', marginBottom: 6 }}>ROUTE OPTIMIZED</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: 18, maxWidth: 360, margin: '0 auto 18px' }}>
                  Drops #3 through #11 re-sequenced, cutting 18.2 miles of downtown congestion and bypassing 2 low bridge hazards.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: 'var(--color-bg-surface)', padding: 14, borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>NEW TOTAL DISTANCE</div>
                    <div className="text-mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-copper)' }}>130.2 mi (-12.2%)</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>ESTIMATED SAVINGS</div>
                    <div className="text-mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-success)' }}>+$44.50 USD</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ opacity: 0.7, padding: 30 }}>
                <Icon name="map" size={42} color="var(--color-text-muted)" />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 12, marginBottom: 6 }}>Ready for Optimization</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', maxWidth: 260, margin: '0 auto' }}>
                  Click &quot;Run AI Route Optimization&quot; on the left to re-sequence stops and check commercial road restrictions.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TWO-WAY CAB MESSAGING & DISPATCH CHAT (FEATURE 18) */}
      {activeTab === 'MESSAGES' && (
        <div className="enterprise-card">
          <div className="card-title">
            <span>TWO-WAY DISPATCHER ↔ CAB MESSAGING (FEATURE 18)</span>
            <span className="badge badge-success">ENCRYPTED SOCKET ACTIVE</span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 16 }}>
            Direct real-time communication between dispatch command and driver in-cab tablets. Messages trigger automated text-to-speech reading in the vehicle.
          </p>

          <div style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 16, height: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.fromCab ? 'flex-start' : 'flex-end',
                  maxWidth: '70%',
                  background: m.fromCab ? 'var(--color-bg-surface)' : 'rgba(199, 107, 42, 0.15)',
                  border: `1px solid ${m.fromCab ? 'var(--color-border)' : 'var(--color-copper)'}`,
                  borderRadius: 'var(--radius-card)',
                  padding: '10px 14px'
                }}
              >
                <div className="flex-between" style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                  <strong style={{ color: m.fromCab ? 'var(--color-text-primary)' : 'var(--color-copper)' }}>{m.sender}</strong>
                  <span>{m.time}</span>
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--color-text-primary)' }}>{m.text}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              className="enterprise-input"
              style={{ flex: 1 }}
              placeholder="Type urgent dispatch instruction or weather update for driver cab..."
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Transmit Message
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: BACKHAUL LOAD MATCHING (FEATURE 19) */}
      {activeTab === 'BACKHAUL' && (
        <div className="enterprise-card">
          <div className="card-title">
            <span>AUTOMATED BACKHAUL LOAD MATCHING (FEATURE 19)</span>
            <span className="badge badge-success">ZERO EMPTY MILES INITIATIVE</span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 18 }}>
            AI algorithm pairs terminating delivery destinations with return-trip freight loads, converting non-revenue deadhead return trips into profit.
          </p>

          <div className="table-container">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Backhaul ID</th>
                  <th>Origin / Terminating City</th>
                  <th>Return Hub Destination</th>
                  <th>Cargo Manifest</th>
                  <th>Est. Revenue</th>
                  <th>Empty Miles Saved</th>
                  <th>Match Confidence</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {backhauls.map((b) => (
                  <tr key={b.id}>
                    <td className="text-mono" style={{ fontWeight: 700, color: 'var(--color-copper)' }}>{b.id}</td>
                    <td><strong style={{ color: 'var(--color-text-primary)' }}>{b.origin}</strong></td>
                    <td><strong style={{ color: 'var(--color-text-primary)' }}>{b.dest}</strong></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{b.freight}</td>
                    <td className="text-mono" style={{ color: 'var(--color-success)', fontWeight: 700 }}>+${b.revenue.toLocaleString()} USD</td>
                    <td className="text-mono" style={{ color: 'var(--color-copper)' }}>{b.emptyMilesSaved} mi</td>
                    <td>
                      <span className="badge badge-success">{b.matchPct}% MATCH</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.78rem', minHeight: 30 }}
                        onClick={() => {
                          if (showToast) showToast('Backhaul Assigned', `Matched load ${b.id} to return trip. Saved ${b.emptyMilesSaved} empty miles!`, 'success');
                        }}
                      >
                        Book Load
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: DEPOT YARD MANAGEMENT (FEATURE 20) */}
      {activeTab === 'YARD' && (
        <div className="enterprise-card">
          <div className="card-title">
            <span>DEPOT YARD MANAGEMENT & DOCK STAGING (FEATURE 20)</span>
            <span className="badge badge-info">CHICAGO CENTRAL DEPOT</span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 18 }}>
            Real-time tracking of assets, reefer shore power plugs, and trailers positioned inside terminal yards.
          </p>

          <div className="grid-2">
            {yardBays.map((bay, idx) => (
              <div key={idx} style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 16 }}>
                <div className="flex-between" style={{ marginBottom: 8 }}>
                  <strong style={{ color: 'var(--color-copper)', fontSize: '0.92rem' }}>{bay.bay}</strong>
                  <span className="badge badge-info">{bay.status}</span>
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--color-text-primary)', marginBottom: 4 }}>
                  Occupying Unit: <strong>{bay.asset}</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                  Dock Infrastructure: {bay.type}
                </div>
                {bay.temp !== 'N/A' && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-info)' }}>
                    Reefer Shore Power Temp: <strong>{bay.temp}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: GEOFENCE POLYGON ENGINE (FEATURE 13) */}
      {activeTab === 'GEOFENCE' && (
        <div className="enterprise-card">
          <div className="flex-between" style={{ marginBottom: 18 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>
              <span>DYNAMIC GEOFENCE & SPATIAL RAY-CASTING ENGINE (FEATURE 13)</span>
              <span className="badge badge-success">POSTGIS VECTOR ACTIVE</span>
            </div>
            <button className="btn btn-primary" onClick={() => setShowGeofenceModal(true)}>
              <Icon name="plus" size={14} color="#FFF" />
              <span>Define New Geofence</span>
            </button>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 18 }}>
            Real-time geospatial ray-casting evaluation running over streaming GPS telemetry in Flink/Spring Boot. Automatically triggers dispatch alerts on perimeter ENTRY, EXIT, or excessive DWELL time.
          </p>

          <div className="table-container">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Zone Name</th>
                  <th>Rule Type</th>
                  <th>Dwell Limit</th>
                  <th>Fleet Inside</th>
                  <th>Alerts Today</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {geofences.map((gf) => (
                  <tr key={gf.id}>
                    <td>
                      <strong style={{ color: 'var(--color-text-primary)', display: 'block' }}>{gf.name}</strong>
                      <span className="text-mono" style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>ID: {gf.id}</span>
                    </td>
                    <td><span className="badge badge-info">{gf.type}</span></td>
                    <td className="text-mono" style={{ color: 'var(--color-warning)' }}>{gf.dwellLimitMins} mins</td>
                    <td><strong style={{ color: gf.currentVehicles > 0 ? 'var(--color-copper)' : 'var(--color-text-muted)' }}>{gf.currentVehicles} Vehicles</strong></td>
                    <td>
                      {gf.alertsToday > 0 ? (
                        <span className="badge badge-danger">{gf.alertsToday} EXCEEDED</span>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>0 Violations</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${gf.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                        {gf.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Freight Order Modal */}
      {showOrderModal && (
        <div className="modal-backdrop" onClick={() => setShowOrderModal(false)}>
          <div className="enterprise-card" style={{ width: 540, backgroundColor: '#1D2329', border: '1px solid var(--color-border)', padding: 26 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Create New Dispatch Order</h3>
              <button 
                type="button" 
                onClick={() => setShowOrderModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>LOAD DESCRIPTION</label>
                <input
                  type="text"
                  required
                  className="enterprise-input"
                  style={{ width: '100%' }}
                  value={newOrder.load}
                  onChange={(e) => setNewOrder({ ...newOrder, load: e.target.value })}
                />
              </div>

              <div className="grid-2" style={{ gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>ASSIGNED VEHICLE</label>
                  <select
                    className="enterprise-select"
                    style={{ width: '100%' }}
                    value={newOrder.vehicle}
                    onChange={(e) => setNewOrder({ ...newOrder, vehicle: e.target.value })}
                  >
                    {assets.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>ASSIGNED DRIVER</label>
                  <input
                    type="text"
                    required
                    className="enterprise-input"
                    style={{ width: '100%' }}
                    value={newOrder.driver}
                    onChange={(e) => setNewOrder({ ...newOrder, driver: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>START LOCATION</label>
                  <input
                    type="text"
                    required
                    className="enterprise-input"
                    style={{ width: '100%' }}
                    value={newOrder.startLocation}
                    onChange={(e) => setNewOrder({ ...newOrder, startLocation: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>DESTINATION</label>
                  <input
                    type="text"
                    required
                    className="enterprise-input"
                    style={{ width: '100%' }}
                    value={newOrder.endLocation}
                    onChange={(e) => setNewOrder({ ...newOrder, endLocation: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: 12, marginBottom: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>START HOUR (UTC)</label>
                  <input
                    type="number"
                    min="4"
                    max="18"
                    className="enterprise-input"
                    style={{ width: '100%' }}
                    value={newOrder.startHour}
                    onChange={(e) => setNewOrder({ ...newOrder, startHour: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>DURATION (HOURS)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    className="enterprise-input"
                    style={{ width: '100%' }}
                    value={newOrder.duration}
                    onChange={(e) => setNewOrder({ ...newOrder, duration: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowOrderModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Dispatch Load</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill of Lading (BOL) Shipment Details Modal */}
      {selectedShipment && (
        <div className="modal-backdrop" onClick={() => setSelectedShipment(null)}>
          <div className="enterprise-card" style={{ width: 560, backgroundColor: '#1D2329', border: '1px solid var(--color-border)', padding: 26 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: 4 }}>BILL OF LADING (BOL)</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{selectedShipment.bolNumber}</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedShipment(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <div style={{ background: 'var(--color-bg-surface)', padding: 14, borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', marginBottom: 16, fontSize: '0.84rem' }}>
              <div style={{ marginBottom: 8 }}>Load: <strong>{selectedShipment.load}</strong></div>
              <div style={{ marginBottom: 8 }}>Carrier Vehicle: <strong>{selectedShipment.vehicle}</strong></div>
              <div style={{ marginBottom: 8 }}>Assigned Driver: <strong>{selectedShipment.driver}</strong></div>
              <div style={{ marginBottom: 8 }}>Origin: <strong>{selectedShipment.startLocation}</strong> &rarr; Destination: <strong>{selectedShipment.endLocation}</strong></div>
              <div>Status: <span className="badge badge-success">{selectedShipment.status}</span></div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => window.print()}>Print BOL</button>
              <button className="btn btn-primary" onClick={() => setSelectedShipment(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Define Geofence Modal */}
      {showGeofenceModal && (
        <div className="modal-backdrop" onClick={() => setShowGeofenceModal(false)}>
          <div className="enterprise-card" style={{ width: 480, backgroundColor: '#1D2329', border: '1px solid var(--color-border)', padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 14 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Define New Geofence Zone</h3>
              <button 
                type="button" 
                onClick={() => setShowGeofenceModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGeofence}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>ZONE NAME</label>
                <input
                  type="text"
                  required
                  className="enterprise-input"
                  style={{ width: '100%' }}
                  value={newGf.name}
                  onChange={(e) => setNewGf({ ...newGf, name: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>RULE TYPE</label>
                <select
                  className="enterprise-select"
                  style={{ width: '100%' }}
                  value={newGf.type}
                  onChange={(e) => setNewGf({ ...newGf, type: e.target.value })}
                >
                  <option value="CUSTOM_ZONE">Custom Logistics Corridor</option>
                  <option value="GATED_YARD">Gated Warehouse Yard</option>
                  <option value="EXCLUSION_ENTRY">No-Entry Exclusion Zone</option>
                  <option value="CURFEW_ZONE">Curfew / Night Silence Zone</option>
                </select>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>DWELL LIMIT (MINUTES)</label>
                <input
                  type="number"
                  className="enterprise-input"
                  style={{ width: '100%' }}
                  value={newGf.dwellLimitMins}
                  onChange={(e) => setNewGf({ ...newGf, dwellLimitMins: Number(e.target.value) })}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowGeofenceModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Geofence</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

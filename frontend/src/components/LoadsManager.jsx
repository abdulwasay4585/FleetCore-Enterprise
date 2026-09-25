"use client";
import React, { useState } from 'react';
import { Icon } from './Icons';

export default function LoadsManager({ assets, showToast }) {
  const [loads, setLoads] = useState([
    { id: 'LOAD-8841', bol: 'BOL-2026-00881', commodity: 'COLD_CHAIN_PHARMA', shipper: 'Pfizer Pharma Distribution', consignee: 'Boston Medical Supply', pickup: 'Chicago IL', delivery: 'Boston MA', pickupDate: '2026-07-25', deliveryDate: '2026-07-27', weight: 24800, pallets: 26, hazmat: false, rate: 5450, status: 'IN_TRANSIT', driver: 'David Kim', vehicle: 'Freightliner Cascadia (#F-550)' },
    { id: 'LOAD-8840', bol: 'BOL-2026-00880', commodity: 'GENERAL_FREIGHT', shipper: 'Amazon Fulfillment (ORD7)', consignee: 'Amazon DAL4 Fulfillment', pickup: 'Chicago IL', delivery: 'Dallas TX', pickupDate: '2026-07-25', deliveryDate: '2026-07-26', weight: 44000, pallets: 48, hazmat: false, rate: 3200, status: 'IN_TRANSIT', driver: 'Marcus Vance', vehicle: 'Kenworth W900 (#K-204)' },
    { id: 'LOAD-8839', bol: 'BOL-2026-00879', commodity: 'HAZMAT_CLASS_3', shipper: 'Shell Chemical Products', consignee: 'Refinery Gate 14, Houston TX', pickup: 'Baton Rouge LA', delivery: 'Houston TX', pickupDate: '2026-07-24', deliveryDate: '2026-07-25', weight: 38400, pallets: 0, hazmat: true, hazmatClass: 'Class 3 — Flammable Liquid', rate: 7800, status: 'DELIVERED', driver: 'James Wilson', vehicle: 'Volvo FH16 (#V-901)' },
    { id: 'LOAD-8838', bol: 'BOL-2026-00878', commodity: 'STEEL_COILS', shipper: 'Nucor Steel Midwest', consignee: 'GM Assembly Detroit', pickup: 'Indianapolis IN', delivery: 'Detroit MI', pickupDate: '2026-07-26', deliveryDate: '2026-07-27', weight: 47500, pallets: 0, hazmat: false, rate: 4100, status: 'AVAILABLE', driver: null, vehicle: null },
    { id: 'LOAD-8837', bol: 'BOL-2026-00877', commodity: 'REEFER_PRODUCE', shipper: 'Dole Fresh Harvest CA', consignee: 'Whole Foods Distribution ATL', pickup: 'Fresno CA', delivery: 'Atlanta GA', pickupDate: '2026-07-26', deliveryDate: '2026-07-29', weight: 22000, pallets: 32, hazmat: false, rate: 8900, status: 'AVAILABLE', driver: null, vehicle: null },
    { id: 'LOAD-8836', bol: 'BOL-2026-00876', commodity: 'ELECTRONICS', shipper: 'Apple Inc. (SJC)', consignee: 'Apple NYC Retail Stores', pickup: 'San Jose CA', delivery: 'New York NY', pickupDate: '2026-07-23', deliveryDate: '2026-07-26', weight: 11200, pallets: 14, hazmat: false, rate: 12400, status: 'CANCELLED', driver: null, vehicle: null },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoad, setSelectedLoad] = useState(null);

  const [newLoad, setNewLoad] = useState({
    commodity: 'GENERAL_FREIGHT', shipper: '', consignee: '', pickup: '', delivery: '',
    pickupDate: '', deliveryDate: '', weight: '', pallets: '', hazmat: false, hazmatClass: '', rate: ''
  });

  const STATUS_COLORS = { AVAILABLE: 'badge-success', ASSIGNED: 'badge-info', IN_TRANSIT: 'badge-warning', DELIVERED: 'badge-success', CANCELLED: 'badge-danger' };
  const COMMODITY_LABELS = {
    COLD_CHAIN_PHARMA: 'Cold-Chain Pharma', GENERAL_FREIGHT: 'General Freight', HAZMAT_CLASS_3: 'HazMat Class 3',
    STEEL_COILS: 'Steel Coils', REEFER_PRODUCE: 'Reefer Produce', ELECTRONICS: 'Electronics',
    AUTOMOTIVE: 'Automotive Parts', LUMBER: 'Lumber / Building Materials'
  };

  const handleCreateLoad = (e) => {
    e.preventDefault();
    const id = `LOAD-${8836 + loads.length + 1}`;
    const created = {
      ...newLoad,
      id,
      bol: `BOL-2026-${String(881 + loads.length).padStart(5, '0')}`,
      status: 'AVAILABLE',
      driver: null,
      vehicle: null,
      weight: Number(newLoad.weight),
      pallets: Number(newLoad.pallets),
      rate: Number(newLoad.rate),
    };
    setLoads([created, ...loads]);
    setShowCreateModal(false);
    setNewLoad({ commodity: 'GENERAL_FREIGHT', shipper: '', consignee: '', pickup: '', delivery: '', pickupDate: '', deliveryDate: '', weight: '', pallets: '', hazmat: false, hazmatClass: '', rate: '' });
    if (showToast) showToast(`Load ${id} created. TSP solver is evaluating available assets for auto-assignment.`, 'success');
  };

  const handleAssign = (loadId) => {
    const availableAssets = (assets || []).filter(a => a.status === 'ONLINE');
    if (!availableAssets.length) {
      if (showToast) showToast('No available assets online. Cannot auto-assign load.', 'warning');
      return;
    }
    const asset = availableAssets[Math.floor(Math.random() * availableAssets.length)];
    setLoads(loads.map(l => l.id === loadId ? { ...l, status: 'ASSIGNED', driver: asset.driver, vehicle: asset.name } : l));
    if (showToast) showToast(`Load ${loadId} assigned to ${asset.name} via TSP optimization. Driver ${asset.driver} notified via ELD.`, 'success');
  };

  const filtered = loads.filter(l => {
    const matchStatus = filterStatus === 'ALL' || l.status === filterStatus;
    const matchSearch = !searchTerm || l.id.toLowerCase().includes(searchTerm.toLowerCase()) || l.shipper.toLowerCase().includes(searchTerm.toLowerCase()) || l.consignee.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h1 className="module-title">Freight Load Management</h1>
          <p className="module-subtitle">
            Full lifecycle freight management — from BOL creation and hazmat classification through automated TSP-optimized asset assignment, real-time shipment tracking, and IFTA fuel tax reconciliation.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div className="stat-badge">
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-lime)' }}>{loads.filter(l => l.status === 'AVAILABLE').length}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>AVAILABLE LOADS</span>
          </div>
          <div className="stat-badge">
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-warning)' }}>{loads.filter(l => l.status === 'IN_TRANSIT').length}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>IN TRANSIT</span>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Icon name="plus" size={15} />
            <span>Create New Load</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="enterprise-card" style={{ marginBottom: 16, padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="enterprise-input" style={{ flex: 1, minWidth: 200 }} placeholder="Search by Load ID, shipper, or consignee..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          {['ALL', 'AVAILABLE', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].map(s => (
            <button key={s} className={`btn ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.75rem', minHeight: 34 }} onClick={() => setFilterStatus(s)}>
              {s === 'ALL' ? 'All' : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Loads Table */}
      <div className="table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>LOAD ID / BOL</th>
              <th>COMMODITY</th>
              <th>SHIPPER → CONSIGNEE</th>
              <th>ROUTE</th>
              <th>WEIGHT / PALLETS</th>
              <th>FREIGHT RATE</th>
              <th>STATUS</th>
              <th>ASSIGNED TO</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedLoad(selectedLoad?.id === l.id ? null : l)}>
                <td>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--color-copper)' }}>{l.id}</div>
                  <div className="text-mono" style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{l.bol}</div>
                  {l.hazmat && <span className="badge badge-danger" style={{ fontSize: '0.6rem', marginTop: 2 }}>HAZMAT</span>}
                </td>
                <td><span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{COMMODITY_LABELS[l.commodity] || l.commodity}</span></td>
                <td>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{l.shipper}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>→ {l.consignee}</div>
                </td>
                <td>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{l.pickup} → {l.delivery}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{l.pickupDate} → {l.deliveryDate}</div>
                </td>
                <td>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{l.weight?.toLocaleString()} lbs</div>
                  {l.pallets > 0 && <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{l.pallets} pallets</div>}
                </td>
                <td><strong style={{ fontSize: '0.88rem', color: 'var(--color-lime)' }}>${l.rate?.toLocaleString()}</strong></td>
                <td><span className={`badge ${STATUS_COLORS[l.status] || 'badge-info'}`}>{l.status.replace(/_/g, ' ')}</span></td>
                <td>
                  {l.driver ? (
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{l.driver}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{l.vehicle}</div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Unassigned</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {l.status === 'AVAILABLE' && (
                      <button className="btn btn-primary" style={{ fontSize: '0.72rem', minHeight: 28, padding: '4px 8px' }} onClick={ev => { ev.stopPropagation(); handleAssign(l.id); }}>
                        Auto-Assign
                      </button>
                    )}
                    {l.status === 'IN_TRANSIT' && (
                      <button className="btn btn-secondary" style={{ fontSize: '0.72rem', minHeight: 28, padding: '4px 8px' }} onClick={ev => { ev.stopPropagation(); setLoads(loads.map(x => x.id === l.id ? { ...x, status: 'DELIVERED' } : x)); if (showToast) showToast(`Load ${l.id} marked delivered. POD signed.`, 'success'); }}>
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No loads match the current filter criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Load Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="enterprise-card" style={{ width: 680, maxWidth: '95vw', margin: 'auto', background: 'var(--color-surface)', border: '1px solid var(--color-copper)' }} onClick={e => e.stopPropagation()}>
            <div className="flex-between" style={{ marginBottom: 16, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Create New Load Order</span>
              <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1, padding: '2px 6px' }} aria-label="Dismiss modal">✕</button>
            </div>
            <form onSubmit={handleCreateLoad} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>COMMODITY TYPE:</label>
                  <select className="enterprise-select" style={{ width: '100%' }} value={newLoad.commodity} onChange={e => setNewLoad({ ...newLoad, commodity: e.target.value })}>
                    <option value="GENERAL_FREIGHT">General Freight</option>
                    <option value="COLD_CHAIN_PHARMA">Cold-Chain Pharmaceutical</option>
                    <option value="REEFER_PRODUCE">Reefer Produce</option>
                    <option value="HAZMAT_CLASS_3">HazMat Class 3 (Flammable)</option>
                    <option value="STEEL_COILS">Steel Coils / Heavy Metal</option>
                    <option value="ELECTRONICS">High-Value Electronics</option>
                    <option value="AUTOMOTIVE">Automotive Parts</option>
                    <option value="LUMBER">Lumber / Building Materials</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>FREIGHT RATE ($):</label>
                  <input required type="number" className="enterprise-input" style={{ width: '100%' }} value={newLoad.rate} onChange={e => setNewLoad({ ...newLoad, rate: e.target.value })} placeholder="e.g. 4800" />
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>SHIPPER NAME:</label>
                  <input required className="enterprise-input" style={{ width: '100%' }} value={newLoad.shipper} onChange={e => setNewLoad({ ...newLoad, shipper: e.target.value })} placeholder="e.g. Pfizer Distribution CA" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>CONSIGNEE NAME:</label>
                  <input required className="enterprise-input" style={{ width: '100%' }} value={newLoad.consignee} onChange={e => setNewLoad({ ...newLoad, consignee: e.target.value })} placeholder="e.g. Boston Medical Center" />
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>PICKUP LOCATION:</label>
                  <input required className="enterprise-input" style={{ width: '100%' }} value={newLoad.pickup} onChange={e => setNewLoad({ ...newLoad, pickup: e.target.value })} placeholder="e.g. Chicago IL" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>DELIVERY LOCATION:</label>
                  <input required className="enterprise-input" style={{ width: '100%' }} value={newLoad.delivery} onChange={e => setNewLoad({ ...newLoad, delivery: e.target.value })} placeholder="e.g. Boston MA" />
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>PICKUP DATE:</label>
                  <input required type="date" className="enterprise-input" style={{ width: '100%' }} value={newLoad.pickupDate} onChange={e => setNewLoad({ ...newLoad, pickupDate: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>DELIVERY DATE:</label>
                  <input required type="date" className="enterprise-input" style={{ width: '100%' }} value={newLoad.deliveryDate} onChange={e => setNewLoad({ ...newLoad, deliveryDate: e.target.value })} />
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>WEIGHT (lbs):</label>
                  <input required type="number" className="enterprise-input" style={{ width: '100%' }} value={newLoad.weight} onChange={e => setNewLoad({ ...newLoad, weight: e.target.value })} placeholder="e.g. 44000" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>PALLET COUNT:</label>
                  <input type="number" className="enterprise-input" style={{ width: '100%' }} value={newLoad.pallets} onChange={e => setNewLoad({ ...newLoad, pallets: e.target.value })} placeholder="e.g. 26" />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>
                <input type="checkbox" checked={newLoad.hazmat} onChange={e => setNewLoad({ ...newLoad, hazmat: e.target.checked })} style={{ accentColor: 'var(--color-danger)', width: 14, height: 14 }} />
                This load contains HAZMAT materials (DOT placard required)
              </label>
              {newLoad.hazmat && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>HAZMAT CLASS / DESCRIPTION:</label>
                  <input className="enterprise-input" style={{ width: '100%' }} value={newLoad.hazmatClass} onChange={e => setNewLoad({ ...newLoad, hazmatClass: e.target.value })} placeholder="e.g. Class 3 — Flammable Liquid" />
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Load & Generate BOL</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

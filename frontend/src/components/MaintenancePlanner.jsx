"use client";
import React, { useState } from 'react';
import { Icon } from './Icons';

export default function MaintenancePlanner({ onNavigateToModule, showToast }) {
  const [activeTab, setActiveTab] = useState('KANBAN');
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [showDvirModal, setShowDvirModal] = useState(false);
  const [showMechanicKpiModal, setShowMechanicKpiModal] = useState(false);

  // Kanban Work Orders state (Feature 22 & 24)
  const [workOrders, setWorkOrders] = useState([
    { id: 'WO-901', asset: 'Volvo FH16 (#V-901)', vin: '19X9192', desc: 'Pre-emptive Turbocharger Bearing Replacement (ML Trigger)', priority: 'CRITICAL', status: 'OPEN', mechanic: 'Unassigned', estHours: 4.5, created: '2026-07-25' },
    { id: 'WO-902', asset: 'Kenworth W900 (#K-204)', vin: '88Y4149', desc: 'DTC P0087: Secondary Fuel Filter & Lift Pump Inspection', priority: 'HIGH', status: 'IN_PROGRESS', mechanic: 'Ray M. (Tech #4)', estHours: 2.0, created: '2026-07-25' },
    { id: 'WO-903', asset: 'BrightDrop Zevo (#EV-402)', vin: 'EV90214', desc: 'EV Stator Coolant Flush & Battery Thermal Manifold Check', priority: 'MEDIUM', status: 'WAITING_PARTS', mechanic: 'Sam K. (EV Specialist)', estHours: 3.5, created: '2026-07-24' },
    { id: 'WO-904', asset: 'Caterpillar 336 (#C-812)', vin: 'CAT1029', desc: 'Hydraulic Hoses Periodic Preventative Maintenance & Oil Sample', priority: 'LOW', status: 'COMPLETED', mechanic: 'Ray M. (Tech #4)', estHours: 1.5, created: '2026-07-23' },
  ]);

  // Spare Parts Inventory (Feature 23)
  const [inventory, setInventory] = useState([
    { sku: 'SKU-FLT-440', name: 'Fleet OE Diesel Engine Oil Filter Element (12 pk)', stock: 24, minThreshold: 10, unitPrice: 42.50, supplier: 'NAPA Commercial Depot', status: 'OPTIMAL' },
    { sku: 'SKU-BRK-092', name: 'Heavy Duty Air Brake Disc Pads (Axle Set)', stock: 4, minThreshold: 8, unitPrice: 185.00, supplier: 'Bendix Commercial Hub', status: 'REORDER_REQUIRED' },
    { sku: 'SKU-DEF-100', name: 'Diesel Exhaust Fluid (DEF) 55-Gallon Drum', stock: 6, minThreshold: 5, unitPrice: 120.00, supplier: 'Pilot Flying J Fleet Services', status: 'OPTIMAL' },
    { sku: 'SKU-EVB-300', name: 'High-Voltage Relay & Thermal Coolant Kit (EV)', stock: 1, minThreshold: 2, unitPrice: 640.00, supplier: 'GM Enclave Logistics', status: 'REORDER_REQUIRED' },
    { sku: 'SKU-WHL-180', name: 'Michelin X-Line Energy Z Steer Tires (295/75R22.5)', stock: 12, minThreshold: 10, unitPrice: 480.00, supplier: 'Michelin North America Depot', status: 'OPTIMAL' }
  ]);

  // DVIR Reports (Feature 22)
  const [dvirList, setDvirList] = useState([
    { id: 'DVIR-801', vehicle: 'Volvo FH16 (#V-901)', driver: 'James Wilson', type: 'PRE_TRIP', status: 'PASSED', defects: 'None (Satisfactory Condition)', signedBy: 'James Wilson', time: 'Today 06:15 UTC' },
    { id: 'DVIR-802', vehicle: 'Kenworth W900 (#K-204)', driver: 'Marcus Vance', type: 'POST_TRIP', status: 'DEFECT_FOUND', defects: 'Air Brake Hose Chafing & Left Tail Lamp Out', signedBy: 'Ray M. (Mechanic Sign-Off Pending)', time: 'Today 04:30 UTC' },
    { id: 'DVIR-803', vehicle: 'BrightDrop Zevo (#EV-402)', driver: 'Elena Rostova', type: 'PRE_TRIP', status: 'PASSED', defects: 'None (EV Stator & Battery Safe)', signedBy: 'Elena Rostova', time: 'Today 07:45 UTC' }
  ]);

  // Forms State
  const [newWo, setNewWo] = useState({
    asset: 'Volvo FH16 (#V-901)',
    vin: '19X91929410912',
    desc: 'Brake pad wear replacement',
    priority: 'HIGH',
    mechanic: 'Ray M. (Tech #4)',
    estHours: 2.5
  });

  const [newDvir, setNewDvir] = useState({
    vehicle: 'Volvo FH16 (#V-901)',
    driver: 'James Wilson',
    type: 'PRE_TRIP',
    brakesOk: true,
    steeringOk: true,
    tiresOk: true,
    lightsOk: true,
    couplingOk: true,
    emergencyOk: true,
    comments: 'All inspection points satisfactory.'
  });

  const handleMoveStatus = (id, newStatus) => {
    setWorkOrders(workOrders.map(wo => wo.id === id ? { ...wo, status: newStatus } : wo));
    if (showToast) {
      showToast('Work Order Updated', `Ticket ${id} status updated to ${newStatus}.`, 'info');
    }
  };

  const handleReorderPart = (sku) => {
    setInventory(inventory.map(item => item.sku === sku ? { ...item, stock: item.stock + 10, status: 'OPTIMAL' } : item));
    if (showToast) {
      showToast('Procurement Dispatched', `Issued EDI 850 purchase order for SKU ${sku} (+10 units).`, 'success');
    }
  };

  const handleCreateWorkOrderSubmit = (e) => {
    e.preventDefault();
    const created = {
      ...newWo,
      id: `WO-90${workOrders.length + 1}`,
      status: 'OPEN',
      created: new Date().toISOString().split('T')[0]
    };
    setWorkOrders([...workOrders, created]);
    setShowWorkOrderModal(false);
    if (showToast) {
      showToast('Work Order Created', `Ticket ${created.id} queued for ${created.asset}.`, 'success');
    }
  };

  const handleCreateDvirSubmit = (e) => {
    e.preventDefault();
    const hasDefect = !newDvir.brakesOk || !newDvir.steeringOk || !newDvir.tiresOk || !newDvir.lightsOk || !newDvir.couplingOk || !newDvir.emergencyOk;
    const report = {
      id: `DVIR-80${dvirList.length + 1}`,
      vehicle: newDvir.vehicle,
      driver: newDvir.driver,
      type: newDvir.type,
      status: hasDefect ? 'DEFECT_FOUND' : 'PASSED',
      defects: hasDefect ? `Defects identified: ${!newDvir.brakesOk ? 'Brakes ' : ''}${!newDvir.steeringOk ? 'Steering ' : ''}${!newDvir.tiresOk ? 'Tires ' : ''}${!newDvir.lightsOk ? 'Lights ' : ''}` : 'None (Satisfactory Condition)',
      signedBy: newDvir.driver,
      time: 'Just now'
    };
    setDvirList([report, ...dvirList]);
    setShowDvirModal(false);
    if (showToast) {
      showToast('DVIR Submitted', `Inspection report ${report.id} recorded with status: ${report.status}.`, hasDefect ? 'danger' : 'success');
    }
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Top Page Header */}
      <div className="flex-between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
            Predictive Maintenance &amp; Shop Operations
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>
            Weibull component failure lifetime modeling, digital DVIR pre/post-trip compliance vault, automated spare parts replenishment, and shop bay work order scheduling.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className={`btn ${activeTab === 'KANBAN' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('KANBAN')}
          >
            <Icon name="tool" size={14} />
            <span>Repair Kanban</span>
          </button>
          <button
            className={`btn ${activeTab === 'DVIR' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('DVIR')}
          >
            <Icon name="check" size={14} />
            <span>Digital DVIR Vault</span>
          </button>
          <button
            className={`btn ${activeTab === 'PARTS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('PARTS')}
          >
            <Icon name="activity" size={14} />
            <span>Parts Inventory</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowMechanicKpiModal(true)}
          >
            <Icon name="shield" size={14} />
            <span>Mechanic Labor KPI</span>
          </button>
        </div>
      </div>

      {/* Quick Status KPI Ribbon */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="enterprise-card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>OPEN WORK ORDERS</div>
          <div className="text-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-danger)', margin: '4px 0' }}>
            {workOrders.filter(w => w.status === 'OPEN').length} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Tickets</span>
          </div>
        </div>
        <div className="enterprise-card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>ACTIVE SHOP BAYS</div>
          <div className="text-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-copper)', margin: '4px 0' }}>
            {workOrders.filter(w => w.status === 'IN_PROGRESS').length} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Bays Active</span>
          </div>
        </div>
        <div className="enterprise-card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>WAITING FOR PARTS</div>
          <div className="text-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-warning)', margin: '4px 0' }}>
            {workOrders.filter(w => w.status === 'WAITING_PARTS').length} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Hold State</span>
          </div>
        </div>
        <div className="enterprise-card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>PARTS REORDER ALERTS</div>
          <div className="text-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: inventory.some(i => i.status !== 'OPTIMAL') ? 'var(--color-danger)' : 'var(--color-success)', margin: '4px 0' }}>
            {inventory.filter(i => i.status !== 'OPTIMAL').length} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Low Stock</span>
          </div>
        </div>
      </div>

      {/* TAB 1: KANBAN WORK ORDER REPAIR BOARD (FEATURE 22 & 24) */}
      {activeTab === 'KANBAN' && (
        <div>
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Shop Bay & Preventative Maintenance Kanban</h3>
            <button className="btn btn-primary" onClick={() => setShowWorkOrderModal(true)}>
              <Icon name="plus" size={14} color="#FFF" />
              <span>Create Work Order</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {/* COLUMN 1: OPEN */}
            <div style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 14, minHeight: 440 }}>
              <div className="flex-between" style={{ borderBottom: '2px solid var(--color-danger)', paddingBottom: 8, marginBottom: 12 }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>QUEUED / OPEN</span>
                <span className="badge badge-danger">{workOrders.filter(w => w.status === 'OPEN').length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {workOrders.filter(w => w.status === 'OPEN').map(wo => (
                  <div key={wo.id} style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 12 }}>
                    <div className="flex-between" style={{ marginBottom: 4 }}>
                      <strong className="text-mono" style={{ color: 'var(--color-copper)', fontSize: '0.78rem' }}>{wo.id}</strong>
                      <span className={`badge ${wo.priority === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>{wo.priority}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--color-text-primary)', marginBottom: 4 }}>{wo.asset}</div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, marginBottom: 10 }}>{wo.desc}</p>
                    <div className="flex-between" style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: 6 }}>
                      <span>Est: {wo.estHours}h</span>
                      <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.72rem', minHeight: 26 }} onClick={() => handleMoveStatus(wo.id, 'IN_PROGRESS')}>
                        Move → Bay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 2: IN PROGRESS */}
            <div style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 14, minHeight: 440 }}>
              <div className="flex-between" style={{ borderBottom: '2px solid var(--color-copper)', paddingBottom: 8, marginBottom: 12 }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>IN PROGRESS (BAY)</span>
                <span className="badge badge-info">{workOrders.filter(w => w.status === 'IN_PROGRESS').length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {workOrders.filter(w => w.status === 'IN_PROGRESS').map(wo => (
                  <div key={wo.id} style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-copper)', borderRadius: 'var(--radius-card)', padding: 12 }}>
                    <div className="flex-between" style={{ marginBottom: 4 }}>
                      <strong className="text-mono" style={{ color: 'var(--color-copper)', fontSize: '0.78rem' }}>{wo.id}</strong>
                      <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{wo.priority}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--color-text-primary)', marginBottom: 4 }}>{wo.asset}</div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, marginBottom: 6 }}>{wo.desc}</p>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-copper)', marginBottom: 10 }}>{wo.mechanic}</div>
                    <div className="flex-between" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 6 }}>
                      <button className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '0.72rem', minHeight: 26 }} onClick={() => handleMoveStatus(wo.id, 'WAITING_PARTS')}>
                        Need Parts
                      </button>
                      <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.72rem', minHeight: 26, background: 'var(--color-success)' }} onClick={() => handleMoveStatus(wo.id, 'COMPLETED')}>
                        Done
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 3: WAITING PARTS */}
            <div style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 14, minHeight: 440 }}>
              <div className="flex-between" style={{ borderBottom: '2px solid var(--color-warning)', paddingBottom: 8, marginBottom: 12 }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>WAITING FOR PARTS</span>
                <span className="badge badge-warning">{workOrders.filter(w => w.status === 'WAITING_PARTS').length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {workOrders.filter(w => w.status === 'WAITING_PARTS').map(wo => (
                  <div key={wo.id} style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-card)', padding: 12 }}>
                    <div className="flex-between" style={{ marginBottom: 4 }}>
                      <strong className="text-mono" style={{ color: 'var(--color-warning)', fontSize: '0.78rem' }}>{wo.id}</strong>
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>HOLD</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--color-text-primary)', marginBottom: 4 }}>{wo.asset}</div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, marginBottom: 10 }}>{wo.desc}</p>
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 6 }}>
                      <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.72rem', width: '100%', minHeight: 26 }} onClick={() => handleMoveStatus(wo.id, 'IN_PROGRESS')}>
                        Parts Arrived → Resume
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 4: COMPLETED */}
            <div style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 14, minHeight: 440 }}>
              <div className="flex-between" style={{ borderBottom: '2px solid var(--color-success)', paddingBottom: 8, marginBottom: 12 }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>ROAD READY</span>
                <span className="badge badge-success">{workOrders.filter(w => w.status === 'COMPLETED').length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {workOrders.filter(w => w.status === 'COMPLETED').map(wo => (
                  <div key={wo.id} style={{ background: 'var(--color-bg-surface)', border: '1px solid rgba(50, 201, 113, 0.3)', borderRadius: 'var(--radius-card)', padding: 12 }}>
                    <div className="flex-between" style={{ marginBottom: 4 }}>
                      <strong className="text-mono" style={{ color: 'var(--color-success)', fontSize: '0.78rem' }}>{wo.id}</strong>
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>RESOLVED</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--color-text-primary)', marginBottom: 4 }}>{wo.asset}</div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, marginBottom: 8 }}>{wo.desc}</p>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: 6 }}>
                      Signed off by <strong>{wo.mechanic}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIGITAL DVIR INSPECTION VAULT (FEATURE 22) */}
      {activeTab === 'DVIR' && (
        <div className="enterprise-card">
          <div className="flex-between" style={{ marginBottom: 18 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>
              <span>DIGITAL DRIVER VEHICLE INSPECTION REPORTS (DVIR)</span>
              <span className="badge badge-success">49 CFR § 396.11 COMPLIANT</span>
            </div>
            <button className="btn btn-primary" onClick={() => setShowDvirModal(true)}>
              <Icon name="plus" size={14} color="#FFF" />
              <span>Submit DVIR Report</span>
            </button>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 18 }}>
            Electronic daily pre-trip and post-trip inspection documentation. Defect entries automatically lock the vehicle from automated dispatch until cleared by certified shop mechanic sign-off.
          </p>

          <div className="table-container">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>DVIR ID</th>
                  <th>Vehicle & Driver</th>
                  <th>Type</th>
                  <th>Timestamp</th>
                  <th>Inspection Status</th>
                  <th>Mechanical Defects</th>
                  <th>Sign-Off Authorization</th>
                </tr>
              </thead>
              <tbody>
                {dvirList.map((d) => (
                  <tr key={d.id} style={{ background: d.status === 'DEFECT_FOUND' ? 'rgba(229, 72, 77, 0.05)' : 'transparent' }}>
                    <td className="text-mono" style={{ fontWeight: 700, color: 'var(--color-copper)' }}>{d.id}</td>
                    <td>
                      <strong style={{ color: 'var(--color-text-primary)', display: 'block' }}>{d.vehicle}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}> {d.driver}</span>
                    </td>
                    <td><span className="badge badge-info">{d.type}</span></td>
                    <td className="text-mono" style={{ fontSize: '0.8rem' }}>{d.time}</td>
                    <td>
                      <span className={`badge ${d.status === 'PASSED' ? 'badge-success' : 'badge-danger'}`}>
                        {d.status === 'PASSED' ? 'PASSED' : 'DEFECTS FOUND'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: d.status === 'DEFECT_FOUND' ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}>
                      {d.defects}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      {d.signedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SPARE PARTS INVENTORY (FEATURE 23) */}
      {activeTab === 'PARTS' && (
        <div className="enterprise-card">
          <div className="card-title">
            <span>WAREHOUSE SPARE PARTS &amp; AUTOMATED PROCUREMENT</span>
            <span className="badge badge-info">EDI 850 INTEGRATED</span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 18 }}>
            Threshold-triggered parts procurement. When inventory drops below minimum quantity, system automatically transmits electronic purchase orders to registered supply partners.
          </p>

          <div className="table-container">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Component SKU</th>
                  <th>Part Description</th>
                  <th>Current Stock</th>
                  <th>Min Threshold</th>
                  <th>Unit Price</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Procurement</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.sku}>
                    <td className="text-mono" style={{ fontWeight: 700, color: 'var(--color-copper)' }}>{item.sku}</td>
                    <td><strong style={{ color: 'var(--color-text-primary)' }}>{item.name}</strong></td>
                    <td className="text-mono" style={{ fontSize: '1rem', fontWeight: 800, color: item.status !== 'OPTIMAL' ? 'var(--color-danger)' : 'var(--color-success)' }}>
                      {item.stock} units
                    </td>
                    <td className="text-mono" style={{ color: 'var(--color-warning)' }}>{item.minThreshold} units</td>
                    <td className="text-mono">${item.unitPrice.toFixed(2)}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{item.supplier}</td>
                    <td>
                      <span className={`badge ${item.status === 'OPTIMAL' ? 'badge-success' : 'badge-danger'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.78rem', minHeight: 30 }}
                        onClick={() => handleReorderPart(item.sku)}
                      >
                        + Reorder (+10)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Work Order Modal */}
      {showWorkOrderModal && (
        <div className="modal-backdrop" onClick={() => setShowWorkOrderModal(false)}>
          <div className="enterprise-card" style={{ width: 520, backgroundColor: '#1D2329', border: '1px solid var(--color-border)', padding: 26 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Create Maintenance Work Order</h3>
              <button 
                type="button" 
                onClick={() => setShowWorkOrderModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWorkOrderSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>TARGET VEHICLE</label>
                <input
                  type="text"
                  required
                  className="enterprise-input"
                  style={{ width: '100%' }}
                  value={newWo.asset}
                  onChange={(e) => setNewWo({ ...newWo, asset: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>SCOPE OF MECHANICAL REPAIR</label>
                <textarea
                  required
                  className="enterprise-input"
                  style={{ width: '100%', height: 75 }}
                  value={newWo.desc}
                  onChange={(e) => setNewWo({ ...newWo, desc: e.target.value })}
                />
              </div>

              <div className="grid-2" style={{ gap: 12, marginBottom: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>PRIORITY</label>
                  <select
                    className="enterprise-select"
                    style={{ width: '100%' }}
                    value={newWo.priority}
                    onChange={(e) => setNewWo({ ...newWo, priority: e.target.value })}
                  >
                    <option value="CRITICAL">Critical (Immediate Road Lock)</option>
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium / Routine</option>
                    <option value="LOW">Low / Minor Wear</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>ESTIMATED HOURS</label>
                  <input
                    type="number"
                    step="0.5"
                    className="enterprise-input"
                    style={{ width: '100%' }}
                    value={newWo.estHours}
                    onChange={(e) => setNewWo({ ...newWo, estHours: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowWorkOrderModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Queue Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit DVIR Inspection Modal */}
      {showDvirModal && (
        <div className="modal-backdrop" onClick={() => setShowDvirModal(false)}>
          <div className="enterprise-card" style={{ width: 560, backgroundColor: '#1D2329', border: '1px solid var(--color-border)', padding: 26 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Submit Electronic DVIR Inspection</h3>
              <button 
                type="button" 
                onClick={() => setShowDvirModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDvirSubmit}>
              <div className="grid-2" style={{ gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>VEHICLE</label>
                  <input
                    type="text"
                    required
                    className="enterprise-input"
                    style={{ width: '100%' }}
                    value={newDvir.vehicle}
                    onChange={(e) => setNewDvir({ ...newDvir, vehicle: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>INSPECTION PHASE</label>
                  <select
                    className="enterprise-select"
                    style={{ width: '100%' }}
                    value={newDvir.type}
                    onChange={(e) => setNewDvir({ ...newDvir, type: e.target.value })}
                  >
                    <option value="PRE_TRIP">Pre-Trip Inspection</option>
                    <option value="POST_TRIP">Post-Trip Inspection</option>
                  </select>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
                FMCSA MANDATORY SAFETY CHECKLIST:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: 'var(--color-bg-surface)', padding: 12, borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={newDvir.brakesOk} onChange={(e) => setNewDvir({ ...newDvir, brakesOk: e.target.checked })} />
                  <span>Brake System & Hoses</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={newDvir.steeringOk} onChange={(e) => setNewDvir({ ...newDvir, steeringOk: e.target.checked })} />
                  <span>Steering Mechanism</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={newDvir.tiresOk} onChange={(e) => setNewDvir({ ...newDvir, tiresOk: e.target.checked })} />
                  <span>Tires & Wheel Assemblies</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={newDvir.lightsOk} onChange={(e) => setNewDvir({ ...newDvir, lightsOk: e.target.checked })} />
                  <span>Lighting Devices & Reflectors</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={newDvir.couplingOk} onChange={(e) => setNewDvir({ ...newDvir, couplingOk: e.target.checked })} />
                  <span>Coupling & Fifth Wheel</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={newDvir.emergencyOk} onChange={(e) => setNewDvir({ ...newDvir, emergencyOk: e.target.checked })} />
                  <span>Emergency Equipment (Extinguisher)</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDvirModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Sign & Submit DVIR</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mechanic Labor KPI Modal */}
      {showMechanicKpiModal && (
        <div className="modal-backdrop" onClick={() => setShowMechanicKpiModal(false)}>
          <div className="enterprise-card" style={{ width: 500, backgroundColor: '#1D2329', border: '1px solid var(--color-border)', padding: 26 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Shop Technician Productivity Report</h3>
              <button 
                type="button" 
                onClick={() => setShowMechanicKpiModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px 8px' }}
                aria-label="Dismiss modal"
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
              <div className="metric-panel">
                <div className="metric-label">AVERAGE BILLABLE UTILIZATION</div>
                <div className="metric-value" style={{ color: 'var(--color-success)', marginTop: 4 }}>93.4%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Above industry standard of 85%</div>
              </div>
              <div className="metric-panel">
                <div className="metric-label">MEAN TIME TO REPAIR (MTTR)</div>
                <div className="metric-value" style={{ color: 'var(--color-copper)', marginTop: 4 }}>2.8 hrs</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Reduced by 34 minutes with predictive parts pre-ordering</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setShowMechanicKpiModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

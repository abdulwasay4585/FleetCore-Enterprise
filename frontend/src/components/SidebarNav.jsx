"use client";
import React from 'react';
import { Icon } from './Icons';

export default function SidebarNav({ activeModule, setActiveModule, onSelectModule, isMobileOpen = false, onCloseMobile }) {
  const handleSelect = (modId) => {
    const selector = onSelectModule || setActiveModule;
    if (selector) selector(modId);
    if (onCloseMobile) onCloseMobile(); // Auto-close drawer on mobile selection
  };

  const handleKeyDown = (e, modId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(modId);
    }
  };

  const navItems = [
    { id: 'command-center', section: 'OPERATIONS', title: 'Command Center Map', icon: 'map', badge: 'WEBGL', color: 'badge-info' },
    { id: 'asset-directory', section: 'OPERATIONS', title: 'Global Asset Directory', icon: 'box', badge: 'LIVE', color: 'badge-success' },
    { id: 'dispatch-board', section: 'OPERATIONS', title: 'Dispatch & TSP Route Board', icon: 'zap', badge: 'TSP OPT', color: 'badge-info' },
    { id: 'loads-manager', section: 'OPERATIONS', title: 'Freight Loads & BOL Manager', icon: 'package', badge: 'F13/F16', color: 'badge-warning' },
    
    { id: 'asset-detail', section: 'HEALTH & TELEMETRY', title: 'Asset 360 & Lifecycle TCO', icon: 'activity', badge: 'J1939', color: 'badge-warning' },
    { id: 'fuel-ev', section: 'HEALTH & TELEMETRY', title: 'Fuel Optimization & EV Grid', icon: 'zap', badge: 'IFTA/ESG', color: 'badge-success' },
    { id: 'maintenance-planner', section: 'HEALTH & TELEMETRY', title: 'Maintenance & Digital DVIRs', icon: 'tool', badge: 'WEIBULL', color: 'badge-info' },
    
    { id: 'driver-safety', section: 'SAFETY & COMPLIANCE', title: 'Driver Safety & Vision Coaching', icon: 'shield', badge: 'VISION', color: 'badge-danger' },
    { id: 'eld-compliance', section: 'SAFETY & COMPLIANCE', title: 'FMCSA ELD & IFTA Fuel Tax', icon: 'check', badge: 'FMCSA', color: 'badge-success' },
    
    { id: 'data-warehouse', section: 'INTELLIGENCE & ADMIN', title: 'TimescaleDB BI & Reports', icon: 'database', badge: 'POSTGIS', color: 'badge-warning' },
    { id: 'tenant-settings', section: 'INTELLIGENCE & ADMIN', title: 'Tenant Security & ERP Admin', icon: 'settings', badge: 'SAP/SSO', color: 'badge-success' },
    { id: 'stretch-suite', section: 'INTELLIGENCE & ADMIN', title: 'Frontier Stretch Suite', icon: 'cpu', badge: 'S1–S25', color: 'badge-info' },
  ];

  const sections = ['OPERATIONS', 'HEALTH & TELEMETRY', 'SAFETY & COMPLIANCE', 'INTELLIGENCE & ADMIN'];

  return (
    <aside className={`sidebar-nav ${isMobileOpen ? 'open' : ''}`} aria-label="Main navigation">
      {/* OS Home Navigation Switch */}
      <div 
        className={`nav-item ${activeModule === 'landing' ? 'active' : ''}`}
        style={{ marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', color: 'var(--color-copper)', fontWeight: 700 }}
        onClick={() => handleSelect('landing')}
        onKeyDown={(e) => handleKeyDown(e, 'landing')}
        role="button"
        tabIndex={0}
        aria-current={activeModule === 'landing' ? 'page' : undefined}
      >
        <span className="nav-item-icon">
          <Icon name="home" size={18} color="currentColor" />
        </span>
        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          OS Landing Home
        </span>
        <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>HOME</span>
      </div>

      {sections.map(section => (
        <div key={section}>
          <div className="nav-section-title">{section}</div>
          {navItems.filter(item => item.section === section).map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeModule === item.id ? 'active' : ''}`}
              onClick={() => handleSelect(item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              role="button"
              tabIndex={0}
              aria-current={activeModule === item.id ? 'page' : undefined}
            >
              <span className="nav-item-icon">
                <Icon name={item.icon} size={18} color="currentColor" />
              </span>
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.title}
              </span>
              {item.badge && (
                <span className={`badge ${item.color}`}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}

      <div style={{ marginTop: 'auto', padding: '16px 4px 4px', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ background: 'var(--color-bg-surface)', padding: '12px', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-copper)', marginBottom: 8, letterSpacing: '0.04em' }}>
            <Icon name="alert" size={14} color="var(--color-copper)" />
            <span>LIVE TELEMETRY EXCEPTION FEED</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>[01:17 UTC]</strong> Asset #V-901: Hard braking event (G-force &gt; 1.2) near I-80 W. Audio alarm triggered in cab.
          </div>
        </div>
      </div>
    </aside>
  );
}

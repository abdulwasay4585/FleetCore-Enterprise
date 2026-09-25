"use client";
import React, { useState, useEffect } from 'react';
import { Icon } from './Icons';

/**
 * FleetCore Enterprise — Global Navigation Header
 * Design System: Steel Graphite (var(--color-graphite)) background, no glassmorphism,
 * solid borders, Geist typography, industrial flat styling.
 */
export default function NavigationHeader({ currentLocale, setCurrentLocale, currentUnit, setCurrentUnit, activeTenant, setActiveTenant, onOpenCabApp, tenants, selectedTenant, onSelectTenant, onToggleUnit, onGoToLanding, onToggleMobileMenu }) {
  const [currentTime, setCurrentTime] = useState('');
  const [showCabNotice, setShowCabNotice] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const tenantValue = activeTenant || (selectedTenant ? selectedTenant.name : "");
  const handleTenantChange = (val) => {
    if (setActiveTenant) setActiveTenant(val);
    if (onSelectTenant && tenants) {
      const found = tenants.find(t => t.name === val);
      if (found) onSelectTenant(found);
    }
  };

  // Auto-dismiss cab app toast notification
  useEffect(() => {
    if (showCabNotice) {
      const t = setTimeout(() => setShowCabNotice(false), 4000);
      return () => clearTimeout(t);
    }
  }, [showCabNotice]);

  return (
    <>
      <header className="header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            className="mobile-nav-toggle" 
            onClick={onToggleMobileMenu} 
            aria-label="Toggle navigation drawer"
          >
            <Icon name="menu" size={20} />
          </button>
          
          <div className="brand-section" style={{ cursor: 'pointer' }} onClick={onGoToLanding} title="Return to FleetCore OS Home" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onGoToLanding?.(); }}>
            <div className="core-ring-logo" aria-hidden="true">
              <div className="core-center-square"></div>
              <div className="core-ring-segment segment-top"></div>
              <div className="core-ring-segment segment-right"></div>
              <div className="core-ring-segment segment-bottom"></div>
              <div className="core-ring-segment segment-left"></div>
            </div>
            <div className="brand-title">
              FLEET<span>CORE</span>
            </div>
          </div>
        </div>

        <div className="header-status-group">
          {onGoToLanding && (
            <button onClick={onGoToLanding} className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
              <Icon name="home" size={14} color="var(--color-copper)" />
              <span style={{ color: 'var(--color-copper)', fontWeight: 700 }}>OS Home</span>
            </button>
          )}

          <div className="status-pill">
            <span className="status-dot dot-lime"></span>
            <span>Ingestion: <strong style={{ color: 'var(--color-text-primary)' }}>2.4M p/s</strong></span>
          </div>

          <div className="status-pill">
            <span className="status-dot dot-success"></span>
            <span>Flink: <strong style={{ color: 'var(--color-text-primary)' }}>ONLINE</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label htmlFor="tenant-select" style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>TENANT:</label>
            <select 
              id="tenant-select"
              className="enterprise-select" 
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              value={tenantValue} 
              onChange={(e) => handleTenantChange(e.target.value)}
              aria-label="Select enterprise organization tenant"
            >
              {tenants && tenants.length > 0 ? (
                tenants.map(t => (
                  <option key={t.id} value={t.name}>{t.name} ({t.tier})</option>
                ))
              ) : (
                <>
                  <option value="Global Logistics Corp (HQ)">Global Logistics Corp (HQ)</option>
                  <option value="Americas Regional Hub (Chicago)">Americas Regional Hub (Chicago)</option>
                </>
              )}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <select
              className="enterprise-select"
              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              value={currentLocale || 'en_US'}
              onChange={(e) => setCurrentLocale && setCurrentLocale(e.target.value)}
              aria-label="Select locale"
            >
              <option value="en_US">EN (US)</option>
              <option value="es_MX">ES (MX)</option>
              <option value="fr_CA">FR (CA)</option>
              <option value="de_DE">DE (DE)</option>
            </select>

            <button
              className="btn btn-ghost"
              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              onClick={() => {
                if (onToggleUnit) onToggleUnit();
                else if (setCurrentUnit) setCurrentUnit(currentUnit === 'METRIC' ? 'IMPERIAL' : 'METRIC');
              }}
              title="Toggle Metric vs Imperial Units"
              aria-label="Toggle measurement units between Metric and Imperial"
            >
              <Icon name="globe" size={14} />
              <span>{currentUnit === 'METRIC' ? 'KM / L' : 'MI / GAL'}</span>
            </button>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            onClick={() => {
              if (onOpenCabApp) onOpenCabApp();
              else setShowCabNotice(true);
            }}
          >
            <Icon name="terminal" size={14} color="#FFF" />
            <span>Driver Cab</span>
          </button>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-secondary)', minWidth: 140, textAlign: 'right', letterSpacing: '0.02em' }}>
            {currentTime || '—'}
          </div>
        </div>
      </header>

      {/* Toast Notification — replaces the browser alert() dialog */}
      {showCabNotice && (
        <div style={{
          position: 'fixed',
          top: 68,
          right: 24,
          zIndex: 200,
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderLeft: '3px solid var(--color-copper)',
          borderRadius: 'var(--radius-card)',
          padding: '14px 20px',
          maxWidth: 380,
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          animation: 'slideInRight 0.25s ease'
        }}>
          <Icon name="terminal" size={18} color="var(--color-copper)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--color-text-primary)', marginBottom: 4 }}>Driver Cab Telematics Terminal</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Onboard telematics terminal ready. Deploy React Native app or access web view at <strong style={{ color: 'var(--color-copper)' }}>/cab</strong>
            </div>
          </div>
          <button onClick={() => setShowCabNotice(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: 2 }}>×</button>
        </div>
      )}
    </>
  );
}

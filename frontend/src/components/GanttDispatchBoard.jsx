import React, { useState } from 'react';

export default function GanttDispatchBoard() {
  const [schedules, setSchedules] = useState([
    { id: '1', asset: 'TRK-8921', driver: 'Marcus Vance', load: 'Load #9921: Chicago -> Detroit (Reefer)', startCol: 2, spanCol: 5, color: 'var(--color-copper)' },
    { id: '2', asset: 'REEFER-4412', driver: 'Elena Rostova', load: 'Load #9928: Detroit -> Toronto (Pharma)', startCol: 3, spanCol: 6, color: 'var(--color-graphite)' },
    { id: '3', asset: 'EV-VAN-902', driver: 'Chen Wei', load: 'Load #1042: Seattle Last-Mile Delivery', startCol: 1, spanCol: 4, color: '#4285F4' },
  ]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Dispatch & Commercial Routing Command</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>Interactive Gantt load scheduling board with backhaul load matching.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary">Auto-Match Backhauls</button>
          <button className="btn-primary">+ Dispatch New Freight Load</button>
        </div>
      </div>

      <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 16, overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '200px repeat(12, 1fr)', borderBottom: '1px solid var(--color-border)', fontWeight: 700, fontSize: '0.78rem', color: 'var(--color-text-secondary)', paddingBottom: 10, letterSpacing: '0.04em' }}>
          <div>ASSET / OPERATOR</div>
          <div>06:00</div><div>08:00</div><div>10:00</div><div>12:00</div>
          <div>14:00</div><div>16:00</div><div>18:00</div><div>20:00</div>
          <div>22:00</div><div>00:00</div><div>02:00</div><div>04:00</div>
        </div>

        {schedules.map((row) => (
          <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '200px repeat(12, 1fr)', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
            <div>
              <strong style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{row.asset}</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{row.driver}</div>
            </div>
            <div style={{
              gridColumnStart: row.startCol + 1,
              gridColumnEnd: `span ${row.spanCol}`,
              backgroundColor: row.color,
              color: '#FFF',
              height: 32,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              padding: '0 10px',
              fontSize: '0.78rem',
              fontWeight: 600,
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}>
              {row.load}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

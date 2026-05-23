'use client';

import React from 'react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-panel glass-card glass-glow-primary" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem', color: '#fff' }}>
          Welcome to the AgriKeep Control Center
        </h2>
        <p style={{ color: 'var(--muted-foreground)', maxWidth: '600px', marginBottom: '1.5rem' }}>
          Monitor your agricultural inventory catalog, log import receipts, dispatch operator requests, and monitor safety stock limits in real-time.
        </p>
        <div>
          <Link href="/catalog" className="glass-btn glass-btn-primary">
            Browse Material Catalog
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '0.25rem' }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel glass-card" style={{ gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            System Stock Status
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>100%</span>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Active</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
            All catalog database structures are operational.
          </p>
        </div>

        <div className="glass-panel glass-card" style={{ gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active Stock Alerts
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--warning)' }}>--</span>
            <span className="glass-badge glass-badge-warning">Check Catalog</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
            Safety stock alerts are monitored dynamically.
          </p>
        </div>
      </div>
    </div>
  );
}

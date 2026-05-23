'use client';

import React, { useMemo } from 'react';
import { useDashboardSummaryQuery } from '@/hooks/use-dashboard-queries';
import {
  formatDateTime,
  formatCurrency,
  type DashboardLowStockWarning,
  type DashboardNearExpiryAlert,
  type DashboardStockItem,
  type DashboardSummary,
} from '@/lib/utils';

const quantityFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

const formatShortDate = (value: string): string =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const formatDaysRemaining = (daysRemaining: number): string => {
  if (daysRemaining === 0) {
    return 'Expires today';
  }

  if (daysRemaining === 1) {
    return '1 day remaining';
  }

  return `${daysRemaining} days remaining`;
};

const getAlertBadgeClassName = (status: DashboardStockItem['alertStatus']): string => {
  if (status === 'out') {
    return 'glass-badge glass-badge-danger';
  }

  if (status === 'low') {
    return 'glass-badge glass-badge-warning';
  }

  return 'glass-badge glass-badge-primary';
};

const getAlertLabel = (item: DashboardStockItem): string => {
  if (item.alertStatus === 'out') {
    return 'Out of stock';
  }

  if (item.alertStatus === 'low') {
    return 'Low stock';
  }

  return 'Healthy';
};

const LoadingDashboard = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} aria-label="Loading live stock dashboard">
    <div className="glass-panel glass-card glass-glow-primary" style={{ padding: '2rem', gap: '1rem' }}>
      <div className="skeleton-pulse" style={{ width: '40%', height: '1.25rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.08)' }} />
      <div className="skeleton-pulse" style={{ width: '70%', height: '3rem', borderRadius: '20px', background: 'rgba(255,255,255,0.06)' }} />
      <div className="skeleton-pulse" style={{ width: '55%', height: '1rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.05)' }} />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
      {[0, 1, 2].map((item) => (
        <div key={item} className="glass-panel glass-card" style={{ gap: '0.85rem' }}>
          <div className="skeleton-pulse" style={{ width: '45%', height: '0.9rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.08)' }} />
          <div className="skeleton-pulse" style={{ width: '60%', height: '2.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.06)' }} />
          <div className="skeleton-pulse" style={{ width: '80%', height: '0.85rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.04)' }} />
        </div>
      ))}
    </div>

    <div className="glass-panel glass-card" style={{ gap: '1rem' }}>
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="skeleton-pulse"
          style={{ width: '100%', height: '5rem', borderRadius: '18px', background: 'rgba(255,255,255,0.04)' }}
        />
      ))}
    </div>
  </div>
);

export default function Dashboard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboardSummaryQuery();

  const summary = data?.data;
  const lowStockWarnings: DashboardLowStockWarning[] = summary?.lowStockWarnings ?? [];
  const nearExpiryAlerts: DashboardNearExpiryAlert[] = summary?.nearExpiryAlerts ?? [];
  const updatedLabel = useMemo(
    () =>
      data
        ? new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })
        : null,
    [data]
  );

  if (isLoading) {
    return <LoadingDashboard />;
  }

  if (isError || !summary) {
    return (
      <section className="glass-panel glass-card glass-glow-danger" style={{ padding: '2rem', gap: '1rem' }}>
        <span className="glass-badge glass-badge-danger">Dashboard offline</span>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Live stock view could not be loaded.</h2>
        <p style={{ color: 'var(--muted-foreground)', maxWidth: '640px' }}>
          {error?.message ?? 'Try refreshing the dashboard. The inventory records are still safe, but this view needs a fresh API response.'}
        </p>
        <div>
          <button type="button" className="glass-btn glass-btn-primary" onClick={() => void refetch()} aria-label="Retry dashboard request">
            Retry dashboard
          </button>
        </div>
      </section>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <section className="glass-panel glass-card glass-glow-primary" style={{ padding: '2rem', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxWidth: '760px' }}>
            <span className="glass-badge glass-badge-primary">Live inventory command view</span>
            <h2 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', lineHeight: 1.05, fontWeight: 800 }}>
              Stock on hand, alert pressure, and portfolio value in one surface.
            </h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.98rem' }}>
              This dashboard combines catalog stock, import pricing history, and export movement so the farm team can inspect risk and value without leaving the home screen.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', minWidth: '220px' }}>
            <button
              type="button"
              className="glass-btn"
              onClick={() => void refetch()}
              disabled={isFetching}
              aria-label="Refresh live stock dashboard"
            >
              {isFetching ? <div className="spinner" /> : null}
              <span>{isFetching ? 'Refreshing...' : 'Refresh now'}</span>
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
              {updatedLabel ? `Last synced at ${updatedLabel}` : 'Awaiting sync'}
            </span>
          </div>
        </div>
      </section>

      <section
        className="dashboard-kpi-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}
        aria-label="Dashboard key performance indicators"
      >
        <div className="glass-panel glass-card" style={{ gap: '0.65rem' }}>
          <span style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Total Materials
          </span>
          <strong style={{ fontSize: '2.6rem', lineHeight: 1, fontWeight: 800 }}>{summary.totalMaterials}</strong>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>
            Catalog items currently tracked across seeds, fertilizer, pesticides, and tools.
          </p>
        </div>

        <div className="glass-panel glass-card glass-glow-warning" style={{ gap: '0.65rem' }}>
          <span style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Active Alerts
          </span>
          <strong style={{ fontSize: '2.6rem', lineHeight: 1, fontWeight: 800, color: 'var(--warning)' }}>{summary.activeAlerts}</strong>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>
            Materials at or below safety stock, including zero-stock items that need immediate follow-up.
          </p>
        </div>

        <div className="glass-panel glass-card" style={{ gap: '0.65rem' }}>
          <span style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Total Portfolio Value
          </span>
          <strong style={{ fontSize: '2.2rem', lineHeight: 1.1, fontWeight: 800 }}>
            {formatCurrency(summary.totalPortfolioValue)}
          </strong>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>
            Calculated as current stock on hand multiplied by the weighted average import unit price per material.
          </p>
        </div>
      </section>

      <section
        className="dashboard-main-grid"
        style={{ display: 'grid', gap: '1rem' }}
      >
        <div className="glass-panel glass-card" style={{ gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Live Stock Summary</h3>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                Alerted items rise to the top so the team sees pressure first.
              </p>
            </div>
            <span className="glass-badge glass-badge-muted">{summary.stockItems.length} tracked items</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {summary.stockItems.map((item: DashboardStockItem) => (
              <article
                key={item.materialId}
                className="dashboard-stock-row"
                style={{
                  display: 'grid',
                  gap: '1rem',
                  alignItems: 'center',
                  padding: '1rem 1.1rem',
                  borderRadius: '18px',
                  background:
                    item.alertStatus === 'healthy'
                      ? 'rgba(255,255,255,0.025)'
                      : item.alertStatus === 'low'
                        ? 'rgba(245, 158, 11, 0.06)'
                        : 'rgba(239, 68, 68, 0.08)',
                  border:
                    item.alertStatus === 'healthy'
                      ? '1px solid rgba(255,255,255,0.04)'
                      : item.alertStatus === 'low'
                        ? '1px solid rgba(245, 158, 11, 0.16)'
                        : '1px solid rgba(239, 68, 68, 0.18)',
                }}
              >
                <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{item.name}</h4>
                    <span className={getAlertBadgeClassName(item.alertStatus)}>{getAlertLabel(item)}</span>
                    <span className="glass-badge glass-badge-muted">{item.type}</span>
                  </div>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '0.84rem' }}>
                    Safety stock: {quantityFormatter.format(item.safetyStock)} {item.uom} | Last movement: {formatDateTime(item.lastTransactionDate) || 'No activity yet'}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    On Hand
                  </span>
                  <strong style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                    {quantityFormatter.format(item.currentStock)} {item.uom}
                  </strong>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: '0.78rem' }}>
                    Imported {quantityFormatter.format(item.totalImportedQuantity)} | Exported {quantityFormatter.format(item.totalExportedQuantity)}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Estimated Value
                  </span>
                  <strong style={{ fontSize: '1.2rem', fontWeight: 800 }}>{formatCurrency(item.stockValue)}</strong>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: '0.78rem' }}>
                    Avg unit price {formatCurrency(item.averageUnitPrice)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} aria-label="Inventory alert sections">
          <section className="glass-panel glass-card" style={{ gap: '1rem' }} aria-label="Low stock warnings card">
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Low Stock Warnings</h3>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                Items below threshold are ranked by shortage urgency.
              </p>
            </div>

            {isFetching ? (
              <div className="glass-badge glass-badge-muted" role="status" aria-live="polite">
                Refreshing warning signals...
              </div>
            ) : null}

            {lowStockWarnings.length === 0 ? (
              <div
                style={{
                  borderRadius: '18px',
                  padding: '1rem',
                  border: '1px solid rgba(16, 185, 129, 0.18)',
                  background: 'rgba(16, 185, 129, 0.06)',
                  color: '#a7f3d0',
                }}
              >
                No low-stock materials detected.
              </div>
            ) : (
              lowStockWarnings.map((item) => (
                <article
                  key={item.materialId}
                  style={{
                    borderRadius: '18px',
                    padding: '1rem',
                    border: '1px solid rgba(245, 158, 11, 0.28)',
                    background: 'rgba(245, 158, 11, 0.08)',
                    boxShadow: '0 0 18px rgba(245, 158, 11, 0.16)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.98rem', fontWeight: 700 }}>{item.name}</strong>
                    <span className="glass-badge glass-badge-warning">Low Stock Warning</span>
                  </div>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '0.84rem' }}>
                    On hand {quantityFormatter.format(item.currentStock)} {item.uom} of{' '}
                    {quantityFormatter.format(item.safetyStock)} {item.uom} safety stock.
                  </p>
                  <p style={{ fontSize: '0.82rem', color: '#fde68a' }}>
                    Short by {quantityFormatter.format(item.shortageQuantity)} {item.uom}.
                  </p>
                </article>
              ))
            )}
          </section>

          <section className="glass-panel glass-card" style={{ gap: '1rem' }} aria-label="Near expiry alerts">
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Near Expiry Alerts</h3>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                Batches expiring within 30 days from today.
              </p>
            </div>

            {nearExpiryAlerts.length === 0 ? (
              <div
                style={{
                  borderRadius: '18px',
                  padding: '1rem',
                  border: '1px solid rgba(16, 185, 129, 0.18)',
                  background: 'rgba(16, 185, 129, 0.06)',
                  color: '#a7f3d0',
                }}
              >
                No batches are expiring within the next 30 days.
              </div>
            ) : (
              nearExpiryAlerts.map((entry: DashboardNearExpiryAlert) => (
                <article
                  key={`${entry.materialId}-${entry.batchCode}-${entry.expirationDate}`}
                  style={{
                    borderRadius: '18px',
                    padding: '1rem',
                    border: '1px solid rgba(239, 68, 68, 0.24)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.48rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.98rem', fontWeight: 700 }}>{entry.materialName}</strong>
                    <span className="glass-badge glass-badge-danger">Near Expiry Alert</span>
                  </div>
                  <p style={{ color: '#fecaca', fontSize: '0.84rem' }}>
                    Batch <strong>{entry.batchCode}</strong> expires on {formatShortDate(entry.expirationDate)}.
                  </p>
                  <p style={{ color: '#fecaca', fontSize: '0.82rem' }}>{formatDaysRemaining(entry.daysRemaining)}</p>
                </article>
              ))
            )}
          </section>
        </aside>
      </section>
    </div>
  );
}

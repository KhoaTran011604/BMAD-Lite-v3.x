'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/utils';

export type MaterialType = 'Seeds' | 'Fertilizers' | 'Pesticides' | 'Tools';

export interface IMaterial {
  _id: string;
  name: string;
  type: MaterialType;
  uom: string;
  safetyStock: number;
  currentStock: number;
}

export interface IImport {
  _id: string;
  date: string;
  supplierName: string;
  materialId: IMaterial;
  quantity: number;
  unitPrice: number;
  batchCode?: string;
  expirationDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

// API fetcher for Imports transaction feed
const fetchImports = async (): Promise<IApiResponse<IImport[]>> => {
  const res = await fetch('/api/imports');
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || 'Failed to fetch import transaction logs');
  }
  return res.json();
};

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'imports' | 'exports'>('imports');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImport, setSelectedImport] = useState<IImport | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // TanStack React Query for GET Imports feed
  const { data, isLoading, error, refetch } = useQuery<IApiResponse<IImport[]>, Error>({
    queryKey: queryKeys.imports.all,
    queryFn: fetchImports,
    enabled: activeTab === 'imports',
  });

  const imports: IImport[] = data?.data || [];

  // Client-side text filtering for imports
  const filteredImports = imports.filter((imp) => {
    const matchesSupplier = imp.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMaterial = imp.materialId?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    return matchesSupplier || matchesMaterial;
  });

  // Drawer interaction handlers
  const handleOpenDrawer = (imp: IImport) => {
    setSelectedImport(imp);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    // Keep reference briefly to allow sliding CSS animation to finish
    setTimeout(() => {
      setSelectedImport(null);
    }, 350);
  };

  // Keyboard navigation for accessible modal closure
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        handleCloseDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  // Localized date formatting
  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  // Localized currency formatting
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Dynamic chemical expiration and warnings analysis
  const getExpirationStatus = (expirationDateString?: string) => {
    if (!expirationDateString) return null;
    const expDate = new Date(expirationDateString);
    const now = new Date();

    expDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const timeDiff = expDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
      return { status: 'expired', text: 'Expired', days: Math.abs(daysDiff) };
    } else if (daysDiff <= 30) {
      return { status: 'near-expiry', text: `Expiring soon (${daysDiff} days)`, days: daysDiff };
    }
    return { status: 'healthy', text: `Healthy (${daysDiff} days left)`, days: daysDiff };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>Transaction History</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
            Unified audit logs of incoming deliveries and outgoing disbursements
          </p>
        </div>
      </div>

      {/* Tabs navigation row */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '0.5rem', paddingBottom: '1px' }}>
        <button
          onClick={() => {
            setActiveTab('imports');
            setSearchTerm('');
          }}
          className={`glass-btn ${activeTab === 'imports' ? 'glass-btn-primary' : ''}`}
          style={{
            borderBottomRightRadius: 0,
            borderBottomLeftRadius: 0,
            borderBottom: activeTab === 'imports' ? '2px solid var(--primary)' : 'none',
            padding: '0.75rem 1.75rem',
          }}
          aria-label="View Imports Feed"
        >
          <span>📥</span>
          <span>Imports</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('exports');
            setSearchTerm('');
          }}
          className={`glass-btn ${activeTab === 'exports' ? 'glass-btn-primary' : ''}`}
          style={{
            borderBottomRightRadius: 0,
            borderBottomLeftRadius: 0,
            borderBottom: activeTab === 'exports' ? '2px solid var(--primary)' : 'none',
            padding: '0.75rem 1.75rem',
          }}
          aria-label="View Exports Feed"
        >
          <span>📤</span>
          <span>Exports</span>
        </button>
      </div>

      {/* SEARCH AND CONTROLS SECTION */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <span
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted-foreground)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              type="text"
              placeholder={
                activeTab === 'imports'
                  ? 'Search receipts by supplier name or supply name...'
                  : 'Search disbursements...'
              }
              className="glass-input"
              style={{ paddingLeft: '2.75rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Filter transaction history search input"
              id="transaction-search-input"
            />
          </div>
          {activeTab === 'imports' && (
            <button className="glass-btn" onClick={() => refetch()} aria-label="Refresh imports log feed">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* FEED FEEDBACK VIEW GRID */}
      {activeTab === 'imports' ? (
        <div className="glass-panel glass-card">
          {/* Skeleton loading display */}
          {isLoading && (
            <div style={{ padding: '1rem 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--border)',
                      color: 'var(--muted-foreground)',
                      fontSize: '0.85rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    <th style={{ padding: '1rem' }}>Date</th>
                    <th style={{ padding: '1rem' }}>Supply Item</th>
                    <th style={{ padding: '1rem' }}>Supplier</th>
                    <th style={{ padding: '1rem' }}>Quantity</th>
                    <th style={{ padding: '1rem' }}>Unit Price</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <div
                          className="skeleton-pulse"
                          style={{
                            height: '1.25rem',
                            width: '90px',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            borderRadius: '4px',
                          }}
                        ></div>
                      </td>
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <div
                          className="skeleton-pulse"
                          style={{
                            height: '1.25rem',
                            width: '180px',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            borderRadius: '4px',
                          }}
                        ></div>
                      </td>
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <div
                          className="skeleton-pulse"
                          style={{
                            height: '1.25rem',
                            width: '120px',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            borderRadius: '4px',
                          }}
                        ></div>
                      </td>
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <div
                          className="skeleton-pulse"
                          style={{
                            height: '1.25rem',
                            width: '60px',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            borderRadius: '4px',
                          }}
                        ></div>
                      </td>
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <div
                          className="skeleton-pulse"
                          style={{
                            height: '1.25rem',
                            width: '50px',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            borderRadius: '4px',
                          }}
                        ></div>
                      </td>
                      <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                        <div
                          className="skeleton-pulse"
                          style={{
                            height: '1.25rem',
                            width: '70px',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            borderRadius: '4px',
                            marginLeft: 'auto',
                          }}
                        ></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Database Synchronization Errors */}
          {error && (
            <div
              className="glass-glow-danger"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 2rem',
                textAlign: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--danger)',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Database Sync Failure</h3>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', maxWidth: '400px' }}>
                {error.message || 'An error occurred while loading incoming transaction logs.'}
              </p>
              <button className="glass-btn glass-btn-primary" onClick={() => refetch()} style={{ marginTop: '0.5rem' }}>
                Retry Log Feed Sync
              </button>
            </div>
          )}

          {/* Chronological Logs Table */}
          {!isLoading && !error && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--border)',
                      color: 'var(--muted-foreground)',
                      fontSize: '0.85rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    <th style={{ padding: '1rem' }}>Date</th>
                    <th style={{ padding: '1rem' }}>Supply Item</th>
                    <th style={{ padding: '1rem' }}>Supplier</th>
                    <th style={{ padding: '1rem' }}>Quantity</th>
                    <th style={{ padding: '1rem' }}>Unit Price</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredImports.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                        <div style={{ marginBottom: '0.75rem', fontSize: '1.5rem' }}>🔍</div>
                        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>No logs recorded</p>
                        <p style={{ fontSize: '0.85rem' }}>
                          No delivery transactions matched your filter keywords.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredImports.map((imp) => {
                      const totalCost = imp.quantity * imp.unitPrice;
                      const uom = imp.materialId?.uom || '';
                      
                      return (
                        <tr
                          key={imp._id}
                          onClick={() => handleOpenDrawer(imp)}
                          style={{
                            borderBottom: '1px solid var(--border)',
                            transition: 'var(--transition-smooth)',
                            cursor: 'pointer',
                          }}
                          className="catalog-row"
                        >
                          <td style={{ padding: '1.15rem 1rem', color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                            {formatDate(imp.date)}
                          </td>
                          <td style={{ padding: '1.15rem 1rem', fontWeight: 600, color: '#fff' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span>{imp.materialId?.name || 'Unknown Supply'}</span>
                              {imp.materialId?.type && (
                                <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--muted-foreground)' }}>
                                  {imp.materialId.type === 'Seeds' && '🌱 '}
                                  {imp.materialId.type === 'Fertilizers' && '🧪 '}
                                  {imp.materialId.type === 'Pesticides' && '🦠 '}
                                  {imp.materialId.type === 'Tools' && '🛠️ '}
                                  {imp.materialId.type}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '1.15rem 1rem', color: 'var(--foreground)' }}>
                            {imp.supplierName}
                          </td>
                          <td style={{ padding: '1.15rem 1rem', fontWeight: 700, color: 'var(--primary)' }}>
                            +{imp.quantity}
                            <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginLeft: '0.25rem', fontWeight: 400 }}>
                              {uom}
                            </span>
                          </td>
                          <td style={{ padding: '1.15rem 1rem', color: 'var(--muted-foreground)' }}>
                            {formatCurrency(imp.unitPrice)}
                          </td>
                          <td style={{ padding: '1.15rem 1rem', textAlign: 'right', fontWeight: 700, color: '#fff' }}>
                            {formatCurrency(totalCost)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Exports Tab Placeholder Card */
        <div
          className="glass-panel glass-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6rem 2rem',
            textAlign: 'center',
            gap: '1.5rem',
            background: 'rgba(20, 20, 23, 0.4)',
            borderStyle: 'dashed',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              border: '1px solid rgba(16, 185, 129, 0.1)',
            }}
          >
            📦
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
              Disbursements Feed Coming Soon
            </h3>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto' }}>
              Story 2.3 handles primary stock-receipt auditing. Outgoing crop disbursements, safety limits checks, and exports logs will be enabled in Epic 3.
            </p>
          </div>
          <button
            className="glass-btn"
            onClick={() => setActiveTab('imports')}
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
          >
            <span>Return to Deliveries</span>
          </button>
        </div>
      )}

      {/* PREMIUM DETAILS DRAWER PANE */}
      <div
        className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`}
        onClick={handleCloseDrawer}
        aria-hidden={!isDrawerOpen}
      >
        <div
          className={`drawer-content ${isDrawerOpen ? 'open' : ''}`}
          onClick={(e) => e.stopPropagation()}
          style={{ width: '520px' }}
        >
          {/* Header */}
          <div className="drawer-header">
            <h2>Receipt Audit Record</h2>
            <button className="drawer-close-btn" onClick={handleCloseDrawer} aria-label="Close Audit Record">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Drawer Details Body */}
          {selectedImport && (
            <div className="drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Material catalog overview header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <div style={{ fontSize: '2rem' }}>
                  {selectedImport.materialId?.type === 'Seeds' && '🌱'}
                  {selectedImport.materialId?.type === 'Fertilizers' && '🧪'}
                  {selectedImport.materialId?.type === 'Pesticides' && '🦠'}
                  {selectedImport.materialId?.type === 'Tools' && '🛠️'}
                  {!selectedImport.materialId?.type && '📦'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                    {selectedImport.materialId?.name || 'Unknown Supply'}
                  </h3>
                  <span className="glass-badge glass-badge-muted" style={{ marginTop: '0.25rem' }}>
                    {selectedImport.materialId?.type || 'Not Classified'}
                  </span>
                </div>
              </div>

              {/* Transaction Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div
                  className="glass-panel"
                  style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>
                    QUANTITY RECEIVED
                  </span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                    +{selectedImport.quantity}
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginLeft: '0.25rem', fontWeight: 400 }}>
                      {selectedImport.materialId?.uom}
                    </span>
                  </span>
                </div>
                <div
                  className="glass-panel"
                  style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>
                    TOTAL TRANSACTION COST
                  </span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                    {formatCurrency(selectedImport.quantity * selectedImport.unitPrice)}
                  </span>
                </div>
              </div>

              {/* Supplier details list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Auditing Attributes
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.85rem 1rem',
                      background: 'rgba(255, 255, 255, 0.01)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>Supplier Vendor</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                      {selectedImport.supplierName}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.85rem 1rem',
                      background: 'rgba(255, 255, 255, 0.01)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>Transaction Date</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                      {formatDate(selectedImport.date)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.85rem 1rem',
                      background: 'rgba(255, 255, 255, 0.01)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>Unit Contract Price</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                      {formatCurrency(selectedImport.unitPrice)} per {selectedImport.materialId?.uom}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.85rem 1rem',
                      background: 'rgba(255, 255, 255, 0.01)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>Record Reference ID</span>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--muted-foreground)' }}>
                      {selectedImport._id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chemical Shell-Life Tracking */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Safety & Batch Traceability
                </h4>

                <div
                  className="glass-panel"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    background: 'rgba(24, 24, 27, 0.4)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>Manufacturer Batch Code</span>
                    {selectedImport.batchCode ? (
                      <span
                        className="glass-badge glass-badge-primary"
                        style={{ fontFamily: 'monospace', padding: '0.3rem 0.75rem' }}
                      >
                        {selectedImport.batchCode}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
                        Not Provided
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>Expiration Date</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                      {selectedImport.expirationDate ? formatDate(selectedImport.expirationDate) : 'None'}
                    </span>
                  </div>

                  {/* Dynamic Alert Banner for chemically expiring items */}
                  {selectedImport.expirationDate && (
                    <div style={{ marginTop: '0.5rem' }}>
                      {(() => {
                        const analysis = getExpirationStatus(selectedImport.expirationDate);
                        if (!analysis) return null;

                        if (analysis.status === 'expired') {
                          return (
                            <div
                              className="glass-glow-danger"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1rem',
                                background: 'rgba(239, 68, 68, 0.08)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '8px',
                                color: '#fecaca',
                                fontSize: '0.8rem',
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                              </svg>
                              <span>
                                **CRITICAL WARNING:** This chemical batch has expired by **{analysis.days} days**! Immediate safety review required.
                              </span>
                            </div>
                          );
                        } else if (analysis.status === 'near-expiry') {
                          return (
                            <div
                              className="glass-glow-warning"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1rem',
                                background: 'rgba(245, 158, 11, 0.08)',
                                border: '1px solid rgba(245, 158, 11, 0.2)',
                                borderRadius: '8px',
                                color: '#fde68a',
                                fontSize: '0.8rem',
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                              </svg>
                              <span>
                                **SHELF-LIFE ALERT:** This agricultural batch expires in **{analysis.days} days**! Plan immediate field application.
                              </span>
                            </div>
                          );
                        } else {
                          return (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1rem',
                                background: 'rgba(16, 185, 129, 0.05)',
                                border: '1px solid rgba(16, 185, 129, 0.15)',
                                borderRadius: '8px',
                                color: '#a7f3d0',
                                fontSize: '0.8rem',
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span>
                                Batch chemical stability is healthy. Dynamic shelf-life tracks **{analysis.days} days** remaining before expiration.
                              </span>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

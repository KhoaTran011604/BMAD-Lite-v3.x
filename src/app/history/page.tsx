'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { filterExportHistory, filterImportHistory, queryKeys, sortByDateDesc } from '@/lib/utils';

type MaterialType = 'Seeds' | 'Fertilizers' | 'Pesticides' | 'Tools';
type HistoryTab = 'imports' | 'exports';

interface IMaterial {
  _id: string;
  name: string;
  type: MaterialType;
  uom: string;
  safetyStock: number;
  currentStock: number;
}

interface IImport {
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

interface IExport {
  _id: string;
  date: string;
  requesterName: string;
  materialId: IMaterial;
  quantity: number;
  destinationPurpose: string;
  createdAt: string;
  updatedAt: string;
}

interface IApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

type IHistorySelection =
  | {
      type: 'imports';
      record: IImport;
    }
  | {
      type: 'exports';
      record: IExport;
    };

const fetchHistory = async <T,>(path: string, fallbackMessage: string): Promise<IApiResponse<T[]>> => {
  const response = await fetch(path);

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(errorBody.error || fallbackMessage);
  }

  return response.json() as Promise<IApiResponse<T[]>>;
};

const fetchImports = (): Promise<IApiResponse<IImport[]>> =>
  fetchHistory<IImport>('/api/imports', 'Failed to fetch import transaction logs');

const fetchExports = (): Promise<IApiResponse<IExport[]>> =>
  fetchHistory<IExport>('/api/exports', 'Failed to fetch export transaction logs');

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? dateString : date.toISOString().split('T')[0];
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

const getMaterialTypeLabel = (materialType?: MaterialType): string => {
  if (!materialType) {
    return 'Unclassified';
  }

  return materialType;
};

const getHistorySearchPlaceholder = (activeTab: HistoryTab): string =>
  activeTab === 'imports'
    ? 'Search receipts by supplier or material name...'
    : 'Search exports by requester, material, or destination...';

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<HistoryTab>('imports');
  const [searchTerm, setSearchTerm] = useState('');
  const [selection, setSelection] = useState<IHistorySelection | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    data: importsResponse,
    isLoading: isImportsLoading,
    error: importsError,
    refetch: refetchImports,
  } = useQuery<IApiResponse<IImport[]>, Error>({
    queryKey: queryKeys.imports.all,
    queryFn: fetchImports,
  });

  const {
    data: exportsResponse,
    isLoading: isExportsLoading,
    error: exportsError,
    refetch: refetchExports,
  } = useQuery<IApiResponse<IExport[]>, Error>({
    queryKey: queryKeys.exports.all,
    queryFn: fetchExports,
  });

  const imports = useMemo<IImport[]>(
    () => sortByDateDesc<IImport>(importsResponse?.data ?? []),
    [importsResponse]
  );

  const exports = useMemo<IExport[]>(
    () => sortByDateDesc<IExport>(exportsResponse?.data ?? []),
    [exportsResponse]
  );

  const filteredImports = useMemo(() => {
    return filterImportHistory(imports, searchTerm);
  }, [imports, searchTerm]);

  const filteredExports = useMemo(() => {
    return filterExportHistory(exports, searchTerm);
  }, [exports, searchTerm]);

  const hasActiveSearch = searchTerm.trim().length > 0;

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);

    window.setTimeout(() => {
      setSelection(null);
    }, 250);
  }, []);

  const handleOpenImportDrawer = useCallback((record: IImport) => {
    setSelection({ type: 'imports', record });
    setIsDrawerOpen(true);
  }, []);

  const handleOpenExportDrawer = useCallback((record: IExport) => {
    setSelection({ type: 'exports', record });
    setIsDrawerOpen(true);
  }, []);

  const handleTabChange = useCallback((tab: HistoryTab) => {
    setActiveTab(tab);
    setSearchTerm('');
    setSelection(null);
    setIsDrawerOpen(false);
  }, []);

  const handleRetry = useCallback(() => {
    if (activeTab === 'imports') {
      void refetchImports();
      return;
    }

    void refetchExports();
  }, [activeTab, refetchExports, refetchImports]);

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseDrawer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCloseDrawer, isDrawerOpen]);

  const activeError = activeTab === 'imports' ? importsError : exportsError;
  const isActiveLoading = activeTab === 'imports' ? isImportsLoading : isExportsLoading;
  const hasRows = activeTab === 'imports' ? filteredImports.length > 0 : filteredExports.length > 0;

  const renderLoadingRows = (columnCount: number) => (
    <tbody>
      {Array.from({ length: 5 }, (_, index) => (
        <tr key={`loading-row-${index}`} style={{ borderBottom: '1px solid var(--border)' }}>
          {Array.from({ length: columnCount }, (_, columnIndex) => (
            <td key={`loading-cell-${index}-${columnIndex}`} style={{ padding: '1.1rem 1rem' }}>
              <div
                className="skeleton-pulse"
                style={{
                  height: '1.1rem',
                  width: `${60 + columnIndex * 20}px`,
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  const renderEmptyState = () => (
    <tr>
      <td
        colSpan={activeTab === 'imports' ? 6 : 5}
        style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}
      >
        <p style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '0.5rem' }}>
          No {activeTab === 'imports' ? 'receipts' : 'exports'} found
        </p>
        <p style={{ fontSize: '0.9rem' }}>
          {hasActiveSearch
            ? 'Try a different keyword to broaden the audit search.'
            : activeTab === 'imports'
              ? 'New import receipts will appear here once stock is logged.'
              : 'New export disbursements will appear here once inventory is issued.'}
        </p>
      </td>
    </tr>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>Transaction History</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.95rem' }}>
            Review incoming receipts and outgoing disbursements in one audit surface.
          </p>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Transaction history tabs"
        style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '0.5rem', paddingBottom: '1px' }}
      >
        <button
          type="button"
          id="history-tab-imports"
          role="tab"
          aria-selected={activeTab === 'imports'}
          aria-controls="history-panel-imports"
          onClick={() => handleTabChange('imports')}
          className={`glass-btn ${activeTab === 'imports' ? 'glass-btn-primary' : ''}`}
          style={{
            borderBottomRightRadius: 0,
            borderBottomLeftRadius: 0,
            borderBottom: activeTab === 'imports' ? '2px solid var(--primary)' : 'none',
            padding: '0.75rem 1.75rem',
          }}
        >
          Imports
        </button>
        <button
          type="button"
          id="history-tab-exports"
          role="tab"
          aria-selected={activeTab === 'exports'}
          aria-controls="history-panel-exports"
          onClick={() => handleTabChange('exports')}
          className={`glass-btn ${activeTab === 'exports' ? 'glass-btn-primary' : ''}`}
          style={{
            borderBottomRightRadius: 0,
            borderBottomLeftRadius: 0,
            borderBottom: activeTab === 'exports' ? '2px solid var(--primary)' : 'none',
            padding: '0.75rem 1.75rem',
          }}
        >
          Exports
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <span
            aria-hidden="true"
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
            id="transaction-search-input"
            type="text"
            className="glass-input"
            style={{ paddingLeft: '2.75rem' }}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={getHistorySearchPlaceholder(activeTab)}
            aria-label={`Search ${activeTab} transaction history`}
          />
        </div>
        <button
          type="button"
          className="glass-btn"
          onClick={handleRetry}
          aria-label={`Refresh ${activeTab} history`}
        >
          Refresh
        </button>
      </div>

      <div
        id={activeTab === 'imports' ? 'history-panel-imports' : 'history-panel-exports'}
        role="tabpanel"
        aria-labelledby={activeTab === 'imports' ? 'history-tab-imports' : 'history-tab-exports'}
        className="glass-panel glass-card"
      >
        {activeError ? (
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
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Unable to load history</h3>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', maxWidth: '420px' }}>
              {activeError.message || 'The transaction feed could not be loaded. Please retry.'}
            </p>
            <button type="button" className="glass-btn glass-btn-primary" onClick={handleRetry}>
              Retry
            </button>
          </div>
        ) : (
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
                  <th style={{ padding: '1rem' }}>Material</th>
                  <th style={{ padding: '1rem' }}>
                    {activeTab === 'imports' ? 'Supplier' : 'Requester'}
                  </th>
                  <th style={{ padding: '1rem' }}>Quantity</th>
                  {activeTab === 'imports' ? (
                    <>
                      <th style={{ padding: '1rem' }}>Unit Price</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Total Cost</th>
                    </>
                  ) : (
                    <th style={{ padding: '1rem' }}>Purpose</th>
                  )}
                </tr>
              </thead>

              {isActiveLoading ? (
                renderLoadingRows(activeTab === 'imports' ? 6 : 5)
              ) : (
                <tbody>
                  {!hasRows
                    ? renderEmptyState()
                    : activeTab === 'imports'
                      ? filteredImports.map((entry) => {
                          const totalCost = entry.quantity * entry.unitPrice;

                          return (
                            <tr
                              key={entry._id}
                              className="catalog-row"
                              role="button"
                              tabIndex={0}
                              aria-label={`Open import record for ${entry.materialId?.name || 'Unknown Material'}`}
                              onClick={() => handleOpenImportDrawer(entry)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  handleOpenImportDrawer(entry);
                                }
                              }}
                              style={{
                                borderBottom: '1px solid var(--border)',
                                cursor: 'pointer',
                                transition: 'var(--transition-smooth)',
                              }}
                            >
                              <td style={{ padding: '1.1rem 1rem', color: 'var(--muted-foreground)' }}>
                                {formatDate(entry.date)}
                              </td>
                              <td style={{ padding: '1.1rem 1rem', color: '#fff', fontWeight: 700 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                  <span>{entry.materialId?.name || 'Unknown Material'}</span>
                                  <span className="glass-badge glass-badge-muted" style={{ width: 'fit-content' }}>
                                    {getMaterialTypeLabel(entry.materialId?.type)}
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: '1.1rem 1rem', color: 'var(--foreground)' }}>
                                {entry.supplierName}
                              </td>
                              <td style={{ padding: '1.1rem 1rem', fontWeight: 800, color: 'var(--primary)' }}>
                                +{entry.quantity}
                                <span
                                  style={{
                                    marginLeft: '0.25rem',
                                    fontSize: '0.8rem',
                                    fontWeight: 400,
                                    color: 'var(--muted-foreground)',
                                  }}
                                >
                                  {entry.materialId?.uom}
                                </span>
                              </td>
                              <td style={{ padding: '1.1rem 1rem', color: 'var(--muted-foreground)' }}>
                                {formatCurrency(entry.unitPrice)}
                              </td>
                              <td style={{ padding: '1.1rem 1rem', textAlign: 'right', color: '#fff', fontWeight: 700 }}>
                                {formatCurrency(totalCost)}
                              </td>
                            </tr>
                          );
                        })
                      : filteredExports.map((entry) => (
                          <tr
                            key={entry._id}
                            className="catalog-row"
                            role="button"
                            tabIndex={0}
                            aria-label={`Open export record for ${entry.materialId?.name || 'Unknown Material'}`}
                            onClick={() => handleOpenExportDrawer(entry)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                handleOpenExportDrawer(entry);
                              }
                            }}
                            style={{
                              borderBottom: '1px solid var(--border)',
                              cursor: 'pointer',
                              transition: 'var(--transition-smooth)',
                            }}
                          >
                            <td style={{ padding: '1.1rem 1rem', color: 'var(--muted-foreground)' }}>
                              {formatDate(entry.date)}
                            </td>
                            <td style={{ padding: '1.1rem 1rem', color: '#fff', fontWeight: 700 }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <span>{entry.materialId?.name || 'Unknown Material'}</span>
                                <span className="glass-badge glass-badge-muted" style={{ width: 'fit-content' }}>
                                  {getMaterialTypeLabel(entry.materialId?.type)}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '1.1rem 1rem' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <span style={{ color: '#fff', fontWeight: 700 }}>{entry.requesterName}</span>
                                <span style={{ color: 'var(--muted-foreground)', fontSize: '0.82rem' }}>
                                  Issued for field execution
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '1.1rem 1rem', fontWeight: 800, color: '#fca5a5' }}>
                              -{entry.quantity}
                              <span
                                style={{
                                  marginLeft: '0.25rem',
                                  fontSize: '0.8rem',
                                  fontWeight: 400,
                                  color: 'var(--muted-foreground)',
                                }}
                              >
                                {entry.materialId?.uom}
                              </span>
                            </td>
                            <td style={{ padding: '1.1rem 1rem' }}>
                              <span className="glass-badge glass-badge-warning">{entry.destinationPurpose}</span>
                            </td>
                          </tr>
                        ))}
                </tbody>
              )}
            </table>
          </div>
        )}
      </div>

      <div
        className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`}
        onClick={handleCloseDrawer}
        aria-hidden={!isDrawerOpen}
      >
        <div
          className={`drawer-content ${isDrawerOpen ? 'open' : ''}`}
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={selection?.type === 'exports' ? 'Export audit record' : 'Import audit record'}
          style={{ width: '520px' }}
        >
          <div className="drawer-header">
            <h2>{selection?.type === 'exports' ? 'Export Audit Record' : 'Import Audit Record'}</h2>
            <button
              type="button"
              className="drawer-close-btn"
              onClick={handleCloseDrawer}
              aria-label="Close audit record"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {selection && (
            <div className="drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  padding: '1.25rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <span
                  className={`glass-badge ${
                    selection.type === 'exports' ? 'glass-badge-warning' : 'glass-badge-primary'
                  }`}
                  style={{ width: 'fit-content' }}
                >
                  {selection.type === 'exports' ? 'Outgoing Transaction' : 'Incoming Transaction'}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                  {selection.record.materialId?.name || 'Unknown Material'}
                </h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                  {getMaterialTypeLabel(selection.record.materialId?.type)} · {selection.record.materialId?.uom || 'No UOM'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: 700 }}>
                    {selection.type === 'exports' ? 'QUANTITY ISSUED' : 'QUANTITY RECEIVED'}
                  </span>
                  <span
                    style={{
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      color: selection.type === 'exports' ? '#fca5a5' : 'var(--primary)',
                    }}
                  >
                    {selection.type === 'exports' ? '-' : '+'}
                    {selection.record.quantity}
                    <span
                      style={{
                        marginLeft: '0.25rem',
                        fontSize: '0.85rem',
                        fontWeight: 400,
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      {selection.record.materialId?.uom}
                    </span>
                  </span>
                </div>
                <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: 700 }}>
                    TRANSACTION DATE
                  </span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                    {formatDate(selection.record.date)}
                  </span>
                </div>
              </div>

              {selection.type === 'imports' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="glass-panel" style={{ padding: '0.95rem 1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>Supplier</span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>{selection.record.supplierName}</span>
                  </div>
                  <div className="glass-panel" style={{ padding: '0.95rem 1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>Unit Price</span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>{formatCurrency(selection.record.unitPrice)}</span>
                  </div>
                  <div className="glass-panel" style={{ padding: '0.95rem 1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>Total Cost</span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>
                      {formatCurrency(selection.record.quantity * selection.record.unitPrice)}
                    </span>
                  </div>
                  <div className="glass-panel" style={{ padding: '0.95rem 1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>Batch Code</span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>
                      {selection.record.batchCode || 'Not provided'}
                    </span>
                  </div>
                  <div className="glass-panel" style={{ padding: '0.95rem 1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>Expiration Date</span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>
                      {selection.record.expirationDate ? formatDate(selection.record.expirationDate) : 'Not provided'}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="glass-panel" style={{ padding: '0.95rem 1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>Requester</span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>{selection.record.requesterName}</span>
                  </div>
                  <div className="glass-panel" style={{ padding: '0.95rem 1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>Purpose</span>
                    <span className="glass-badge glass-badge-warning">{selection.record.destinationPurpose}</span>
                  </div>
                  <div className="glass-panel" style={{ padding: '0.95rem 1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>Record ID</span>
                    <span style={{ color: '#fff', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {selection.record._id}
                    </span>
                  </div>
                  <div
                    className="glass-panel"
                    style={{
                      padding: '1rem 1.1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      background: 'rgba(245, 158, 11, 0.08)',
                      borderColor: 'rgba(245, 158, 11, 0.18)',
                    }}
                  >
                    <span style={{ color: '#fde68a', fontWeight: 700 }}>Audit Note</span>
                    <p style={{ color: 'var(--foreground)', fontSize: '0.9rem' }}>
                      This disbursement reduced on-hand inventory and should align with the backend stock validation rules.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

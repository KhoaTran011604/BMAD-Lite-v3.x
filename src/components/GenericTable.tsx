import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';

interface GenericTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  emptyStateText?: string;
  emptyStateIcon?: string;
  onRowClick?: (record: TData) => void;
}

export function GenericTable<TData>({
  data,
  columns,
  isLoading = false,
  error = null,
  onRetry,
  emptyStateText = 'No items found',
  emptyStateIcon = '🔍',
  onRowClick,
}: GenericTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div style={{ padding: '1rem 0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                style={{
                  borderBottom: '1px solid var(--border)',
                  color: 'var(--muted-foreground)',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} style={{ padding: '1rem' }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                {columns.map((_, colIdx) => (
                  <td key={colIdx} style={{ padding: '1.25rem 1rem' }}>
                    <div
                      className="skeleton-pulse"
                      style={{
                        height: '1.25rem',
                        width: colIdx === 0 ? '160px' : '80px',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: '4px',
                      }}
                    ></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return (
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Database Sync Failure</h3>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', maxWidth: '400px' }}>
          {error.message || 'An error occurred while loading records.'}
        </p>
        {onRetry && (
          <button
            type="button"
            className="glass-btn glass-btn-primary"
            onClick={onRetry}
            style={{ marginTop: '0.5rem' }}
          >
            Retry Sync
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              style={{
                borderBottom: '1px solid var(--border)',
                color: 'var(--muted-foreground)',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    padding: '1rem',
                    cursor: header.column.getCanSort() ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? ''}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}
              >
                <div style={{ marginBottom: '0.75rem', fontSize: '1.5rem' }}>{emptyStateIcon}</div>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>
                  {emptyStateText}
                </p>
                <p style={{ fontSize: '0.85rem' }}>Try refining your search terms or filters.</p>
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                style={{
                  borderBottom: '1px solid var(--border)',
                  transition: 'var(--transition-smooth)',
                  cursor: onRowClick ? 'pointer' : 'default',
                }}
                className="catalog-row"
                onClick={() => onRowClick?.(row.original)}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? 'button' : undefined}
                onKeyDown={(event) => {
                  if (onRowClick && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    onRowClick(row.original);
                  }
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} style={{ padding: '1.15rem 1rem' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

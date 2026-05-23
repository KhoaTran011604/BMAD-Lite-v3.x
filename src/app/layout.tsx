'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import QuickActionDrawer from '@/components/QuickActionDrawer';
import '@/styles/globals.css';
import '@/styles/layout.css';
import '@/styles/glass.css';

// React Query Client setup
function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute stale time
            refetchOnWindowFocus: false, // Avoid aggressive refetches
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <title>AgriKeep - Farm Inventory Management</title>
        <meta name="description" content="Centralized supply receipts, cataloging, and safety stock alerts" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <QueryProvider>
          <div className="app-container">
            <Sidebar />
            <main className="main-content">
              <div className="top-nav">
                <div className="page-title">
                  <h1>AgriKeep</h1>
                  <p>Central Agriculture Supply System</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <button
                    className="glass-btn glass-btn-primary"
                    onClick={() => setIsDrawerOpen(true)}
                    aria-label="Open transaction log drawer"
                    id="global-log-delivery-btn"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Log Delivery</span>
                  </button>
                  <div className="user-profile">
                    <div className="user-avatar">KM</div>
                    <div className="user-info">
                      <span className="user-name">Khoa Minh</span>
                      <span className="user-role">Farm Manager</span>
                    </div>
                  </div>
                </div>
              </div>
              {children}
            </main>
            <QuickActionDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}

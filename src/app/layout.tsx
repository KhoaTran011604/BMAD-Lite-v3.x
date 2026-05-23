'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
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
                <div className="user-profile">
                  <div className="user-avatar">KM</div>
                  <div className="user-info">
                    <span className="user-name">Khoa Minh</span>
                    <span className="user-role">Farm Manager</span>
                  </div>
                </div>
              </div>
              {children}
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}

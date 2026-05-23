'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import QuickActionDrawer from '@/components/QuickActionDrawer';
import { AuthProvider, useAuth } from '@/context/auth';
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

const getUserInitials = (username: string): string => {
  const parts = username.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return 'AG';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
};

function TopNavUserProfile() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="user-profile">
        <div className="user-avatar skeleton-pulse" aria-hidden="true" />
        <div className="user-info">
          <span className="user-name">Loading...</span>
          <span className="user-role">Checking session</span>
        </div>
      </div>
    );
  }

  const username = user?.username ?? 'Guest';
  const roleLabel = user ? (user.role === 'FarmManager' ? 'Manager' : user.role) : 'Visitor';

  return (
    <div className="user-profile">
      <div className="user-avatar">{getUserInitials(username)}</div>
      <div className="user-info">
        <span className="user-name">{username}</span>
        <span className="user-role">{roleLabel}</span>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  return (
    <html lang="en">
      <head>
        <title>AgriKeep - Farm Inventory Management</title>
        <meta name="description" content="Centralized supply receipts, cataloging, and safety stock alerts" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <QueryProvider>
          <AuthProvider>
            {isAuthRoute ? (
              <main>{children}</main>
            ) : (
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
                      <TopNavUserProfile />
                    </div>
                  </div>
                  {children}
                </main>
                <QuickActionDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
              </div>
            )}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

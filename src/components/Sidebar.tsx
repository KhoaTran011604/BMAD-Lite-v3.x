'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/context/auth';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const menuItems = [
    {
      name: 'Live Dashboard',
      path: '/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      ),
    },
    {
      name: 'Material Catalog',
      path: '/catalog',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m16 16 3 3 3-3" />
          <path d="m22 16-3-3-3 3" />
          <rect x="2" y="3" width="20" height="7" rx="1" />
          <rect x="2" y="14" width="10" height="7" rx="1" />
        </svg>
      ),
    },
    {
      name: 'Transaction Logs',
      path: '/history',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8v4l3 3" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
  ];

  const roleLabel = user?.role === 'FarmManager' ? 'Manager' : user?.role ?? 'Worker';
  const roleBadgeClass = roleLabel === 'Worker' ? 'glass-badge-muted' : 'glass-badge-primary';

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    const result = await logout();
    setIsLoggingOut(false);

    if (!result.success) {
      return;
    }

    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <span>AgriKeep</span>
      </div>

      <nav style={{ flexGrow: 1 }}>
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path} className={`sidebar-item ${isActive ? 'active' : ''}`}>
                <Link href={item.path}>
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-panel">
          <p className="sidebar-user-name">{user?.username ?? 'Unknown User'}</p>
          <span className={`glass-badge ${roleBadgeClass}`}>{roleLabel}</span>
        </div>
        <button
          type="button"
          className="glass-btn sidebar-logout-btn"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label="Logout and return to login page"
        >
          {isLoggingOut ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Logging out...
            </>
          ) : (
            'Logout'
          )}
        </button>
        <p>BMAD-Lite Framework v3.0</p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.6 }}>(c) 2026 AgriKeep Ltd.</p>
      </div>
    </aside>
  );
}

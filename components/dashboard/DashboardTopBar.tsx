
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

import NotificationCenter from './NotificationCenter';

const breadcrumbMap: Record<string, string> = {
  '/':         'Dashboard',
  '/rooms':    'Rooms',
  '/history':  'History',
  '/settings': 'Settings',
};

interface DashboardTopBarProps {
  onMenuClick?: () => void;
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

export default function DashboardTopBar({
  onMenuClick,
  onToggleSidebar,
  sidebarCollapsed,
}: DashboardTopBarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [dynamicNames, setDynamicNames] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    // If it's a room detail page, fetch the room name
    const match = pathname.match(/^\/rooms\/(\d+)$/);
    if (match) {
      const id = match[1];
      fetch(`/api/rooms/${id}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((room) => {
          if (room) setDynamicNames((prev) => ({ ...prev, [pathname]: room.name }));
        })
        .catch(console.error);
    }
  }, [pathname]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  // Compute breadcrumb
  const segments = pathname.split('/').filter(Boolean);
  
  // Build breadcrumb items
  const breadcrumbItems = [];
  
  if (segments.length === 0) {
    breadcrumbItems.push('Dashboard');
  } else {
    // Build path incrementally
    let currentPath = '';
    for (let i = 0; i < segments.length; i++) {
      currentPath += `/${segments[i]}`;
      
      // If it's a known static path
      if (breadcrumbMap[currentPath]) {
        breadcrumbItems.push(breadcrumbMap[currentPath]);
      } 
      // If we fetched a dynamic name for it
      else if (dynamicNames[currentPath]) {
        breadcrumbItems.push(dynamicNames[currentPath]);
      }
      // Fallback
      else {
        // Capitalize segment
        const name = segments[i].charAt(0).toUpperCase() + segments[i].slice(1);
        breadcrumbItems.push(name);
      }
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-xl border-b border-outline-variant/20 flex items-center justify-between px-4 gap-4">
      {/* Left: collapse toggle (desktop) + hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Desktop sidebar toggle */}
        <button
          className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors flex-shrink-0"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span className="material-symbols-outlined text-[20px]">
            {sidebarCollapsed ? 'menu_open' : 'menu'}
          </span>
        </button>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors flex-shrink-0"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        {/* Logo (mobile only) */}
        <div className="flex lg:hidden items-center gap-2">
          <div className="w-6 h-6 primary-gradient rounded-md flex items-center justify-center">
            <span className="material-symbols-outlined text-background text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          </div>
          <span className="text-base font-bold tracking-tight text-transparent bg-clip-text primary-gradient headline-font">
            HomeHub
          </span>
        </div>

        {/* Breadcrumb (desktop) */}
        <div className="hidden lg:flex items-center text-sm min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">
          <span className="text-on-surface-variant/60 flex-shrink-0">HomeHub</span>
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={index}>
              <span className="text-outline-variant mx-1.5 flex-shrink-0">/</span>
              <span 
                className={`truncate ${
                  index === breadcrumbItems.length - 1 
                    ? 'text-on-surface font-medium' 
                    : 'text-on-surface-variant/60 hidden sm:inline-block'
                }`}
              >
                {item}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right: search mock + user */}
      <div className="flex items-center gap-2">
        {/* Search (desktop) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface-variant/60 text-sm cursor-pointer hover:border-outline-variant/60 transition-colors group">
          <span className="material-symbols-outlined text-[16px] group-hover:text-on-surface-variant transition-colors">search</span>
          <span className="text-xs">Search devices…</span>
          <kbd className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/20 font-mono">⌘K</kbd>
        </div>

        {/* Notification bell */}
        <NotificationCenter />

        {/* User chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-outline-variant/20">
          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
          <span className="hidden sm:block text-xs font-medium text-on-surface-variant">{session?.user?.name || session?.user?.email || 'User'}</span>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-all"
            title="Logout"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

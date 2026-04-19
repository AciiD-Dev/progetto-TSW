
'use client';

import React, { useState } from 'react';
import ToastProvider from '@/components/ToastProvider';
import DashboardNav from '@/components/DashboardNav';
import DashboardTopBar from '@/components/DashboardTopBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen,     setIsMobileOpen]     = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <DashboardTopBar
        onMenuClick={() => setIsMobileOpen(true)}
        onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* ── Mobile Drawer ── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-surface flex flex-col shadow-2xl border-r border-outline-variant/20 overflow-y-auto">
            <div className="flex justify-between items-center px-4 py-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 primary-gradient rounded-lg flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-background text-[15px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    home
                  </span>
                </div>
                <span className="text-lg font-bold tracking-tight text-transparent bg-clip-text primary-gradient headline-font">
                  HomeHub
                </span>
              </div>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                onClick={() => setIsMobileOpen(false)}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <DashboardNav onClose={() => setIsMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      <aside
        className={`
          hidden lg:flex fixed left-0 top-14 h-[calc(100vh-56px)]
          flex-col bg-surface border-r border-outline-variant/20 z-40
          transition-[width] duration-300 ease-in-out overflow-hidden
          ${sidebarCollapsed ? 'w-[68px]' : 'w-60'}
        `}
      >
        {/* Logo */}
        <div
          className={`
            flex items-center flex-shrink-0 border-b border-outline-variant/20
            transition-all duration-300
            ${sidebarCollapsed ? 'justify-center py-4 px-2' : 'gap-2.5 px-4 py-4'}
          `}
        >
          <div className="w-7 h-7 primary-gradient rounded-lg flex items-center justify-center flex-shrink-0">
            <span
              className="material-symbols-outlined text-background text-[15px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              home
            </span>
          </div>
          {!sidebarCollapsed && (
            <span className="text-base font-bold tracking-tight text-transparent bg-clip-text primary-gradient headline-font whitespace-nowrap">
              HomeHub
            </span>
          )}
        </div>

        <DashboardNav collapsed={sidebarCollapsed} />
      </aside>

      {/* ── Main Content ── */}
      <main
        className={`
          pt-14 min-h-screen transition-[margin] duration-300 ease-in-out
          ${sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-60'}
        `}
      >
        <div className="p-5 lg:p-7 custom-scrollbar">
          <ToastProvider>{children}</ToastProvider>
        </div>
      </main>

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute -top-[20%] -left-[5%] w-[45%] h-[45%] bg-primary/[0.03] blur-[160px] rounded-full" />
        <div className="absolute top-[45%] -right-[8%] w-[35%] h-[35%] bg-secondary/[0.03] blur-[140px] rounded-full" />
        <div className="absolute bottom-0 left-[25%] w-[30%] h-[30%] bg-tertiary/[0.02] blur-[120px] rounded-full" />
      </div>
    </div>
  );
}

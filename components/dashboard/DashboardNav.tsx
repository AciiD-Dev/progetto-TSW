
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const navLinks = [
  { href: '/',         label: 'Dashboard', icon: 'grid_view'     },
  { href: '/rooms',    label: 'Rooms',     icon: 'meeting_room'  },
  { href: '/history',  label: 'History',   icon: 'bar_chart'     },
  { href: '/settings', label: 'Settings',  icon: 'tune'          },
];

interface DashboardNavProps {
  collapsed?: boolean;
  onClose?: () => void;
}

export default function DashboardNav({ collapsed = false, onClose }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col flex-1 py-3 overflow-hidden">
      {/* Section label */}
      {!collapsed && (
        <div className="px-4 mb-2">
          <span className="text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.15em]">
            Menu
          </span>
        </div>
      )}

      <div className="flex-1 px-2 space-y-0.5">
        {navLinks.map(({ href, label, icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              title={collapsed ? label : undefined}
              className={`
                group flex items-center gap-3 rounded-xl transition-all duration-200 select-none
                ${collapsed ? 'px-0 py-3 justify-center' : 'px-3 py-2.5'}
                ${isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }
              `}
            >
              <span
                className={`material-symbols-outlined text-[20px] flex-shrink-0 transition-all duration-200
                  ${isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'}
                `}
                style={{
                  fontVariationSettings: isActive
                    ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24"
                    : "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
                }}
              >
                {icon}
              </span>
              {!collapsed && (
                <span className="font-medium text-sm leading-none">{label}</span>
              )}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom section */}
      <div className={`mt-auto px-2 pt-3 border-t border-outline-variant/20 space-y-0.5`}>
        {process.env.NODE_ENV === 'development' && (
          <Link
            href="/debug"
            title={collapsed ? 'Database Inspector' : undefined}
            className={`
              group flex items-center gap-3 rounded-xl transition-all duration-200 select-none
              text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high
              ${pathname.startsWith('/debug') ? 'bg-primary/10 text-primary' : ''}
              ${collapsed ? 'px-0 py-3 justify-center' : 'px-3 py-2.5'}
            `}
          >
            <span className="material-symbols-outlined text-[20px] flex-shrink-0">bug_report</span>
            {!collapsed && <span className="text-sm font-medium">Debug</span>}
          </Link>
        )}
         <Link
  href="/support"
  onClick={onClose}
  title={collapsed ? 'Support' : undefined}
  className={`
    group flex items-center gap-3 rounded-xl transition-all duration-200 select-none
    text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high
    ${pathname.startsWith('/support') ? 'bg-primary/10 text-primary' : ''}
    ${collapsed ? 'px-0 py-3 justify-center' : 'px-3 py-2.5'}
  `}
>
  <span className="material-symbols-outlined text-[20px] flex-shrink-0">
    help_outline
  </span>
  {!collapsed && <span className="text-sm font-medium">Support</span>}
</Link>
      </div>
    </nav>
  );
}

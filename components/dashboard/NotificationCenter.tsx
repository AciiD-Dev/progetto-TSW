'use client';

import React, { useEffect, useState, useRef } from 'react';

interface Notification {
  id: number;
  type: 'alert' | 'mode_change' | 'system';
  title: string;
  message: string;
  is_read: number;
  created_at: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => n.is_read === 0).length;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 4000); // Poll every 4s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'all', is_read: true })
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (e) {
      console.error(e);
    }
  };

  const clearAll = async () => {
    try {
      await fetch('/api/notifications', { method: 'DELETE' });
      setNotifications([]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-background animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-[480px] bg-surface-container-high border border-outline-variant/20 rounded-2xl shadow-2xl z-[100] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-outline-variant/10 flex items-center justify-between">
            <h3 className="font-bold text-sm text-on-surface">Notifications</h3>
            <div className="flex gap-2">
              <button 
                onClick={markAllAsRead}
                className="text-[10px] uppercase font-bold text-primary hover:text-primary/80 transition-colors"
              >
                Mark all read
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[100px]">
            {loading && notifications.length === 0 ? (
              <div className="p-8 flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-on-surface-variant/40">progress_activity</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center gap-2 opacity-40">
                <span className="material-symbols-outlined text-4xl">notifications_off</span>
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/5">
                {notifications.map(n => (
                  <div key={n.id} className={`p-4 hover:bg-surface-container-highest transition-colors ${n.is_read === 0 ? 'bg-primary/5' : ''}`}>
                    <div className="flex gap-3">
                      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        n.type === 'alert' ? 'bg-error/10 text-error' : 
                        n.type === 'mode_change' ? 'bg-secondary/10 text-secondary' : 
                        'bg-primary/10 text-primary'
                      }`}>
                        <span className="material-symbols-outlined text-[18px]">
                          {n.type === 'alert' ? 'warning' : n.type === 'mode_change' ? 'settings_suggest' : 'info'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-bold truncate ${n.is_read === 0 ? 'text-on-surface' : 'text-on-surface-variant'}`}>{n.title}</p>
                          <span className="text-[10px] text-on-surface-variant/40 whitespace-nowrap">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-outline-variant/10 flex justify-center">
              <button 
                onClick={clearAll}
                className="text-[10px] uppercase font-bold text-on-surface-variant/40 hover:text-error transition-colors"
              >
                Clear History
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

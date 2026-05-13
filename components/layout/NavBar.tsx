"use client";

import Link from 'next/link';
import React, { useState } from 'react';

export interface NavBarProps {
  className?: string;
}

export default function NavBar({ className = '' }: NavBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={`fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10 ${className}`}>
      <div className="flex justify-between items-center w-full px-6 md:px-12 py-5 max-w-[1920px] mx-auto">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 primary-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
            <span
              className="material-symbols-outlined text-background text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              home
            </span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-on-surface headline-font">
            HomeHub
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          <Link href="/" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm">Dashboard</Link>
          <Link href="/rooms" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm">Rooms</Link>
          <Link href="/pricing" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm">Pricing</Link>
          <Link href="/support" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm">Support</Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden text-on-surface p-2 hover:bg-surface-container rounded-xl active:scale-95 transition-transform"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="material-symbols-outlined">{isOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Drawer (Dropdown) */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-surface-container border-b border-outline-variant/10 shadow-2xl flex flex-col py-8 px-6 gap-8 font-['Inter'] animate-fade-in-up">
          <div className="flex flex-col gap-5">
            <Link href="/" onClick={() => setIsOpen(false)} className="text-on-surface font-semibold text-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">dashboard</span>
              Dashboard
            </Link>
            <Link href="/rooms" onClick={() => setIsOpen(false)} className="text-on-surface font-semibold text-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">meeting_room</span>
              Rooms
            </Link>
            <Link href="/pricing" onClick={() => setIsOpen(false)} className="text-on-surface font-semibold text-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">payments</span>
              Pricing
            </Link>
            <Link href="/support" onClick={() => setIsOpen(false)} className="text-on-surface font-semibold text-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">help</span>
              Support
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}



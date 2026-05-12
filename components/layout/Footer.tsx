import Link from 'next/link';
import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full py-16 bg-surface-container-low border-t border-outline-variant/10 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-start px-8 md:px-12 max-w-7xl mx-auto gap-12">
        <div className="flex flex-col gap-4 max-w-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 primary-gradient rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-background text-[14px]">home</span>
            </div>
            <span className="text-xl font-bold text-on-surface headline-font">HomeHub</span>
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            The intelligent platform to manage your home with simplicity, security, and energy efficiency.
          </p>
          <p className="text-on-surface-variant/60 text-[11px] font-medium mt-2 uppercase tracking-wider">
            © 2026 HomeHub Global. All rights reserved.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 md:gap-20">
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface/40">Product</h4>
            <Link href="/" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Dashboard</Link>
            <Link href="/rooms" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Rooms</Link>
            <Link href="/pricing" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Pricing</Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface/40">Legal</h4>
            <Link href="/privacy" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Terms</Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface/40">Support</h4>
            <Link href="/support" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Help Center</Link>
            <Link href="/status" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Service Status</Link>
          </div>
        </div>

        <div className="flex gap-3">
          <a href="#" className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container border border-outline-variant/10 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all">
            <span className="material-symbols-outlined text-[20px]">alternate_email</span>
          </a>
          <a href="#" className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container border border-outline-variant/10 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all">
            <span className="material-symbols-outlined text-[20px]">share</span>
          </a>
        </div>
      </div>
    </footer>
  );
}



"use client";

import Link from 'next/link';
import React, { useState } from 'react';

export interface NavBarProps {
  className?: string;
}

export default function NavBar({ className = '' }: NavBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={`fixed top-0 w-full z-50 bg-[#0b0e14]/80 backdrop-blur-xl bg-gradient-to-b from-[#10131a] to-transparent shadow-[0px_12px_32px_rgba(109,221,255,0.08)] ${className}`}>
      <div className="flex justify-between items-center w-full px-6 md:px-8 py-4 max-w-[1920px] mx-auto">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-[#6dddff] font-['Space_Grotesk'] shrink-0">
          Neural Canvas
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/editor" className="text-slate-400 font-medium hover:text-[#6dddff] transition-colors">Editor Engine</Link>
          <Link href="/docs" className="text-slate-400 font-medium hover:text-[#6dddff] transition-colors">Docs</Link>
          <Link href="/community" className="text-slate-400 font-medium hover:text-[#6dddff] transition-colors">Community</Link>
          <Link href="/pricing" className="text-slate-400 font-medium hover:text-[#6dddff] transition-colors">Pricing</Link>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-slate-400 font-medium hover:text-[#6dddff] transition-colors scale-95 active:scale-90 transition-transform px-4 py-2 block">Login</Link>
          <Link href="/register" className="ethereal-gradient text-[#0b0e14] font-bold px-6 py-2.5 rounded-lg scale-95 active:scale-90 transition-transform block">Sign Up</Link>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          className="md:hidden text-slate-300 p-2 hover:bg-white/5 rounded-lg active:scale-95 transition-transform" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="material-symbols-outlined">{isOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Drawer (Dropdown) */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#0b0e14] border-b border-outline-variant/10 shadow-2xl flex flex-col py-6 px-6 gap-6 font-['Inter'] animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-4">
            <Link href="/" onClick={() => setIsOpen(false)} className="text-slate-300 font-medium p-2 active:bg-white/5 rounded-lg block">Home</Link>
            <Link href="/editor" onClick={() => setIsOpen(false)} className="text-slate-300 font-medium p-2 active:bg-white/5 rounded-lg block">Sequence Editor</Link>
            <Link href="/docs" onClick={() => setIsOpen(false)} className="text-slate-300 font-medium p-2 active:bg-white/5 rounded-lg block">Documentation</Link>
            <Link href="/pricing" onClick={() => setIsOpen(false)} className="text-slate-300 font-medium p-2 active:bg-white/5 rounded-lg block">Pricing Framework</Link>
          </div>
          
          <div className="w-full h-px bg-outline-variant/10" />
          
          <div className="flex flex-col gap-4">
            <Link href="/login" onClick={() => setIsOpen(false)} className="text-slate-300 font-medium p-3 text-center border border-outline-variant/20 rounded-lg active:bg-white/5 transition-colors block">
              Login to Vault
            </Link>
            <Link href="/register" onClick={() => setIsOpen(false)} className="ethereal-gradient text-[#0b0e14] font-bold p-3 text-center rounded-lg active:brightness-90 transition-all block">
              Sign Up via Protocol
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

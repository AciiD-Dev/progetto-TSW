"use client";

import React, { useState } from 'react';
import SequenceEditor from '@/components/editor/SequenceEditor';
import PropertiesPanel from '@/components/editor/PropertiesPanel';
import { EditorProvider } from '@/components/editor/EditorContext';
import { SequenceStep } from '@/types';
import Link from 'next/link';

const INITIAL_SEQUENCE: SequenceStep[] = [
  {
    id: 'step-1',
    type: 'trigger',
    icon: 'sensors',
    title: 'IOT SENSOR TRIGGER',
    badge: 'Live',
    description: 'IF **Living Room Sensor** Temperature is greater than **24°C**',
  },
  {
    id: 'step-2',
    type: 'ai',
    icon: 'psychology',
    title: 'AI ANALYSIS',
    badge: 'Neural',
    description: 'ANALYZE **Energy Efficiency Profile** and determine optimal Cooling setpoint',
  },
  {
    id: 'step-3',
    type: 'action',
    icon: 'ac_unit',
    title: 'IOT ACTION',
    description: 'SET **Main HVAC** to COOL mode at **22°C**',
  },
  {
    id: 'step-4',
    type: 'notification',
    icon: 'notifications_active',
    title: 'COMMUNICATION',
    description: 'SEND "Optimized cooling active" to Admin Mobile',
  }
];

export default function EditorPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <EditorProvider initialSteps={INITIAL_SEQUENCE}>
      <div className="bg-background text-on-background overflow-hidden h-screen flex flex-col font-['Inter']">
        
        {/* TopNavBar per l'Editor */}
        <header className="fixed top-0 w-full z-50 bg-[#0b0e14]/80 backdrop-blur-xl border-b border-[#45484f]/15 shadow-[0px_12px_32px_rgba(109,221,255,0.08)] flex items-center justify-between px-4 lg:px-6 h-16">
          <div className="flex items-center gap-4 lg:gap-8">
            <button 
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-slate-300"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            
            <span className="text-xl font-bold text-transparent bg-clip-text ethereal-gradient headline-font tracking-tight">
              Neural Canvas
            </span>
            <nav className="hidden lg:flex items-center gap-6">
              <Link className="text-[#00D4FF] border-b-2 border-[#00D4FF] pb-1 font-['Space_Grotesk'] tracking-tight" href="/editor">Editor</Link>
              <Link className="text-slate-400 hover:text-slate-200 transition-colors font-['Space_Grotesk'] tracking-tight" href="#">Library</Link>
              <Link className="text-slate-400 hover:text-slate-200 transition-colors font-['Space_Grotesk'] tracking-tight" href="/docs">Docs</Link>
              <Link className="text-slate-400 hover:text-slate-200 transition-colors font-['Space_Grotesk'] tracking-tight" href="/pricing">Pricing</Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="hidden lg:flex bg-surface-container-highest rounded-full px-4 py-1.5 items-center gap-2 border border-outline-variant/10">
              <span className="material-symbols-outlined text-primary text-sm">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm w-48 text-on-surface outline-none" placeholder="Search commands..." type="text" />
            </div>
            <button className="hidden lg:block p-2 hover:bg-white/5 rounded-full transition-all duration-200 active:scale-95">
              <span className="material-symbols-outlined text-slate-400">notifications</span>
            </button>
            <button className="hidden lg:block p-2 hover:bg-white/5 rounded-full transition-all duration-200 active:scale-95">
              <span className="material-symbols-outlined text-slate-400">settings</span>
            </button>
            <img alt="User Profile Avatar" className="w-8 h-8 rounded-full border border-primary/20 shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGnHMSiKAatvFTMoUDand-h1pAiPEFX5GG9Z1n9FYufO8YyQYVOxoEVryu9xClyLMrC8wXswjATp_dVr8TVK6TkPtzdpu3MMMZQ2K-ZvVdsgDgfwBdDmZelDuWIxnYinXomv1jyj133OnDEHaKeII94ESsv1xZkdpJE5iGEECyauYBRtAC-JIdXMw1mLEHkz6fx02JKVx0vh27UsjvARj0jpldwiAjSarLuwRZPVGutWQKtq-_Po9E71RSgzewiIbLYpTIxcLSqUxV" />
          </div>
        </header>

        {/* Mobile App Drawer (Overlay & Menu) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#10131a] flex flex-col py-6 font-['Inter'] shadow-2xl overflow-y-auto">
              <div className="flex justify-between items-center px-6 mb-8">
                <span className="text-xl font-bold text-transparent bg-clip-text ethereal-gradient headline-font tracking-tight">
                  Neural Canvas
                </span>
                <button className="text-slate-400 p-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="px-6 mb-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Menu Globale</h3>
                <div className="space-y-2">
                  <Link href="/editor" className="block text-[#00D4FF] font-medium py-2">Editor (Active)</Link>
                  <Link href="/" className="block text-slate-300 hover:text-white py-2">Home (Landing)</Link>
                  <Link href="/pricing" className="block text-slate-300 hover:text-white py-2">Pricing</Link>
                  <Link href="/login" className="block text-slate-300 hover:text-white py-2">Login Vault</Link>
                </div>
              </div>

              <div className="w-full h-px bg-outline-variant/10 my-4"></div>

              <div className="px-6 mb-4">
                <h3 className="text-[#00D4FF] font-semibold text-xs uppercase tracking-widest opacity-70 mb-3">Libreria Nodi</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-3 py-3 text-[#6dddff]">
                    <span className="material-symbols-outlined text-lg">bolt</span>
                    <span className="font-medium">Triggers</span>
                  </div>
                  <div className="flex items-center gap-3 py-3 text-slate-300">
                    <span className="material-symbols-outlined text-lg">psychology</span>
                    <span className="font-medium">AI Agents</span>
                  </div>
                  <div className="flex items-center gap-3 py-3 text-slate-300">
                    <span className="material-symbols-outlined text-lg">sensors</span>
                    <span className="font-medium">IoT Nodes</span>
                  </div>
                  <div className="flex items-center gap-3 py-3 text-slate-300">
                    <span className="material-symbols-outlined text-lg">account_tree</span>
                    <span className="font-medium">Logic</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto px-6 pb-6 pt-8">
                <button className="w-full py-3 px-4 rounded-lg bg-surface-container-highest border border-outline-variant/20 text-primary text-sm font-medium flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">add</span> New Custom Node
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-1 pt-16 h-full overflow-hidden">
          {/* SideNavBar (Library) - Desktop Only */}
          <aside className="hidden lg:flex fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-[#10131a] flex-col py-4 font-['Inter'] text-sm antialiased border-r border-outline-variant/5 z-40">
            <div className="px-6 mb-6">
              <h2 className="text-[#00D4FF] font-semibold text-xs uppercase tracking-widest opacity-70">Library</h2>
              <p className="text-slate-500 text-[10px] mt-1">v2.4 Ethereal</p>
            </div>
            <div className="flex-1 overflow-y-auto px-2 space-y-1">
              <div className="group flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#6dddff]/10 to-transparent text-[#6dddff] border-l-4 border-[#00D4FF] cursor-pointer select-none">
                <span className="material-symbols-outlined text-lg">bolt</span>
                <span className="font-medium">Triggers</span>
              </div>
              <div className="group flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-300 hover:bg-[#161a21] transition-colors cursor-pointer select-none">
                <span className="material-symbols-outlined text-lg">psychology</span>
                <span className="font-medium">AI Agents</span>
              </div>
              <div className="group flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-300 hover:bg-[#161a21] transition-colors cursor-pointer select-none">
                <span className="material-symbols-outlined text-lg">sensors</span>
                <span className="font-medium">IoT Nodes</span>
              </div>
              <div className="group flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-300 hover:bg-[#161a21] transition-colors cursor-pointer select-none">
                <span className="material-symbols-outlined text-lg">account_tree</span>
                <span className="font-medium">Logic</span>
              </div>
              <div className="pt-8 px-4">
                <button className="w-full py-2 px-4 rounded-lg bg-surface-container-highest border border-outline-variant/20 text-primary text-xs font-medium hover:bg-surface-bright transition-all active:scale-95 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add Custom Node
                </button>
              </div>
            </div>
            <div className="mt-auto px-2 space-y-1 pb-4">
              <div className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-300 hover:bg-[#161a21] transition-colors cursor-pointer select-none">
                <span className="material-symbols-outlined text-lg">menu_book</span>
                <span>Documentation</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-300 hover:bg-[#161a21] transition-colors cursor-pointer select-none">
                <span className="material-symbols-outlined text-lg">contact_support</span>
                <span>Support</span>
              </div>
            </div>
          </aside>

          {/* Main Workspace (Sequence Editor Component) */}
          <div className="flex-1 w-full lg:w-auto lg:ml-64 lg:mr-[340px] relative h-full">
            <SequenceEditor />
          </div>

          <PropertiesPanel />
        </div>

        {/* Background Decoration */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full"></div>
          <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] bg-secondary/5 blur-[120px] rounded-full"></div>
        </div>
      </div>
    </EditorProvider>
  );
}

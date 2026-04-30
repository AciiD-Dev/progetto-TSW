import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import React from 'react';

export default function PricingPage() {
  return (
    <div className="bg-background text-on-background selection:bg-primary/30 min-h-screen font-['Inter']">
      <NavBar />
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h1 className="headline-font text-4xl md:text-6xl font-bold tracking-tight text-on-background">
            Elevate Your <span className="text-primary">Logic Architecture</span>
          </h1>
          <p className="font-body text-on-surface-variant max-w-2xl mx-auto text-lg leading-relaxed">
            Choose the engine that powers your next breakthrough. From individual experiments to industrial-grade
            deployments.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          <div className="flex flex-col p-8 rounded-xl bg-surface-container-low border border-outline-variant/15 transition-all duration-300 hover:bg-surface-container">
            <div className="mb-8">
              <h3 className="headline-font text-xl font-bold text-on-surface mb-2">Free (Guest)</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold headline-font">$0</span>
                <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">/forever</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-start gap-3 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                Public Node Library Access
              </li>
              <li className="flex items-start gap-3 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                Standard IoT Connectors
              </li>
              <li className="flex items-start gap-3 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                Community Forum Support
              </li>
              <li className="flex items-start gap-3 text-on-surface-variant/40 text-sm">
                <span className="material-symbols-outlined text-sm mt-0.5">cancel</span>
                Project Saving
              </li>
            </ul>
            <button className="w-full py-3 px-4 rounded-lg border border-outline-variant/30 text-on-surface font-semibold hover:bg-surface-container-highest transition-colors">
              Start Designing
            </button>
          </div>

          <div className="relative flex flex-col p-8 rounded-xl glass-panel border border-primary/30 shadow-[0px_0px_40px_rgba(109,221,255,0.15)] transform md:scale-105 z-10 overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary px-4 py-1 text-[#0b0e14] text-[0.625rem] font-bold tracking-widest uppercase rounded-bl-lg">
              Best Value
            </div>
            <div className="mb-8">
              <h3 className="headline-font text-xl font-bold text-primary mb-2">Pro</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold headline-font text-on-background">$19</span>
                <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">/mo</span>
              </div>
              <p className="text-xs text-primary/80 mt-2 font-medium">Billed annually</p>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-start gap-3 text-on-surface text-sm font-medium">
                <span className="material-symbols-outlined text-primary text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Project Saving &amp; History
              </li>
              <li className="flex items-start gap-3 text-on-surface text-sm font-medium">
                <span className="material-symbols-outlined text-primary text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Advanced Logic Nodes
              </li>
              <li className="flex items-start gap-3 text-on-surface text-sm font-medium">
                <span className="material-symbols-outlined text-primary text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                24/7 Priority Support
              </li>
              <li className="flex items-start gap-3 text-on-surface text-sm font-medium">
                <span className="material-symbols-outlined text-primary text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Unlimited Data Flow Streams
              </li>
              <li className="flex items-start gap-3 text-on-surface text-sm font-medium">
                <span className="material-symbols-outlined text-primary text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Custom API Integrations
              </li>
            </ul>
            <button className="w-full py-4 px-4 rounded-lg ethereal-gradient text-[#0b0e14] font-bold text-lg shadow-[0px_12px_32px_rgba(109,221,255,0.2)] hover:brightness-110 transition-all scale-95 active:scale-90">
              Choose Plan
            </button>
          </div>

          <div className="flex flex-col p-8 rounded-xl bg-surface-container-low border border-outline-variant/15 transition-all duration-300 hover:bg-surface-container">
            <div className="mb-8">
              <h3 className="headline-font text-xl font-bold text-on-surface mb-2">Enterprise</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold headline-font">Custom</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-start gap-3 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-secondary text-sm mt-0.5">verified</span>
                On-Premise Deployment
              </li>
              <li className="flex items-start gap-3 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-secondary text-sm mt-0.5">verified</span>
                Custom Node Development
              </li>
              <li className="flex items-start gap-3 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-secondary text-sm mt-0.5">verified</span>
                SLA &amp; Dedicated Account Manager
              </li>
              <li className="flex items-start gap-3 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-secondary text-sm mt-0.5">verified</span>
                SSO &amp; Advanced Security
              </li>
            </ul>
            <button className="w-full py-3 px-4 rounded-lg border border-secondary/30 text-secondary font-semibold hover:bg-secondary/5 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 p-8 rounded-2xl bg-surface-container-low border border-outline-variant/10 overflow-hidden relative">
            <h4 className="headline-font text-2xl font-bold mb-4">Precision Orchestration</h4>
            <p className="text-on-surface-variant text-sm max-w-xs">Our advanced node engine handles millions of concurrent data streams with zero latency overhead.</p>
            <div className="absolute -right-10 -bottom-10 opacity-20">
              <span className="material-symbols-outlined text-[180px] text-primary" style={{ fontVariationSettings: "'wght' 100" }}>account_tree</span>
            </div>
          </div>
          <div className="p-8 rounded-2xl bg-gradient-to-br from-surface-container-high to-surface-container border border-outline-variant/10">
            <span className="material-symbols-outlined text-primary mb-4">memory</span>
            <h4 className="headline-font text-lg font-bold">Edge AI</h4>
            <p className="text-on-surface-variant text-xs mt-2">Deploy models directly to IoT hardware with one-click export.</p>
          </div>
          <div className="p-8 rounded-2xl bg-gradient-to-br from-surface-container-high to-surface-container border border-outline-variant/10">
            <span className="material-symbols-outlined text-secondary mb-4">security</span>
            <h4 className="headline-font text-lg font-bold">Encrypted</h4>
            <p className="text-on-surface-variant text-xs mt-2">End-to-end encryption for all logic pipelines and data flows.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

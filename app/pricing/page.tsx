import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import React from 'react';

export default function PricingPage() {
  return (
    <div className="bg-background text-on-surface selection:bg-primary/30 min-h-screen font-['Inter'] flex flex-col">
      <NavBar />
      
      <main className="flex-grow pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16 space-y-4 animate-fade-in-up">
          <h1 className="headline-font text-4xl md:text-6xl font-bold tracking-tight text-on-surface">
            The Right Plan for Your <span className="text-primary">Smart Home</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-lg leading-relaxed">
            From single apartments to multi-story villas, HomeHub scales with your needs. 
            Automate your life with precision and style.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
          {/* Basic Plan */}
          <div className="flex flex-col p-8 rounded-[2rem] bg-surface-container border border-outline-variant/20 transition-all duration-300 hover:border-primary/30">
            <div className="mb-8">
              <h3 className="headline-font text-xl font-bold text-on-surface mb-2">Essential</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold headline-font text-on-surface">$0</span>
                <span className="text-on-surface-variant text-xs uppercase font-bold tracking-widest">/forever</span>
              </div>
              <p className="text-sm text-on-surface-variant mt-3">Perfect for getting started with smart home basics.</p>
            </div>
            
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                Up to 5 Smart Devices
              </li>
              <li className="flex items-center gap-3 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                2 Rooms Management
              </li>
              <li className="flex items-center gap-3 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                Live Dashboard Control
              </li>
              <li className="flex items-center gap-3 text-on-surface-variant/40 text-sm">
                <span className="material-symbols-outlined text-[20px]">cancel</span>
                Historical Data Trends
              </li>
            </ul>
            
            <Link
              href="/register"
              className="w-full py-4 px-4 rounded-2xl bg-surface-container-highest text-on-surface font-bold hover:bg-outline-variant/20 transition-all text-center"
            >
              Get Started
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="relative flex flex-col p-8 rounded-[2.5rem] bg-surface-container border-2 border-primary/40 shadow-2xl shadow-primary/10 transform md:scale-105 z-10 overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary px-5 py-1.5 text-background text-[0.65rem] font-bold tracking-widest uppercase rounded-bl-2xl">
              Recommended
            </div>
            
            <div className="mb-8">
              <h3 className="headline-font text-xl font-bold text-primary mb-2">Home Pro</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold headline-font text-on-surface">$9</span>
                <span className="text-on-surface-variant text-xs uppercase font-bold tracking-widest">/mo</span>
              </div>
              <p className="text-sm text-primary font-medium mt-3">Full control and advanced automation.</p>
            </div>
            
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-on-surface text-sm font-medium">
                <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Unlimited Devices & Rooms
              </li>
              <li className="flex items-center gap-3 text-on-surface text-sm font-medium">
                <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                30-Day Sensor History
              </li>
              <li className="flex items-center gap-3 text-on-surface text-sm font-medium">
                <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Advanced Custom Automations
              </li>
              <li className="flex items-center gap-3 text-on-surface text-sm font-medium">
                <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Smart Alerts & Notifications
              </li>
              <li className="flex items-center gap-3 text-on-surface text-sm font-medium">
                <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Priority Support Access
              </li>
            </ul>
            
            <Link
              href="/register"
              className="w-full py-4 px-4 rounded-2xl primary-gradient text-white font-bold text-lg shadow-lg shadow-primary/25 hover:brightness-110 transition-all text-center"
            >
              Upgrade Now
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="flex flex-col p-8 rounded-[2rem] bg-surface-container border border-outline-variant/20 transition-all duration-300 hover:border-secondary/30">
            <div className="mb-8">
              <h3 className="headline-font text-xl font-bold text-on-surface mb-2">Infinite</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold headline-font text-on-surface">$19</span>
                <span className="text-on-surface-variant text-xs uppercase font-bold tracking-widest">/mo</span>
              </div>
              <p className="text-sm text-on-surface-variant mt-3">For tech enthusiasts and luxury homes.</p>
            </div>
            
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-secondary text-[20px]">auto_awesome</span>
                Multi-Home Management
              </li>
              <li className="flex items-center gap-3 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-secondary text-[20px]">auto_awesome</span>
                Infinite Data Retention
              </li>
              <li className="flex items-center gap-3 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-secondary text-[20px]">auto_awesome</span>
                API Access for Integrations
              </li>
              <li className="flex items-center gap-3 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-secondary text-[20px]">auto_awesome</span>
                Dedicated Personal Assistant
              </li>
            </ul>
            
            <Link
              href="/register"
              className="w-full py-4 px-4 rounded-2xl border-2 border-secondary/20 text-on-surface font-bold hover:bg-secondary/10 transition-all text-center"
            >
              Go Infinite
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/10">
            <span className="material-symbols-outlined text-primary mb-3">speed</span>
            <h4 className="font-bold mb-1">Zero Latency</h4>
            <p className="text-xs text-on-surface-variant">Real-time updates every 3 seconds for instant response.</p>
          </div>
          <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/10">
            <span className="material-symbols-outlined text-secondary mb-3">security</span>
            <h4 className="font-bold mb-1">Privacy First</h4>
            <p className="text-xs text-on-surface-variant">All your home data is encrypted and stays yours.</p>
          </div>
          <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/10">
            <span className="material-symbols-outlined text-tertiary mb-3">eco</span>
            <h4 className="font-bold mb-1">Energy Saving</h4>
            <p className="text-xs text-on-surface-variant">Intelligent algorithms to reduce your home consumption.</p>
          </div>
          <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/10">
            <span className="material-symbols-outlined text-warning mb-3">phonelink</span>
            <h4 className="font-bold mb-1">Universal</h4>
            <p className="text-xs text-on-surface-variant">Compatible with over 200+ smart device brands.</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}


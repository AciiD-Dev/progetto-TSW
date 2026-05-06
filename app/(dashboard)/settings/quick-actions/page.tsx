'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/ToastProvider';

// Default configuration for quick actions
const DEFAULT_CONFIG = {
  night_mode: {
    thermostatTemp: 19,
    blindsClosed: true,
    turnOffLights: true,
  },
  away_mode: {
    thermostatTemp: 16,
    blindsClosed: true,
    turnOffLights: true,
    turnOffPlugs: true,
  },
  eco_mode: {
    thermostatTemp: 20,
  }
};

export default function QuickActionsSettingsPage() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const toast = useToast();

  useEffect(() => {
    // Load config from localStorage
    const saved = localStorage.getItem('homehub-quick-actions');
    if (saved) {
      try {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(saved) });
      } catch (err) {
        console.error('Failed to parse quick actions config', err);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('homehub-quick-actions', JSON.stringify(config));
    toast.success('Quick actions configuration saved');
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.setItem('homehub-quick-actions', JSON.stringify(DEFAULT_CONFIG));
    toast.success('Reset to defaults');
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/settings" className="text-primary hover:underline text-sm mb-2 inline-block">&larr; Back to Settings</Link>
          <h1 className="headline-font text-2xl font-bold text-on-surface">Quick Actions Config</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Customize the behavior of dashboard quick action buttons</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="px-4 py-2 rounded-xl border border-outline-variant/30 text-on-surface hover:bg-surface-container-highest transition-colors text-sm font-medium">
            Reset
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-colors text-sm">
            Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Night Mode Config */}
        <section className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20">
          <h2 className="headline-font text-xl font-bold text-secondary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">bedtime</span>
            Night Mode
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-on-surface">Turn off all lights</p>
                <p className="text-sm text-on-surface-variant/70">Automatically turn off all active lights.</p>
              </div>
              <button
                onClick={() => setConfig(c => ({ ...c, night_mode: { ...c.night_mode, turnOffLights: !c.night_mode.turnOffLights } }))}
                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${config.night_mode.turnOffLights ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <span className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow transition-all duration-300 ${config.night_mode.turnOffLights ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
              <div>
                <p className="font-medium text-on-surface">Close all blinds</p>
                <p className="text-sm text-on-surface-variant/70">Set blinds to 0%.</p>
              </div>
              <button
                onClick={() => setConfig(c => ({ ...c, night_mode: { ...c.night_mode, blindsClosed: !c.night_mode.blindsClosed } }))}
                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${config.night_mode.blindsClosed ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <span className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow transition-all duration-300 ${config.night_mode.blindsClosed ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
              <div>
                <p className="font-medium text-on-surface">Thermostat Temperature</p>
                <p className="text-sm text-on-surface-variant/70">Target temperature for all thermostats.</p>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={config.night_mode.thermostatTemp} 
                  onChange={e => setConfig(c => ({ ...c, night_mode: { ...c.night_mode, thermostatTemp: parseFloat(e.target.value) || 19 } }))}
                  className="w-20 bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3 py-1.5 text-sm text-center text-on-surface"
                />
                <span className="text-on-surface-variant">°C</span>
              </div>
            </div>
          </div>
        </section>

        {/* Away Mode Config */}
        <section className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20">
          <h2 className="headline-font text-xl font-bold text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">directions_walk</span>
            Away Mode
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-on-surface">Turn off all lights</p>
                <p className="text-sm text-on-surface-variant/70">Automatically turn off all active lights.</p>
              </div>
              <button
                onClick={() => setConfig(c => ({ ...c, away_mode: { ...c.away_mode, turnOffLights: !c.away_mode.turnOffLights } }))}
                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${config.away_mode.turnOffLights ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <span className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow transition-all duration-300 ${config.away_mode.turnOffLights ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
              <div>
                <p className="font-medium text-on-surface">Turn off all smart plugs</p>
                <p className="text-sm text-on-surface-variant/70">Automatically turn off active plugs.</p>
              </div>
              <button
                onClick={() => setConfig(c => ({ ...c, away_mode: { ...c.away_mode, turnOffPlugs: !c.away_mode.turnOffPlugs } }))}
                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${config.away_mode.turnOffPlugs ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <span className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow transition-all duration-300 ${config.away_mode.turnOffPlugs ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
              <div>
                <p className="font-medium text-on-surface">Close all blinds</p>
                <p className="text-sm text-on-surface-variant/70">Set blinds to 0%.</p>
              </div>
              <button
                onClick={() => setConfig(c => ({ ...c, away_mode: { ...c.away_mode, blindsClosed: !c.away_mode.blindsClosed } }))}
                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${config.away_mode.blindsClosed ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <span className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow transition-all duration-300 ${config.away_mode.blindsClosed ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
              <div>
                <p className="font-medium text-on-surface">Maintenance Temperature</p>
                <p className="text-sm text-on-surface-variant/70">Target temperature while away.</p>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={config.away_mode.thermostatTemp} 
                  onChange={e => setConfig(c => ({ ...c, away_mode: { ...c.away_mode, thermostatTemp: parseFloat(e.target.value) || 16 } }))}
                  className="w-20 bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3 py-1.5 text-sm text-center text-on-surface"
                />
                <span className="text-on-surface-variant">°C</span>
              </div>
            </div>
          </div>
        </section>

        {/* Eco Mode Config */}
        <section className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20">
          <h2 className="headline-font text-xl font-bold text-tertiary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">eco</span>
            Eco Mode
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-on-surface">Eco Temperature</p>
                <p className="text-sm text-on-surface-variant/70">Target temperature to optimize energy consumption.</p>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={config.eco_mode.thermostatTemp} 
                  onChange={e => setConfig(c => ({ ...c, eco_mode: { ...c.eco_mode, thermostatTemp: parseFloat(e.target.value) || 20 } }))}
                  className="w-20 bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3 py-1.5 text-sm text-center text-on-surface"
                />
                <span className="text-on-surface-variant">°C</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Device } from '@/types';

interface DevicePanelProps {
  device: Device | null;
  liveValue?: number;
  onClose: () => void;
  onToggle: (device: Device, newStatus: number) => void;
  onSliderChange: (device: Device, newValue: number) => void;
  onDelete: (device: Device) => void;
}

const typeColorMap: Record<string, { bg: string; text: string; icon: string }> = {
  light:      { bg: 'bg-primary/10',   text: 'text-primary',   icon: 'lightbulb'    },
  thermostat: { bg: 'bg-secondary/10', text: 'text-secondary', icon: 'thermostat'   },
  humidity:   { bg: 'bg-tertiary/10',  text: 'text-tertiary',  icon: 'water_drop'   },
  blinds:     { bg: 'bg-slate-500/10', text: 'text-slate-400', icon: 'blinds_closed'},
};

export default function DevicePanel({
  device,
  liveValue,
  onClose,
  onToggle,
  onSliderChange,
  onDelete,
}: DevicePanelProps) {
  if (!device) {
    return (
      <aside className="hidden lg:flex fixed right-4 top-24 h-[calc(100vh-112px)] w-80 glass-panel border border-outline-variant/20 rounded-2xl flex-col items-center justify-center p-6 z-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] opacity-80">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-4 block">touch_app</span>
        <p className="text-sm font-medium text-on-surface-variant text-center">
          Select a device to view and control it
        </p>
      </aside>
    );
  }

  const theme = typeColorMap[device.type] ?? typeColorMap.light;
  const displayValue = liveValue ?? device.value;
  const isToggleable = device.type === 'light' || device.type === 'blinds';
  const isSlider     = device.type === 'thermostat';
  const isReadOnly   = device.type === 'humidity';

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />

      <aside className="fixed inset-x-4 bottom-4 top-auto max-h-[85vh] lg:bottom-auto lg:right-4 lg:inset-auto lg:top-24 lg:h-[calc(100vh-112px)] lg:w-80 glass-panel border border-outline-variant/20 rounded-2xl flex flex-col p-6 overflow-y-auto z-50 shadow-[0_8px_32px_rgba(0,0,0,0.6)] custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <h3 className="headline-font font-bold text-lg text-primary">Device Control</h3>
          <button
            onClick={onClose}
            className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-on-surface p-1 bg-white/5 rounded-full"
          >
            close
          </button>
        </div>

        <div className="space-y-6">
          {/* Device identity */}
          <section>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Selected Device</label>
            <div className="flex items-center gap-4 bg-surface-container p-3 rounded-lg border border-outline-variant/10">
              <div className={`w-10 h-10 rounded-lg ${theme.bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined ${theme.text}`}>{theme.icon}</span>
              </div>
              <div>
                <p className="font-bold text-on-surface text-sm">{device.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 capitalize">{device.type} · ID #{device.id}</p>
              </div>
            </div>
          </section>

          {/* Current value */}
          <section>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Current Reading</label>
            <div className="bg-surface-container-highest rounded-lg p-4 border border-outline-variant/10 text-center">
              <span className={`text-4xl font-bold tabular-nums ${theme.text}`}>
                {device.type === 'light' || device.type === 'blinds'
                  ? device.status === 1 ? 'ON' : 'OFF'
                  : displayValue.toFixed(1)}
              </span>
              {(device.type === 'thermostat') && (
                <span className="text-lg text-on-surface-variant ml-1">°C</span>
              )}
              {(device.type === 'humidity') && (
                <span className="text-lg text-on-surface-variant ml-1">%</span>
              )}
            </div>
          </section>

          {/* Toggle Switch (light / blinds) */}
          {isToggleable && (
            <section>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Power</label>
              <div className="flex items-center justify-between bg-surface-container p-4 rounded-lg border border-outline-variant/10">
                <span className="text-sm font-medium text-on-surface">
                  {device.status === 1 ? 'Device is ON' : 'Device is OFF'}
                </span>
                <button
                  id={`toggle-${device.id}`}
                  onClick={() => onToggle(device, device.status === 1 ? 0 : 1)}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    device.status === 1 ? 'bg-primary' : 'bg-surface-container-highest'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                      device.status === 1 ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </section>
          )}

          {/* Slider (thermostat) */}
          {isSlider && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Setpoint</label>
                <span className={`text-sm font-bold tabular-nums ${theme.text}`}>{device.value.toFixed(1)} °C</span>
              </div>
              <input
                id={`slider-${device.id}`}
                type="range"
                min={10}
                max={35}
                step={0.5}
                value={device.value}
                onChange={(e) => onSliderChange(device, parseFloat(e.target.value))}
                className="w-full accent-[#6dddff] h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>10°C</span>
                <span>35°C</span>
              </div>
            </section>
          )}

          {/* Read-only humidity */}
          {isReadOnly && (
            <section>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Info</label>
              <p className="text-xs text-on-surface-variant italic">
                Humidity sensors are read-only. Values are updated every 5 seconds via live polling.
              </p>
            </section>
          )}

          {/* Brightness slider for dimmable lights */}
          {device.type === 'light' && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Brightness</label>
                <span className="text-sm font-bold tabular-nums text-primary">{device.value}%</span>
              </div>
              <input
                id={`brightness-${device.id}`}
                type="range"
                min={0}
                max={100}
                step={5}
                value={device.value}
                onChange={(e) => onSliderChange(device, parseFloat(e.target.value))}
                className="w-full accent-[#6dddff] h-2 cursor-pointer"
              />
            </section>
          )}

          {/* Delete */}
          <div className="pt-4 border-t border-outline-variant/10">
            <button
              id={`delete-device-${device.id}`}
              onClick={() => onDelete(device)}
              className="w-full py-3 px-4 rounded-lg border border-outline-variant/20 text-error font-semibold text-sm hover:bg-error/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              Delete Device
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

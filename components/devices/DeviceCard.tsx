'use client';

import React, { useState, useEffect } from 'react';
import { Device } from '@/types';

interface DeviceCardProps {
  device: Device;
  liveValue?: number;
  onToggle: (device: Device, newStatus: number) => void;
  onSliderChange: (device: Device, newValue: number) => void;
  onDelete?: (device: Device) => void;
  compact?: boolean;
}

const typeConfig: Record<string, {
  icon: string;
  label: string;
  unit?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  hasSlider: boolean;
  sliderLabel?: string;
  sliderMin?: number;
  sliderMax?: number;
  readOnly?: boolean;
}> = {
  light: {
    icon: 'lightbulb',
    label: 'Light',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/25',
    hasSlider: true,
    sliderLabel: 'Brightness',
    sliderMin: 0,
    sliderMax: 100,
    unit: '%',
  },
  thermostat: {
    icon: 'thermostat',
    label: 'Thermostat',
    unit: '°C',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
    borderColor: 'border-secondary/25',
    hasSlider: true,
    sliderLabel: 'Setpoint',
    sliderMin: 10,
    sliderMax: 35,
  },
  humidity: {
    icon: 'water_drop',
    label: 'Humidity',
    unit: '%',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/25',
    hasSlider: true,
    sliderLabel: 'Target',
    sliderMin: 20,
    sliderMax: 80,
  },
  blinds: {
    icon: 'blinds',
    label: 'Blinds',
    unit: '%',
    color: 'text-on-surface-variant',
    bgColor: 'bg-surface-container-highest/50',
    borderColor: 'border-outline-variant/30',
    hasSlider: true,
    sliderLabel: 'Position',
    sliderMin: 0,
    sliderMax: 100,
  },
  plug: {
    icon: 'power',
    label: 'Smart Plug',
    unit: 'W',
    color: 'text-tertiary',
    bgColor: 'bg-tertiary/10',
    borderColor: 'border-tertiary/30',
    hasSlider: true,
    sliderLabel: 'Power',
    sliderMin: 0,
    sliderMax: 3000,
  },
};

export default function DeviceCard({
  device,
  liveValue,
  onToggle,
  onSliderChange,
  onDelete,
  compact = false,
}: DeviceCardProps) {
  const cfg     = typeConfig[device.type] ?? typeConfig.light;
  const isOn    = device.status === 1;
  const displayValue = liveValue ?? device.value;
  const [sliderLocal, setSliderLocal] = useState(device.value);

  // Sync local slider state when the parent updates device.value
  // (e.g. via quick actions like Away/Night/Eco mode)
  useEffect(() => {
    setSliderLocal(device.value);
  }, [device.value]);

  const handleToggle = () => {
    onToggle(device, isOn ? 0 : 1);
  };

  const handleSliderCommit = (val: number) => {
    onSliderChange(device, val);
  };

  if (compact) {
    return (
      <div
        className={`
          relative rounded-xl p-3 border transition-all duration-300 group
          ${isOn
            ? `${cfg.bgColor} ${cfg.borderColor}`
            : 'bg-surface-container border-outline-variant/20'
          }
        `}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isOn ? cfg.bgColor : 'bg-surface-container-high'}`}>
            <span
              className={`material-symbols-outlined text-[18px] ${isOn ? cfg.color : 'text-on-surface-variant/40'}`}
              style={{ fontVariationSettings: isOn ? "'FILL' 1" : "'FILL' 0" }}
            >
              {cfg.icon}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-on-surface truncate">{device.name}</p>
            <p className={`text-[10px] ${isOn ? cfg.color : 'text-on-surface-variant/50'}`}>
              {isOn
                ? cfg.readOnly
                  ? `${displayValue}${cfg.unit ?? ''}`
                  : 'On'
                : 'Off'
              }
            </p>
          </div>
          {!cfg.readOnly && (
            <button
              onClick={handleToggle}
              className={`
                w-8 h-4 rounded-full relative transition-all duration-300 flex-shrink-0
                ${isOn ? 'bg-active' : 'bg-outline-variant/40'}
              `}
            >
              <span
                className={`
                  absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-300
                  ${isOn ? 'left-[calc(100%-14px)]' : 'left-0.5'}
                `}
              />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        relative rounded-2xl p-4 border transition-all duration-300 group
        ${isOn
          ? `${cfg.bgColor} ${cfg.borderColor} ${isOn ? 'device-active-pulse' : ''}`
          : 'bg-surface-container border-outline-variant/20'
        }
        hover:border-opacity-60
      `}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300
            ${isOn ? cfg.bgColor : 'bg-surface-container-high'}
          `}
        >
          <span
            className={`material-symbols-outlined text-[22px] transition-all duration-300 ${isOn ? cfg.color : 'text-on-surface-variant/40'}`}
            style={{ fontVariationSettings: isOn ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300" }}
          >
            {cfg.icon}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface leading-tight truncate">{device.name}</p>
          <p className="text-xs text-on-surface-variant/60 mt-0.5">{cfg.label}</p>
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          {/* Delete button */}
          {onDelete && (
            <button
              onClick={() => onDelete(device)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-on-surface-variant/30 hover:text-error hover:bg-error/10 transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-error/50"
              title="Delete Device"
              aria-label="Delete device"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          )}

          {/* Toggle switch (not for read-only) */}
          {!cfg.readOnly && (
            <button
              onClick={handleToggle}
              className={`
                relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0
                ${isOn ? 'bg-active' : 'bg-outline-variant/40'}
              `}
              aria-label={isOn ? 'Turn off' : 'Turn on'}
            >
              <span
                className={`
                  absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300
                  ${isOn ? 'left-[calc(100%-18px)]' : 'left-0.5'}
                `}
              />
            </button>
          )}
        </div>
      </div>

      {/* Value display */}
      <div className="mb-3">
        {cfg.readOnly ? (
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold headline-font tabular-nums ${cfg.color}`}>
              {displayValue.toFixed(1)}
            </span>
            <span className="text-sm text-on-surface-variant">{cfg.unit}</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold headline-font tabular-nums ${isOn ? cfg.color : 'text-on-surface-variant/40'}`}>
              {(device.type === 'thermostat' || device.type === 'humidity') ? sliderLocal.toFixed(1) : sliderLocal}
            </span>
            <span className={`text-sm ${isOn ? 'text-on-surface-variant' : 'text-on-surface-variant/30'}`}>
              {cfg.unit}
            </span>
          </div>
        )}
      </div>

      {/* Slider */}
      {cfg.hasSlider && isOn && (
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-on-surface-variant/50 uppercase tracking-wider font-medium">
              {cfg.sliderLabel}
            </span>
            <span className="text-[10px] text-on-surface-variant/50 tabular-nums">
              {cfg.sliderMin}{cfg.unit} — {cfg.sliderMax}{cfg.unit}
            </span>
          </div>
          <input
            type="range"
            min={cfg.sliderMin}
            max={cfg.sliderMax}
            step={device.type === 'thermostat' || device.type === 'humidity' ? 0.5 : device.type === 'plug' ? 10 : 1}
            value={sliderLocal}
            onChange={(e) => setSliderLocal(Number(e.target.value))}
            onMouseUp={(e) => handleSliderCommit(Number((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => handleSliderCommit(Number((e.target as HTMLInputElement).value))}
            className="w-full h-1.5 rounded-full cursor-pointer accent-active"
            style={{
              background: `linear-gradient(to right, var(--color-active) 0%, var(--color-active) ${
                ((sliderLocal - (cfg.sliderMin ?? 0)) / ((cfg.sliderMax ?? 100) - (cfg.sliderMin ?? 0))) * 100
              }%, var(--color-surface-container-highest) ${
                ((sliderLocal - (cfg.sliderMin ?? 0)) / ((cfg.sliderMax ?? 100) - (cfg.sliderMin ?? 0))) * 100
              }%, var(--color-surface-container-highest) 100%)`,
            }}
          />
        </div>
      )}

      {/* Thermostat quick controls */}
      {device.type === 'thermostat' && isOn && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/10">
          <button
            onClick={() => {
              const newVal = Math.max(cfg.sliderMin ?? 10, sliderLocal - 0.5);
              setSliderLocal(newVal);
              handleSliderCommit(newVal);
            }}
            className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
          <span className="text-xs text-on-surface-variant/60">Adjust setpoint</span>
          <button
            onClick={() => {
              const newVal = Math.min(cfg.sliderMax ?? 35, sliderLocal + 0.5);
              setSliderLocal(newVal);
              handleSliderCommit(newVal);
            }}
            className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
        </div>
      )}

      {/* Blinds quick controls */}
      {device.type === 'blinds' && isOn && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-outline-variant/10">
          <button
            onClick={() => {
              const newVal = 100;
              setSliderLocal(newVal);
              handleSliderCommit(newVal);
            }}
            className="flex-1 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-xs text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">expand_less</span>
            Open
          </button>
          <button
            onClick={() => {
              const newVal = 0;
              setSliderLocal(newVal);
              handleSliderCommit(newVal);
            }}
            className="flex-1 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-xs text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
            Close
          </button>
        </div>
      )}
    </div>
  );
}

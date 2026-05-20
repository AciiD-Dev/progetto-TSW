'use client';

import React, { useState, useEffect } from 'react';
import { DeviceType, Device } from '@/types';
import { useFormValidation } from '@/lib/hooks/use-form-validation';
import { useApiWithRetry } from '@/lib/hooks/use-api-with-retry';
import { deviceSchema } from '@/lib/validation';

interface AddDeviceModalProps {
  roomId: number;
  onClose: () => void;
  onAdd: (device: Device) => void;
  canAddDevice?: boolean; // Optional prop to control if the user can add more devices based on their plan
  limitMessage?: string; // Optional message to show when the user has reached their device limit
}

const deviceTypes: {
  value: DeviceType;
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  description: string;
}[] = [
  {
    value: 'light',
    label: 'Light',
    icon: 'lightbulb',
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    description: 'Smart bulb or strip',
  },
  {
    value: 'thermostat',
    label: 'Thermostat',
    icon: 'thermostat',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'border-secondary/30',
    description: 'Temperature control',
  },
  {
    value: 'humidity',
    label: 'Humidity',
    icon: 'water_drop',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    description: 'Humidity sensor',
  },
  {
    value: 'blinds',
    label: 'Blinds',
    icon: 'blinds',
    color: 'text-on-surface-variant',
    bg: 'bg-surface-container-highest',
    border: 'border-outline-variant/40',
    description: 'Motorized blinds',
  },
  {
    value: 'plug',
    label: 'Plug',
    icon: 'power',
    color: 'text-tertiary',
    bg: 'bg-tertiary/10',
    border: 'border-tertiary/30',
    description: 'Smart power plug',
  },
];

const defaultValues: Record<DeviceType, number> = {
  light:      80,
  thermostat: 21,
  humidity:   50,
  blinds:     0,
  plug:       0,
};

export default function AddDeviceModal({ roomId, onClose, onAdd, canAddDevice, limitMessage='il piano free consente al massimo 5 dispositivi' }: AddDeviceModalProps) {
  const [type, setType] = useState<DeviceType>('light');
  const [value, setValue] = useState<number>(defaultValues.light);
  const [serverError, setServerError] = useState('');
  const [retryAttempt, setRetryAttempt] = useState(0);

  // Form validation
  const form = useFormValidation(
    { room_id: roomId, name: '', type: 'light', value: 80 },
    deviceSchema
  );

  // API with retry
  const api = useApiWithRetry();

  // Close on Escape and lock body scroll
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  const handleTypeChange = (t: DeviceType) => {
    setType(t);
    form.setFieldValue('type', t);
    setValue(defaultValues[t]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if(!canAddDevice){
      setServerError(limitMessage);
      return;
    }
    // Valida il form
    if (!form.validateForm()) {
      return;
    }

    // Invia la richiesta con retry
    const result = await api.request('/api/devices', {
      method: 'POST',
      body: {
        room_id: roomId,
        name: form.values.name,
        type,
        value,
      },
      maxRetries: 3,
      retryDelay: 1000,
    });

    if (result.error) {
      setServerError(result.error);
      setRetryAttempt(result.retryCount);
    } else if (result.data) {
      onAdd(result.data);
      onClose();
    }
  };

  const selectedType = deviceTypes.find((t) => t.value === type)!;
  const nameError = form.touched.name ? form.errors.name : '';

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-surface-container border border-outline-variant/30 rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 overflow-hidden">
        {/* Top drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-outline-variant/40" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
          <div>
            <h2 className="headline-font font-bold text-base text-on-surface">Add Device</h2>
            <p className="text-xs text-on-surface-variant/60 mt-0.5">Configure a new smart device</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar max-h-[75vh]">
          {/* Name input with validation */}
          <div>
            <label
              htmlFor="device-name"
              className="block text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-2"
            >
              Device Name {form.touched.name && nameError && <span className="text-error">*</span>}
            </label>
            <input
              id="device-name"
              type="text"
              placeholder="e.g. Bedside Lamp"
              {...form.getFieldProps('name')}
              autoFocus
              className={`w-full bg-surface-container-high border rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 transition-all ${
                form.touched.name && nameError
                  ? 'border-error/50 focus:border-error focus:ring-error/10'
                  : 'border-outline-variant/30 focus:border-primary/50 focus:ring-primary/10'
              }`}
            />
            {form.touched.name && nameError && (
              <p className="text-xs text-error mt-1">{nameError}</p>
            )}
          </div>

          {/* Type selector */}
          <div>
            <label className="block text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-2">
              Device Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {deviceTypes.map((dt) => (
                <button
                  key={dt.value}
                  type="button"
                  onClick={() => handleTypeChange(dt.value)}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                    ${type === dt.value
                      ? `${dt.bg} ${dt.border} ${dt.color}`
                      : 'bg-surface-container-high border-outline-variant/20 text-on-surface-variant hover:border-outline-variant/40'
                    }
                  `}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] flex-shrink-0 ${type === dt.value ? dt.color : 'text-on-surface-variant/60'}`}
                    style={{ fontVariationSettings: type === dt.value ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {dt.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-none">{dt.label}</p>
                    <p className="text-[10px] text-on-surface-variant/50 mt-0.5 truncate">{dt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Initial value */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="device-value"
                className="text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-widest"
              >
                Initial Value
              </label>
              <span className={`text-sm font-bold tabular-nums ${selectedType.color}`}>
                {value}{type === 'thermostat' ? ' °C' : type === 'plug' ? ' W' : ' %'}
              </span>
            </div>
            <input
              id="device-value"
              type="range"
              min={type === 'thermostat' ? 10 : type === 'humidity' ? 20 : 0}
              max={type === 'thermostat' ? 35 : type === 'humidity' ? 80 : type === 'plug' ? 3000 : 100}
              step={type === 'thermostat' || type === 'humidity' ? 0.5 : type === 'plug' ? 10 : 1}
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value))}
              className="w-full accent-primary"
              style={{
                background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${
                  type === 'thermostat'
                    ? ((value - 10) / (35 - 10)) * 100
                    : type === 'humidity'
                    ? ((value - 20) / (80 - 20)) * 100
                    : type === 'plug'
                    ? (value / 3000) * 100
                    : value
                }%, var(--color-surface-container-highest) ${
                  type === 'thermostat'
                    ? ((value - 10) / (35 - 10)) * 100
                    : type === 'humidity'
                    ? ((value - 20) / (80 - 20)) * 100
                    : type === 'plug'
                    ? (value / 3000) * 100
                    : value
                }%, var(--color-surface-container-highest) 100%)`,
              }}
            />
          </div>

          {/* Server Error with Retry Info */}
          {serverError && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-error/30 bg-error/10 text-error text-sm">
              <span className="material-symbols-outlined text-[16px] flex-shrink-0 mt-0.5">error</span>
              <div className="flex-1">
                <p>{serverError}</p>
                {retryAttempt > 0 && (
                  <p className="text-xs text-error/80 mt-1">Tentativi: {retryAttempt}/3</p>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {api.loading && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-primary/30 bg-primary/10 text-primary text-sm">
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              {api.retryCount > 0 ? `Tentativo ${api.retryCount + 1}...` : 'Invio in corso...'}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={api.loading}
              className="flex-1 py-2.5 px-4 rounded-xl border border-outline-variant/30 text-on-surface-variant font-medium text-sm hover:bg-surface-container-high transition-all disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={api.loading || !form.isValid}
              className="flex-1 py-2.5 px-4 rounded-xl primary-gradient text-background font-bold text-sm shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {api.loading ? 'Adding…' : 'Add Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

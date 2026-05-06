
'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import Link from 'next/link';

interface Device {
  id: number;
  name: string;
  type: string;
}

interface AlertRule {
  id: number;
  device_id: number;
  device_name: string;
  rule_type: 'gt' | 'lt';
  threshold: number;
  message: string;
  is_active: number;
  triggered_at: string | null;
}

const settingsSections = [
  {
    title: 'Notifications',
    icon: 'notifications',
    color: 'text-primary',
    bg: 'bg-primary/10',
    items: [
      { label: 'Push Notifications', description: 'Receive alerts for device events', coming: false, enabled: true },
      { label: 'Email Alerts', description: 'Send critical alerts via email', coming: true, enabled: false },
      { label: 'Temperature Alerts', description: 'Alert when temp exceeds threshold', coming: true, enabled: false },
    ],
  },
  {
    title: 'Integrations',
    icon: 'hub',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    items: [
      { label: 'Google Home', description: 'Connect with Google Home ecosystem', coming: true, enabled: false },
      { label: 'Amazon Alexa', description: 'Voice control via Amazon Alexa', coming: true, enabled: false },
      { label: 'Apple HomeKit', description: 'Integrate with Apple HomeKit', coming: true, enabled: false },
    ],
  },
  {
    title: 'Appearance',
    icon: 'palette',
    color: 'text-tertiary',
    bg: 'bg-tertiary/10',
    items: [
      { label: 'Dark Mode', description: 'Always use dark theme', coming: false, enabled: true },
      { label: 'Compact View', description: 'Reduce spacing in dashboard', coming: true, enabled: false },
      { label: 'Animations', description: 'Enable UI animations', coming: false, enabled: true },
    ],
  },
  {
    title: 'Security',
    icon: 'security',
    color: 'text-error',
    bg: 'bg-error/10',
    items: [
      { label: 'Two-Factor Auth', description: 'Enable 2FA for enhanced security', coming: true, enabled: false },
      { label: 'Change Password', description: 'Update your account password', coming: false, enabled: false },
    ],
  },
];

export default function SettingsPage() {
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [deviceId, setDeviceId] = useState('');
  const [ruleType, setRuleType] = useState<'gt' | 'lt'>('gt');
  const [threshold, setThreshold] = useState('');
  const [message, setMessage] = useState('');

  const toast = useToast();

  useEffect(() => {
    Promise.all([
      fetch('/api/alerts').then(res => res.json()),
      fetch('/api/devices').then(res => res.json())
    ]).then(([alertsData, devicesData]) => {
      if (Array.isArray(alertsData)) setAlerts(alertsData);
      if (Array.isArray(devicesData)) setDevices(devicesData.filter((d: any) => d.type === 'thermostat' || d.type === 'humidity'));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
      toast.error('Failed to load alerts');
    });
  }, [toast]);

  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId || !threshold || !message) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: parseInt(deviceId),
          rule_type: ruleType,
          threshold: parseFloat(threshold),
          message
        })
      });
      if (!res.ok) throw new Error('Failed to create alert');
      const newAlert = await res.json();
      setAlerts(prev => [newAlert, ...prev]);
      toast.success('Alert added successfully');
      setDeviceId('');
      setThreshold('');
      setMessage('');
    } catch (err) {
      toast.error('Failed to create alert');
    }
  };

  const handleToggleAlert = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_active: newStatus } : a));
    try {
      await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus })
      });
    } catch (err) {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_active: currentStatus } : a));
      toast.error('Failed to update alert');
    }
  };

  const handleDeleteAlert = async (id: number) => {
    const original = [...alerts];
    setAlerts(prev => prev.filter(a => a.id !== id));
    try {
      await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
      toast.success('Alert deleted');
    } catch (err) {
      setAlerts(original);
      toast.error('Failed to delete alert');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="headline-font text-2xl font-bold text-on-surface">Settings</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">System configuration and alert rules</p>
      </div>

      {/* Alerts Management Section */}
      <section className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20">
        <h2 className="headline-font text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">notifications_active</span>
          Alert Rules
        </h2>

        {/* Add new alert form */}
        <div className="bg-surface-container-high rounded-xl p-5 border border-outline-variant/10 mb-8 overflow-hidden">
          <h3 className="text-sm font-bold text-on-surface mb-4">Create New Rule</h3>
          <form onSubmit={handleAddAlert} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant/60 block mb-1">Device</label>
              <select
                value={deviceId}
                onChange={e => setDeviceId(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm outline-none text-on-surface focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
              >
                <option value="">Select...</option>
                {devices.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant/60 block mb-1">Condition</label>
              <select
                value={ruleType}
                onChange={e => setRuleType(e.target.value as 'gt' | 'lt')}
                className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm outline-none text-on-surface focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
              >
                <option value="gt">Greater than (&gt;)</option>
                <option value="lt">Less than (&lt;)</option>
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant/60 block mb-1">Threshold</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 25.5"
                value={threshold}
                onChange={e => setThreshold(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm outline-none text-on-surface focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="lg:col-span-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant/60 block mb-1">Message</label>
              <input
                type="text"
                placeholder="Alert text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm outline-none text-on-surface focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="lg:col-span-1">
              <button type="submit" className="w-full py-2.5 bg-primary/20 text-primary font-bold rounded-xl hover:bg-primary/30 transition-colors text-sm">
                Add Rule
              </button>
            </div>
          </form>
        </div>

        {/* Alerts list */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-on-surface-variant">Loading rules...</div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 bg-surface-container-high rounded-xl border border-outline-variant/10 text-sm text-on-surface-variant/50">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">notifications_off</span>
              <p>No alert rules defined. Create one above to get notified of sensor events.</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${alert.is_active ? 'bg-surface-container-high border-outline-variant/15' : 'bg-surface-container-low border-outline-variant/5 opacity-60'
                }`}>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${alert.triggered_at && alert.is_active === 1 ? 'bg-error animate-pulse shadow-[0_0_8px_rgba(255,82,82,0.8)]' : 'bg-tertiary'}`}></span>
                    <span className="font-bold text-sm text-on-surface">{alert.device_name}</span>
                    <span className="text-xs text-on-surface-variant px-2 py-0.5 rounded-full bg-surface-container-highest">
                      {alert.rule_type === 'gt' ? '>' : '<'} {alert.threshold}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant">{alert.message}</p>
                  {alert.triggered_at && alert.is_active === 1 && (
                    <p className="text-xs text-error font-medium mt-1">
                      Triggered at {new Date(alert.triggered_at).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggleAlert(alert.id, alert.is_active)}
                    className={`relative w-10 h-5 rounded-full transition-all duration-300 ${alert.is_active === 1 ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}
                  >
                    <span className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow transition-all duration-300 ${alert.is_active === 1 ? 'left-6' : 'left-1'
                      }`} />
                  </button>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="material-symbols-outlined text-error/70 hover:text-error p-1 rounded-full hover:bg-error/10 transition-colors"
                  >
                    delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* General Settings Sections */}
      <section className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20">
        <h2 className="headline-font text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">bolt</span>
          Quick Actions
        </h2>
        <div className="space-y-4">
          <Link href="/settings/quick-actions" className="flex items-center justify-between bg-surface-container-high rounded-xl p-4 border border-outline-variant/10 hover:border-primary/50 transition-all">
            <div>
              <p className="font-medium text-on-surface">Configure Modes</p>
              <p className="text-sm text-on-surface-variant/70">Customize Night Mode, Away Mode, and Eco Mode</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">arrow_forward_ios</span>
          </Link>
        </div>
      </section>

      {settingsSections.map((section) => (
        <section key={section.title} className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20">
          <h2 className="headline-font text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
            <span className={`material-symbols-outlined ${section.color}`}>{section.icon}</span>
            {section.title}
          </h2>
          <div className="space-y-4">
            {section.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between bg-surface-container-high rounded-xl p-4 border border-outline-variant/10">
                <div>
                  <p className="font-medium text-on-surface">{item.label}</p>
                  <p className="text-sm text-on-surface-variant/70">{item.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  {item.coming ? (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">Soon</span>
                  ) : (
                    <button
                      className={`relative w-10 h-5 rounded-full transition-all duration-300 ${item.enabled ? 'bg-primary' : 'bg-surface-container-highest'
                        }`}
                    >
                      <span className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow transition-all duration-300 ${item.enabled ? 'left-6' : 'left-1'
                        }`} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Danger Zone */}
      <section className="bg-surface-container rounded-2xl p-5 border border-error/20">
        <h2 className="headline-font text-xl font-bold text-error mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-error">warning</span>
          Danger Zone
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-surface-container-high rounded-xl p-4 border border-error/10">
            <div>
              <p className="font-medium text-on-surface">Reset All Settings</p>
              <p className="text-sm text-on-surface-variant/70">Erase all custom configurations and revert to defaults.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-error/20 text-error text-sm font-medium hover:bg-error/30 transition-colors">Reset</button>
          </div>
          <div className="flex items-center justify-between bg-surface-container-high rounded-xl p-4 border border-error/10">
            <div>
              <p className="font-medium text-on-surface">Delete Account</p>
              <p className="text-sm text-on-surface-variant/70">Permanently delete your account and all associated data.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-error/20 text-error text-sm font-medium hover:bg-error/30 transition-colors">Delete</button>
          </div>
        </div>
      </section>
    </div>
  );
}


'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

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

export default function SettingsPage() {
  const { data: session } = useSession();
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  // General Settings State
  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Form state for alerts
  const [deviceId, setDeviceId] = useState('');
  const [ruleType, setRuleType] = useState<'gt' | 'lt'>('gt');
  const [threshold, setThreshold] = useState('');
  const [message, setMessage] = useState('');

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const toast = useToast();

  useEffect(() => {
    // Load general settings from LocalStorage ONLY once mounted
    const savedPush = localStorage.getItem('homehub-push-enabled');
    const savedTheme = localStorage.getItem('theme');
    const savedAnims = localStorage.getItem('homehub-animations-enabled');

    if (savedPush !== null) setPushEnabled(savedPush === 'true');
    if (savedTheme !== null) setDarkMode(savedTheme === 'dark');
    if (savedAnims !== null) setAnimationsEnabled(savedAnims === 'true');
    
    setMounted(true);

    const fetchData = async () => {
      try {
        // Trigger cron to generate readings and check alerts
        await fetch('/api/cron/generate-readings').catch(() => {});

        const [alertsRes, devicesRes] = await Promise.all([
          fetch('/api/alerts', { cache: 'no-store' }),
          fetch('/api/devices', { cache: 'no-store' })
        ]);
        const alertsData = await alertsRes.json();
        const devicesData = await devicesRes.json();

        if (Array.isArray(alertsData)) setAlerts(alertsData);
        if (Array.isArray(devicesData)) setDevices(devicesData.filter((d: any) => d.type === 'thermostat' || d.type === 'humidity'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [toast]);

  // Sync theme with DOM (only after mounting)
  useEffect(() => {
    if (!mounted) return;
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode, mounted]);

  // Sync animations with DOM (only after mounting)
  useEffect(() => {
    if (!mounted) return;
    if (animationsEnabled) {
      document.documentElement.classList.remove('no-animations');
      localStorage.setItem('homehub-animations-enabled', 'true');
    } else {
      document.documentElement.classList.add('no-animations');
      localStorage.setItem('homehub-animations-enabled', 'false');
    }
  }, [animationsEnabled, mounted]);

  const handlePushToggle = () => {
    const newState = !pushEnabled;
    setPushEnabled(newState);
    localStorage.setItem('homehub-push-enabled', String(newState));
    toast.success(`Push notifications ${newState ? 'enabled' : 'disabled'}`);
  };

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
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create alert');
      }
      
      setAlerts(prev => [data, ...prev]);
      toast.success('Alert added successfully');
      setDeviceId('');
      setThreshold('');
      setMessage('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create alert');
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

  const handleResetSettings = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults? This will clear theme preferences, quick actions configuration, and DELETE all alert rules.')) return;
    
    // Clear LocalStorage
    localStorage.removeItem('theme');
    localStorage.removeItem('homehub-animations-enabled');
    localStorage.removeItem('homehub-push-enabled');
    localStorage.removeItem('homehub-quick-actions');
    
    // Reset state
    setDarkMode(true);
    setAnimationsEnabled(true);
    setPushEnabled(true);
    
    // Delete all alerts from DB
    try {
      await Promise.all(alerts.map(a => fetch(`/api/alerts/${a.id}`, { method: 'DELETE' })));
      setAlerts([]);
      toast.success('All settings and alerts reset to defaults');
    } catch (err) {
      toast.error('Partially reset: Failed to clear some alert rules');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('CRITICAL: Are you sure you want to delete your account? This action is permanent and will erase all your rooms, devices, and historical data.')) return;
    
    try {
      const res = await fetch('/api/auth/delete-account', { method: 'DELETE' });
      if (res.ok) {
        toast.success('Account deleted successfully');
        signOut({ callbackUrl: '/login' });
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete account');
      }
    } catch (err: any) {
      toast.error(`Failed to delete account: ${err.message}`);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword === oldPassword) {
      toast.error('New password must be different from current password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success('Password updated successfully');
        setShowPasswordModal(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch (err) {
      toast.error('Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
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
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] uppercase font-bold text-on-surface-variant/60">Threshold</label>
                {deviceId && (
                  <span className="text-[9px] text-primary font-bold">
                    {devices.find(d => d.id === parseInt(deviceId))?.type === 'thermostat' ? 'Range: 10-35' : 'Range: 20-80'}
                  </span>
                )}
              </div>
              <input
                type="number"
                step="0.1"
                min={deviceId ? (devices.find(d => d.id === parseInt(deviceId))?.type === 'thermostat' ? 10 : 20) : undefined}
                max={deviceId ? (devices.find(d => d.id === parseInt(deviceId))?.type === 'thermostat' ? 35 : 80) : undefined}
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

      {/* Quick Actions Sections */}
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

      {/* Notifications Section */}
      <section className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20">
        <h2 className="headline-font text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">notifications</span>
          Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-surface-container-high rounded-xl p-4 border border-outline-variant/10">
            <div>
              <p className="font-medium text-on-surface">Push Notifications</p>
              <p className="text-sm text-on-surface-variant/70">Receive alerts for device events</p>
            </div>
            <button
              onClick={handlePushToggle}
              className={`relative w-10 h-5 rounded-full transition-all duration-300 ${pushEnabled ? 'bg-primary' : 'bg-surface-container-highest'}`}
            >
              <span className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow transition-all duration-300 ${pushEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between bg-surface-container-high rounded-xl p-4 border border-outline-variant/10 opacity-50">
            <div>
              <p className="font-medium text-on-surface">Email Alerts</p>
              <p className="text-sm text-on-surface-variant/70">Send critical alerts via email</p>
            </div>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">Soon</span>
          </div>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20">
        <h2 className="headline-font text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary">palette</span>
          Appearance
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-surface-container-high rounded-xl p-4 border border-outline-variant/10">
            <div>
              <p className="font-medium text-on-surface">Dark Mode</p>
              <p className="text-sm text-on-surface-variant/70">Always use dark theme</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-10 h-5 rounded-full transition-all duration-300 ${darkMode ? 'bg-primary' : 'bg-surface-container-highest'}`}
            >
              <span className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow transition-all duration-300 ${darkMode ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between bg-surface-container-high rounded-xl p-4 border border-outline-variant/10">
            <div>
              <p className="font-medium text-on-surface">Animations</p>
              <p className="text-sm text-on-surface-variant/70">Enable UI animations</p>
            </div>
            <button
              onClick={() => setAnimationsEnabled(!animationsEnabled)}
              className={`relative w-10 h-5 rounded-full transition-all duration-300 ${animationsEnabled ? 'bg-primary' : 'bg-surface-container-highest'}`}
            >
              <span className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow transition-all duration-300 ${animationsEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20">
        <h2 className="headline-font text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-error">security</span>
          Security
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-surface-container-high rounded-xl p-4 border border-outline-variant/10">
            <div>
              <p className="font-medium text-on-surface">Change Password</p>
              <p className="text-sm text-on-surface-variant/70">Update your account password</p>
            </div>
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 rounded-xl bg-surface-container-highest text-on-surface text-sm font-medium hover:bg-outline-variant/20 transition-colors"
            >
              Update
            </button>
          </div>
        </div>
      </section>

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
            <button onClick={handleResetSettings} className="px-4 py-2 rounded-xl bg-error/20 text-error text-sm font-medium hover:bg-error/30 transition-colors">Reset</button>
          </div>
          <div className="flex items-center justify-between bg-surface-container-high rounded-xl p-4 border border-error/10">
            <div>
              <p className="font-medium text-on-surface">Delete Account</p>
              <p className="text-sm text-on-surface-variant/70">Permanently delete your account and all associated data.</p>
            </div>
            <button onClick={handleDeleteAccount} className="px-4 py-2 rounded-xl bg-error/20 text-error text-sm font-medium hover:bg-error/30 transition-colors">Delete</button>
          </div>
        </div>
      </section>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-surface-container rounded-[2.5rem] border border-outline-variant/20 p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="headline-font text-2xl font-bold text-on-surface mb-2">Change Password</h3>
            <p className="text-sm text-on-surface-variant mb-6">Enter your details to update your password.</p>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-on-surface-variant/60 block mb-1.5 ml-1">Current Password</label>
                <input 
                  type="password" 
                  required
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm outline-none text-on-surface focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-on-surface-variant/60 block mb-1.5 ml-1">New Password</label>
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm outline-none text-on-surface focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-on-surface-variant/60 block mb-1.5 ml-1">Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm outline-none text-on-surface focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-3.5 rounded-2xl border border-outline-variant/30 text-on-surface font-bold hover:bg-surface-container-highest transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={changingPassword}
                  className="flex-1 py-3.5 rounded-2xl primary-gradient text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {changingPassword ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}




'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


const features = [
  { icon: 'thermostat', color: 'text-secondary', bg: 'bg-secondary/10', title: 'Climate Control', desc: 'Monitor and adjust temperature across every room in real time.' },
  { icon: 'lightbulb', color: 'text-warning', bg: 'bg-warning/10', title: 'Smart Lighting', desc: 'Toggle, dim and schedule your lights from anywhere.' },
  { icon: 'sensors', color: 'text-primary', bg: 'bg-primary/10', title: 'Live Sensor Data', desc: 'Humidity, temperature, and more — updated every 5 seconds.' },
  { icon: 'bar_chart', color: 'text-tertiary', bg: 'bg-tertiary/10', title: 'Historical Trends', desc: 'View 24h and 7-day charts for any device in your home.' },
];

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prefetch dashboard for instant navigation
    router.prefetch('/');
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Login failed. Please try again.');
        setLoading(false);
        return;
      }

      // Refresh router cache and navigate to dashboard
      router.refresh();
      router.push('/');
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex">
      {/* ── Left Panel: Features ── */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-center px-16 py-12 bg-surface overflow-hidden border-r border-outline-variant/20">
        {/* Ambient blobs */}
        <div className="absolute -top-[15%] -left-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center glow-primary">
              <span
                className="material-symbols-outlined text-background text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                home
              </span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-transparent bg-clip-text primary-gradient headline-font">
              HomeHub
            </span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-4 headline-font">
            Your smart home,<br />
            <span className="text-transparent bg-clip-text primary-gradient">fully in control.</span>
          </h1>

          <p className="text-on-surface-variant text-base mb-12 leading-relaxed">
            Monitor rooms, control devices, and track sensor trends — all from one beautiful dashboard.
          </p>

          <div className="space-y-6">
            {features.map(({ icon, color, bg, title, desc }) => (
              <div key={icon} className="flex items-start gap-4 p-4 rounded-xl bg-surface-container border border-outline-variant/20 hover:border-primary/50 transition-colors group">
                <div className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
                  <p className="text-on-surface-variant text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex-1 flex px-6 lg:px-24 bg-surface z-20">
        <div className="w-full max-w-md m-auto py-12">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-8 h-8 primary-gradient rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-background text-sm font-bold">home</span>
            </div>
            <span className="text-xl font-bold tracking-tighter text-transparent bg-clip-text primary-gradient headline-font">
              HomeHub
            </span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-2 headline-font text-on-surface">Welcome back</h2>
            <p className="text-on-surface-variant">Sign in to manage your smart home.</p>
          </div>

          <div 
            className="space-y-6" 
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit(e as any);
            }}
          >
            <div>
              <label
                className="block text-[10px] uppercase font-bold text-on-surface-variant/60 tracking-widest mb-2"
                htmlFor="login-email"
              >
                Email Address
              </label>
              <input
                id="login-email"
                className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 transition-all outline-none text-on-surface"
                placeholder="admin@home.local"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  className="block text-[10px] uppercase font-bold text-on-surface-variant/60 tracking-widest"
                  htmlFor="login-password"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-xs text-on-surface-variant/70 hover:text-on-surface transition-colors"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="login-password"
                className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 transition-all outline-none text-on-surface"
                placeholder="••••••••"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl border border-error/30 bg-error/10 text-error text-sm font-medium">
                {error}
              </div>
            )}

            <button
              id="login-submit"
              className="w-full py-4 primary-gradient rounded-xl text-background font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 active:scale-[0.98] disabled:opacity-60"
              onClick={handleSubmit}
              disabled={loading || !mounted}
            >
              {loading ? 'Signing in…' : (!mounted ? 'Loading…' : 'Sign In')}
            </button>
          </div>

          <div className="mt-12 p-6 bg-surface-container rounded-xl border border-outline-variant/20 text-center">
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Demo credentials:<br />
              <span className="text-primary font-semibold">admin@home.local</span>
              {' '}·{' '}
              <span className="text-primary font-semibold">password123</span>
            </p>
          </div>

          <footer className="mt-12 flex justify-center gap-6">
            <Link href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">Terms of Service</Link>
            <span className="text-xs text-on-surface-variant">HomeHub v1.0</span>
          </footer>
        </div>
      </div>
    </div>
  );
}

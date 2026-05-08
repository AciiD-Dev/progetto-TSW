'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
/* ─── Feature Cards ─── */
const features = [
  { icon: 'thermostat', color: '#818CF8', title: 'Climate Control', desc: 'Monitor and adjust temperature in real time.' },
  { icon: 'lightbulb',  color: '#F59E0B', title: 'Smart Lighting',  desc: 'Toggle, dim and schedule your lights.' },
  { icon: 'sensors',    color: '#6366F1', title: 'Live Sensors',     desc: 'Humidity, temperature — updated every 5s.' },
  { icon: 'bar_chart',  color: '#10B981', title: 'Trend Charts',    desc: 'View 24h and 7-day history for any device.' },
];

/* ─── Floating particle component (client-only to avoid hydration mismatch) ─── */
function Particles({ mounted }: { mounted: boolean }) {
  // Pre-compute deterministic particle styles using a simple seed
  const particles = React.useMemo(() => {
    const seed = (n: number) => {
      // Simple deterministic hash
      let x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: 18 }).map((_, i) => ({
      width:  `${3 + seed(i * 6 + 0) * 5}px`,
      height: `${3 + seed(i * 6 + 1) * 5}px`,
      left:   `${seed(i * 6 + 2) * 100}%`,
      top:    `${seed(i * 6 + 3) * 100}%`,
      background: `hsl(${230 + seed(i * 6 + 4) * 40}, 80%, 70%)`,
      animation: `particle-float ${6 + seed(i * 6 + 5) * 8}s ease-in-out ${seed(i * 6 + 0) * 5}s infinite`,
    }));
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((style, i) => (
        <span key={i} className="absolute rounded-full opacity-0" style={style} />
      ))}
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [mounted, setMounted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  /* Form state */
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setMounted(true);
    router.prefetch('/');
  }, [router]);

  /* ── Switch mode with transition ── */
  const switchMode = useCallback((newMode: 'login' | 'register') => {
    if (newMode === mode || transitioning) return;
    setTransitioning(true);
    setError('');
    setSuccess('');
    // Wait for exit animation, then switch
    setTimeout(() => {
      setMode(newMode);
      setName('');
      setEmail('');
      setPassword('');
      setShowPass(false);
      // Wait a tick for new content to mount, then enter
      requestAnimationFrame(() => setTransitioning(false));
    }, 150);
  }, [mode, transitioning]);

  /* ── Handle credential login ── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter your email and password.'); return; }

    setLoading(true);
    try {
      const res = await signIn('credentials', { email, password, redirect: false });
      if (res?.error) { setError('Invalid credentials. Please try again.'); setLoading(false); return; }
      router.refresh();
      router.push('/');
    } catch { setError('Network error. Please try again.'); setLoading(false); }
  };

  /* ── Handle registration ── */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || 'New User' }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed.'); setLoading(false); return; }

      // Auto-login after registration
      const signInRes = await signIn('credentials', { email, password, redirect: false });
      if (signInRes?.error) { setError('Registered! Please sign in.'); setLoading(false); return; }
      router.refresh();
      router.push('/');
    } catch { setError('Network error. Please try again.'); setLoading(false); }
  };

  const handleGoogle = () => signIn('google', { callbackUrl: '/' });
  const handleSubmit = mode === 'login' ? handleLogin : handleRegister;
  const isRegister = mode === 'register';

  return (
    <>

      <div className="bg-background text-on-surface min-h-screen flex flex-col lg:flex-row overflow-x-hidden relative">

        {/* ── Animated background ── */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute w-[600px] h-[600px] opacity-[0.07]"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary), var(--tertiary))',
              backgroundSize: '200% 200%',
              animation: 'blob-morph 20s ease-in-out infinite, gradient-shift 8s ease-in-out infinite',
              top: '-10%',
              left: isRegister ? '50%' : '-10%',
              transition: 'left 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] opacity-[0.05]"
            style={{
              background: 'linear-gradient(225deg, var(--secondary), var(--tertiary))',
              backgroundSize: '200% 200%',
              animation: 'blob-morph 25s ease-in-out 2s infinite, gradient-shift 10s ease-in-out 1s infinite',
              bottom: '-15%',
              right: isRegister ? '-10%' : '50%',
              transition: 'right 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
          <Particles mounted={mounted} />
        </div>

        {/* ══════════════════════════════════════════════════════════
            LEFT PANEL — Branding + Features (desktop)
            slides position based on mode
            ══════════════════════════════════════════════════════════ */}
        <div
          className={`hidden lg:flex w-1/2 z-10 flex-col justify-center px-16 py-12 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isRegister ? 'translate-x-full' : 'translate-x-0'
          }`}
        >
          <div className="relative z-10 max-w-lg mx-auto">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-14">
              <div className="w-11 h-11 primary-gradient rounded-xl flex items-center justify-center glow-primary"
                   style={{ transition: 'transform 0.3s', transform: isRegister ? 'rotate(360deg)' : 'rotate(0deg)' }}>
                <span className="material-symbols-outlined text-background text-[22px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-transparent bg-clip-text primary-gradient headline-font">
                HomeHub
              </span>
            </div>

            <h1 className="text-4xl font-bold leading-tight mb-4 headline-font">
              {isRegister ? (
                <>Start your journey,<br /><span className="text-transparent bg-clip-text primary-gradient">smart from day one.</span></>
              ) : (
                <>Your smart home,<br /><span className="text-transparent bg-clip-text primary-gradient">fully in control.</span></>
              )}
            </h1>

            <p className="text-on-surface-variant text-base mb-12 leading-relaxed">
              {isRegister
                ? 'Join thousands of homeowners who trust HomeHub to keep their home running smoothly.'
                : 'Monitor rooms, control devices, and track sensor trends — all from one beautiful dashboard.'}
            </p>

            <div className="space-y-4">
              {features.map(({ icon, color, title, desc }, i) => (
                <div
                  key={icon}
                  className={`feature-card opacity-0 flex items-center gap-4 p-3.5 rounded-xl bg-surface-container/60 border border-outline-variant/20 hover:border-primary/40 transition-colors group stagger-${i + 1}`}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
                    <p className="text-on-surface-variant text-xs truncate">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            RIGHT PANEL — Auth Form
            slides to the opposite side of branding
            ══════════════════════════════════════════════════════════ */}
        <div
          className={`w-full lg:w-1/2 flex-1 flex z-20 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isRegister ? 'lg:-translate-x-full' : 'translate-x-0'
          }`}
        >
          <div className="w-full max-w-md m-auto px-6 lg:px-12 py-12">

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-background text-sm font-bold">home</span>
              </div>
              <span className="text-xl font-bold tracking-tighter text-transparent bg-clip-text primary-gradient headline-font">HomeHub</span>
            </div>

            {/* ── Mode Toggle ── */}
            <div className="relative flex mb-10 bg-surface-container-highest/50 rounded-2xl p-1.5 border border-outline-variant/20">
              {/* Sliding indicator */}
              <div
                className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl primary-gradient shadow-lg shadow-primary/20 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ left: isRegister ? 'calc(50% + 3px)' : '6px' }}
              />
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`relative z-10 flex-1 py-3 text-sm font-bold rounded-xl transition-colors duration-300 ${
                  !isRegister ? 'text-background' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`relative z-10 flex-1 py-3 text-sm font-bold rounded-xl transition-colors duration-300 ${
                  isRegister ? 'text-background' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* ── Form ── */}
            <div
              className={transitioning ? 'form-exit' : 'form-enter'}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e as any); }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-1.5 headline-font text-on-surface">
                  {isRegister ? 'Get started' : 'Welcome back'}
                </h2>
                <p className="text-on-surface-variant text-sm">
                  {isRegister
                    ? 'Create your account to manage your smart home.'
                    : 'Sign in to access your dashboard.'}
                </p>
              </div>

              <div className="space-y-5">
                {/* Name (register only) */}
                {isRegister && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-surface-variant/60 tracking-widest mb-2" htmlFor="auth-name">
                      Full Name
                    </label>
                    <div className="relative group">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-on-surface-variant/40 group-focus-within:text-primary transition-colors">person</span>
                      <input
                        id="auth-name"
                        className="w-full bg-surface-container-highest/60 border border-outline-variant/30 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none text-on-surface placeholder:text-on-surface-variant/30"
                        placeholder="Your name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant/60 tracking-widest mb-2" htmlFor="auth-email">
                    Email Address
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-on-surface-variant/40 group-focus-within:text-primary transition-colors">mail</span>
                    <input
                      id="auth-email"
                      className="w-full bg-surface-container-highest/60 border border-outline-variant/30 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none text-on-surface placeholder:text-on-surface-variant/30"
                      placeholder="you@example.com"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] uppercase font-bold text-on-surface-variant/60 tracking-widest" htmlFor="auth-password">
                      Password
                    </label>
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="text-xs text-on-surface-variant/60 hover:text-primary transition-colors font-medium">
                      {showPass ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="relative group">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-on-surface-variant/40 group-focus-within:text-primary transition-colors">lock</span>
                    <input
                      id="auth-password"
                      className="w-full bg-surface-container-highest/60 border border-outline-variant/30 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none text-on-surface placeholder:text-on-surface-variant/30"
                      placeholder="••••••••"
                      type={showPass ? 'text' : 'password'}
                      autoComplete={isRegister ? 'new-password' : 'current-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Error / Success */}
                {error && (
                  <div className="px-4 py-3 rounded-xl border border-error/30 bg-error/10 text-error text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {error}
                  </div>
                )}
                {success && (
                  <div className="px-4 py-3 rounded-xl border border-tertiary/30 bg-tertiary/10 text-tertiary text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    {success}
                  </div>
                )}

                {/* Submit button */}
                <button
                  id="auth-submit"
                  className="w-full py-3.5 primary-gradient rounded-xl text-background font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:brightness-110 transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:hover:shadow-primary/20 disabled:hover:brightness-100"
                  onClick={handleSubmit}
                  disabled={loading || !mounted}
                >
                  {loading
                    ? (isRegister ? 'Creating account…' : 'Signing in…')
                    : (!mounted
                        ? 'Loading…'
                        : (isRegister ? 'Create Account' : 'Sign In')
                      )
                  }
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-outline-variant/30" />
                  <span className="text-[10px] text-on-surface-variant/50 uppercase font-bold tracking-widest">Or continue with</span>
                  <div className="flex-1 h-px bg-outline-variant/30" />
                </div>

                {/* Google button */}
                <button
                  type="button"
                  onClick={handleGoogle}
                  className="w-full py-3 bg-surface-container border border-outline-variant/30 rounded-xl text-on-surface font-semibold hover:bg-surface-container-highest hover:border-outline-variant/50 transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </button>
              </div>

              {/* Demo credentials (login only) */}
              {!isRegister && (
                <div className="mt-10 p-4 bg-surface-container/60 rounded-xl border border-outline-variant/15 text-center">
                  <p className="text-on-surface-variant text-xs leading-relaxed">
                    Demo · <span className="text-primary font-semibold">admin@home.local</span>
                    {' '}/ <span className="text-primary font-semibold">password123</span>
                  </p>
                </div>
              )}

              <footer className="mt-10 flex justify-center gap-6">
                <Link href="/privacy" className="text-[11px] text-on-surface-variant/50 hover:text-primary transition-colors">Privacy</Link>
                <Link href="/terms" className="text-[11px] text-on-surface-variant/50 hover:text-primary transition-colors">Terms</Link>
                <span className="text-[11px] text-on-surface-variant/30">HomeHub v1.0</span>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
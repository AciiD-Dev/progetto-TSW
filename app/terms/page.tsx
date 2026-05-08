import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface p-6 md:p-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute w-[500px] h-[500px] opacity-[0.05]"
          style={{
            background: 'linear-gradient(225deg, var(--secondary), var(--tertiary))',
            backgroundSize: '200% 200%',
            animation: 'blob-morph 25s ease-in-out 2s infinite, gradient-shift 10s ease-in-out 1s infinite',
            bottom: '-15%',
            right: '-10%',
          }}
        />
      </div>

      <div className="max-w-3xl mx-auto relative z-10 animate-fade-in-up">
        <Link href="/login" className="inline-flex items-center gap-2 text-primary hover:brightness-110 mb-8 transition-all">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="font-semibold text-sm">Back to Login</span>
        </Link>

        <div className="bg-surface-container/80 backdrop-blur-xl border border-outline-variant/30 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 secondary-gradient rounded-xl flex items-center justify-center glow-secondary">
              <span className="material-symbols-outlined text-background text-[24px]">gavel</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text secondary-gradient headline-font">
              Terms of Service
            </h1>
          </div>

          <div className="space-y-8 text-on-surface-variant leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-on-surface mb-3 headline-font">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the HomeHub service, you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-on-surface mb-3 headline-font">2. Usage Restrictions</h2>
              <p>
                You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, impairs or renders the Service less efficient. You agree not to attempt any unauthorized access to any part or component of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-on-surface mb-3 headline-font">3. User Accounts</h2>
              <p>
                When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-on-surface mb-3 headline-font">4. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion. We will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

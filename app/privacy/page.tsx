import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface p-6 md:p-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute w-[600px] h-[600px] opacity-[0.05]"
          style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary), var(--tertiary))',
            backgroundSize: '200% 200%',
            animation: 'blob-morph 20s ease-in-out infinite, gradient-shift 8s ease-in-out infinite',
            top: '-10%',
            left: '-10%',
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
            <div className="w-12 h-12 primary-gradient rounded-xl flex items-center justify-center glow-primary">
              <span className="material-symbols-outlined text-background text-[24px]">shield</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text primary-gradient headline-font">
              Privacy Policy
            </h1>
          </div>

          <div className="space-y-8 text-on-surface-variant leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-on-surface mb-3 headline-font">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-on-surface mb-3 headline-font">2. Use of Information</h2>
              <p>
                We may use the information we collect about you to provide, maintain, and improve our services, including to facilitate payments, send receipts, provide products and services you request, develop new features, provide customer support to Users, develop safety features, authenticate users, and send product updates and administrative messages.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-on-surface mb-3 headline-font">3. Data Security</h2>
              <p>
                We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-on-surface mb-3 headline-font">4. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at <span className="text-primary font-semibold">privacy@home.local</span>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

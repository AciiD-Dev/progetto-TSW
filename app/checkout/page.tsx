'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isValidPlan, PLAN_LABELS, Plan } from '@/lib/plans';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planParam = searchParams.get('plan');
  const selectedPlan: Plan = isValidPlan(planParam) ? planParam : 'home_pro';

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');

  function handleFakePayment(e: React.FormEvent) {
    e.preventDefault();

    if (!cardName || !cardNumber || !expiry || !cvv) {
      setError('Compila tutti i campi della carta.');
      return;
    }

    if (cardNumber.replaceAll(' ', '').length < 12) {
      setError('Numero carta non valido.');
      return;
    }

    localStorage.setItem('homehub-plan', selectedPlan);

    router.push('/');
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-on-surface">
      <section className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6C63E6] text-lg font-bold text-white shadow-lg">
            H
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-[#2F3545]">
            Checkout simulato
          </h1>

          <p className="mt-3 text-sm text-[#6B7280]">
            Inserisci dati per attivare il piano selezionato.
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#E5E7F5] bg-white p-8 shadow-[0_20px_60px_rgba(108,99,230,0.12)]">
          <div className="mb-6 rounded-2xl bg-[#F4F3FF] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6C63E6]">
              Piano selezionato
            </p>

            <p className="mt-2 text-2xl font-bold text-[#2F3545]">
              {PLAN_LABELS[selectedPlan]}
            </p>

            <p className="mt-1 text-sm text-[#6B7280]">
              Questa è una simulazione per il progetto HomeHub.
            </p>
          </div>

          <form onSubmit={handleFakePayment} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">
                Nome sulla carta
              </label>
              <input
                 className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-sm text-[#2F3545] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6C63E6] focus:ring-4 focus:ring-[#6C63E6]/10"
                  placeholder="Mario Rossi"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">
                Numero carta
              </label>
              <input
                className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-sm text-[#2F3545] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6C63E6] focus:ring-4 focus:ring-[#6C63E6]/10"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">
                  Scadenza
                </label>
                <input
                  className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-sm text-[#2F3545] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6C63E6] focus:ring-4 focus:ring-[#6C63E6]/10"
                  placeholder="12/28"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">
                  CVV
                </label>
                <input
                  className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-sm text-[#2F3545] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6C63E6] focus:ring-4 focus:ring-[#6C63E6]/10"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#6C63E6] px-5 py-4 font-bold text-white shadow-[0_14px_30px_rgba(108,99,230,0.35)] transition hover:bg-[#5B54D8]"
            >
              Attiva piano
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-[#9CA3AF]">
            Nessun pagamento reale viene effettuato.
          </p>
        </div>
      </section>
    </main>
  );
}
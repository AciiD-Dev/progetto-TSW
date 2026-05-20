import Link from 'next/link';

interface PlanBlockedProps {
  title?: string;
  message?: string;
}

export default function PlanBlocked({
  title = 'Funzione non disponibile',
  message = 'Questa funzionalità non è inclusa nel tuo piano attuale.',
}: PlanBlockedProps) {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-on-surface">
      <section className="mx-auto max-w-xl rounded-[2rem] border border-[#E5E7F5] bg-white p-8 text-center shadow-[0_20px_60px_rgba(108,99,230,0.12)]">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4F3FF] text-2xl text-[#6C63E6]">
          ✦
        </div>

        <h1 className="text-3xl font-bold text-[#2F3545]">
          {title}
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#6B7280]">
          {message}
        </p>

        <Link
          href="/pricing"
          className="mt-6 inline-block rounded-2xl bg-[#6C63E6] px-6 py-3 font-bold text-white shadow-[0_14px_30px_rgba(108,99,230,0.35)] transition hover:bg-[#5B54D8]"
        >
          Vai ai piani
        </Link>
      </section>
    </main>
  );
}
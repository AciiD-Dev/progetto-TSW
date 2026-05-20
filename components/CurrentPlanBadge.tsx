'use client';

import { useEffect, useState } from 'react';
import { getPlanFromStorage, PLAN_LABELS, Plan } from '@/lib/plans';

export default function CurrentPlanBadge() {
  const [plan, setPlan] = useState<Plan>('free');

  useEffect(() => {
    setPlan(getPlanFromStorage());
  }, []);
  // Badge adattato al tema chiaro/scuro
  
  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container px-5 py-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">
        Piano attivo
      </p>

      <p className="mt-1 text-lg font-bold text-primary">
        {PLAN_LABELS[plan]}
      </p>
    </div>
  );
}
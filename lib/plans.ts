export type Plan = 'free' | 'home_pro' | 'infinite';

export const PLAN_LABELS: Record<Plan, string> = {
  free: 'Essential',
  home_pro: 'Home Pro',
  infinite: 'Infinite',
};
// Define the limits and features for each plan
export const PLAN_LIMITS = {
  free: {
    maxDevices: 5,
    maxRooms: 2,
    historyDays: 0,
    automations: false,
    alerts: false,
    support: false,
    multiHome: false,
    apiAccess: false,
  },

  home_pro: {
    maxDevices: 15,
    maxRooms: 6,
    historyDays: 30,
    automations: true,
    alerts: true,
    support: true,
    multiHome: false,
    apiAccess: false,
  },

  infinite: {
    maxDevices: Infinity,
    maxRooms: Infinity,
    historyDays: Infinity,
    automations: true,
    alerts: true,
    support: true,
    multiHome: true,
    apiAccess: true,
  },
} as const;

export function isValidPlan(plan: string | null): plan is Plan {
  return plan === 'free' || plan === 'home_pro' || plan === 'infinite';
}
// recupera il piano dell'utente dal localStorage, se esiste e è valido, altrimenti restituisce 'free'
export function getPlanFromStorage(): Plan {
  if (typeof window === 'undefined') return 'free';

  const storedPlan = localStorage.getItem('homehub-plan');

  if (isValidPlan(storedPlan)) {
    return storedPlan;
  }

  return 'free';
}
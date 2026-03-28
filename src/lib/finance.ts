import { AppState, Debt, Expense, IncomeEntry, RiskStatus } from '@/types/finance';

const STORAGE_KEY = 'cashflow-control-state';
const RISK_FACTOR = 0.3;
const MIN_DAILY_LIMIT = 50;
const AUSTERITY_LIMIT = 50;
const NEAR_DUE_DAYS = 3;
const NEAR_DUE_LIMIT = 60;

export function getDefaultState(): AppState {
  return {
    currentCash: 0,
    debts: [],
    expenses: [],
    incomes: [],
    consecutiveOverDays: 0,
    lastOverDate: null,
    austerityMode: false,
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...getDefaultState(), ...JSON.parse(raw) };
  } catch {}
  return getDefaultState();
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getNextDueDate(dueDay: number): Date {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), dueDay);
  if (thisMonth > now) return thisMonth;
  return new Date(now.getFullYear(), now.getMonth() + 1, dueDay);
}

function daysBetween(a: Date, b: Date): number {
  return Math.max(1, Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}

export function getUpcomingDebts(debts: Debt[]): (Debt & { nextDueDate: Date; daysUntil: number })[] {
  const now = new Date();
  return debts
    .map(d => {
      const nextDueDate = getNextDueDate(d.dueDay);
      return { ...d, nextDueDate, daysUntil: daysBetween(now, nextDueDate) };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

export function calculateDailyLimit(state: AppState): number {
  if (state.austerityMode) return AUSTERITY_LIMIT;

  const upcoming = getUpcomingDebts(state.debts);
  if (upcoming.length === 0) {
    // No debts, simple division over 30 days
    return Math.max(MIN_DAILY_LIMIT, Math.round((state.currentCash * RISK_FACTOR) / 30));
  }

  const totalDebt = upcoming.reduce((sum, d) => sum + d.amount, 0);
  const nearestDays = upcoming[0]?.daysUntil ?? 30;

  // Near due protection
  if (nearestDays <= NEAR_DUE_DAYS) {
    return Math.min(NEAR_DUE_LIMIT, Math.max(MIN_DAILY_LIMIT, Math.round((state.currentCash - totalDebt) * RISK_FACTOR / nearestDays)));
  }

  const available = state.currentCash - totalDebt;
  const raw = (available * RISK_FACTOR) / nearestDays;
  return Math.max(MIN_DAILY_LIMIT, Math.round(raw));
}

export function getTodayExpenses(expenses: Expense[]): Expense[] {
  const today = new Date().toDateString();
  return expenses.filter(e => new Date(e.timestamp).toDateString() === today);
}

export function getTodayTotal(expenses: Expense[]): number {
  return getTodayExpenses(expenses).reduce((sum, e) => sum + e.amount, 0);
}

export function getMonthTotal(expenses: Expense[]): number {
  const now = new Date();
  return expenses
    .filter(e => {
      const d = new Date(e.timestamp);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

export function getRiskStatus(remaining: number, dailyLimit: number): RiskStatus {
  if (remaining <= 0) return 'danger';
  if (remaining / dailyLimit <= 0.3) return 'warning';
  return 'safe';
}

export function checkAndUpdateOverStatus(state: AppState): AppState {
  const todayStr = new Date().toDateString();
  const dailyLimit = calculateDailyLimit(state);
  const todaySpent = getTodayTotal(state.expenses);

  if (todaySpent > dailyLimit) {
    if (state.lastOverDate && new Date(state.lastOverDate).toDateString() !== todayStr) {
      const lastDate = new Date(state.lastOverDate);
      const today = new Date(todayStr);
      const diffDays = daysBetween(lastDate, today);
      if (diffDays <= 1) {
        const newConsecutive = state.consecutiveOverDays + 1;
        return {
          ...state,
          consecutiveOverDays: newConsecutive,
          lastOverDate: todayStr,
          austerityMode: newConsecutive >= 3,
        };
      }
    }
    return {
      ...state,
      consecutiveOverDays: state.lastOverDate === todayStr ? state.consecutiveOverDays : 1,
      lastOverDate: todayStr,
    };
  }
  return state;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}

export function getCashFlowTimeline(state: AppState): { day: number; label: string; amount: number; type: 'debt' | 'income' }[] {
  const items: { day: number; label: string; amount: number; type: 'debt' | 'income' }[] = [];

  state.debts.forEach(d => {
    items.push({ day: d.dueDay, label: d.platform, amount: -d.amount, type: 'debt' });
  });

  state.incomes.forEach(i => {
    items.push({ day: i.day, label: i.source, amount: i.amount, type: 'income' });
  });

  return items.sort((a, b) => a.day - b.day);
}

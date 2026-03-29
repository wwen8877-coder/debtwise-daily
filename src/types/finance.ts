export type BillingCycle = 'yearly' | 'monthly' | 'daily';

export interface Debt {
  id: string;
  platform: string;
  amount: number;
  dueDay: number; // 1-31
  billingCycle: BillingCycle;
  hasInstallment: boolean;
  installmentPeriods?: number;
  isPaidThisMonth: boolean;
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  note?: string;
  timestamp: string;
}

export interface IncomeEntry {
  id: string;
  source: string;
  amount: number;
  day: number; // 1-31
}

export interface AppState {
  currentCash: number;
  debts: Debt[];
  expenses: Expense[];
  incomes: IncomeEntry[];
  consecutiveOverDays: number;
  lastOverDate: string | null;
  austerityMode: boolean;
}

export type RiskStatus = 'safe' | 'warning' | 'danger';

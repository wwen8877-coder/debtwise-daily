import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppState, Debt, Expense, IncomeEntry } from '@/types/finance';
import { loadState, saveState, generateId, checkAndUpdateOverStatus } from '@/lib/finance';

interface FinanceContextType {
  state: AppState;
  setCash: (amount: number) => void;
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;

  removeDebt: (id: string) => void;
  updateDebt: (debt: Debt) => void;
  addExpense: (amount: number, note?: string) => void;
  addIncome: (income: Omit<IncomeEntry, 'id'>) => void;
  removeIncome: (id: string) => void;
  resetAusterity: () => void;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setCash = useCallback((amount: number) => {
    setState(s => ({ ...s, currentCash: amount }));
  }, []);

  const addDebt = useCallback((debt: Omit<Debt, 'id' | 'createdAt'>) => {
    setState(s => ({
      ...s,
      debts: [...s.debts, { ...debt, id: generateId(), createdAt: new Date().toISOString() }],
    }));
  }, []);

  const removeDebt = useCallback((id: string) => {
    setState(s => ({ ...s, debts: s.debts.filter(d => d.id !== id) }));
  }, []);

  const updateDebt = useCallback((debt: Debt) => {
    setState(s => ({ ...s, debts: s.debts.map(d => d.id === debt.id ? debt : d) }));
  }, []);

  const addExpense = useCallback((amount: number, note?: string) => {
    setState(s => {
      const newState = {
        ...s,
        expenses: [...s.expenses, { id: generateId(), amount, note, timestamp: new Date().toISOString() }],
      };
      return checkAndUpdateOverStatus(newState);
    });
  }, []);

  const addIncome = useCallback((income: Omit<IncomeEntry, 'id'>) => {
    setState(s => ({ ...s, incomes: [...s.incomes, { ...income, id: generateId() }] }));
  }, []);

  const removeIncome = useCallback((id: string) => {
    setState(s => ({ ...s, incomes: s.incomes.filter(i => i.id !== id) }));
  }, []);

  const resetAusterity = useCallback(() => {
    setState(s => ({ ...s, austerityMode: false, consecutiveOverDays: 0 }));
  }, []);

  return (
    <FinanceContext.Provider value={{ state, setCash, addDebt, removeDebt, updateDebt, addExpense, addIncome, removeIncome, resetAusterity }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}

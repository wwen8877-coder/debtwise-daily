import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { calculateDailyLimit, getTodayTotal, getRiskStatus, formatCurrency, getTodayExpenses } from '@/lib/finance';
import { TrendingDown, Plus, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';

const DashboardView = () => {
  const { state, addExpense } = useFinance();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const dailyLimit = calculateDailyLimit(state);
  const todaySpent = getTodayTotal(state.expenses);
  const remaining = dailyLimit - todaySpent;
  const status = getRiskStatus(remaining, dailyLimit);
  const todayExpenses = getTodayExpenses(state.expenses);

  const statusConfig = {
    safe: { label: '正常', pillBg: 'bg-status-safe/10', pillText: 'text-status-safe', accentBg: 'bg-status-safe' },
    warning: { label: '临界', pillBg: 'bg-status-warning/10', pillText: 'text-status-warning', accentBg: 'bg-status-warning' },
    danger: { label: '超额', pillBg: 'bg-status-danger/10', pillText: 'text-status-danger', accentBg: 'bg-status-danger' },
  };

  const cfg = statusConfig[status];

  const handleAdd = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    addExpense(val, note || undefined);
    setAmount('');
    setNote('');
  };

  const percentage = dailyLimit > 0 ? Math.max(0, Math.min(100, (remaining / dailyLimit) * 100)) : 0;

  return (
    <div className="space-y-5">
      {/* Austerity mode warning */}
      {state.austerityMode && (
        <div className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
          <ShieldAlert className="h-5 w-5 text-destructive shrink-0" />
          <div>
            <p className="text-sm font-semibold text-destructive">紧缩模式已激活</p>
            <p className="text-xs text-muted-foreground">连续超额消费，每日额度固定为 ¥50</p>
          </div>
        </div>
      )}

      {/* Main limit card */}
      <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.pillBg} ${cfg.pillText}`}>
            {status === 'danger' && <AlertTriangle className="h-3 w-3" />}
            {cfg.label}
          </span>
          <span className="text-xs text-muted-foreground">今日额度</span>
        </div>

        <div className="text-center mb-6">
          <p className="text-5xl font-display font-bold text-foreground tracking-tight">
            {formatCurrency(Math.max(0, remaining))}
          </p>
          <p className="text-sm text-muted-foreground mt-2">剩余可用</p>
        </div>

        {/* Progress bar */}
        <div className="h-3 rounded-full bg-secondary overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${cfg.accentBg}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between mt-3 text-xs text-muted-foreground">
          <span>已花 <span className="font-mono text-foreground">{formatCurrency(todaySpent)}</span></span>
          <span>额度 <span className="font-mono text-foreground">{formatCurrency(dailyLimit)}</span></span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card p-4 shadow-sm border border-border">
          <p className="text-xs text-muted-foreground mb-1">现金余额</p>
          <p className="text-2xl font-display font-bold text-foreground">{formatCurrency(state.currentCash)}</p>
        </div>
        <div className="rounded-2xl bg-primary p-4 shadow-sm">
          <p className="text-xs text-primary-foreground/70 mb-1">负债笔数</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-display font-bold text-primary-foreground">{state.debts.length}</p>
            <ArrowRight className="h-5 w-5 text-primary-foreground/70" />
          </div>
        </div>
      </div>

      {/* Quick expense input */}
      <div className="rounded-2xl bg-card p-5 shadow-sm border border-border">
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
          快速记账
        </p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="金额"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="flex-1 rounded-xl bg-secondary border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <input
            type="text"
            placeholder="备注"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-20 rounded-xl bg-secondary border-0 px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="rounded-xl bg-foreground px-4 py-3 text-card font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Today's expenses */}
      {todayExpenses.length > 0 && (
        <div className="rounded-2xl bg-card p-5 shadow-sm border border-border">
          <p className="text-sm font-semibold text-foreground mb-3">今日消费记录</p>
          <div className="space-y-2">
            {todayExpenses.slice().reverse().map(exp => (
              <div key={exp.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{exp.note || '消费'}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(exp.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-sm font-semibold text-foreground">-{formatCurrency(exp.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;

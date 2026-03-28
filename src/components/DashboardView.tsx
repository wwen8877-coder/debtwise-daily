import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { calculateDailyLimit, getTodayTotal, getRiskStatus, formatCurrency, getTodayExpenses } from '@/lib/finance';
import { TrendingDown, Plus, AlertTriangle, ShieldAlert } from 'lucide-react';

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
    safe: { label: '正常', color: 'text-status-safe', bg: 'status-gradient-safe', glow: 'glow-safe', border: 'border-status-safe/30' },
    warning: { label: '临界', color: 'text-status-warning', bg: 'status-gradient-warning', glow: 'glow-warning', border: 'border-status-warning/30' },
    danger: { label: '超额', color: 'text-status-danger', bg: 'status-gradient-danger', glow: 'glow-danger', border: 'border-status-danger/30' },
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
    <div className="space-y-4">
      {/* Austerity mode warning */}
      {state.austerityMode && (
        <div className="flex items-center gap-3 rounded-lg border border-status-danger/40 bg-status-danger/10 p-3">
          <ShieldAlert className="h-5 w-5 text-status-danger shrink-0" />
          <div>
            <p className="text-sm font-semibold text-status-danger">紧缩模式已激活</p>
            <p className="text-xs text-muted-foreground">连续超额消费，每日额度固定为 ¥50</p>
          </div>
        </div>
      )}

      {/* Main limit card */}
      <div className={`rounded-xl border ${cfg.border} ${cfg.bg} p-6 ${cfg.glow}`}>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">今日可用额度</p>
          <p className={`text-5xl font-mono font-bold ${cfg.color} tracking-tight`}>
            {formatCurrency(Math.max(0, remaining))}
          </p>
          <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-medium ${cfg.color} bg-background/50`}>
            {status === 'danger' && <AlertTriangle className="h-3 w-3" />}
            {cfg.label}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 h-2 rounded-full bg-background/50 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              status === 'safe' ? 'bg-status-safe' : status === 'warning' ? 'bg-status-warning' : 'bg-status-danger'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between mt-3 text-xs text-muted-foreground">
          <span>已花 {formatCurrency(todaySpent)}</span>
          <span>额度 {formatCurrency(dailyLimit)}</span>
        </div>
      </div>

      {/* Quick expense input */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
          快速记账
        </p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="金额"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="flex-1 rounded-lg bg-muted border-0 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <input
            type="text"
            placeholder="备注(可选)"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-24 rounded-lg bg-muted border-0 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="rounded-lg bg-primary px-4 py-2.5 text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Today's expenses */}
      {todayExpenses.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground mb-3">今日消费记录</p>
          <div className="space-y-2">
            {todayExpenses.slice().reverse().map(exp => (
              <div key={exp.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                <div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(exp.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {exp.note && <span className="text-xs text-muted-foreground ml-2">{exp.note}</span>}
                </div>
                <span className="font-mono text-sm text-status-danger">-{formatCurrency(exp.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;

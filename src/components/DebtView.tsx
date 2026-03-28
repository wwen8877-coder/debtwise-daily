import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { getUpcomingDebts, formatCurrency } from '@/lib/finance';
import { Plus, Trash2, AlertCircle, CreditCard } from 'lucide-react';

const DebtView = () => {
  const { state, addDebt, removeDebt } = useFinance();
  const [platform, setPlatform] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [showForm, setShowForm] = useState(false);

  const upcoming = getUpcomingDebts(state.debts);

  const handleAdd = () => {
    const amt = parseFloat(amount);
    const day = parseInt(dueDay);
    if (!platform.trim() || isNaN(amt) || amt <= 0 || isNaN(day) || day < 1 || day > 31) return;
    addDebt({ platform: platform.trim(), amount: amt, dueDay: day });
    setPlatform('');
    setAmount('');
    setDueDay('');
    setShowForm(false);
  };

  const totalDebt = state.debts.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground">负债总额</p>
        <p className="text-3xl font-mono font-bold text-status-danger mt-1">{formatCurrency(totalDebt)}</p>
        <p className="text-xs text-muted-foreground mt-1">{state.debts.length} 笔负债</p>
      </div>

      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-xl border border-dashed border-border bg-card/50 p-4 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          添加负债
        </button>
      )}

      {/* Add form */}
      {showForm && (
        <div className="rounded-xl border border-primary/30 bg-card p-4 space-y-3">
          <input
            type="text"
            placeholder="平台名称 (如信用卡、花呗)"
            value={platform}
            onChange={e => setPlatform(e.target.value)}
            className="w-full rounded-lg bg-muted border-0 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="应还金额"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="flex-1 rounded-lg bg-muted border-0 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
            />
            <input
              type="number"
              placeholder="还款日(几号)"
              value={dueDay}
              onChange={e => setDueDay(e.target.value)}
              min={1}
              max={31}
              className="w-28 rounded-lg bg-muted border-0 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-primary-foreground font-medium text-sm">
              确认添加
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-lg bg-muted px-4 py-2.5 text-muted-foreground text-sm">
              取消
            </button>
          </div>
        </div>
      )}

      {/* Debt list */}
      <div className="space-y-2">
        {upcoming.map(debt => {
          const isUrgent = debt.daysUntil <= 3;
          return (
            <div
              key={debt.id}
              className={`rounded-xl border ${isUrgent ? 'border-status-danger/40 status-gradient-danger' : 'border-border bg-card'} p-4`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${isUrgent ? 'bg-status-danger/20' : 'bg-muted'}`}>
                    <CreditCard className={`h-4 w-4 ${isUrgent ? 'text-status-danger' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{debt.platform}</p>
                    <p className="text-xs text-muted-foreground">每月 {debt.dueDay} 号还款</p>
                  </div>
                </div>
                <button onClick={() => removeDebt(debt.id)} className="text-muted-foreground hover:text-status-danger transition-colors p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-end justify-between mt-3">
                <p className="font-mono text-lg font-semibold text-foreground">{formatCurrency(debt.amount)}</p>
                <div className="flex items-center gap-1">
                  {isUrgent && <AlertCircle className="h-3.5 w-3.5 text-status-danger" />}
                  <span className={`text-xs font-medium ${isUrgent ? 'text-status-danger' : 'text-muted-foreground'}`}>
                    {debt.daysUntil === 0 ? '今天到期' : `${debt.daysUntil} 天后`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DebtView;

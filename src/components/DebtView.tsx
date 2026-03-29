import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { getUpcomingDebts, formatCurrency } from '@/lib/finance';
import { Plus, Trash2, AlertCircle, CreditCard, ArrowRight } from 'lucide-react';

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
    <div className="space-y-5">
      {/* Summary */}
      <div className="rounded-2xl bg-foreground p-5">
        <p className="text-xs text-card/60">负债总额</p>
        <p className="text-3xl font-display font-bold text-card mt-1">{formatCurrency(totalDebt)}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-card/60">{state.debts.length} 笔负债</span>
          <ArrowRight className="h-4 w-4 text-card/60" />
        </div>
      </div>

      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-2xl border-2 border-dashed border-border bg-card p-4 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          添加负债
        </button>
      )}

      {/* Add form */}
      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-sm">
          <input
            type="text"
            placeholder="平台名称 (如信用卡、花呗)"
            value={platform}
            onChange={e => setPlatform(e.target.value)}
            className="w-full rounded-xl bg-secondary border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="应还金额"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="flex-1 rounded-xl bg-secondary border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
            />
            <input
              type="number"
              placeholder="几号还款"
              value={dueDay}
              onChange={e => setDueDay(e.target.value)}
              min={1}
              max={31}
              className="w-28 rounded-xl bg-secondary border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 rounded-xl bg-foreground px-4 py-3 text-card font-medium text-sm">
              确认添加
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-xl bg-secondary px-4 py-3 text-muted-foreground text-sm">
              取消
            </button>
          </div>
        </div>
      )}

      {/* Debt list */}
      <div className="space-y-3">
        {upcoming.map(debt => {
          const isUrgent = debt.daysUntil <= 3;
          return (
            <div
              key={debt.id}
              className={`rounded-2xl border ${isUrgent ? 'border-destructive/20 bg-destructive/5' : 'border-border bg-card'} p-4 shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-2.5 ${isUrgent ? 'bg-destructive/10' : 'bg-secondary'}`}>
                    <CreditCard className={`h-4 w-4 ${isUrgent ? 'text-destructive' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{debt.platform}</p>
                    <p className="text-xs text-muted-foreground">每月 {debt.dueDay} 号</p>
                  </div>
                </div>
                <button onClick={() => removeDebt(debt.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-end justify-between mt-3">
                <p className="font-mono text-xl font-bold text-foreground">{formatCurrency(debt.amount)}</p>
                <div className="flex items-center gap-1.5">
                  {isUrgent && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    isUrgent ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-muted-foreground'
                  }`}>
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

import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { getUpcomingDebts, formatCurrency } from '@/lib/finance';
import { BillingCycle } from '@/types/finance';
import { Plus, Trash2, AlertCircle, CreditCard, ArrowRight, CheckCircle2, Clock, Repeat } from 'lucide-react';

const CYCLE_OPTIONS: { value: BillingCycle; label: string }[] = [
  { value: 'monthly', label: '月' },
  { value: 'yearly', label: '年' },
  { value: 'daily', label: '日' },
];

const DebtView = () => {
  const { state, addDebt, removeDebt, updateDebt } = useFinance();
  const [platform, setPlatform] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [hasInstallment, setHasInstallment] = useState(false);
  const [installmentPeriods, setInstallmentPeriods] = useState('');
  const [showForm, setShowForm] = useState(false);

  const upcoming = getUpcomingDebts(state.debts);

  const handleAdd = () => {
    const amt = parseFloat(amount);
    const day = parseInt(dueDay);
    if (!platform.trim() || isNaN(amt) || amt <= 0 || isNaN(day) || day < 1 || day > 31) return;
    if (hasInstallment && (!installmentPeriods || parseInt(installmentPeriods) <= 0)) return;

    addDebt({
      platform: platform.trim(),
      amount: amt,
      dueDay: day,
      billingCycle,
      hasInstallment,
      installmentPeriods: hasInstallment ? parseInt(installmentPeriods) : undefined,
      isPaidThisMonth: false,
    });
    setPlatform('');
    setAmount('');
    setDueDay('');
    setBillingCycle('monthly');
    setHasInstallment(false);
    setInstallmentPeriods('');
    setShowForm(false);
  };

  const togglePaid = (debtId: string) => {
    const debt = state.debts.find(d => d.id === debtId);
    if (debt) {
      updateDebt({ ...debt, isPaidThisMonth: !debt.isPaidThisMonth });
    }
  };

  const totalDebt = state.debts.filter(d => !d.isPaidThisMonth).reduce((s, d) => s + d.amount, 0);
  const paidCount = state.debts.filter(d => d.isPaidThisMonth).length;

  const cycleLabel = (c: BillingCycle) => {
    switch (c) {
      case 'yearly': return '年付';
      case 'monthly': return '月付';
      case 'daily': return '日付';
    }
  };

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="rounded-2xl bg-foreground p-5">
        <p className="text-xs text-card/60">未还负债总额</p>
        <p className="text-3xl font-display font-bold text-card mt-1">{formatCurrency(totalDebt)}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-card/60">
            {state.debts.length} 笔负债 · {paidCount} 笔已还
          </span>
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

          {/* Billing cycle */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">账单周期</p>
            <div className="flex gap-2">
              {CYCLE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setBillingCycle(opt.value)}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    billingCycle === opt.value
                      ? 'bg-foreground text-card'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Installment toggle */}
          <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
            <span className="text-sm text-foreground">是否分期</span>
            <button
              onClick={() => setHasInstallment(!hasInstallment)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                hasInstallment ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-card transition-transform ${
                  hasInstallment ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Installment periods */}
          {hasInstallment && (
            <input
              type="number"
              placeholder="分期期数（如 3、6、12）"
              value={installmentPeriods}
              onChange={e => setInstallmentPeriods(e.target.value)}
              min={1}
              className="w-full rounded-xl bg-secondary border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          )}

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
          const isUrgent = debt.daysUntil <= 3 && !debt.isPaidThisMonth;
          const isPaid = debt.isPaidThisMonth;
          return (
            <div
              key={debt.id}
              className={`rounded-2xl border ${
                isPaid
                  ? 'border-primary/20 bg-primary/5'
                  : isUrgent
                  ? 'border-destructive/20 bg-destructive/5'
                  : 'border-border bg-card'
              } p-4 shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-2.5 ${
                    isPaid ? 'bg-primary/10' : isUrgent ? 'bg-destructive/10' : 'bg-secondary'
                  }`}>
                    <CreditCard className={`h-4 w-4 ${
                      isPaid ? 'text-primary' : isUrgent ? 'text-destructive' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isPaid ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {debt.platform}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">每{cycleLabel(debt.billingCycle).charAt(0)} {debt.dueDay} 号</span>
                      <span className="text-xs text-muted-foreground/60">·</span>
                      <span className="text-xs text-muted-foreground">{cycleLabel(debt.billingCycle)}</span>
                      {debt.hasInstallment && (
                        <>
                          <span className="text-xs text-muted-foreground/60">·</span>
                          <span className="text-xs text-primary flex items-center gap-0.5">
                            <Repeat className="h-3 w-3" />
                            {debt.installmentPeriods}期
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePaid(debt.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isPaid ? 'text-primary hover:text-primary/80' : 'text-muted-foreground hover:text-primary'
                    }`}
                    title={isPaid ? '标记为未还' : '标记为已还'}
                  >
                    {isPaid ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </button>
                  <button onClick={() => removeDebt(debt.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-end justify-between mt-3">
                <p className={`font-mono text-xl font-bold ${isPaid ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {formatCurrency(debt.amount)}
                </p>
                <div className="flex items-center gap-1.5">
                  {isPaid ? (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      已还款
                    </span>
                  ) : (
                    <>
                      {isUrgent && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        isUrgent ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-muted-foreground'
                      }`}>
                        {debt.daysUntil === 0 ? '今天到期' : `${debt.daysUntil} 天后`}
                      </span>
                    </>
                  )}
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

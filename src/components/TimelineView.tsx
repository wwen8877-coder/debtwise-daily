import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { getCashFlowTimeline, formatCurrency } from '@/lib/finance';
import { ArrowDownCircle, ArrowUpCircle, Plus, Trash2 } from 'lucide-react';

const TimelineView = () => {
  const { state, addIncome, removeIncome } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState('');

  const timeline = getCashFlowTimeline(state);
  const now = new Date();
  const currentDay = now.getDate();

  const handleAdd = () => {
    const amt = parseFloat(amount);
    const d = parseInt(day);
    if (!source.trim() || isNaN(amt) || amt <= 0 || isNaN(d) || d < 1 || d > 31) return;
    addIncome({ source: source.trim(), amount: amt, day: d });
    setSource('');
    setAmount('');
    setDay('');
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-card p-5 shadow-sm border border-border">
        <p className="text-base font-semibold font-display text-foreground mb-1">现金流时间轴</p>
        <p className="text-xs text-muted-foreground">本月资金变动 · 当前现金 <span className="font-mono font-semibold text-foreground">{formatCurrency(state.currentCash)}</span></p>
      </div>

      {/* Add income */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-2xl border-2 border-dashed border-border bg-card p-3.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          添加收入
        </button>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-sm">
          <input type="text" placeholder="收入来源 (如工资)" value={source} onChange={e => setSource(e.target.value)}
            className="w-full rounded-xl bg-secondary border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <div className="flex gap-2">
            <input type="number" placeholder="金额" value={amount} onChange={e => setAmount(e.target.value)}
              className="flex-1 rounded-xl bg-secondary border-0 px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <input type="number" placeholder="几号" value={day} onChange={e => setDay(e.target.value)} min={1} max={31}
              className="w-20 rounded-xl bg-secondary border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 rounded-xl bg-foreground px-4 py-3 text-card font-medium text-sm">确认</button>
            <button onClick={() => setShowForm(false)} className="rounded-xl bg-secondary px-4 py-3 text-muted-foreground text-sm">取消</button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

        <div className="space-y-2">
          {timeline.map((item, i) => {
            const isPast = item.day < currentDay;
            const isToday = item.day === currentDay;
            const isDebt = item.type === 'debt';

            return (
              <div key={`${item.type}-${item.label}-${item.day}-${i}`} className={`relative flex items-center gap-4 pl-0 py-1.5 ${isPast ? 'opacity-40' : ''}`}>
                <div className={`relative z-10 rounded-full p-1.5 ${
                  isToday ? 'bg-foreground ring-2 ring-foreground/20' :
                  isDebt ? 'bg-destructive/10' : 'bg-primary/20'
                }`}>
                  {isDebt ? (
                    <ArrowDownCircle className={`h-4 w-4 ${isToday ? 'text-card' : 'text-destructive'}`} />
                  ) : (
                    <ArrowUpCircle className={`h-4 w-4 ${isToday ? 'text-card' : 'text-status-safe'}`} />
                  )}
                </div>
                <div className="flex-1 flex items-center justify-between rounded-2xl bg-card border border-border px-4 py-3 shadow-sm">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.day}号</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-sm font-bold ${isDebt ? 'text-destructive' : 'text-status-safe'}`}>
                      {isDebt ? '' : '+'}{formatCurrency(Math.abs(item.amount))}
                    </span>
                    {item.type === 'income' && (
                      <button
                        onClick={() => {
                          const inc = state.incomes.find(i => i.source === item.label && i.day === item.day);
                          if (inc) removeIncome(inc.id);
                        }}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {timeline.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">暂无数据，请先添加负债或收入</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineView;

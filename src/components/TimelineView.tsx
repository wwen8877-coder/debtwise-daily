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
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium text-foreground mb-1">现金流时间轴</p>
        <p className="text-xs text-muted-foreground">本月资金变动一览 · 当前现金 <span className="font-mono text-foreground">{formatCurrency(state.currentCash)}</span></p>
      </div>

      {/* Add income */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-xl border border-dashed border-border bg-card/50 p-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          添加收入
        </button>
      ) : (
        <div className="rounded-xl border border-primary/30 bg-card p-4 space-y-3">
          <input type="text" placeholder="收入来源 (如工资)" value={source} onChange={e => setSource(e.target.value)}
            className="w-full rounded-lg bg-muted border-0 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <div className="flex gap-2">
            <input type="number" placeholder="金额" value={amount} onChange={e => setAmount(e.target.value)}
              className="flex-1 rounded-lg bg-muted border-0 px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <input type="number" placeholder="几号" value={day} onChange={e => setDay(e.target.value)} min={1} max={31}
              className="w-20 rounded-lg bg-muted border-0 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-primary-foreground font-medium text-sm">确认</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg bg-muted px-4 py-2.5 text-muted-foreground text-sm">取消</button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

        <div className="space-y-1">
          {timeline.map((item, i) => {
            const isPast = item.day < currentDay;
            const isToday = item.day === currentDay;
            const isDebt = item.type === 'debt';

            return (
              <div key={`${item.type}-${item.label}-${item.day}-${i}`} className={`relative flex items-center gap-4 pl-0 py-2 ${isPast ? 'opacity-50' : ''}`}>
                <div className={`relative z-10 rounded-full p-1.5 ${
                  isToday ? 'bg-primary ring-2 ring-primary/30' :
                  isDebt ? 'bg-status-danger/20' : 'bg-status-safe/20'
                }`}>
                  {isDebt ? (
                    <ArrowDownCircle className={`h-4 w-4 ${isToday ? 'text-primary-foreground' : 'text-status-danger'}`} />
                  ) : (
                    <ArrowUpCircle className={`h-4 w-4 ${isToday ? 'text-primary-foreground' : 'text-status-safe'}`} />
                  )}
                </div>
                <div className="flex-1 flex items-center justify-between rounded-lg bg-card border border-border/50 px-3 py-2">
                  <div>
                    <p className="text-sm text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.day}号</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-sm font-semibold ${isDebt ? 'text-status-danger' : 'text-status-safe'}`}>
                      {isDebt ? '' : '+'}{formatCurrency(Math.abs(item.amount))}
                    </span>
                    {item.type === 'income' && (
                      <button
                        onClick={() => {
                          const inc = state.incomes.find(i => i.source === item.label && i.day === item.day);
                          if (inc) removeIncome(inc.id);
                        }}
                        className="text-muted-foreground hover:text-status-danger transition-colors"
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

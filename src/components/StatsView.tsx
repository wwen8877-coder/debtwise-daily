import { useFinance } from '@/contexts/FinanceContext';
import { getTodayTotal, getMonthTotal, formatCurrency } from '@/lib/finance';
import { BarChart3, Calendar, Clock } from 'lucide-react';

const StatsView = () => {
  const { state } = useFinance();

  const todayTotal = getTodayTotal(state.expenses);
  const monthTotal = getMonthTotal(state.expenses);
  const recent = state.expenses.slice().reverse().slice(0, 20);

  return (
    <div className="space-y-4">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">今日消费</p>
          </div>
          <p className="text-2xl font-mono font-bold text-foreground">{formatCurrency(todayTotal)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">本月消费</p>
          </div>
          <p className="text-2xl font-mono font-bold text-foreground">{formatCurrency(monthTotal)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">现金余额</p>
        </div>
        <p className="text-2xl font-mono font-bold text-status-safe">{formatCurrency(state.currentCash)}</p>
      </div>

      {/* Recent expenses */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium text-foreground mb-3">最近消费记录</p>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">暂无消费记录</p>
        ) : (
          <div className="space-y-2">
            {recent.map(exp => (
              <div key={exp.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                <div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(exp.timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    {' '}
                    {new Date(exp.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {exp.note && <span className="text-xs text-muted-foreground ml-2">· {exp.note}</span>}
                </div>
                <span className="font-mono text-sm text-status-danger">-{formatCurrency(exp.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsView;

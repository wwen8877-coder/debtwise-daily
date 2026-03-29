import { useFinance } from '@/contexts/FinanceContext';
import { getTodayTotal, getMonthTotal, formatCurrency } from '@/lib/finance';
import { TrendingDown, Calendar, Wallet } from 'lucide-react';

const StatsView = () => {
  const { state } = useFinance();

  const todayTotal = getTodayTotal(state.expenses);
  const monthTotal = getMonthTotal(state.expenses);
  const recent = state.expenses.slice().reverse().slice(0, 20);

  return (
    <div className="space-y-5">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-destructive" />
            </div>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{formatCurrency(todayTotal)}</p>
          <p className="text-xs text-muted-foreground mt-1">今日消费</p>
        </div>
        <div className="rounded-2xl bg-card p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-primary/20 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{formatCurrency(monthTotal)}</p>
          <p className="text-xs text-muted-foreground mt-1">本月消费</p>
        </div>
      </div>

      <div className="rounded-2xl bg-primary p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="h-4 w-4 text-primary-foreground/70" />
          <p className="text-xs text-primary-foreground/70">现金余额</p>
        </div>
        <p className="text-3xl font-display font-bold text-primary-foreground">{formatCurrency(state.currentCash)}</p>
      </div>

      {/* Recent expenses */}
      <div className="rounded-2xl bg-card p-5 shadow-sm border border-border">
        <p className="text-sm font-semibold text-foreground mb-4">最近消费记录</p>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">暂无消费记录</p>
        ) : (
          <div className="space-y-1">
            {recent.map(exp => (
              <div key={exp.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                    <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{exp.note || '消费'}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(exp.timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                      {' '}
                      {new Date(exp.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-sm font-semibold text-foreground">-{formatCurrency(exp.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsView;

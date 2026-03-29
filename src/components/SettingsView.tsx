import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/finance';
import { Wallet, Settings, RotateCcw, Info } from 'lucide-react';

const SettingsView = () => {
  const { state, setCash, resetAusterity } = useFinance();
  const [cashInput, setCashInput] = useState(state.currentCash.toString());

  const handleSave = () => {
    const val = parseFloat(cashInput);
    if (!isNaN(val) && val >= 0) setCash(val);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-card p-5 shadow-sm border border-border">
        <div className="flex items-center gap-2 mb-5">
          <div className="h-8 w-8 rounded-xl bg-secondary flex items-center justify-center">
            <Settings className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-base font-semibold font-display text-foreground">系统设置</p>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-2 block">当前现金余额</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="number"
                value={cashInput}
                onChange={e => setCashInput(e.target.value)}
                className="w-full rounded-xl bg-secondary border-0 pl-11 pr-4 py-3 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button onClick={handleSave} className="rounded-xl bg-foreground px-5 py-3 text-card font-medium text-sm">
              保存
            </button>
          </div>
        </div>
      </div>

      {/* System status */}
      <div className="rounded-2xl bg-card p-5 shadow-sm border border-border space-y-4">
        <p className="text-base font-semibold font-display text-foreground">系统状态</p>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">紧缩模式</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              state.austerityMode ? 'bg-destructive/10 text-destructive' : 'bg-status-safe/10 text-status-safe'
            }`}>
              {state.austerityMode ? '已激活' : '未激活'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">连续超额天数</span>
            <span className="text-foreground font-mono font-semibold">{state.consecutiveOverDays}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">消费记录总数</span>
            <span className="text-foreground font-mono font-semibold">{state.expenses.length}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">负债数量</span>
            <span className="text-foreground font-mono font-semibold">{state.debts.length}</span>
          </div>
        </div>

        {state.austerityMode && (
          <button
            onClick={resetAusterity}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            解除紧缩模式
          </button>
        )}
      </div>

      {/* Info */}
      <div className="rounded-2xl bg-primary/10 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-foreground" />
          <p className="text-sm font-semibold text-foreground">计算规则</p>
        </div>
        <div className="text-xs text-muted-foreground space-y-2">
          <p>• 每日额度 = (现金 - 未到期负债) ÷ 距最近还款日天数 × 0.3</p>
          <p>• 最低额度保护：¥50</p>
          <p>• 还款日前3天：额度上限 ¥60</p>
          <p>• 连续3天超额：进入紧缩模式（固定 ¥50/天）</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

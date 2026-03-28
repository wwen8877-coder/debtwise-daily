import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/finance';
import { Wallet, Settings, RotateCcw } from 'lucide-react';

const SettingsView = () => {
  const { state, setCash, resetAusterity } = useFinance();
  const [cashInput, setCashInput] = useState(state.currentCash.toString());

  const handleSave = () => {
    const val = parseFloat(cashInput);
    if (!isNaN(val) && val >= 0) setCash(val);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">系统设置</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">当前现金余额</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  value={cashInput}
                  onChange={e => setCashInput(e.target.value)}
                  className="w-full rounded-lg bg-muted border-0 pl-10 pr-3 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button onClick={handleSave} className="rounded-lg bg-primary px-4 py-2.5 text-primary-foreground font-medium text-sm">
                保存
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System status */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">系统状态</p>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">紧缩模式</span>
            <span className={state.austerityMode ? 'text-status-danger font-medium' : 'text-status-safe'}>
              {state.austerityMode ? '已激活' : '未激活'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">连续超额天数</span>
            <span className="text-foreground font-mono">{state.consecutiveOverDays}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">消费记录总数</span>
            <span className="text-foreground font-mono">{state.expenses.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">负债数量</span>
            <span className="text-foreground font-mono">{state.debts.length}</span>
          </div>
        </div>

        {state.austerityMode && (
          <button
            onClick={resetAusterity}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg border border-status-warning/30 bg-status-warning/10 px-4 py-2.5 text-sm text-status-warning hover:bg-status-warning/20 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            解除紧缩模式
          </button>
        )}
      </div>

      {/* Info */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium text-foreground mb-2">计算规则</p>
        <div className="text-xs text-muted-foreground space-y-1.5">
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

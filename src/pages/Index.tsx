import { useState } from 'react';
import { FinanceProvider } from '@/contexts/FinanceContext';
import DashboardView from '@/components/DashboardView';
import DebtView from '@/components/DebtView';
import TimelineView from '@/components/TimelineView';
import StatsView from '@/components/StatsView';
import SettingsView from '@/components/SettingsView';
import { Gauge, CreditCard, GitBranch, BarChart3, Settings } from 'lucide-react';

type Tab = 'dashboard' | 'debts' | 'timeline' | 'stats' | 'settings';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: '控制台', icon: Gauge },
  { id: 'debts', label: '负债', icon: CreditCard },
  { id: 'timeline', label: '时间轴', icon: GitBranch },
  { id: 'stats', label: '统计', icon: BarChart3 },
  { id: 'settings', label: '设置', icon: Settings },
];

const AppShell = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'debts': return <DebtView />;
      case 'timeline': return <TimelineView />;
      case 'stats': return <StatsView />;
      case 'settings': return <SettingsView />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-display text-foreground tracking-tight">
              {tabs.find(t => t.id === activeTab)?.label === '控制台' ? 'CashFlow Control' : tabs.find(t => t.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">个人现金流控制系统</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-foreground flex items-center justify-center">
            <span className="text-xs font-bold text-card">CF</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-5 pb-24 overflow-y-auto">
        {renderView()}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="max-w-lg mx-auto flex">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary' : ''}`}>
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : ''}`} />
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

const Index = () => (
  <FinanceProvider>
    <AppShell />
  </FinanceProvider>
);

export default Index;

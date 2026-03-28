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
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Gauge className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-sm font-semibold text-foreground tracking-tight">CashFlow Control</h1>
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full ml-1">v1.0</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4 pb-20 overflow-y-auto">
        {renderView()}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border">
        <div className="max-w-lg mx-auto flex">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
                {isActive && <div className="h-0.5 w-4 rounded-full bg-primary mt-0.5" />}
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

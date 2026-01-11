
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ResearchStation from './components/ResearchStation';
import Vault from './components/Vault';
import KnowledgeGraph from './components/KnowledgeGraph';
import KitsStation from './components/KitsStation';
import DebateStation from './components/DebateStation';
import AgentStation from './components/AgentStation';
import Onboarding from './components/Onboarding';
import SplashScreen from './components/SplashScreen';
import SettingsStation from './components/SettingsStation';
import { useAppStore } from './stores/appStore';
import { useVaultStore } from './stores/vaultStore';
import { AppView } from './types';

const App: React.FC = () => {
  const { view, setView } = useAppStore();
  const { items } = useVaultStore();
  const [booting, setBooting] = useState(true);
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem('aethel_onboarded') === 'true');

  if (booting) {
    return <SplashScreen onComplete={() => setBooting(false)} />;
  }

  if (!onboarded) {
    return <Onboarding onComplete={() => { setOnboarded(true); localStorage.setItem('aethel_onboarded', 'true'); }} />;
  }

  const renderView = () => {
    switch (view) {
      case AppView.DASHBOARD: return <Dashboard vault={items} setActiveView={setView} />;
      case AppView.RESEARCH: return <ResearchStation />;
      case AppView.VAULT: return <Vault />;
      case AppView.GRAPH: return <KnowledgeGraph items={items} />;
      case AppView.KITS: return <KitsStation />;
      case AppView.DEBATE: return <DebateStation />;
      case AppView.AGENTS: return <AgentStation />;
      case AppView.SETTINGS: return <SettingsStation />;
      default: return <Dashboard vault={items} setActiveView={setView} />;
    }
  };

  return (
    <Layout activeView={view} setActiveView={setView}>
      {renderView()}
    </Layout>
  );
};

export default App;

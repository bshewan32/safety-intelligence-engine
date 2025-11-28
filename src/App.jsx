import React, { useState } from 'react';
import AppShell from './components/layout/AppShell';
import Dashboard from './components/dashboard/Dashboard';
import { WorkerList } from './components/workers/WorkerList';
import { HazardLibrary } from './components/hazards/HazardLibrary';
import { ControlLibrary } from './components/controls/ControlLibrary';
import { RoleLibrary } from './components/roles/RoleLibrary';
import { ReportBuilder } from './components/reports/ReportBuilder';
import { ClientList } from './components/clients/ClientList';
import { ClientProvider } from './contexts/ClientContext';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'workers':
        return <WorkerList />;
      case 'clients':
        return <ClientList />;
      case 'roles':
        return <RoleLibrary />;
      case 'hazards':
        return <HazardLibrary />;
      case 'controls':
        return <ControlLibrary />;
      case 'reports':
        return <ReportBuilder />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppShell currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </AppShell>
  );
}

export default App;
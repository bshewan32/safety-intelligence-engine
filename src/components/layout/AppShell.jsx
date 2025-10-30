import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Home, Building2, Users, AlertTriangle, Shield, FileText } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'clients', label: 'Clients', icon: Building2 },
  { id: 'workers', label: 'Workers', icon: Users },
  { id: 'hazards', label: 'Hazards', icon: AlertTriangle },
  { id: 'controls', label: 'Controls', icon: Shield },
  { id: 'reports', label: 'Reports', icon: FileText },
];

function AppShell({ children, currentView, onNavigate }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentView={currentView} onNavigate={onNavigate} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentView={currentView} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
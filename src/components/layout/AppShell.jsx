import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

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
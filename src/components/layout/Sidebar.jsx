import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  Shield, 
  FileText,
  Settings, 
  Building2
} from 'lucide-react';

function Sidebar({ currentView, onNavigate }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Building2 },
    { id: 'workers', label: 'Workers', icon: Users },
    { id: 'hazards', label: 'Hazards', icon: AlertTriangle },
    { id: 'controls', label: 'Controls', icon: Shield },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Safety Intelligence</h1>
        <p className="text-xs text-gray-400 mt-1">Risk-Based Platform</p>
      </div>

      <nav className="flex-1 p-4">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2
                transition-colors
                ${isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800'
                }
              `}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;

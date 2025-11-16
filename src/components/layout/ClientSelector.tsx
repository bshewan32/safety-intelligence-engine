import React, { useState, useEffect } from 'react';
import { Building2, ChevronDown, Check, X } from 'lucide-react';
import { useClient } from '@/context/ClientContext';

interface Client {
  id: string;
  name: string;
  createdAt: Date | string;
}

export function ClientSelector() {
  const { activeClient, setActiveClient, clearActiveClient } = useClient();
  const [clients, setClients] = useState<Client[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await window.api.listClients();
      setClients(data || []);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh clients list when dropdown opens
  const handleToggleDropdown = () => {
    if (!isOpen) {
      loadClients(); // Refresh the list when opening
    }
    setIsOpen(!isOpen);
  };

  const handleSelectClient = (client: Client) => {
    setActiveClient({ id: client.id, name: client.name });
    setIsOpen(false);
  };

  const handleClearClient = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearActiveClient();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <button
          onClick={handleToggleDropdown}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            activeClient
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Building2 size={18} />
          <span className="text-sm font-medium">
            {activeClient ? activeClient.name : 'All Clients'}
          </span>
          <ChevronDown size={16} />
        </button>
        {activeClient && (
          <button
            onClick={handleClearClient}
            className={`p-2 rounded-lg transition-colors ${
              activeClient
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Clear selection"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-40 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                Select Active Client
              </div>

              {/* Clear Selection Option */}
              <button
                onClick={handleClearClient}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <span className="text-sm text-gray-700">All Clients (No Filter)</span>
                {!activeClient && (
                  <Check size={16} className="text-blue-600" />
                )}
              </button>

              <div className="border-t border-gray-200 my-2" />

              {loading ? (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  Loading clients...
                </div>
              ) : clients.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  No clients available
                </div>
              ) : (
                clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {client.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Added {new Date(client.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {activeClient?.id === client.id && (
                      <Check size={16} className="text-blue-600" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

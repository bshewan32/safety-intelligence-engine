import React, { useState, useEffect, useMemo } from 'react';
import { Building2, Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { ClientSetupWizard } from './ClientSetupWizard';

interface ClientData {
  id: string;
  name: string;
  createdAt: Date | string;
  _count?: {
    sites: number;
    workerRoles: number;
  };
}

export function ClientList() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

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

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    const search = (searchTerm || '').toLowerCase().trim();
    if (!search) return clients;
    return clients.filter((c) => {
      const name = (c.name || '').toLowerCase();
      return name.includes(search);
    });
  }, [clients, searchTerm]);

  const handleDelete = async (clientId: string, clientName: string) => {
    if (!confirm(`Are you sure you want to delete client "${clientName}"? This will remove all associated data.`)) {
      return;
    }
    
    try {
      await window.api.deleteClient(clientId);
      await loadClients();
    } catch (error) {
      console.error('Failed to delete client:', error);
      alert('Failed to delete client. It may have associated workers or sites.');
    }
  };

  const handleWizardComplete = () => {
    setShowSetupWizard(false);
    loadClients();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">Manage client organizations and safety frameworks</p>
        </div>
        <button
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => setShowSetupWizard(true)}
        >
          <Plus size={20} />
          <span>New Client Setup</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search clients by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Client Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading clients...</div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No clients found' : 'No clients yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Get started by creating your first client setup'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowSetupWizard(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} className="mr-2" />
                Create First Client
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Building2 className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(client.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sites:</span>
                    <span className="font-medium">{client._count?.sites || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Workers:</span>
                    <span className="font-medium">{client._count?.workerRoles || 0}</span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      // TODO: Navigate to client detail view
                      console.log('View client:', client.id);
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDelete(client.id, client.name)}
                    className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete client"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Client Setup Wizard Modal */}
      {showSetupWizard && (
        <ClientSetupWizard
          onClose={() => setShowSetupWizard(false)}
          onComplete={handleWizardComplete}
        />
      )}
    </div>
  );
}
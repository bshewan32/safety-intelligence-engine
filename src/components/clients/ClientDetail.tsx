import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  Edit2,
  Save,
  X,
  Users,
  Plus,
  MapPin,
  Trash2,
  UserPlus,
  LayoutGrid,
} from 'lucide-react';

interface ClientDetailProps {
  clientId: string;
  onBack: () => void;
  onViewRiskMatrix?: (clientId: string) => void;
}

interface Client {
  id: string;
  name: string;
  createdAt: Date | string;
  sites?: Site[];
  workerRoles?: WorkerRoleWithDetails[];
}

interface Site {
  id: string;
  name: string;
  clientId: string;
  createdAt: Date | string;
}

interface WorkerRoleWithDetails {
  id: string;
  workerId: string;
  roleId: string;
  isPrimary: boolean;
  clientId?: string | null;
  siteId?: string | null;
  startAt: Date | string;
  endAt?: Date | string | null;
  worker: {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email?: string;
    status: string;
  };
  role: {
    id: string;
    name: string;
  };
  site?: {
    id: string;
    name: string;
  } | null;
}

export function ClientDetail({ clientId, onBack, onViewRiskMatrix }: ClientDetailProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [saving, setSaving] = useState(false);

  // Site management
  const [showAddSite, setShowAddSite] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');

  // Worker assignment
  const [showAssignWorker, setShowAssignWorker] = useState(false);

  useEffect(() => {
    loadClient();
  }, [clientId]);

  const loadClient = async () => {
    setLoading(true);
    try {
      const data = await window.api.getClient(clientId);
      setClient(data);
      setEditedName(data?.name || '');
    } catch (error) {
      console.error('Failed to load client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editedName.trim()) {
      alert('Client name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await window.api.updateClient({
        id: clientId,
        name: editedName.trim(),
      });
      await loadClient();
      setEditMode(false);
    } catch (error) {
      console.error('Failed to update client:', error);
      alert('Failed to update client');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(client?.name || '');
    setEditMode(false);
  };

  const handleAddSite = async () => {
    if (!newSiteName.trim()) {
      alert('Site name cannot be empty');
      return;
    }

    try {
      await window.api.createSite({
        clientId,
        name: newSiteName.trim(),
      });
      setNewSiteName('');
      setShowAddSite(false);
      await loadClient();
    } catch (error) {
      console.error('Failed to add site:', error);
      alert('Failed to add site');
    }
  };

  const handleDeleteSite = async (siteId: string, siteName: string) => {
    if (!confirm(`Delete site "${siteName}"? This will remove all worker assignments for this site.`)) {
      return;
    }

    try {
      await window.api.deleteSite(siteId);
      await loadClient();
    } catch (error) {
      console.error('Failed to delete site:', error);
      alert('Failed to delete site');
    }
  };

  const handleRemoveWorker = async (workerRoleId: string, workerName: string) => {
    if (!confirm(`Remove ${workerName} from this client?`)) {
      return;
    }

    try {
      await window.api.removeWorkerRole(workerRoleId);
      await loadClient();
    } catch (error) {
      console.error('Failed to remove worker:', error);
      alert('Failed to remove worker');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading client...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-500">Client not found</div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <button
              onClick={onBack}
              className="mt-1 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              {editMode ? (
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none flex-1"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save size={20} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
                  <button
                    onClick={() => setEditMode(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit client name"
                  >
                    <Edit2 size={18} className="text-gray-600" />
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Created {new Date(client.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600">Total Sites</div>
            <div className="text-3xl font-bold text-blue-600 mt-1">
              {client.sites?.length || 0}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600">Assigned Workers</div>
            <div className="text-3xl font-bold text-green-600 mt-1">
              {client.workerRoles?.length || 0}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600">Active Assignments</div>
            <div className="text-3xl font-bold text-purple-600 mt-1">
              {client.workerRoles?.filter((wr) => !wr.endAt || new Date(wr.endAt) > new Date()).length || 0}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {onViewRiskMatrix && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => onViewRiskMatrix(clientId)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <LayoutGrid size={20} />
              <span>View Risk Matrix</span>
            </button>
          </div>
        )}
      </div>

      {/* Sites Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="text-gray-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Sites</h2>
          </div>
          <button
            onClick={() => setShowAddSite(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Plus size={16} />
            <span>Add Site</span>
          </button>
        </div>

        <div className="p-6">
          {!client.sites || client.sites.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No sites added yet. Click "Add Site" to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {client.sites.map((site) => (
                <div
                  key={site.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{site.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Added {new Date(site.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteSite(site.id, site.name)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete site"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Workers Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="text-gray-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Assigned Workers</h2>
          </div>
          <button
            onClick={() => setShowAssignWorker(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            <UserPlus size={16} />
            <span>Assign Worker</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          {!client.workerRoles || client.workerRoles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No workers assigned yet. Click "Assign Worker" to add one.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Worker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {client.workerRoles.map((wr) => (
                  <tr key={wr.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {wr.worker.firstName} {wr.worker.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{wr.worker.employeeId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{wr.role.name}</div>
                      {wr.isPrimary && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Primary
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {wr.site?.name || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!wr.endAt || new Date(wr.endAt) > new Date() ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Ended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() =>
                          handleRemoveWorker(
                            wr.id,
                            `${wr.worker.firstName} ${wr.worker.lastName}`
                          )
                        }
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Site Modal */}
      {showAddSite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Site</h3>
            <input
              type="text"
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
              placeholder="Site name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddSite(false);
                  setNewSiteName('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSite}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Site
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Worker Modal */}
      {showAssignWorker && (
        <AssignWorkerModal
          clientId={clientId}
          sites={client.sites || []}
          onClose={() => setShowAssignWorker(false)}
          onSuccess={() => {
            setShowAssignWorker(false);
            loadClient();
          }}
        />
      )}
    </div>
  );
}

// Worker Assignment Modal Component
function AssignWorkerModal({
  clientId,
  sites,
  onClose,
  onSuccess,
}: {
  clientId: string;
  sites: Site[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [workers, setWorkers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [workersData, rolesData] = await Promise.all([
        window.api.listWorkers(),
        window.api.listRoles(),
      ]);
      setWorkers(workersData || []);
      setRoles(rolesData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedWorkerId || !selectedRoleId) {
      alert('Please select both a worker and a role');
      return;
    }

    setLoading(true);
    try {
      await window.api.addWorkerRole({
        workerId: selectedWorkerId,
        roleId: selectedRoleId,
        clientId,
        siteId: selectedSiteId || undefined,
        isPrimary,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to assign worker:', error);
      alert('Failed to assign worker');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
        <h3 className="text-lg font-semibold mb-4">Assign Worker to Client</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Worker <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select worker...</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.firstName} {w.lastName} ({w.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select role...</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site (Optional)</label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No specific site</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPrimary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isPrimary" className="text-sm text-gray-700">
              Set as primary role for this worker
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Assigning...' : 'Assign Worker'}
          </button>
        </div>
      </div>
    </div>
  );
}

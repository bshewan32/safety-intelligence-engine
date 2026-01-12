// src/components/workers/WorkerList.tsx
// Complete WorkerList with Phase 2B Gap Integration + Edit/Delete

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Plus, Search } from 'lucide-react';
import { WorkerPassport } from './WorkerPassport';
import { useClient } from '../../context/ClientContext';
import { GapBadge } from './GapBadge';

type UIWorker = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: string;
  role?: { name?: string } | null;
  roles?: Array<{ isPrimary: boolean; role?: { name?: string } | null }>;
};

interface WorkerGapSummary {
  workerId: string;
  totalGaps: number;
  criticalGaps: number;
  highGaps: number;
}

export function WorkerList() {
  const { activeClient } = useClient();
  const [workers, setWorkers] = useState<UIWorker[]>([]);
  const [workerGaps, setWorkerGaps] = useState<Map<string, WorkerGapSummary>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingGaps, setLoadingGaps] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showEditWorker, setShowEditWorker] = useState(false);
  const [workerToEdit, setWorkerToEdit] = useState<UIWorker | null>(null);
  const [showBulkEvidence, setShowBulkEvidence] = useState(false);
  
  // Track if we've already loaded gaps for current workers
  const gapsLoadedForWorkers = useRef<string>('');

  const loadWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await window.api?.listWorkers?.(activeClient?.id);
      setWorkers((data || []) as UIWorker[]);
    } catch (error) {
      console.error('Failed to load workers:', error);
    } finally {
      setLoading(false);
    }
  }, [activeClient]);

  // Load gap analysis for all workers
  const loadGapAnalysis = useCallback(async () => {
    if (!workers.length || loadingGaps) return;
    
    // Create a key from worker IDs to detect if workers changed
    const workerKey = workers.map(w => w.id).sort().join(',');
    
    // Skip if we already loaded gaps for these exact workers
    if (gapsLoadedForWorkers.current === workerKey) {
      return;
    }
    
    console.log('[WorkerList] Loading gap analysis for', workers.length, 'workers');
    setLoadingGaps(true);
    
    try {
      const gapMap = new Map<string, WorkerGapSummary>();
      
      // Load gaps for each worker in parallel
      const gapPromises = workers.map(async (worker) => {
        try {
          const analysis = await window.api.analyzeWorkerGaps(worker.id);
          return {
            workerId: worker.id,
            totalGaps: analysis.summary.totalGaps,
            criticalGaps: analysis.summary.criticalGaps,
            highGaps: analysis.summary.highGaps,
          };
        } catch (error) {
          console.error(`Failed to load gaps for worker ${worker.id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(gapPromises);
      results.forEach((result) => {
        if (result) {
          gapMap.set(result.workerId, result);
        }
      });

      setWorkerGaps(gapMap);
      gapsLoadedForWorkers.current = workerKey;
      console.log('[WorkerList] Gap analysis complete');
    } catch (error) {
      console.error('Failed to load gap analysis:', error);
    } finally {
      setLoadingGaps(false);
    }
  }, [workers, loadingGaps]);

  useEffect(() => {
    loadWorkers();
  }, [loadWorkers]);

  // Load gaps only when workers change
  useEffect(() => {
    if (workers.length > 0) {
      loadGapAnalysis();
    }
  }, [workers]);

  const getDisplayRole = useCallback((w: UIWorker) => {
    const primary = w.roles?.find(r => r?.isPrimary)?.role?.name;
    const fallback = w.role?.name;
    const name = primary || fallback || '—';
    const secondaryCount = (w.roles?.filter(r => !r.isPrimary).length) || 0;
    return secondaryCount > 0 ? `${name} (+${secondaryCount})` : name;
  }, []);

  const filteredWorkers = useMemo(() => {
    const search = (searchTerm || '').toLowerCase().trim();
    if (!search) return workers;
    return workers.filter((w) => {
      const fn = (w.firstName || '').toLowerCase();
      const ln = (w.lastName || '').toLowerCase();
      const emp = (w.employeeId || '').toLowerCase();
      const em = (w.email || '').toLowerCase();
      const roleName = (getDisplayRole(w) || '').toLowerCase();
      return (
        fn.includes(search) ||
        ln.includes(search) ||
        emp.includes(search) ||
        em.includes(search) ||
        roleName.includes(search)
      );
    });
  }, [workers, searchTerm, getDisplayRole]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'restricted':
        return 'bg-amber-100 text-amber-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Manual refresh function
  const refreshGaps = useCallback(() => {
    gapsLoadedForWorkers.current = ''; // Reset the cache
    loadGapAnalysis();
  }, [loadGapAnalysis]);

  // Edit worker handler
  const handleEditWorker = (worker: UIWorker) => {
    setWorkerToEdit(worker);
    setShowEditWorker(true);
  };

  // Delete worker handler
  const handleDeleteWorker = async (workerId: string, workerName: string) => {
    if (!confirm(`Delete ${workerName}? This will remove all their evidence, roles, and compliance data.`)) {
      return;
    }

    try {
      await window.api.deleteWorker(workerId);
      await loadWorkers();
      refreshGaps();
    } catch (error) {
      console.error('Failed to delete worker:', error);
      alert('Failed to delete worker');
    }
  };

  // If a worker is selected, show their passport
  if (selectedWorkerId) {
    return (
      <WorkerPassport 
        workerId={selectedWorkerId} 
        onBack={() => {
          setSelectedWorkerId(null);
          // Reload gaps after returning from passport
          refreshGaps();
        }} 
      />
    );
  }

  // Otherwise show the list
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workers</h1>
          <p className="text-gray-500 mt-1">Manage worker profiles and compliance</p>
        </div>
        <div className="space-x-2">
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setShowAddWorker(true)}
          >
            <Plus size={20} />
            <span>Add Worker</span>
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={() => setShowBulkEvidence(true)}
          >
            📄 Add Record
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search workers by name, ID, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Worker List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading workers...</div>
        ) : filteredWorkers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No workers match your search' : 'No workers yet. Click "Add Worker" to get started.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredWorkers.map((worker) => {
              const gaps = workerGaps.get(worker.id);
              
              return (
                <div
                  key={worker.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    {/* Left side - clickable to open passport */}
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => setSelectedWorkerId(worker.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {worker.firstName} {worker.lastName}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(worker.status)}`}>
                          {worker.status}
                        </span>
                        {/* Gap Badge */}
                        {gaps && gaps.totalGaps > 0 && (
                          <GapBadge 
                            gapCount={gaps.totalGaps}
                            criticalCount={gaps.criticalGaps}
                            highCount={gaps.highGaps}
                            size="sm"
                          />
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        <span className="font-mono">{worker.employeeId}</span>
                        <span className="mx-2">•</span>
                        <span>{getDisplayRole(worker)}</span>
                        {worker.email && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{worker.email}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Right side - Action buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditWorker(worker);
                        }}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorker(worker.id, `${worker.firstName} ${worker.lastName}`);
                        }}
                        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Worker Modal */}
      {showAddWorker && (
        <AddWorkerModal
          onClose={() => setShowAddWorker(false)}
          onSuccess={() => {
            setShowAddWorker(false);
            loadWorkers();
            // Gaps will reload automatically when workers change
          }}
        />
      )}

      {/* Edit Worker Modal */}
      {showEditWorker && workerToEdit && (
        <EditWorkerModal
          worker={workerToEdit}
          onClose={() => {
            setShowEditWorker(false);
            setWorkerToEdit(null);
          }}
          onSuccess={() => {
            setShowEditWorker(false);
            setWorkerToEdit(null);
            loadWorkers();
            refreshGaps();
          }}
        />
      )}

      {/* Bulk Evidence Modal placeholder */}
      {showBulkEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Bulk Evidence Modal (Coming Soon)</h2>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
                onClick={() => setShowBulkEvidence(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ADD WORKER MODAL
// ============================================================================

type RoleOption = {
  id: string;
  name: string;
};

function AddWorkerModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [primaryRoleId, setPrimaryRoleId] = useState<string>('');
  const [additionalRoleIds, setAdditionalRoleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoles() {
      try {
        const data = await window.api?.listRoles?.();
        setRoles(data || []);
      } catch (err) {
        console.error('Failed to load roles:', err);
      }
    }
    loadRoles();
  }, []);

  const validate = () => {
    if (!firstName.trim()) {
      setError('First name is required.');
      return false;
    }
    if (!lastName.trim()) {
      setError('Last name is required.');
      return false;
    }
    if (!employeeId.trim()) {
      setError('Employee ID is required.');
      return false;
    }
    if (primaryRoleId === '') {
      setError('Primary role is required.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const newWorker: {
        firstName: string;
        lastName: string;
        employeeId: string;
        email?: string;
        phone?: string;
        status: string;
      } = {
        firstName,
        lastName,
        employeeId,
        email: email || undefined,
        phone: phone || undefined,
        status: 'active',
      };

      const created = await window.api.upsertWorker(newWorker);

      await window.api.addWorkerRole({
        workerId: created.id,
        roleId: primaryRoleId,
        isPrimary: true,
      });

      for (const roleId of additionalRoleIds) {
        await window.api.addWorkerRole({
          workerId: created.id,
          roleId,
          isPrimary: false,
        });
      }

      await window.api.recomputeWorker({ workerId: created.id });

      onSuccess();
    } catch (err: any) {
      console.error('Error adding worker:', err);
      setError(err?.message || 'Failed to add worker.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdditionalRole = (roleId: string) => {
    if (additionalRoleIds.includes(roleId)) {
      setAdditionalRoleIds(additionalRoleIds.filter(id => id !== roleId));
    } else {
      setAdditionalRoleIds([...additionalRoleIds, roleId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Add Worker</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Employee ID<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Primary Role<span className="text-red-500">*</span>
            </label>
            <select
              value={primaryRoleId}
              onChange={e => setPrimaryRoleId(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a role...</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Roles (Optional)
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
              {roles
                .filter(role => role.id !== primaryRoleId)
                .map(role => (
                  <label key={role.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={additionalRoleIds.includes(role.id)}
                      onChange={() => toggleAdditionalRole(role.id)}
                      disabled={loading}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{role.name}</span>
                  </label>
                ))}
            </div>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Add Worker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// EDIT WORKER MODAL
// ============================================================================

function EditWorkerModal({
  worker,
  onClose,
  onSuccess,
}: {
  worker: UIWorker;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [firstName, setFirstName] = useState(worker.firstName);
  const [lastName, setLastName] = useState(worker.lastName);
  const [employeeId, setEmployeeId] = useState(worker.employeeId);
  const [email, setEmail] = useState(worker.email || '');
  const [phone, setPhone] = useState(worker.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!firstName.trim()) {
      setError('First name is required.');
      return false;
    }
    if (!lastName.trim()) {
      setError('Last name is required.');
      return false;
    }
    if (!employeeId.trim()) {
      setError('Employee ID is required.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await window.api.upsertWorker({
        id: worker.id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        employeeId: employeeId.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        status: worker.status,
      });

      onSuccess();
    } catch (err: any) {
      console.error('Error updating worker:', err);
      setError(err?.message || 'Failed to update worker.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Edit Worker</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Employee ID<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, Plus, Search } from 'lucide-react';
import { WorkerPassport } from './WorkerPassport';
import { useClient } from '../../context/ClientContext';

type UIWorker = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string; // optional to match backend
  phone?: string;
  status: string;
  role?: { name?: string } | null; // legacy single role may be null
  roles?: Array<{ isPrimary: boolean; role?: { name?: string } | null }>;
};

export function WorkerList() {
  const { activeClient } = useClient();
  const [workers, setWorkers] = useState<UIWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  // Remove addOpen, use showAddWorker for modal control
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showBulkEvidence, setShowBulkEvidence] = useState(false);

  const loadWorkers = useCallback(async () => {
    setLoading(true);
    try {
      // Pass activeClient.id to filter by client
      const data = await window.api?.listWorkers?.(activeClient?.id);
      setWorkers((data || []) as UIWorker[]);
    } catch (error) {
      console.error('Failed to load workers:', error);
    } finally {
      setLoading(false);
    }
  }, [activeClient]);

  useEffect(() => {
    loadWorkers();
  }, [loadWorkers]);

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

  // If a worker is selected, show their passport
  if (selectedWorkerId) {
    return (
      <WorkerPassport 
        workerId={selectedWorkerId} 
        onBack={() => setSelectedWorkerId(null)} 
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
            {searchTerm ? 'No workers found matching your search' : 'No workers yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWorkers.map((worker) => (
                  <tr 
                    key={worker.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedWorkerId(worker.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="text-blue-600" size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {worker.firstName} {worker.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{worker.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getDisplayRole(worker)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{worker.email || '—'}</div>
                      {worker.phone && (
                        <div className="text-sm text-gray-500">{worker.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(worker.status)}`}>
                        {worker.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWorkerId(worker.id);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Passport →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddWorker && (
        <AddWorkerModal
          onClose={() => setShowAddWorker(false)}
          onSuccess={() => {
            setShowAddWorker(false);
            loadWorkers();
          }}
        />
      )}
      {/* BulkEvidenceModal placeholder */}
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

  // Load roles on mount
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
    setError(null);

    try {
      // Create worker
      const newWorker = await window.api.createWorker({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        employeeId: employeeId.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
      });
      if (!newWorker || !newWorker.id) {
        throw new Error('Failed to create worker');
      }

      // Add primary role
      await window.api.addWorkerRole({
        workerId: newWorker.id,
        roleId: primaryRoleId,
        isPrimary: true,
      });

      // Add additional roles
      for (const roleId of additionalRoleIds) {
        if (roleId !== primaryRoleId) {
          await window.api.addWorkerRole({
            workerId: newWorker.id,
            roleId,
            isPrimary: false,
          });
        }
      }

      // Recompute worker (e.g. compliance, derived data)
      await window.api.recomputeWorker(newWorker.id);

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
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Add Worker</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name<span className="text-red-500">*</span></label>
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
            <label className="block text-sm font-medium text-gray-700">Last Name<span className="text-red-500">*</span></label>
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
            <label className="block text-sm font-medium text-gray-700">Employee ID<span className="text-red-500">*</span></label>
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
            <label className="block text-sm font-medium text-gray-700">Primary Role<span className="text-red-500">*</span></label>
            <select
              value={primaryRoleId}
              onChange={e => setPrimaryRoleId(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select primary role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Roles</label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
              {roles.map(role => (
                <div key={role.id} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    id={`role-${role.id}`}
                    value={role.id}
                    checked={additionalRoleIds.includes(role.id)}
                    onChange={() => toggleAdditionalRole(role.id)}
                    disabled={loading || role.id === primaryRoleId}
                    className="mr-2"
                  />
                  <label htmlFor={`role-${role.id}`} className={`${role.id === primaryRoleId ? 'text-gray-400' : ''}`}>
                    {role.name}
                    {role.id === primaryRoleId ? ' (Primary)' : ''}
                  </label>
                </div>
              ))}
            </div>
          </div>
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Worker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
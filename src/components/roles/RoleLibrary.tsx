import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, X, Users, Briefcase, Edit2, Trash2 } from 'lucide-react';

type Role = {
  id: string;
  name: string;
  description?: string | null;
  activityPackage?: string | null;
  createdAt: Date | string;
};

type HazardCategory = {
  category: string;
  count: number;
};

const AVAILABLE_CATEGORIES = [
  'Electrical',
  'Heights',
  'Confined Space',
  'Manual Handling',
  'Structural',
  'Management',
  'General',
  'Hot Work',
  'PPE',
  'Vehicle',
  'Chemical',
  'Noise',
  'Radiation',
  'Biological',
];

export function RoleLibrary() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await window.api?.listRoles?.();
      setRoles(data || []);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return roles;
    return roles.filter((r) => {
      const name = (r.name || '').toLowerCase();
      const desc = (r.description || '').toLowerCase();
      return name.includes(search) || desc.includes(search);
    });
  }, [roles, searchTerm]);

  const handleDelete = async (roleId: string) => {
    try {
      await window.api?.deleteRole?.(roleId);
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete role:', error);
      alert('Failed to delete role. It may be in use by workers.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Positions</h1>
          <p className="text-gray-500 mt-1">Manage worker roles and their hazard assignments</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Role</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search roles by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Roles Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading roles...</div>
        ) : filteredRoles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No roles found matching your search' : 'No roles yet. Click "Add Role" to create one.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredRoles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                onEdit={() => setEditingRole(role)}
                onDelete={() => setShowDeleteConfirm(role.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingRole) && (
        <RoleModal
          role={editingRole}
          onClose={() => {
            setShowAddModal(false);
            setEditingRole(null);
          }}
          onSuccess={() => {
            setShowAddModal(false);
            setEditingRole(null);
            loadRoles();
          }}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Delete Role</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this role? This action cannot be undone.
              Workers assigned to this role will need to be reassigned.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RoleCard({ role, onEdit, onDelete }: { role: Role; onEdit: () => void; onDelete: () => void }) {
  const activityPackage = role.activityPackage ? JSON.parse(role.activityPackage) : null;
  const categories = activityPackage?.hazardCategories || [];

  return (
    <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Briefcase className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{role.name}</h3>
          </div>
        </div>
      </div>

      {role.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{role.description}</p>
      )}

      {/* Hazard Categories */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500 uppercase mb-2">Hazard Categories</p>
        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {categories.map((cat: string) => (
              <span
                key={cat}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {cat}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No categories assigned</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
        <button
          onClick={onEdit}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          <Edit2 size={14} />
          <span>Edit</span>
        </button>
        <button
          onClick={onDelete}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}

function RoleModal({
  role,
  onClose,
  onSuccess,
}: {
  role?: Role | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    if (role?.activityPackage) {
      try {
        const pkg = JSON.parse(role.activityPackage);
        return pkg.hazardCategories || [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Role name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const activityPackage = JSON.stringify({
        hazardCategories: selectedCategories,
      });

      if (role) {
        // Update existing role
        await window.api.updateRole({
          id: role.id,
          name: name.trim(),
          description: description.trim() || null,
          activityPackage,
        });
      } else {
        // Create new role
        await window.api.createRole({
          name: name.trim(),
          description: description.trim() || null,
          activityPackage,
        });
      }

      onSuccess();
    } catch (err: any) {
      console.error('Failed to save role:', err);
      setError(err?.message || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{role ? 'Edit Role' : 'Add New Role'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Electrician, Scaffolder, Supervisor"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this role and its responsibilities"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Hazard Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hazard Categories
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Select which hazard categories apply to this role. Workers in this role will automatically receive controls for hazards in these categories.
            </p>
            <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_CATEGORIES.map((category) => (
                  <label
                    key={category}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      disabled={loading}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>
            {selectedCategories.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

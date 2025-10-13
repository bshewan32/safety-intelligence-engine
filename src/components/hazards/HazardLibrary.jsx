import React from 'react';
import { Plus } from 'lucide-react';

export function HazardLibrary() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Hazard Library</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={20} />
          Add Hazard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <h4 className="font-semibold text-gray-900 mb-2">Electric Shock</h4>
          <p className="text-sm text-gray-600 mb-4">Contact with live conductors</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">ELEC-001</span>
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Critical</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <h4 className="font-semibold text-gray-900 mb-2">Confined Space</h4>
          <p className="text-sm text-gray-600 mb-4">Oxygen deficiency, toxic atmosphere</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">CONF-001</span>
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">High</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <h4 className="font-semibold text-gray-900 mb-2">Working at Heights</h4>
          <p className="text-sm text-gray-600 mb-4">Falls from elevation</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">HEIGHT-001</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Medium</span>
          </div>
        </div>
      </div>
    </div>
  );
}
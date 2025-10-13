import React from 'react';
import { Plus } from 'lucide-react';

export function ControlLibrary() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Control Library</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={20} />
          Add Control
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Control</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validity</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">LV Rescue & CPR</div>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Training</span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">AS/NZS 4836</td>
              <td className="px-6 py-4 text-sm text-gray-500">12 months</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">SWMS - Electrical Work</div>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Document</span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">IMS-DOC-003</td>
              <td className="px-6 py-4 text-sm text-gray-500">Annual review</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">CRV - Isolation Checks</div>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Verification</span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">WHS-CRV-001</td>
              <td className="px-6 py-4 text-sm text-gray-500">Per task</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">RBCS Score</h3>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-blue-600">87%</div>
          <p className="text-sm text-green-600 mt-1">+3% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Open Hazards</h3>
            <AlertTriangle className="text-orange-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">12</div>
          <p className="text-sm text-gray-500 mt-1">3 critical</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Compliance</h3>
            <CheckCircle className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">94%</div>
          <p className="text-sm text-gray-500 mt-1">Controls valid</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Expiring Soon</h3>
            <Clock className="text-orange-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">8</div>
          <p className="text-sm text-gray-500 mt-1">Next 30 days</p>
        </div>
      </div>

      {/* Risk Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Top Residual Risks</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50 rounded">
            <span className="font-medium">Electric Shock - Live Conductors</span>
            <span className="px-3 py-1 bg-red-500 text-white text-sm rounded">High</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
            <span className="font-medium">Confined Space Entry</span>
            <span className="px-3 py-1 bg-orange-500 text-white text-sm rounded">Medium</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
            <span className="font-medium">Working at Heights</span>
            <span className="px-3 py-1 bg-yellow-500 text-white text-sm rounded">Medium</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
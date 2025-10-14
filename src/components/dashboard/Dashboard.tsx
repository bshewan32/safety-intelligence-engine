import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState({
    rbcs: 0,
    compliance: 0,
    openHazards: 0,
    expiringSoon: 0,
  });

  useEffect(() => {
    window.api.dashboardSummary().then(setSummary);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">RBCS Score</h3>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-blue-600">{summary.rbcs}%</div>
          <p className="text-sm text-green-600 mt-1">+3% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Open Hazards</h3>
            <AlertTriangle className="text-orange-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{summary.openHazards}</div>
          <p className="text-sm text-gray-500 mt-1">3 critical</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Compliance</h3>
            <CheckCircle className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{summary.compliance}%</div>
          <p className="text-sm text-gray-500 mt-1">Controls valid</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Expiring Soon</h3>
            <Clock className="text-orange-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{summary.expiringSoon}</div>
          <p className="text-sm text-gray-500 mt-1">Next 30 days</p>
        </div>
      </div>

      {/* Keep your existing UI for risk overview */}
    </div>
  );
}
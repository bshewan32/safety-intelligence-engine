import React from 'react';

function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Risk-Based Control Score (RBCS)</h3>
        <div className="text-4xl font-bold text-blue-600">87%</div>
        <p className="text-sm text-gray-500 mt-2">+3% from last month</p>
      </div>
    </div>
  );
}

export default Dashboard;
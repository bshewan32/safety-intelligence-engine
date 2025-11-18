import React from 'react';
import { Search, Filter } from 'lucide-react';

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  riskLevelFilter: string;
  onRiskLevelChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export default function RiskMatrixFilters({
  searchTerm,
  onSearchChange,
  riskLevelFilter,
  onRiskLevelChange,
  statusFilter,
  onStatusChange
}: Props) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6 flex gap-4">
      {/* Search */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search hazards..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded"
          />
        </div>
      </div>

      {/* Risk Level Filter */}
      <select
        value={riskLevelFilter}
        onChange={(e) => onRiskLevelChange(e.target.value)}
        className="px-4 py-2 border rounded bg-white"
      >
        <option value="All">All Risk Levels</option>
        <option value="Critical">Critical</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      {/* Status Filter */}
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-4 py-2 border rounded bg-white"
      >
        <option value="All">All Status</option>
        <option value="Complete">Complete</option>
        <option value="Gaps">Gaps</option>
        <option value="N/A">N/A</option>
      </select>
    </div>
  );
}
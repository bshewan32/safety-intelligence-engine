import React from 'react';
import { ArrowLeft, RefreshCw, Download } from 'lucide-react';

interface Props {
  client: {
    id: string;
    name: string;
    industry: string | null;
    jurisdiction: string | null;
  };
  summary: {
    totalHazards: number;
    activeHazards: number;
    hazardsWithGaps: number;
    overallCoverage: number;
  };
  onBack: () => void;
  onRefresh: () => void;
  onExport: () => void;
}

export default function RiskMatrixHeader({ client, summary, onBack, onRefresh, onExport }: Props) {
  return (
    <div className="mb-6 pb-4 border-b">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Clients
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          <p className="text-sm text-gray-600">
            {client.industry} · {client.jurisdiction}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            className="px-3 py-2 border rounded hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onExport}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded">
          <div className="text-2xl font-bold text-gray-900">{summary.totalHazards}</div>
          <div className="text-sm text-gray-600">Total Hazards</div>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <div className="text-2xl font-bold text-gray-900">{summary.activeHazards}</div>
          <div className="text-sm text-gray-600">Active Hazards</div>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <div className="text-2xl font-bold text-red-600">{summary.hazardsWithGaps}</div>
          <div className="text-sm text-gray-600">Gaps Identified</div>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <div className="text-2xl font-bold text-green-600">{summary.overallCoverage}%</div>
          <div className="text-sm text-gray-600">Overall Coverage</div>
        </div>
      </div>
    </div>
  );
}
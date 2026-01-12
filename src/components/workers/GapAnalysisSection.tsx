// src/components/workers/GapAnalysisSection.tsx
// Gap Analysis Section - Shows detailed gaps and fix actions in Worker Passport

import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, Upload, Clock, Calendar } from 'lucide-react';

interface Gap {
  id: string;
  controlId: string;
  controlCode: string;
  controlName: string;
  controlType: string;
  status: 'Required' | 'Overdue' | 'Expiring';
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  dueDate: Date | string | null;
  daysUntilDue: number | null;
  hazards: string[];
  priority: number;
}

interface GapAnalysis {
  summary: {
    totalGaps: number;
    criticalGaps: number;
    highGaps: number;
    mediumGaps: number;
    lowGaps: number;
    expiringWithin30Days: number;
    overdue: number;
  };
  gaps: Gap[];
}

interface GapAnalysisSectionProps {
  workerId: string;
  onFixGap: (gap: Gap) => void;
}

export function GapAnalysisSection({ workerId, onFixGap }: GapAnalysisSectionProps) {
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGapAnalysis();
  }, [workerId]);

  const loadGapAnalysis = async () => {
    setLoading(true);
    try {
      const data = await window.api.analyzeWorkerGaps(workerId);
      setAnalysis(data);
    } catch (error) {
      console.error('Failed to load gap analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'Critical':
        return <AlertCircle className="text-red-600" size={20} />;
      case 'High':
        return <AlertTriangle className="text-orange-600" size={18} />;
      case 'Medium':
        return <Info className="text-yellow-600" size={18} />;
      default:
        return <Info className="text-blue-600" size={16} />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'High':
        return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'Medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      Required: (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Missing
        </span>
      ),
      Overdue: (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
          OVERDUE
        </span>
      ),
      Expiring: (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          Expiring Soon
        </span>
      ),
    };
    return badges[status as keyof typeof badges];
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
  };

  const getDaysText = (days: number | null) => {
    if (days === null) return '';
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return '1 day remaining';
    return `${days} days remaining`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Analyzing gaps...</div>
        </div>
      </div>
    );
  }

  if (!analysis || analysis.summary.totalGaps === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32 text-green-600">
          <div className="text-center">
            <div className="text-4xl mb-2">✓</div>
            <div className="font-medium">No Gaps Detected</div>
            <div className="text-sm text-gray-500 mt-1">All controls are satisfied or covered by temporary fixes</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header with Summary */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="text-red-600 mr-2" size={20} />
              Gap Analysis
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {analysis.summary.totalGaps} control{analysis.summary.totalGaps !== 1 ? 's' : ''} requiring attention
            </p>
          </div>

          {/* Summary Stats */}
          <div className="flex space-x-2">
            {analysis.summary.criticalGaps > 0 && (
              <div className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                {analysis.summary.criticalGaps} Critical
              </div>
            )}
            {analysis.summary.highGaps > 0 && (
              <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium">
                {analysis.summary.highGaps} High
              </div>
            )}
            {analysis.summary.overdue > 0 && (
              <div className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm font-medium animate-pulse">
                {analysis.summary.overdue} Overdue
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gap List */}
      <div className="divide-y divide-gray-200">
        {analysis.gaps.map((gap) => (
          <div
            key={gap.id}
            className={`p-6 border-l-4 hover:bg-gray-50 transition-colors ${
              gap.riskLevel === 'Critical' ? 'border-red-500' :
              gap.riskLevel === 'High' ? 'border-orange-500' :
              gap.riskLevel === 'Medium' ? 'border-yellow-500' :
              'border-blue-500'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-2">
                  {getRiskIcon(gap.riskLevel)}
                  <span className="font-mono text-sm text-gray-600">{gap.controlCode}</span>
                  {getStatusBadge(gap.status)}
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    gap.riskLevel === 'Critical' ? 'bg-red-100 text-red-700' :
                    gap.riskLevel === 'High' ? 'bg-orange-100 text-orange-700' :
                    gap.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {gap.riskLevel} Risk
                  </span>
                </div>

                {/* Control Name */}
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {gap.controlName}
                </h3>

                {/* Details */}
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <span className="flex items-center">
                    <span className="font-medium mr-1">Type:</span>
                    {gap.controlType}
                  </span>
                  {gap.dueDate && (
                    <span className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      Due: {formatDate(gap.dueDate)}
                    </span>
                  )}
                  {gap.daysUntilDue !== null && (
                    <span className={`flex items-center ${
                      gap.daysUntilDue < 0 ? 'text-red-600 font-medium' :
                      gap.daysUntilDue <= 7 ? 'text-orange-600 font-medium' :
                      'text-gray-600'
                    }`}>
                      <Clock size={14} className="mr-1" />
                      {getDaysText(gap.daysUntilDue)}
                    </span>
                  )}
                </div>

                {/* Associated Hazards */}
                {gap.hazards.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-medium text-gray-500 mb-1">Associated Hazards:</div>
                    <div className="flex flex-wrap gap-1">
                      {gap.hazards.map((hazard, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {hazard}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => onFixGap(gap)}
                className={`
                  ml-4 px-4 py-2 rounded-lg font-medium text-white transition-colors
                  flex items-center space-x-2 whitespace-nowrap
                  ${gap.riskLevel === 'Critical' ? 'bg-red-600 hover:bg-red-700' :
                    gap.riskLevel === 'High' ? 'bg-orange-600 hover:bg-orange-700' :
                    'bg-blue-600 hover:bg-blue-700'}
                `}
              >
                <Upload size={16} />
                <span>Fix Gap</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
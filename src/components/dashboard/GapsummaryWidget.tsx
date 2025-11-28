import React from 'react';
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface GapSummary {
  totalGaps: number;
  criticalGaps: number;
  highGaps: number;
  mediumGaps: number;
  lowGaps: number;
  expiringWithin30Days: number;
  overdue: number;
}

interface Props {
  summary: GapSummary;
  onViewAllGaps: () => void;
  onScheduleRenewals: () => void;
}

export default function GapSummaryWidget({ summary, onViewAllGaps, onScheduleRenewals }: Props) {
  const hasGaps = summary.totalGaps > 0;
  const hasCritical = summary.criticalGaps > 0;
  const hasExpiring = summary.expiringWithin30Days > 0;

  if (!hasGaps) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border-2 border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="text-green-600" size={28} />
          <h3 className="text-lg font-semibold text-gray-900">No Safety Gaps Detected</h3>
        </div>
        <p className="text-green-700 mb-4">
          All workers have required controls in place. Excellent work!
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp size={16} className="text-green-600" />
          <span>Maintain compliance through regular reviews</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 border-2 ${
      hasCritical ? 'border-red-300' : hasExpiring ? 'border-orange-300' : 'border-yellow-300'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle 
          className={hasCritical ? 'text-red-600' : hasExpiring ? 'text-orange-600' : 'text-yellow-600'} 
          size={28} 
        />
        <h3 className="text-lg font-semibold text-gray-900">Safety Gaps Detected</h3>
      </div>

      {/* Total Gaps */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-gray-900 mb-2">{summary.totalGaps}</div>
        <div className="text-sm text-gray-600">Total Safety Gaps</div>
      </div>

      {/* Breakdown by Risk Level */}
      <div className="space-y-2 mb-4">
        {summary.criticalGaps > 0 && (
          <div className="flex items-center justify-between p-2 bg-red-50 rounded">
            <span className="text-sm font-medium text-red-900">Critical</span>
            <span className="text-sm font-bold text-red-900">{summary.criticalGaps}</span>
          </div>
        )}
        {summary.highGaps > 0 && (
          <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
            <span className="text-sm font-medium text-orange-900">High</span>
            <span className="text-sm font-bold text-orange-900">{summary.highGaps}</span>
          </div>
        )}
        {summary.mediumGaps > 0 && (
          <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
            <span className="text-sm font-medium text-yellow-900">Medium</span>
            <span className="text-sm font-bold text-yellow-900">{summary.mediumGaps}</span>
          </div>
        )}
        {summary.lowGaps > 0 && (
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
            <span className="text-sm font-medium text-blue-900">Low</span>
            <span className="text-sm font-bold text-blue-900">{summary.lowGaps}</span>
          </div>
        )}
      </div>

      {/* Expiring Warning */}
      {hasExpiring && (
        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg mb-4">
          <Clock className="text-orange-600 flex-shrink-0" size={18} />
          <span className="text-sm text-orange-900">
            <strong>{summary.expiringWithin30Days}</strong> control{summary.expiringWithin30Days > 1 ? 's' : ''} expiring within 30 days
          </span>
        </div>
      )}

      {/* Overdue Warning */}
      {summary.overdue > 0 && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertTriangle className="text-red-600 flex-shrink-0" size={18} />
          <span className="text-sm text-red-900">
            <strong>{summary.overdue}</strong> control{summary.overdue > 1 ? 's' : ''} overdue
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onViewAllGaps}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          View All Gaps
        </button>
        {hasExpiring && (
          <button
            onClick={onScheduleRenewals}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
          >
            Schedule Renewals
          </button>
        )}
      </div>
    </div>
  );
}
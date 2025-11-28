import React from 'react';
import { BarChart3 } from 'lucide-react';

interface Coverage {
  overall: number;
  byCriticality: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface Props {
  coverage: Coverage;
}

export default function CoverageWidget({ coverage }: Props) {
  const getColorClass = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTextColorClass = (percentage: number) => {
    if (percentage >= 90) return 'text-green-900';
    if (percentage >= 75) return 'text-yellow-900';
    if (percentage >= 50) return 'text-orange-900';
    return 'text-red-900';
  };

  const getBgColorClass = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-50';
    if (percentage >= 75) return 'bg-yellow-50';
    if (percentage >= 50) return 'bg-orange-50';
    return 'bg-red-50';
  };

  const renderProgressBar = (label: string, percentage: number, showWarning: boolean = false) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-bold ${getTextColorClass(percentage)}`}>
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColorClass(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showWarning && percentage < 80 && (
        <p className="text-xs text-orange-600">⚠️ Below target (80%)</p>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="text-blue-600" size={28} />
        <h3 className="text-lg font-semibold text-gray-900">Coverage by Risk Level</h3>
      </div>

      {/* Overall Coverage - Highlighted */}
      <div className={`p-4 rounded-lg mb-6 ${getBgColorClass(coverage.overall)}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Coverage</span>
          <span className={`text-2xl font-bold ${getTextColorClass(coverage.overall)}`}>
            {coverage.overall}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getColorClass(coverage.overall)}`}
            style={{ width: `${coverage.overall}%` }}
          />
        </div>
        {coverage.overall < 80 && (
          <p className="text-xs text-orange-600 mt-2">
            ⚠️ Target is 80% minimum. Review control assignments.
          </p>
        )}
      </div>

      {/* Breakdown by Criticality */}
      <div className="space-y-4">
        {renderProgressBar('Critical Controls', coverage.byCriticality.critical, true)}
        {renderProgressBar('High Priority', coverage.byCriticality.high, true)}
        {renderProgressBar('Medium Priority', coverage.byCriticality.medium, false)}
        {renderProgressBar('Low Priority', coverage.byCriticality.low, false)}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">Coverage Scale:</p>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600">≥90% Excellent</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-600">75-89% Good</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-gray-600">50-74% Fair</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600">&lt;50% Poor</span>
          </div>
        </div>
      </div>
    </div>
  );
}
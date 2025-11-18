// src/components/risk-matrix/RiskMatrixTable.tsx
import React from 'react';
import type { RiskMatrixHazard, HazardUpdate } from '../../types/risk-matrix';

interface Props {
  hazards: RiskMatrixHazard[];
  onUpdateHazard: (hazardId: string, updates: HazardUpdate) => void;
  onAddControl: (hazardId: string, controlId: string, isCritical: boolean) => void;
  onRemoveControl: (mappingId: string) => void;
  clientId: string;
}

export default function RiskMatrixTable({ hazards, onUpdateHazard, onAddControl, onRemoveControl, clientId }: Props) {
  if (hazards.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No hazards match your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hazards.map(hazard => (
        <div key={hazard.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-mono text-gray-500">{hazard.code}</span>
                <h3 className="text-lg font-semibold">{hazard.name}</h3>
                <span className={`px-2 py-1 text-xs rounded ${
                  hazard.adjustedRiskLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                  hazard.adjustedRiskLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                  hazard.adjustedRiskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {hazard.adjustedRiskLevel}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{hazard.description}</p>
              
              {/* Controls summary */}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">
                  Controls: {hazard.controlCoverage.active} / {hazard.controlCoverage.total}
                </span>
                <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      hazard.controlCoverage.percentage === 100 ? 'bg-green-500' :
                      hazard.controlCoverage.percentage >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${hazard.controlCoverage.percentage}%` }}
                  />
                </div>
                <span className="text-gray-600">{hazard.controlCoverage.percentage}%</span>
              </div>
            </div>
            
            {/* Actions */}
            <div>
              {hazard.isNotApplicable ? (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm">N/A</span>
              ) : hazard.controlCoverage.percentage === 100 ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">Complete</span>
              ) : (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm">Gap</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
// src/components/workers/RequiredControlExplanation.tsx
// Shows WHY a control is required with hazard context

import React from 'react';
import { AlertTriangle, Shield, Info } from 'lucide-react';

interface Source {
  hazardId: string;
  hazardName: string;
  hazardCode: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  role: string;
  roleId: string;
  isMandatory: boolean;
}

interface RequiredControlExplanationProps {
  sources?: string | Source[];  // JSON string or parsed array
  controlCode: string;
  controlName: string;
  status: string;
}

export function RequiredControlExplanation({ 
  sources, 
  controlCode, 
  controlName,
  status 
}: RequiredControlExplanationProps) {
  // Parse sources if it's a JSON string
  let parsedSources: Source[] = [];
  
  if (typeof sources === 'string') {
    try {
      parsedSources = JSON.parse(sources);
    } catch (e) {
      console.error('Failed to parse sources:', e);
    }
  } else if (Array.isArray(sources)) {
    parsedSources = sources;
  }

  if (parsedSources.length === 0) {
    return null;
  }

  // Get highest severity
  const severities = parsedSources.map(s => s.severity);
  const highestSeverity = ['Critical', 'High', 'Medium', 'Low'].find(level => 
    severities.includes(level as any)
  ) || 'Low';

  // Group by severity for display
  const bySeverity = parsedSources.reduce((acc, source) => {
    if (!acc[source.severity]) acc[source.severity] = [];
    acc[source.severity].push(source);
    return acc;
  }, {} as Record<string, Source[]>);

  // Severity colors
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'High': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'Medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'Low': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical': return <AlertTriangle className="text-red-600" size={16} />;
      case 'High': return <AlertTriangle className="text-orange-600" size={16} />;
      case 'Medium': return <Shield className="text-yellow-600" size={16} />;
      case 'Low': return <Info className="text-blue-600" size={16} />;
      default: return <Info className="text-gray-600" size={16} />;
    }
  };

  return (
    <div className={`mt-3 p-4 rounded-lg border-2 ${getSeverityColor(highestSeverity)}`}>
      <div className="flex items-start space-x-2 mb-3">
        {getSeverityIcon(highestSeverity)}
        <div className="flex-1">
          <h4 className="font-semibold text-sm">
            {highestSeverity} Control - Required Because:
          </h4>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(bySeverity).map(([severity, sources]) => (
          <div key={severity}>
            {sources.map((source, idx) => (
              <div 
                key={`${source.hazardId}-${idx}`}
                className="flex items-start space-x-2 text-sm ml-6"
              >
                <span className="text-gray-400">•</span>
                <div className="flex-1">
                  <span className="font-medium">{source.hazardName}</span>
                  <span className="text-gray-600 mx-1">({source.hazardCode})</span>
                  {source.isMandatory && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                      Mandatory
                    </span>
                  )}
                  <div className="text-xs text-gray-600 mt-0.5">
                    Via role: {source.role}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  severity === 'Critical' ? 'bg-red-100 text-red-700' :
                  severity === 'High' ? 'bg-orange-100 text-orange-700' :
                  severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {severity}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-3 pt-3 border-t border-current/20">
        <p className="text-xs opacity-75">
          {parsedSources.filter(s => s.isMandatory).length > 0 && (
            <span className="font-semibold">Critical control - must be satisfied before work. </span>
          )}
          {parsedSources.length === 1 
            ? `Required by 1 hazard` 
            : `Required by ${parsedSources.length} hazards`}
        </p>
      </div>
    </div>
  );
}
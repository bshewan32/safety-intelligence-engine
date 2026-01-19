// src/components/workers/WorkerStatusBadge.tsx
// Enhanced status badge with restriction reasoning

import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface RequiredControl {
  id: string;
  status: string;
  severity?: string;
  sources?: string;
  control: {
    code: string;
    title: string;
  };
}

interface WorkerStatusBadgeProps {
  status: string;
  requiredControls?: RequiredControl[];
  size?: 'sm' | 'md' | 'lg';
  showReasoning?: boolean;
}

export function WorkerStatusBadge({ 
  status, 
  requiredControls = [],
  size = 'md',
  showReasoning = false
}: WorkerStatusBadgeProps) {
  
  // Analyze gaps to find restriction reasons
  const criticalGaps: RequiredControl[] = [];
  const highGaps: RequiredControl[] = [];
  
  for (const rc of requiredControls) {
    if (['Satisfied', 'Temporary'].includes(rc.status)) continue;
    
    let severity = rc.severity;
    
    // Parse sources if needed to get severity
    if (!severity && rc.sources) {
      try {
        const sources = JSON.parse(rc.sources);
        const severities = sources.map((s: any) => s.severity);
        severity = ['Critical', 'High', 'Medium', 'Low'].find(level =>
          severities.includes(level)
        ) || 'Low';
      } catch (e) {
        severity = 'Low';
      }
    }
    
    if (severity === 'Critical') {
      criticalGaps.push(rc);
    } else if (severity === 'High') {
      highGaps.push(rc);
    }
  }

  // Status display logic
  const getStatusConfig = () => {
    if (status === 'active') {
      return {
        label: 'Active',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle size={16} />,
        borderColor: 'border-green-200'
      };
    } else if (status === 'restricted') {
      return {
        label: 'Restricted',
        color: 'bg-red-100 text-red-800',
        icon: <AlertTriangle size={16} />,
        borderColor: 'border-red-200'
      };
    } else {
      return {
        label: 'Inactive',
        color: 'bg-gray-100 text-gray-800',
        icon: <XCircle size={16} />,
        borderColor: 'border-gray-200'
      };
    }
  };

  const config = getStatusConfig();
  
  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div>
      {/* Status Badge */}
      <div className={`inline-flex items-center space-x-1.5 rounded-full font-medium ${config.color} ${sizeClasses[size]}`}>
        {config.icon}
        <span>{config.label}</span>
      </div>

      {/* Restriction Reasoning */}
      {showReasoning && status === 'restricted' && (criticalGaps.length > 0 || highGaps.length > 0) && (
        <div className={`mt-3 p-4 rounded-lg border-2 ${config.borderColor} bg-red-50`}>
          <div className="flex items-start space-x-2">
            <AlertTriangle className="text-red-600 mt-0.5" size={16} />
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-red-900 mb-2">
                Cannot Work - Missing Critical Controls
              </h4>
              
              {criticalGaps.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-red-800">
                    {criticalGaps.length} Critical Gap{criticalGaps.length > 1 ? 's' : ''}:
                  </p>
                  {criticalGaps.slice(0, 3).map(gap => (
                    <div key={gap.id} className="flex items-start space-x-2 text-sm">
                      <span className="text-red-400">•</span>
                      <div className="flex-1">
                        <span className="font-medium text-red-900">{gap.control.code}</span>
                        <span className="text-red-700 ml-1">- {gap.control.title}</span>
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                          gap.status === 'Overdue' ? 'bg-red-200 text-red-900' : 'bg-red-100 text-red-800'
                        }`}>
                          {gap.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {criticalGaps.length > 3 && (
                    <p className="text-xs text-red-700 ml-4">
                      +{criticalGaps.length - 3} more critical gap{criticalGaps.length - 3 > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}
              
              {highGaps.length >= 3 && (
                <div className="mt-2 pt-2 border-t border-red-200">
                  <p className="text-xs text-red-800">
                    Also {highGaps.length} high-severity gap{highGaps.length > 1 ? 's' : ''} requiring attention
                  </p>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-xs text-red-700">
                  <strong>Action Required:</strong> Upload evidence or create temporary fixes to restore operational status.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Status Details */}
      {showReasoning && status === 'active' && requiredControls.length > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-start space-x-2">
            <CheckCircle className="text-green-600 mt-0.5" size={16} />
            <div className="flex-1">
              <p className="text-sm text-green-900">
                All critical controls satisfied. Worker is cleared for assigned roles.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
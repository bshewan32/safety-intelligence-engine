// src/components/workers/GapBadge.tsx
// Gap Badge Component - Shows gap count with risk-based styling

import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface GapBadgeProps {
  gapCount: number;
  criticalCount?: number;
  highCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function GapBadge({ 
  gapCount, 
  criticalCount = 0, 
  highCount = 0,
  size = 'md',
  showIcon = true 
}: GapBadgeProps) {
  if (gapCount === 0) {
    return null; // Don't show badge if no gaps
  }

  // Determine severity based on gap counts
  let severity: 'critical' | 'high' | 'medium' = 'medium';
  let bgColor = 'bg-yellow-100';
  let textColor = 'text-yellow-800';
  let borderColor = 'border-yellow-300';
  let Icon = Info;

  if (criticalCount > 0) {
    severity = 'critical';
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
    borderColor = 'border-red-300';
    Icon = AlertCircle;
  } else if (highCount > 0) {
    severity = 'high';
    bgColor = 'bg-orange-100';
    textColor = 'text-orange-800';
    borderColor = 'border-orange-300';
    Icon = AlertTriangle;
  }

  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <span 
      className={`
        inline-flex items-center rounded-full font-medium border
        ${bgColor} ${textColor} ${borderColor} ${sizeClasses[size]}
        ${severity === 'critical' ? 'animate-pulse' : ''}
      `}
      title={`${gapCount} gap${gapCount !== 1 ? 's' : ''} detected${
        criticalCount > 0 ? ` (${criticalCount} critical)` : 
        highCount > 0 ? ` (${highCount} high)` : ''
      }`}
    >
      {showIcon && <Icon size={iconSizes[size]} className="mr-1" />}
      <span className="font-semibold">{gapCount}</span>
      <span className="ml-1">gap{gapCount !== 1 ? 's' : ''}</span>
    </span>
  );
}
import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useClient } from '../../context/ClientContext';
import GapSummaryWidget from './GapsummaryWidget';
import RecommendationsWidget from './RecommendationsWidget';
import CoverageWidget from './CoverageWidget';

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
  gaps: any[];
  coverage: {
    overall: number;
    byCriticality: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
  };
  recommendations: any[];
}

export default function Dashboard() {
  const { activeClient } = useClient();

  const [summary, setSummary] = useState({
    rbcs: 0,
    compliance: 0,
    openHazards: 0,
    expiringSoon: 0,
  });

  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [activeClient]); // Reload when client changes

  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      // Load basic dashboard summary
      const data = await window.api.dashboardSummary(activeClient?.id);
      
      // Map the API response to match our state structure
      // API returns: operationalReadiness, auditReadiness, openHazards, expiringSoon
      setSummary({
        rbcs: data.operationalReadiness || data.rbcs || 0,
        compliance: data.auditReadiness || data.compliance || 0,
        openHazards: data.openHazards || 0,
        expiringSoon: data.expiringSoon || 0,
      });

      // Load gap analysis
      const gapData = await window.api.analyzeGaps(activeClient?.id);
      setGapAnalysis(gapData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      // Set defaults on error
      setSummary({
        rbcs: 0,
        compliance: 0,
        openHazards: 0,
        expiringSoon: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllGaps = () => {
    // TODO: Navigate to gaps view or show modal
    console.log('View all gaps clicked');
  };

  const handleScheduleRenewals = () => {
    // TODO: Navigate to renewals scheduler or show modal
    console.log('Schedule renewals clicked');
  };

  const handleTakeAction = (recommendation: any) => {
    // TODO: Handle recommendation action
    console.log('Take action on recommendation:', recommendation);
  };

  const handleViewAllRecommendations = () => {
    // TODO: Navigate to recommendations view
    console.log('View all recommendations clicked');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Metrics Row - Existing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">RBCS Score</h3>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-blue-600">{summary.rbcs}%</div>
          <p className="text-sm text-green-600 mt-1">+3% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Open Hazards</h3>
            <AlertTriangle className="text-orange-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{summary.openHazards}</div>
          <p className="text-sm text-gray-500 mt-1">3 critical</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Compliance</h3>
            <CheckCircle className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{summary.compliance}%</div>
          <p className="text-sm text-gray-500 mt-1">Controls valid</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Expiring Soon</h3>
            <Clock className="text-orange-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{summary.expiringSoon}</div>
          <p className="text-sm text-gray-500 mt-1">Next 30 days</p>
        </div>
      </div>

      {/* Gap Analysis Section - NEW */}
      {gapAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Gap Summary (spans 1 column) */}
          <div className="lg:col-span-1">
            <GapSummaryWidget
              summary={gapAnalysis.summary}
              onViewAllGaps={handleViewAllGaps}
              onScheduleRenewals={handleScheduleRenewals}
            />
          </div>

          {/* Right Column: Recommendations and Coverage (spans 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <RecommendationsWidget
              recommendations={gapAnalysis.recommendations}
              onTakeAction={handleTakeAction}
              onViewAll={handleViewAllRecommendations}
            />
            
            <CoverageWidget coverage={gapAnalysis.coverage} />
          </div>
        </div>
      )}

      {/* Risk Overview - Existing */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Top Residual Risks</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50 rounded">
            <span className="font-medium">Electric Shock - Live Conductors</span>
            <span className="px-3 py-1 bg-red-500 text-white text-sm rounded">High</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
            <span className="font-medium">Confined Space Entry</span>
            <span className="px-3 py-1 bg-orange-500 text-white text-sm rounded">Medium</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
            <span className="font-medium">Working at Heights</span>
            <span className="px-3 py-1 bg-yellow-500 text-white text-sm rounded">Medium</span>
          </div>
        </div>
      </div>
    </div>
  );
}
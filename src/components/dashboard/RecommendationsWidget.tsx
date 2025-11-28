import React from 'react';
import { Lightbulb, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

interface Recommendation {
  type: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedWorkers?: number;
  actions: string[];
  controls?: any[];
}

interface Props {
  recommendations: Recommendation[];
  onTakeAction?: (recommendation: Recommendation) => void;
  onViewAll?: () => void;
}

export default function RecommendationsWidget({ recommendations, onTakeAction, onViewAll }: Props) {
  const topRecommendations = recommendations.slice(0, 3);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return <AlertCircle className="text-red-600" size={20} />;
      case 'medium':
        return <AlertCircle className="text-orange-600" size={20} />;
      default:
        return <CheckCircle className="text-blue-600" size={20} />;
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="text-green-600" size={28} />
          <h3 className="text-lg font-semibold text-gray-900">No Recommendations</h3>
        </div>
        <p className="text-gray-600">
          Your safety management system is in good shape. No immediate actions required.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Lightbulb className="text-purple-600" size={28} />
          <h3 className="text-lg font-semibold text-gray-900">Recommended Actions</h3>
        </div>
        {recommendations.length > 3 && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All ({recommendations.length})
          </button>
        )}
      </div>

      <div className="space-y-4">
        {topRecommendations.map((rec, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}
          >
            <div className="flex items-start gap-3 mb-3">
              {getPriorityIcon(rec.priority)}
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{rec.title}</h4>
                <p className="text-sm opacity-90">{rec.description}</p>
                {rec.affectedWorkers && (
                  <p className="text-xs mt-2 opacity-75">
                    Affects {rec.affectedWorkers} worker{rec.affectedWorkers > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Actions List */}
            <div className="ml-8 space-y-1 mb-3">
              {rec.actions.slice(0, 2).map((action, actionIdx) => (
                <div key={actionIdx} className="flex items-start gap-2 text-sm">
                  <span className="opacity-60">•</span>
                  <span className="opacity-90">{action}</span>
                </div>
              ))}
              {rec.actions.length > 2 && (
                <div className="text-xs opacity-75 mt-1">
                  +{rec.actions.length - 2} more action{rec.actions.length - 2 > 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* Take Action Button */}
            {onTakeAction && (
              <button
                onClick={() => onTakeAction(rec)}
                className="flex items-center gap-2 text-sm font-medium opacity-90 hover:opacity-100 transition-opacity"
              >
                <span>Take Action</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {recommendations.length > 3 && onViewAll && (
        <button
          onClick={onViewAll}
          className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
        >
          View All Recommendations
        </button>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Search, Loader2 } from 'lucide-react';
import { TrainingMatch, WorkerMatch, ParsedRow } from './TrainingImporter';

interface SmartMatchingStepProps {
  parsedRows: ParsedRow[];
  clientId?: string;
  onComplete: (trainings: TrainingMatch[], workers: WorkerMatch[]) => void;
  onBack: () => void;
}

export function SmartMatchingStep({ parsedRows, clientId, onComplete, onBack }: SmartMatchingStepProps) {
  const [loading, setLoading] = useState(true);
  const [trainingMatches, setTrainingMatches] = useState<TrainingMatch[]>([]);
  const [workerMatches, setWorkerMatches] = useState<WorkerMatch[]>([]);
  const [availableControls, setAvailableControls] = useState<any[]>([]);
  const [availableWorkers, setAvailableWorkers] = useState<any[]>([]);
  const [expandedTraining, setExpandedTraining] = useState<string | null>(null);

  useEffect(() => {
    performMatching();
  }, []);

  const performMatching = async () => {
    setLoading(true);
    try {
      // Get unique training names and worker names
      const uniqueTrainings = [...new Set(parsedRows.map(r => r.trainingName))];
      const uniqueWorkers = [...new Set(parsedRows.map(r => r.workerName))];

      // Call backend for smart matching
      const result = await window.api.performSmartMatching({
        trainingNames: uniqueTrainings,
        workerNames: uniqueWorkers,
        clientId,
      });

      setTrainingMatches(result.trainingMatches);
      setWorkerMatches(result.workerMatches);
      setAvailableControls(result.availableControls);
      setAvailableWorkers(result.availableWorkers);
    } catch (error) {
      console.error('Matching failed:', error);
      alert('Failed to perform smart matching');
    } finally {
      setLoading(false);
    }
  };

  const updateTrainingMatch = (trainingName: string, controlId: string | null, manualSelection: boolean = false) => {
    setTrainingMatches(prev => prev.map(tm => {
      if (tm.trainingName === trainingName) {
        const control = availableControls.find(c => c.id === controlId);
        return {
          ...tm,
          controlId,
          controlTitle: control ? control.title : 'No Match',
          confidence: manualSelection ? 100 : tm.confidence,
          manualSelection,
        };
      }
      return tm;
    }));
  };

  const handleContinue = () => {
    // Validate that all have matches or explicit "no match"
    const unmatched = trainingMatches.filter(tm => tm.controlId === null && !tm.manualSelection);
    
    if (unmatched.length > 0) {
      alert(`Please select controls for ${unmatched.length} remaining training types`);
      return;
    }

    onComplete(trainingMatches, workerMatches);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-600">Performing smart matching...</p>
      </div>
    );
  }

  const autoMatched = trainingMatches.filter(tm => tm.confidence === 100 && !tm.manualSelection);
  const suggested = trainingMatches.filter(tm => tm.confidence > 50 && tm.confidence < 100);
  const needsManual = trainingMatches.filter(tm => tm.confidence <= 50 || tm.controlId === null);

  // Worker matching stats
  const workersAutoMatched = workerMatches.filter(wm => wm.confidence === 100);
  const workersNeedReview = workerMatches.filter(wm => wm.confidence < 100 && wm.workerId);
  const workersUnmatched = workerMatches.filter(wm => !wm.workerId);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Matching Results</h3>
        <p className="text-gray-600">
          We've automatically matched training records to your controls using fuzzy matching algorithms.
          Review and adjust matches below.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Auto-Matched</p>
              <p className="text-2xl font-bold text-green-900">{autoMatched.length}</p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium">Suggested</p>
              <p className="text-2xl font-bold text-yellow-900">{suggested.length}</p>
            </div>
            <Search className="text-yellow-600" size={32} />
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Needs Manual</p>
              <p className="text-2xl font-bold text-blue-900">{needsManual.length}</p>
            </div>
            <AlertCircle className="text-blue-600" size={32} />
          </div>
        </div>
      </div>

      {/* Worker Matching Info */}
      {workersUnmatched.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-medium text-yellow-900">Worker Matching Notice</h4>
              <p className="text-yellow-800 text-sm mt-1">
                {workersUnmatched.length} worker name(s) couldn't be matched automatically. 
                These records will be skipped during import. You may need to add these workers to your system first.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Matched Section */}
      {autoMatched.length > 0 && (
        <div className="border border-green-200 rounded-lg overflow-hidden">
          <div className="bg-green-50 px-4 py-3 border-b border-green-200">
            <h4 className="font-semibold text-green-900 flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>Auto-Matched ({autoMatched.length})</span>
            </h4>
          </div>
          <div className="bg-white divide-y divide-gray-200 max-h-48 overflow-y-auto">
            {autoMatched.slice(0, 5).map((tm) => (
              <div key={tm.trainingName} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">{tm.trainingName}</span>
                    <span className="text-gray-500 mx-2">→</span>
                    <span className="text-green-700">{tm.controlTitle}</span>
                  </div>
                  <span className="text-green-600 text-xs font-medium">100% match</span>
                </div>
              </div>
            ))}
            {autoMatched.length > 5 && (
              <div className="px-4 py-2 text-center text-sm text-gray-500">
                + {autoMatched.length - 5} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suggested Matches Section */}
      {suggested.length > 0 && (
        <div className="border border-yellow-200 rounded-lg overflow-hidden">
          <div className="bg-yellow-50 px-4 py-3 border-b border-yellow-200">
            <h4 className="font-semibold text-yellow-900 flex items-center space-x-2">
              <Search size={20} />
              <span>Suggested Matches - Review ({suggested.length})</span>
            </h4>
          </div>
          <div className="bg-white divide-y divide-gray-200">
            {suggested.map((tm) => (
              <div key={tm.trainingName} className="px-4 py-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">"{tm.trainingName}"</p>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-500">Suggested:</span>
                      <span className="font-medium text-yellow-700">{tm.controlTitle}</span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">
                        {tm.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{tm.reason}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateTrainingMatch(tm.trainingName, tm.controlId, true)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    ✓ Accept
                  </button>
                  <button
                    onClick={() => setExpandedTraining(expandedTraining === tm.trainingName ? null : tm.trainingName)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                  >
                    Choose Different
                  </button>
                </div>
                {expandedTraining === tm.trainingName && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      value={tm.controlId || ''}
                      onChange={(e) => updateTrainingMatch(tm.trainingName, e.target.value || null, true)}
                    >
                      <option value="">-- Select Control --</option>
                      {availableControls.map((c) => (
                        <option key={c.id} value={c.id}>{c.title} ({c.type})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Mapping Section */}
      {needsManual.length > 0 && (
        <div className="border border-blue-200 rounded-lg overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
            <h4 className="font-semibold text-blue-900 flex items-center space-x-2">
              <AlertCircle size={20} />
              <span>Manual Selection Required ({needsManual.length})</span>
            </h4>
          </div>
          <div className="bg-white divide-y divide-gray-200">
            {needsManual.map((tm) => (
              <div key={tm.trainingName} className="px-4 py-3">
                <p className="font-medium text-gray-900 mb-2">"{tm.trainingName}"</p>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  value={tm.controlId || ''}
                  onChange={(e) => updateTrainingMatch(tm.trainingName, e.target.value || null, true)}
                >
                  <option value="">-- Select Control --</option>
                  {availableControls.map((c) => (
                    <option key={c.id} value={c.id}>{c.title} ({c.type})</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <button
          onClick={handleContinue}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>Review & Import</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

import React, { useMemo } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, FileCheck, Users, Target } from 'lucide-react';
import { TrainingMatch, WorkerMatch, ParsedRow } from './TrainingImporter';

interface ReviewStepProps {
  trainingMatches: TrainingMatch[];
  workerMatches: WorkerMatch[];
  parsedRows: ParsedRow[];
  onImport: () => void;
  onBack: () => void;
  importing: boolean;
}

export function ReviewStep({ 
  trainingMatches, 
  workerMatches, 
  parsedRows, 
  onImport, 
  onBack, 
  importing 
}: ReviewStepProps) {
  
  const summary = useMemo(() => {
    const matchedWorkers = workerMatches.filter(wm => wm.workerId).length;
    const unmatchedWorkers = workerMatches.filter(wm => !wm.workerId).length;
    
    const matchedTrainings = trainingMatches.filter(tm => tm.controlId).length;
    const unmatchedTrainings = trainingMatches.filter(tm => !tm.controlId).length;
    
    // Count records that will be imported (worker matched AND training matched)
    const importableRecords = parsedRows.filter(row => {
      const workerMatch = workerMatches.find(wm => wm.csvName === row.workerName);
      const trainingMatch = trainingMatches.find(tm => tm.trainingName === row.trainingName);
      return workerMatch?.workerId && trainingMatch?.controlId;
    }).length;

    const skippedRecords = parsedRows.length - importableRecords;

    // Count unique controls that will receive evidence
    const affectedControls = new Set(
      parsedRows
        .map(row => {
          const tm = trainingMatches.find(t => t.trainingName === row.trainingName);
          return tm?.controlId;
        })
        .filter(Boolean)
    ).size;

    return {
      totalRecords: parsedRows.length,
      importableRecords,
      skippedRecords,
      matchedWorkers,
      unmatchedWorkers,
      matchedTrainings,
      unmatchedTrainings,
      affectedControls,
    };
  }, [trainingMatches, workerMatches, parsedRows]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Review & Import</h3>
        <p className="text-gray-600">
          Review the import summary below. Once you confirm, training records will be created as evidence.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-3">
            <FileCheck className="text-blue-600" size={28} />
            <div>
              <p className="text-sm text-blue-700 font-medium">Records</p>
              <p className="text-3xl font-bold text-blue-900">{summary.importableRecords}</p>
            </div>
          </div>
          <p className="text-sm text-blue-700">
            {summary.skippedRecords > 0 && (
              <span className="text-yellow-700">
                ({summary.skippedRecords} will be skipped)
              </span>
            )}
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Users className="text-green-600" size={28} />
            <div>
              <p className="text-sm text-green-700 font-medium">Workers</p>
              <p className="text-3xl font-bold text-green-900">{summary.matchedWorkers}</p>
            </div>
          </div>
          {summary.unmatchedWorkers > 0 && (
            <p className="text-sm text-yellow-700">
              {summary.unmatchedWorkers} unmatched
            </p>
          )}
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Target className="text-purple-600" size={28} />
            <div>
              <p className="text-sm text-purple-700 font-medium">Controls</p>
              <p className="text-3xl font-bold text-purple-900">{summary.affectedControls}</p>
            </div>
          </div>
          <p className="text-sm text-purple-700">will receive evidence</p>
        </div>
      </div>

      {/* Warnings */}
      {summary.skippedRecords > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">Import Notes</h4>
          <ul className="text-yellow-800 text-sm space-y-1 list-disc list-inside">
            {summary.unmatchedWorkers > 0 && (
              <li>
                {summary.unmatchedWorkers} worker name(s) couldn't be matched - 
                their records will be skipped
              </li>
            )}
            {summary.unmatchedTrainings > 0 && (
              <li>
                {summary.unmatchedTrainings} training type(s) have no control mapping - 
                those records will be skipped
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Import Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">What Will Happen</h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
            <p className="text-gray-700">
              <strong>{summary.importableRecords}</strong> training records will be created as evidence
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
            <p className="text-gray-700">
              Evidence will be linked to the appropriate RequiredControl for each worker
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
            <p className="text-gray-700">
              Worker compliance status will be automatically updated
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
            <p className="text-gray-700">
              Expiry dates will be set if provided in your CSV
            </p>
          </div>
        </div>
      </div>

      {/* Matched Training Types Preview */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">Training Type Mappings</h4>
        </div>
        <div className="bg-white divide-y divide-gray-200 max-h-64 overflow-y-auto">
          {trainingMatches
            .filter(tm => tm.controlId)
            .map((tm) => (
              <div key={tm.trainingName} className="px-4 py-2 text-sm flex items-center justify-between">
                <div>
                  <span className="text-gray-900">{tm.trainingName}</span>
                  <span className="text-gray-400 mx-2">→</span>
                  <span className="text-blue-700">{tm.controlTitle}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {parsedRows.filter(r => r.trainingName === tm.trainingName).length} records
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          disabled={importing}
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <button
          onClick={onImport}
          disabled={importing || summary.importableRecords === 0}
          className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {importing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Importing...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              <span>Import {summary.importableRecords} Records</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
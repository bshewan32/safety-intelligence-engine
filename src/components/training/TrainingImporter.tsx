import React, { useState } from 'react';
import { X, Upload, Columns, Target, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { UploadStep } from './UploadStep';
import { ColumnMapperStep } from './ColumnMapperStep';
import { SmartMatchingStep } from './SmartMatchingStep';
import { ReviewStep } from './ReviewStep';

interface TrainingImporterProps {
  onClose: () => void;
  onComplete: () => void;
  clientId?: string; // Optional: filter workers by client
}

export interface ParsedRow {
  workerName: string;
  trainingName: string;
  issuedDate: string;
  expiryDate?: string;
  notes?: string;
  [key: string]: any; // Other CSV columns
}

export interface ColumnMapping {
  workerName: string;
  trainingName: string;
  issuedDate: string;
  expiryDate?: string;
  notes?: string;
}

export interface TrainingMatch {
  trainingName: string;
  controlId: string | null;
  controlTitle: string;
  confidence: number;
  reason: string;
  manualSelection?: boolean;
}

export interface WorkerMatch {
  csvName: string;
  workerId: string | null;
  workerFullName: string;
  confidence: number;
}

export function TrainingImporter({ onClose, onComplete, clientId }: TrainingImporterProps) {
  const [step, setStep] = useState(1);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [trainingMatches, setTrainingMatches] = useState<TrainingMatch[]>([]);
  const [workerMatches, setWorkerMatches] = useState<WorkerMatch[]>([]);
  const [importing, setImporting] = useState(false);

  const steps = [
    { id: 1, name: 'Upload', icon: Upload },
    { id: 2, name: 'Map Columns', icon: Columns },
    { id: 3, name: 'Match Controls', icon: Target },
    { id: 4, name: 'Review & Import', icon: CheckCircle2 },
  ];

  const handleUploadComplete = (data: any[], cols: string[]) => {
    setCsvData(data);
    setHeaders(cols);
    setStep(2);
  };

  const handleMappingComplete = (mapping: ColumnMapping, rows: ParsedRow[]) => {
    setColumnMapping(mapping);
    setParsedRows(rows);
    setStep(3);
  };

  const handleMatchingComplete = (trainings: TrainingMatch[], workers: WorkerMatch[]) => {
    setTrainingMatches(trainings);
    setWorkerMatches(workers);
    setStep(4);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];

      // Create lookup maps
      const trainingMap = new Map(
        trainingMatches
          .filter(tm => tm.controlId)
          .map(tm => [tm.trainingName, tm])
      );
      
      const workerMap = new Map(
        workerMatches
          .filter(wm => wm.workerId)
          .map(wm => [wm.csvName, wm])
      );

      // Group records by control for bulk import
      const recordsByControl = new Map<string, Array<{
        workerId: string;
        issuedDate: string;
        expiryDate?: string;
        notes?: string;
      }>>();

      for (const row of parsedRows) {
        try {
          const trainingMatch = trainingMap.get(row.trainingName);
          const workerMatch = workerMap.get(row.workerName);

          if (!trainingMatch || !workerMatch) {
            skipped++;
            continue;
          }

          const { controlId } = trainingMatch;
          const { workerId } = workerMatch;

          if (!controlId || !workerId) {
            skipped++;
            continue;
          }

          // Group by control
          if (!recordsByControl.has(controlId)) {
            recordsByControl.set(controlId, []);
          }

          recordsByControl.get(controlId)!.push({
            workerId,
            issuedDate: row.issuedDate,
            expiryDate: row.expiryDate,
            notes: row.notes,
          });

          imported++;
        } catch (err: any) {
          console.error('Failed to process row:', row, err);
          errors.push(`${row.workerName} - ${row.trainingName}: ${err.message}`);
          skipped++;
          imported--;
        }
      }

      // Import evidence in bulk for each control
      for (const [controlId, records] of recordsByControl) {
        for (const record of records) {
          try {
            await window.api.bulkAddEvidence({
              controlId,
              workerIds: [record.workerId],
              issuedDate: record.issuedDate,
              expiryDate: record.expiryDate,
              notes: record.notes,
            });
          } catch (err: any) {
            console.error('Bulk import failed:', err);
            errors.push(`Failed to import evidence for control ${controlId}`);
          }
        }
      }

      if (errors.length > 0) {
        console.warn('Import completed with errors:', errors);
        alert(`Import completed with ${errors.length} errors. Check console for details.`);
      }

      onComplete();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import training records');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="text-white" size={28} />
            <div>
              <h2 className="text-xl font-bold text-white">Training Records Import</h2>
              <p className="text-blue-100 text-sm">Import training data with smart matching</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded-full p-2 transition-colors"
            disabled={importing}
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= s.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {step > s.id ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <s.icon size={20} />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      step >= s.id ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {s.name}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      step > s.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <UploadStep onComplete={handleUploadComplete} />
          )}
          {step === 2 && (
            <ColumnMapperStep
              headers={headers}
              csvData={csvData}
              onComplete={handleMappingComplete}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <SmartMatchingStep
              parsedRows={parsedRows}
              clientId={clientId}
              onComplete={handleMatchingComplete}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <ReviewStep
              trainingMatches={trainingMatches}
              workerMatches={workerMatches}
              parsedRows={parsedRows}
              onImport={handleImport}
              onBack={() => setStep(3)}
              importing={importing}
            />
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { X, Upload, Columns, Target, CheckCircle2, FileText } from 'lucide-react';
import { UploadStep } from './UploadStep';
import { ColumnMapperStep } from './ColumnMapperStep';
import { SmartMatchingStep } from './SmartMatchingStep';
import { ReviewStep } from './ReviewStep';

interface DocumentImporterProps {
  onClose: () => void;
  onComplete: () => void;
  clientId?: string; // Optional: import for specific client
}

export interface ParsedRow {
  documentName: string;
  documentType: string;
  filePath: string;
  version?: string;
  issuedDate?: string;
  expiryDate?: string;
  notes?: string;
  [key: string]: any;
}

export interface ColumnMapping {
  documentName: string;
  documentType: string;
  filePath: string;
  version?: string;
  issuedDate?: string;
  expiryDate?: string;
  notes?: string;
}

export interface DocumentMatch {
  documentName: string;
  documentType: string;
  controlId: string | null;
  controlTitle: string;
  confidence: number;
  reason: string;
  manualSelection?: boolean;
}

export function DocumentImporter({ onClose, onComplete, clientId }: DocumentImporterProps) {
  const [step, setStep] = useState(1);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [documentMatches, setDocumentMatches] = useState<DocumentMatch[]>([]);
  const [importing, setImporting] = useState(false);

  const steps = [
    { id: 1, name: 'Upload CSV', icon: Upload },
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

  const handleMatchingComplete = (matches: DocumentMatch[]) => {
    setDocumentMatches(matches);
    setStep(4);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const result = await window.api.importDocuments({
        documents: parsedRows.map((row, idx) => ({
          ...row,
          controlId: documentMatches[idx].controlId,
          clientId: clientId || null
        }))
      });

      console.log('Import result:', result);
      onComplete();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed: ' + (error as Error).message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center space-x-3">
            <FileText className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">Import Document Index</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step > s.id
                        ? 'bg-green-600 text-white'
                        : step === s.id
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
              documentMatches={documentMatches}
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
import React from 'react';
import { CheckCircle, FileText, AlertCircle, Loader } from 'lucide-react';
import { DocumentMatch, ParsedRow } from './document-importer';

interface ReviewStepProps {
  documentMatches: DocumentMatch[];
  parsedRows: ParsedRow[];
  onImport: () => Promise<void>;
  onBack: () => void;
  importing: boolean;
}

export function ReviewStep({
  documentMatches,
  parsedRows,
  onImport,
  onBack,
  importing,
}: ReviewStepProps) {
  const totalDocuments = parsedRows.length;
  const matched = documentMatches.filter((dm) => dm.controlId !== null).length;
  const unmatched = totalDocuments - matched;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Review & Import
        </h3>
        <p className="text-gray-600 text-sm">
          Review the final import summary before proceeding.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total Documents</p>
              <p className="text-2xl font-bold text-blue-900">{totalDocuments}</p>
            </div>
            <FileText className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Matched to Controls</p>
              <p className="text-2xl font-bold text-green-900">{matched}</p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unmatched</p>
              <p className="text-2xl font-bold text-gray-900">{unmatched}</p>
            </div>
            <AlertCircle className="text-gray-600" size={32} />
          </div>
        </div>
      </div>

      {/* Import Preview */}
      <div className="border rounded-lg">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h4 className="font-medium text-gray-900">Import Preview</h4>
        </div>
        <div className="divide-y max-h-96 overflow-y-auto">
          {parsedRows.map((row, idx) => {
            const match = documentMatches[idx];
            const hasMatch = match?.controlId !== null;

            return (
              <div key={idx} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {row.documentName}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                        {row.documentType}
                      </span>
                      {row.version && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {row.version}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{row.filePath}</p>
                    {hasMatch ? (
                      <div className="flex items-center space-x-2 mt-2">
                        <CheckCircle size={14} className="text-green-600" />
                        <span className="text-sm text-green-700">
                          → {match.controlTitle}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({match.confidence}% confidence)
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 mt-2">
                        <AlertCircle size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-500">
                          No control mapping
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* What Will Happen */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">What will happen:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>✓ {totalDocuments} Document records will be created</li>
          <li>✓ {matched} Document-Control mappings will be saved</li>
          <li>✓ Mappings will be learned for future imports</li>
          {unmatched > 0 && (
            <li className="text-yellow-700">
              ⚠ {unmatched} documents will be imported without control mappings
            </li>
          )}
        </ul>
      </div>

      {/* Warning for unmatched */}
      {unmatched > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-yellow-900">Some documents are unmatched</p>
              <p className="text-sm text-yellow-700 mt-1">
                {unmatched} document{unmatched !== 1 ? 's' : ''} will be imported without
                control mappings. You can assign controls manually after import.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={onBack}
          disabled={importing}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={onImport}
          disabled={importing}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
        >
          {importing ? (
            <>
              <Loader className="animate-spin" size={20} />
              <span>Importing...</span>
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              <span>Import {totalDocuments} Documents</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { ColumnMapping, ParsedRow } from './TrainingImporter';

interface ColumnMapperStepProps {
  headers: string[];
  csvData: any[];
  onComplete: (mapping: ColumnMapping, rows: ParsedRow[]) => void;
  onBack: () => void;
}

export function ColumnMapperStep({ headers, csvData, onComplete, onBack }: ColumnMapperStepProps) {
  const [mapping, setMapping] = useState<ColumnMapping>({
    workerName: '',
    trainingName: '',
    issuedDate: '',
    expiryDate: '',
    notes: '',
  });
  const [errors, setErrors] = useState<string[]>([]);

  // Auto-detect columns on mount
  useEffect(() => {
    autoDetectColumns();
  }, [headers]);

  const autoDetectColumns = () => {
    const detected: ColumnMapping = {
      workerName: '',
      trainingName: '',
      issuedDate: '',
      expiryDate: '',
      notes: '',
    };

    // Worker name detection
    const workerPatterns = ['name', 'worker', 'employee', 'person', 'full name', 'fullname'];
    detected.workerName = findMatchingHeader(workerPatterns) || '';

    // Training name detection
    const trainingPatterns = ['training', 'course', 'certification', 'certificate', 'program'];
    detected.trainingName = findMatchingHeader(trainingPatterns) || '';

    // Issued date detection
    const issuedPatterns = ['date', 'issued', 'completed', 'completion', 'issue date', 'completion date'];
    detected.issuedDate = findMatchingHeader(issuedPatterns) || '';

    // Expiry date detection
    const expiryPatterns = ['expiry', 'expire', 'expiration', 'valid until', 'expires'];
    detected.expiryDate = findMatchingHeader(expiryPatterns) || '';

    // Notes detection
    const notesPatterns = ['notes', 'comments', 'remarks', 'description'];
    detected.notes = findMatchingHeader(notesPatterns) || '';

    setMapping(detected);
  };

  const findMatchingHeader = (patterns: string[]): string | null => {
    for (const header of headers) {
      const lowerHeader = header.toLowerCase().trim();
      for (const pattern of patterns) {
        if (lowerHeader.includes(pattern)) {
          return header;
        }
      }
    }
    return null;
  };

  const validateMapping = (): boolean => {
    const errs: string[] = [];

    if (!mapping.workerName) {
      errs.push('Worker name column is required');
    }
    if (!mapping.trainingName) {
      errs.push('Training name column is required');
    }
    if (!mapping.issuedDate) {
      errs.push('Issued/completed date column is required');
    }

    setErrors(errs);
    return errs.length === 0;
  };

  const handleContinue = () => {
    if (!validateMapping()) {
      return;
    }

    // Parse rows using mapping
    const parsed: ParsedRow[] = csvData.map((row) => ({
      workerName: row[mapping.workerName] || '',
      trainingName: row[mapping.trainingName] || '',
      issuedDate: row[mapping.issuedDate] || '',
      expiryDate: mapping.expiryDate ? row[mapping.expiryDate] : undefined,
      notes: mapping.notes ? row[mapping.notes] : undefined,
    })).filter(row => row.workerName && row.trainingName && row.issuedDate);

    if (parsed.length === 0) {
      setErrors(['No valid rows found with all required fields']);
      return;
    }

    onComplete(mapping, parsed);
  };

  const previewRows = csvData.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Map CSV Columns</h3>
        <p className="text-gray-600">
          Map your CSV columns to the required fields. We've attempted to auto-detect the columns.
        </p>
      </div>

      {/* Column Mappings */}
      <div className="space-y-4">
        {/* Worker Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Worker Name <span className="text-red-500">*</span>
          </label>
          <select
            value={mapping.workerName}
            onChange={(e) => setMapping({ ...mapping, workerName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Select Column --</option>
            {headers.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        {/* Training Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Training Name <span className="text-red-500">*</span>
          </label>
          <select
            value={mapping.trainingName}
            onChange={(e) => setMapping({ ...mapping, trainingName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Select Column --</option>
            {headers.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        {/* Issued Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Issued/Completed Date <span className="text-red-500">*</span>
          </label>
          <select
            value={mapping.issuedDate}
            onChange={(e) => setMapping({ ...mapping, issuedDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Select Column --</option>
            {headers.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        {/* Expiry Date (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <select
            value={mapping.expiryDate}
            onChange={(e) => setMapping({ ...mapping, expiryDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- None --</option>
            {headers.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        {/* Notes (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <select
            value={mapping.notes}
            onChange={(e) => setMapping({ ...mapping, notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- None --</option>
            {headers.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Preview (first 3 rows)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white border-b-2 border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left">Worker</th>
                <th className="px-3 py-2 text-left">Training</th>
                <th className="px-3 py-2 text-left">Issued</th>
                <th className="px-3 py-2 text-left">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="px-3 py-2">{mapping.workerName ? row[mapping.workerName] : '-'}</td>
                  <td className="px-3 py-2">{mapping.trainingName ? row[mapping.trainingName] : '-'}</td>
                  <td className="px-3 py-2">{mapping.issuedDate ? row[mapping.issuedDate] : '-'}</td>
                  <td className="px-3 py-2">{mapping.expiryDate ? row[mapping.expiryDate] : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-medium text-red-900">Validation Errors</h4>
              <ul className="text-red-700 text-sm mt-1 list-disc list-inside">
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
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
          <span>Continue</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface UploadStepProps {
  onComplete: (data: any[], headers: string[]) => void;
}

export function UploadStep({ onComplete }: UploadStepProps) {
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = async (file: File) => {
    setParsing(true);
    setError(null);

    try {
      // Read file content
      const text = await file.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error('CSV file is empty');
      }

      // Simple CSV parsing
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('CSV file has no content');
      }

      // Parse headers (first line)
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      
      // Parse data rows
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row: any = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });
        return row;
      });

      if (data.length === 0) {
        throw new Error('CSV file has no data rows');
      }

      onComplete(data, headers);
    } catch (err: any) {
      console.error('CSV parse error:', err);
      setError(err.message || 'Failed to parse CSV file');
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.name.endsWith('.csv')) {
        parseCSV(file);
      } else {
        setError('Please upload a CSV file (.csv)');
      }
    }
  }, []);

  const handleFileSelect = async () => {
    try {
      // Create hidden file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv';
      
      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          parseCSV(file);
        }
      };
      
      input.click();
    } catch (err: any) {
      console.error('File select error:', err);
      setError('Failed to select file');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Training Records</h3>
        <p className="text-gray-600">
          Upload a CSV or Excel file containing your training records. The file should include worker names, 
          training names, and completion dates.
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {parsing ? (
          <div className="space-y-4">
            <div className="animate-spin mx-auto w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
            <p className="text-gray-600">Parsing file...</p>
          </div>
        ) : (
          <>
            <FileSpreadsheet className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Drop your CSV file here, or click to browse
            </h4>
            <p className="text-gray-500 mb-4">
              Supported format: CSV
            </p>
            <button
              onClick={handleFileSelect}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <Upload size={20} />
              <span>Select File</span>
            </button>
          </>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-medium text-red-900">Upload Failed</h4>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Expected Format Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Expected CSV Format</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Required columns:</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Worker name (e.g., "First Name", "Last Name", or "Full Name")</li>
            <li>Training name (e.g., "Training", "Course", "Certification")</li>
            <li>Completion date (e.g., "Date", "Completed", "Issue Date")</li>
          </ul>
          <p className="mt-2"><strong>Optional columns:</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Expiry date</li>
            <li>Notes or comments</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
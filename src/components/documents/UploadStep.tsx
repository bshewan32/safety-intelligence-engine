import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';

interface UploadStepProps {
  onComplete: (data: any[], headers: string[]) => void;
}

export function UploadStep({ onComplete }: UploadStepProps) {
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ headers: string[]; rows: any[] } | null>(null);

  const parseCSV = async (file: File) => {
    setParsing(true);
    setError(null);

    try {
      const text = await file.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error('CSV file is empty');
      }

      // Parse CSV (simple comma-split, handles quoted values)
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('CSV file has no content');
      }

      // Parse headers
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

      // Show preview
      setPreview({
        headers,
        rows: data.slice(0, 3) // First 3 rows
      });

      // Auto-proceed after preview
      setTimeout(() => {
        onComplete(data, headers);
      }, 1500);

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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Document Index</h3>
        <p className="text-gray-600 text-sm">
          Upload a CSV file containing your document library. The file should include document names,
          types, file paths, and optionally version info and dates.
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        {parsing ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Parsing CSV file...</p>
          </div>
        ) : preview ? (
          <div className="space-y-4">
            <CheckCircle className="text-green-600 mx-auto" size={48} />
            <div>
              <p className="text-lg font-semibold text-gray-900">CSV Parsed Successfully!</p>
              <p className="text-sm text-gray-600 mt-1">
                Found {preview.rows.length}+ documents. Proceeding to column mapping...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <FileSpreadsheet className="text-gray-400 mx-auto" size={48} />
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Drop your CSV file here
              </p>
              <p className="text-sm text-gray-600 mb-4">or click to browse</p>
              <button
                onClick={handleFileSelect}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Select CSV File
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-red-900">Upload Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* CSV Format Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Required CSV Columns</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• <strong>Document Name</strong> - Name or title of the document</p>
          <p>• <strong>Document Type</strong> - SWMS, SOP, Risk Assessment, Form, etc.</p>
          <p>• <strong>File Path</strong> - Location of the document file</p>
        </div>
        <h4 className="font-medium text-blue-900 mt-3 mb-2">Optional Columns</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Version, Issued Date, Expiry Date, Notes, Author, etc.</p>
        </div>
      </div>

      {/* Example CSV */}
      <details className="text-sm">
        <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
          Show example CSV format
        </summary>
        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
{`Document Name,Document Type,File Path,Version,Issued Date,Expiry Date
GMK SWMS - Arc Flash Work,SWMS,/docs/gmk/arc-flash-swms.pdf,Rev 2,2024-01-15,2025-01-15
GMK Working at Heights Rescue Plan,Plan,/docs/gmk/heights-rescue.pdf,v1,2024-02-01,
ABC Risk Assessment - Confined Space,Risk Assessment,/docs/abc/conf-space-ra.pdf,Rev 3,2023-11-10,2025-11-10
Generic Harness Inspection Form,Form,/templates/harness-inspect.pdf,,,`}
        </pre>
      </details>
    </div>
  );
}
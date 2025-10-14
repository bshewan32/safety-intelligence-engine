import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';

export function ReportBuilder() {
  const [client, setClient] = useState('VIVA');
  const [period, setPeriod] = useState('2025-10');
  const [outputPath, setOutputPath] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await window.api.buildClientReport({ client, period });
      setOutputPath(result.pdfPath);
      alert(`Report saved to: ${result.pdfPath}`);
    } catch (error) {
      console.error('Report generation failed:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-6">Generate Client Compliance Pack</h3>
        
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Name
            </label>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period (YYYY-MM)
            </label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="2025-10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Download size={20} />
            {loading ? 'Generating...' : 'Generate PDF'}
          </button>

          {outputPath && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Report saved to: <br />
                <span className="font-mono text-xs">{outputPath}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
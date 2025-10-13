import React from 'react';
import { FileText, Download } from 'lucide-react';

export function ReportBuilder() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-6">Generate Reports</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6 hover:border-blue-500 cursor-pointer transition">
            <FileText className="text-blue-600 mb-4" size={32} />
            <h4 className="font-semibold text-gray-900 mb-2">Worker Passport</h4>
            <p className="text-sm text-gray-600 mb-4">Individual worker compliance and control status</p>
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
              <Download size={16} />
              Generate PDF
            </button>
          </div>

          <div className="border rounded-lg p-6 hover:border-blue-500 cursor-pointer transition">
            <FileText className="text-blue-600 mb-4" size={32} />
            <h4 className="font-semibold text-gray-900 mb-2">Client Compliance Pack</h4>
            <p className="text-sm text-gray-600 mb-4">Monthly compliance report for clients</p>
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
              <Download size={16} />
              Generate PDF
            </button>
          </div>

          <div className="border rounded-lg p-6 hover:border-blue-500 cursor-pointer transition">
            <FileText className="text-blue-600 mb-4" size={32} />
            <h4 className="font-semibold text-gray-900 mb-2">Organizational Scorecard</h4>
            <p className="text-sm text-gray-600 mb-4">RBCS and risk analytics for leadership</p>
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
              <Download size={16} />
              Generate PDF
            </button>
          </div>

          <div className="border rounded-lg p-6 hover:border-blue-500 cursor-pointer transition">
            <FileText className="text-blue-600 mb-4" size={32} />
            <h4 className="font-semibold text-gray-900 mb-2">IMS Evidence Register</h4>
            <p className="text-sm text-gray-600 mb-4">Complete evidence mapping for audits</p>
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
              <Download size={16} />
              Generate DOCX
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// src/components/workers/QuickFixModal.tsx
// Quick Fix Modal - Fast evidence upload or temporary fix creation

import React, { useState } from 'react';
import { X, Upload, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Gap {
  id: string;
  controlId: string;
  controlCode: string;
  controlName: string;
  controlType: string;
  status: 'Required' | 'Overdue' | 'Expiring';
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
}

interface QuickFixModalProps {
  gap: Gap;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuickFixModal({ gap, onClose, onSuccess }: QuickFixModalProps) {
  const [fixType, setFixType] = useState<'evidence' | 'temporary'>('evidence');
  const [uploading, setUploading] = useState(false);
  const [tempNotes, setTempNotes] = useState('');
  const [tempDays, setTempDays] = useState(7);
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');

  const handleUploadEvidence = async () => {
    setUploading(true);
    try {
      // Open file picker
      const fileData = await window.api.selectEvidence();
      if (!fileData) {
        setUploading(false);
        return;
      }

      // Create evidence record
      await window.api.addEvidence({
        requiredControlId: gap.id,
        type: gap.controlType,
        filePath: fileData.path,
        checksum: fileData.checksum,
        fileSize: fileData.size,
        originalName: fileData.originalName,
        issuedDate: new Date(issuedDate),
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      });

      onSuccess();
    } catch (error) {
      console.error('Failed to upload evidence:', error);
      alert('Failed to upload evidence. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateTemporaryFix = async () => {
    if (!tempNotes.trim()) {
      alert('Please enter notes for the temporary fix');
      return;
    }

    setUploading(true);
    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + tempDays);

      await window.api.createTemporaryFix({
        requiredControlId: gap.id,
        notes: tempNotes,
        validUntil,
      });

      onSuccess();
    } catch (error) {
      console.error('Failed to create temporary fix:', error);
      alert('Failed to create temporary fix. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getRiskColor = () => {
    switch (gap.riskLevel) {
      case 'Critical':
        return 'border-red-500';
      case 'High':
        return 'border-orange-500';
      case 'Medium':
        return 'border-yellow-500';
      default:
        return 'border-blue-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 border-b border-l-4 ${getRiskColor()}`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <AlertCircle className={`mr-2 ${
                  gap.riskLevel === 'Critical' ? 'text-red-600' :
                  gap.riskLevel === 'High' ? 'text-orange-600' :
                  gap.riskLevel === 'Medium' ? 'text-yellow-600' :
                  'text-blue-600'
                }`} size={24} />
                Fix Gap
              </h2>
              <div className="mt-2">
                <p className="text-sm text-gray-600 font-mono">{gap.controlCode}</p>
                <p className="text-base font-medium text-gray-900 mt-1">{gap.controlName}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    gap.riskLevel === 'Critical' ? 'bg-red-100 text-red-700' :
                    gap.riskLevel === 'High' ? 'bg-orange-100 text-orange-700' :
                    gap.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {gap.riskLevel} Risk
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                    {gap.controlType}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Fix Type Selection */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setFixType('evidence')}
              className={`p-4 border-2 rounded-lg transition-all ${
                fixType === 'evidence'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <Upload size={24} className={fixType === 'evidence' ? 'text-blue-600' : 'text-gray-400'} />
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900">Upload Evidence</div>
                <div className="text-xs text-gray-500 mt-1">
                  Permanent solution - Upload proof of completion
                </div>
              </div>
            </button>

            <button
              onClick={() => setFixType('temporary')}
              className={`p-4 border-2 rounded-lg transition-all ${
                fixType === 'temporary'
                  ? 'border-amber-600 bg-amber-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <Clock size={24} className={fixType === 'temporary' ? 'text-amber-600' : 'text-gray-400'} />
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900">Temporary Fix</div>
                <div className="text-xs text-gray-500 mt-1">
                  Interim solution - Document temporary arrangement
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {fixType === 'evidence' ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle2 className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" size={18} />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium">Upload permanent evidence to close this gap</p>
                    <p className="mt-1">
                      This will mark the control as "Satisfied" and improve audit readiness.
                    </p>
                  </div>
                </div>
              </div>

              {/* Issued Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issued Date *
                </label>
                <input
                  type="date"
                  value={issuedDate}
                  onChange={(e) => setIssuedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Expiry Date (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={issuedDate}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank if evidence doesn't expire (e.g., one-time inductions)
                </p>
              </div>

              <button
                onClick={handleUploadEvidence}
                disabled={uploading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Upload size={20} />
                <span>{uploading ? 'Uploading...' : 'Select & Upload File'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Clock className="text-amber-600 mt-0.5 mr-2 flex-shrink-0" size={18} />
                  <div className="text-sm text-amber-900">
                    <p className="font-medium">Create a temporary fix to maintain operational readiness</p>
                    <p className="mt-1">
                      This allows work to continue while you gather permanent evidence.
                      Temporary fixes count toward operational readiness but not audit readiness.
                    </p>
                  </div>
                </div>
              </div>

              {/* Temporary Fix Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temporary Arrangement Details *
                </label>
                <textarea
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  placeholder="E.g., Worker will be supervised by John Smith (who holds the certification) until evidence is obtained"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Valid Until */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid For (Days)
                </label>
                <select
                  value={tempDays}
                  onChange={(e) => setTempDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Valid until: {new Date(Date.now() + tempDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={handleCreateTemporaryFix}
                disabled={uploading || !tempNotes.trim()}
                className="w-full py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Clock size={20} />
                <span>{uploading ? 'Creating...' : 'Create Temporary Fix'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              {fixType === 'evidence' ? (
                <p><strong>Tip:</strong> Supported formats: PDF, images, Word docs, etc.</p>
              ) : (
                <p><strong>Note:</strong> You'll need to upload permanent evidence before expiry</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
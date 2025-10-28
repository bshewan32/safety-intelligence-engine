import React, { useState, useEffect, JSX } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Upload,
  Calendar,
  RefreshCw,
} from 'lucide-react';

// Local view-model types (avoid clashing with global Prisma/Window types)

type RiskStatus = 'Required' | 'Satisfied' | 'Temporary' | 'Overdue';

type EvidenceVM = {
  id: string;
  type: string;
  status: string;
  filePath?: string | null;
  originalName?: string | null;
  issuedDate?: string | Date;
  expiryDate?: string | Date | null;
  notes?: string | null;
};

type ControlVM = {
  id: string;
  code: string;
  title: string;
  type: string; // Training | Document | PPE | Inspection | Licence | Induction | Verification
};

type RequiredControlVM = {
  id: string;
  status: RiskStatus;
  dueDate?: string | Date | null;
  tempValidUntil?: string | Date | null;
  tempNotes?: string | null;
  control: ControlVM;
  evidence: EvidenceVM[];
};

type WorkerRoleVM = {
  isPrimary: boolean;
  role?: { name?: string } | null;
};

type WorkerVM = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  status: string;
  // legacy single role
  role?: { name?: string } | null;
  // new multi-role assignments
  roles?: WorkerRoleVM[];
  required: RequiredControlVM[];
};

type WorkerPassportProps = {
  workerId: string;
  onBack: () => void;
};

export function WorkerPassport({ workerId, onBack }: WorkerPassportProps) {
  const [worker, setWorker] = useState<WorkerVM | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTempFixModal, setShowTempFixModal] = useState(false);
  const [selectedRequiredControl, setSelectedRequiredControl] = useState<string | null>(null);
  const [tempFixNotes, setTempFixNotes] = useState('');
  const [tempFixDays, setTempFixDays] = useState(7);

  useEffect(() => {
    loadWorker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerId]);

  const getDisplayRole = (w?: WorkerVM | null): string => {
    if (!w) return '—';
    const primary = w.roles?.find(r => r?.isPrimary)?.role?.name;
    return primary || w.role?.name || '—';
  };

  const loadWorker = async () => {
    setLoading(true);
    try {
      const data = await window.api.getWorkerWithRequiredControls(workerId);
      setWorker(data as unknown as WorkerVM);
    } catch (error) {
      console.error('Failed to load worker:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecompute = async () => {
    try {
      await window.api.recomputeWorker({ workerId });
      await loadWorker();
    } catch (error) {
      console.error('Failed to recompute:', error);
      alert('Failed to recompute controls');
    }
  };

  const toDateLabel = (d?: string | Date | null): string | null => {
    if (!d) return null;
    const dt = typeof d === 'string' ? new Date(d) : d;
    if (Number.isNaN(dt.getTime())) return null;
    return dt.toLocaleDateString();
  };

  const handleAddEvidence = async (requiredControlId: string) => {
    try {
      const fileData = await window.api.selectEvidence();
      if (!fileData) return;

      const control = worker?.required.find(rc => rc.id === requiredControlId)?.control;
      if (!control) return;

      await window.api.addEvidence({
        requiredControlId,
        type: control.type,
        filePath: fileData.path,
        checksum: fileData.checksum,
        fileSize: fileData.size,
        originalName: fileData.originalName,
        issuedDate: new Date(),
      });

      await loadWorker();
    } catch (error) {
      console.error('Failed to add evidence:', error);
      alert('Failed to upload evidence');
    }
  };

  const handleCreateTempFix = async () => {
    if (!selectedRequiredControl || !tempFixNotes.trim()) {
      alert('Please enter notes for the temporary fix');
      return;
    }

    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + tempFixDays);

      await window.api.createTemporaryFix({
        requiredControlId: selectedRequiredControl,
        notes: tempFixNotes,
        validUntil,
      });

      setShowTempFixModal(false);
      setSelectedRequiredControl(null);
      setTempFixNotes('');
      setTempFixDays(7);
      await loadWorker();
    } catch (error) {
      console.error('Failed to create temporary fix:', error);
      alert('Failed to create temporary fix');
    }
  };

  const openTempFixModal = (requiredControlId: string) => {
    setSelectedRequiredControl(requiredControlId);
    setShowTempFixModal(true);
  };

  const getStatusBadge = (status: RiskStatus, tempValidUntil?: string | Date | null) => {
    const expiryTxt = toDateLabel(tempValidUntil);
    const badges: Record<RiskStatus, JSX.Element> = {
      Required: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Required
        </span>
      ),
      Satisfied: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Satisfied
        </span>
      ),
      Temporary: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 animate-pulse">
          <Clock className="w-3 h-3 mr-1" />
          Temporary {expiryTxt ? `(${expiryTxt})` : ''}
        </span>
      ),
      Overdue: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Overdue
        </span>
      ),
    };
    return badges[status];
  };

  const calculateCompliance = () => {
    const items = worker?.required ?? [];
    if (!items.length) return { operational: 100, audit: 100 };

    const total = items.length;
    const operational = items.filter((rc) => rc.status === 'Satisfied' || rc.status === 'Temporary').length;
    const audit = items.filter((rc) => rc.status === 'Satisfied').length;

    return {
      operational: Math.round((operational / total) * 100),
      audit: Math.round((audit / total) * 100),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Worker not found</div>
      </div>
    );
  }

  const compliance = calculateCompliance();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <button onClick={onBack} className="mt-1 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {worker.firstName} {worker.lastName}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {worker.employeeId} • {getDisplayRole(worker)}
              </p>
              <p className="text-sm text-gray-500">{worker.email || '—'}</p>
            </div>
          </div>
          <button
            onClick={handleRecompute}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Recompute Controls</span>
          </button>
        </div>

        {/* Compliance Metrics */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-amber-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600">Operational Readiness</div>
            <div className="text-3xl font-bold text-amber-600 mt-1">{compliance.operational}%</div>
            <div className="text-xs text-gray-500 mt-1">Includes temporary fixes</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600">Audit Readiness</div>
            <div className="text-3xl font-bold text-blue-600 mt-1">{compliance.audit}%</div>
            <div className="text-xs text-gray-500 mt-1">Permanent evidence only</div>
          </div>
        </div>
      </div>

      {/* Required Controls Matrix */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Required Controls</h2>
          <p className="text-sm text-gray-500 mt-1">Based on role assignment: {getDisplayRole(worker)}</p>
        </div>

        <div className="divide-y divide-gray-200">
          {(worker.required?.length ?? 0) === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No controls assigned. Click "Recompute Controls" to assign controls based on role.
            </div>
          ) : (
            worker.required.map((rc) => (
              <div key={rc.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm text-gray-500">{rc.control.code}</span>
                      {getStatusBadge(rc.status, rc.tempValidUntil)}
                    </div>
                    <h3 className="font-medium text-gray-900 mt-2">{rc.control.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">Type: {rc.control.type}</p>

                    {rc.tempNotes && (
                      <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-800">
                          <strong>Temp Fix Notes:</strong> {rc.tempNotes}
                        </p>
                      </div>
                    )}

                    {/* Evidence List */}
                    {(rc.evidence?.length ?? 0) > 0 && (
                      <div className="mt-3 space-y-2">
                        {rc.evidence.map((ev) => (
                          <div key={ev.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                            <div className="flex items-center space-x-2">
                              <FileText size={16} className="text-gray-400" />
                              <span className="text-sm text-gray-700">{ev.originalName || ev.type}</span>
                              {ev.expiryDate && (
                                <span className="text-xs text-gray-500">Expires: {toDateLabel(ev.expiryDate)}</span>
                              )}
                            </div>
                            {ev.filePath && (
                              <button onClick={() => window.api.openEvidence(ev.filePath!)} className="text-sm text-blue-600 hover:text-blue-800">
                                Open
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    {(rc.status === 'Required' || rc.status === 'Temporary') && (
                      <>
                        <button
                          onClick={() => handleAddEvidence(rc.id)}
                          className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          <Upload size={14} />
                          <span>Add Evidence</span>
                        </button>
                        {rc.status === 'Required' && (
                          <button
                            onClick={() => openTempFixModal(rc.id)}
                            className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                          >
                            <Clock size={14} />
                            <span>Temp Fix</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Temporary Fix Modal */}
      {showTempFixModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create Temporary Fix</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valid For (days)</label>
                <input
                  type="number"
                  value={tempFixDays}
                  onChange={(e) => setTempFixDays(Math.max(1, Math.min(7, parseInt(e.target.value || '0', 10))))}
                  min={1}
                  max={7}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 7 days for operational readiness</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes / Justification</label>
                <textarea
                  value={tempFixNotes}
                  onChange={(e) => setTempFixNotes(e.target.value)}
                  rows={4}
                  placeholder="Explain why temporary fix is needed and plan for permanent evidence..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowTempFixModal(false);
                  setSelectedRequiredControl(null);
                  setTempFixNotes('');
                  setTempFixDays(7);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button onClick={handleCreateTempFix} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                Create Temporary Fix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// src/pages/ClientRiskMatrix.tsx
import React, { useEffect, useState } from 'react';
import type {
  RiskMatrix,
  RiskMatrixHazard,
  HazardUpdate,
} from '../types/risk-matrix';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Download,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import RiskMatrixHeader from '../components/risk-matrix/RiskMatrixHeader';
import RiskMatrixFilters from '../components/risk-matrix/RiskMatrixFilters';
import RiskMatrixTable from '../components/risk-matrix/RiskMatrixTable';

interface ClientRiskMatrixProps {
  clientId: string;
  onBack: () => void;
}

export default function ClientRiskMatrix({ clientId, onBack }: ClientRiskMatrixProps) {
  const id = clientId;
  
  const [riskMatrix, setRiskMatrix] = useState<RiskMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  useEffect(() => {
    loadRiskMatrix();
  }, [id]);

  async function loadRiskMatrix() {
    try {
      setLoading(true);
      setError(null);
      const data = await window.api.getClientRiskMatrix(id!);
      setRiskMatrix(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load risk matrix';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleHazardUpdate(hazardId: string, updates: HazardUpdate) {
    try {
      await window.api.updateClientHazard(hazardId, updates);
      await loadRiskMatrix(); // Reload to show changes
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update hazard';
      alert('Failed to update hazard: ' + message);
    }
  }

  async function handleAddControl(hazardId: string, controlId: string, isCritical: boolean) {
    try {
      await window.api.addControlToHazard({
        clientHazardId: hazardId,
        clientControlId: controlId,
        isCriticalControl: isCritical
      });
      await loadRiskMatrix();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add control';
      alert('Failed to add control: ' + message);
    }
  }

  async function handleRemoveControl(mappingId: string) {
    if (!confirm('Remove this control from the hazard?')) return;
    
    try {
      await window.api.removeControlFromHazard(mappingId);
      await loadRiskMatrix();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove control';
      alert('Failed to remove control: ' + message);
    }
  }

  // Filter hazards (with explicit type annotation)
  const filteredHazards = riskMatrix?.hazards.filter((hazard: RiskMatrixHazard) => {
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (
        !hazard.code.toLowerCase().includes(term) &&
        !hazard.name.toLowerCase().includes(term) &&
        !hazard.description.toLowerCase().includes(term)
      ) {
        return false;
      }
    }

    // Risk level filter
    if (riskLevelFilter !== 'All' && hazard.adjustedRiskLevel !== riskLevelFilter) {
      return false;
    }

    // Status filter
    if (statusFilter === 'Complete' && hazard.controlCoverage.percentage < 100) {
      return false;
    }
    if (statusFilter === 'Gaps' && hazard.controlCoverage.percentage >= 100) {
      return false;
    }
    if (statusFilter === 'N/A' && !hazard.isNotApplicable) {
      return false;
    }

    return true;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading risk matrix...</p>
        </div>
      </div>
    );
  }

  if (error || !riskMatrix) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Risk Matrix</h2>
          <p className="text-gray-600 mb-4">{error || 'Risk matrix not found'}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <RiskMatrixHeader
        client={riskMatrix.client}
        summary={riskMatrix.summary}
        onBack={onBack}
        onRefresh={loadRiskMatrix}
        onExport={() => alert('Export coming soon!')}
      />

      {/* Filters */}
      <RiskMatrixFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        riskLevelFilter={riskLevelFilter}
        onRiskLevelChange={setRiskLevelFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredHazards.length} of {riskMatrix.hazards.length} hazards
      </div>

      {/* Table */}
      <RiskMatrixTable
        hazards={filteredHazards}
        onUpdateHazard={handleHazardUpdate}
        onAddControl={handleAddControl}
        onRemoveControl={handleRemoveControl}
        clientId={id!}
      />
    </div>
  );
}
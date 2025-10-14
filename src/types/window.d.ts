// src/renderer/types/window.d.ts

interface Worker {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  companyId: string;
  roleId?: string;
  status: string;
  createdAt: Date;
  role?: Role;
  required?: RequiredControl[];
}

interface Role {
  id: string;
  name: string;
  description?: string;
  activityPackage?: string;
  createdAt: Date;
}

interface RequiredControl {
  id: string;
  workerId: string;
  controlId: string;
  status: string;
  dueDate?: Date;
  tempValidUntil?: Date;
  tempEvidenceId?: string;
  tempNotes?: string;
  control: Control;
  evidence: Evidence[];
}

interface Control {
  id: string;
  code: string;
  title: string;
  type: string;
  description?: string;
  reference?: string;
  validityDays?: number;
  metadata?: string;
  createdAt: Date;
}

interface Evidence {
  id: string;
  requiredControlId: string;
  type: string;
  status: string;
  issuedDate?: Date;
  expiryDate?: Date;
  filePath?: string;
  checksum?: string;
  fileSize?: number;
  originalName?: string;
  notes?: string;
  createdAt: Date;
}

interface Hazard {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  preControlRisk: number;
  postControlRisk: number;
  industryId?: string;
  createdAt: Date;
}

interface DashboardSummary {
  operationalReadiness: number;
  auditReadiness: number;
  tempFixCount: number;
  openHazards: number;
  expiringSoon: number;
  trifr: number;
  crvRate: number;
}

interface FileData {
  path: string;
  checksum: string;
  size: number;
  originalName: string;
}

interface Window {
  api: {
    // Workers
    listWorkers: () => Promise<Worker[]>;
    getWorker: (workerId: string) => Promise<Worker | null>;
    getWorkerWithRequiredControls: (workerId: string) => Promise<Worker | null>;
    upsertWorker: (worker: Partial<Worker>) => Promise<Worker>;

    // Assignment Engine
    recomputeWorker: (workerId: string) => Promise<{ success: boolean }>;
    recomputeAllWorkers: () => Promise<{ success: boolean }>;

    // Temporary Fixes
    createTemporaryFix: (data: {
      requiredControlId: string;
      notes: string;
      validUntil: Date;
    }) => Promise<{ success: boolean; evidenceId: string }>;

    // Evidence Management
    addEvidence: (data: {
      requiredControlId: string;
      type: string;
      filePath?: string;
      checksum?: string;
      fileSize?: number;
      originalName?: string;
      issuedDate: Date;
      expiryDate?: Date;
      notes?: string;
    }) => Promise<Evidence>;

    // File Operations
    selectEvidence: () => Promise<FileData | null>;
    openEvidence: (filePath: string) => Promise<void>;

    // Hazards
    listHazards: () => Promise<Hazard[]>;

    // Controls
    listControls: () => Promise<Control[]>;

    // Dashboard
    dashboardSummary: () => Promise<DashboardSummary>;

    // Reports
    buildClient: (filters: any) => Promise<any>;
  };
}

export {};
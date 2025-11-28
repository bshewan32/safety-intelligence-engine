export {};

type RiskLabel = 'Critical' | 'High' | 'Medium' | 'Low';

interface Role {
  id: string;
  name: string;
  description?: string;
  activityPackage?: string;
  createdAt: Date | string;
}

interface ClientRef {
  id: string;
  name: string;
}

interface SiteRef {
  id: string;
  name: string;
  clientId: string;
}

type RoleSource = 'Org' | 'Client' | 'Site' | 'Project';

interface WorkerRole {
  id: string;
  workerId: string;
  roleId: string;
  isPrimary: boolean;
  source: RoleSource;
  clientId?: string | null;
  siteId?: string | null;
  startAt: Date | string;
  endAt?: Date | string | null;
  notes?: string | null;
  role?: Role;
  client?: ClientRef | null;
  site?: SiteRef | null;
}

interface Control {
  id: string;
  code: string;
  title: string;
  type: string; // consider union: 'Training'|'Document'|'PPE'|'Inspection'|'Licence'|'Induction'|'Verification'
  description?: string;
  reference?: string;
  validityDays?: number | null;
  metadata?: string | null;
  createdAt: Date | string;
}

interface Evidence {
  id: string;
  requiredControlId: string;
  type: string;    // consider union
  status: string;  // consider union
  issuedDate?: Date | string;
  expiryDate?: Date | string;
  filePath?: string;
  checksum?: string;
  fileSize?: number;
  originalName?: string;
  notes?: string;
  createdAt: Date | string;
}

interface RequiredControl {
  id: string;
  workerId: string;
  controlId: string;
  status: string; // 'Required'|'Satisfied'|'Overdue'|'Temporary' (if you formalize enums later)
  dueDate?: Date | string | null;
  tempValidUntil?: Date | string | null;
  tempEvidenceId?: string | null;
  tempNotes?: string | null;
  control: Control;
  evidence: Evidence[];
}

interface Worker {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  companyId: string;
  roleId?: string | null; // legacy
  status: string;
  createdAt: Date | string;
  role?: Role | null;     // legacy
  roles?: WorkerRole[];   // NEW: multi-role assignments
  required?: RequiredControl[];
}

interface Hazard {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  preControlRisk: number;
  postControlRisk: number;
  createdAt: Date | string;
  // Derived for UI by IPC:
  risk?: RiskLabel;
}

interface Client {
  id: string;
  name: string;
  createdAt: Date | string;
  sites?: Site[];
  _count?: {
    sites: number;
    workerRoles: number;
  };
}

interface Site {
  id: string;
  clientId: string;
  name: string;
  createdAt: Date | string;
  client?: Client;
}

// UPDATED: Added optional fields for backward compatibility
interface DashboardSummary {
  operationalReadiness: number;
  auditReadiness: number;
  tempFixCount: number;
  openHazards: number;
  expiringSoon: number;
  trifr: number;
  crvRate: number;
  // Optional aliases for backward compatibility
  rbcs?: number;
  compliance?: number;
}

interface FileData {
  canceled?: boolean;
  /** Single selected file path */
  filePath?: string;
  /** Multiple selected file paths (for multi-select dialogs) */
  filePaths?: string[];
  /** Generic alias used by some functions */
  path?: string;
  checksum?: string;
  size?: number;
  originalName?: string;
}

interface RiskMatrix {
  client: {
    id: string;
    name: string;
    industry: string | null;
    jurisdiction: string | null;
  };
  summary: {
    totalHazards: number;
    activeHazards: number;
    hazardsWithGaps: number;
    overallCoverage: number;
  };
  hazards: RiskMatrixHazard[];
}

interface RiskMatrixHazard {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  originalRiskLevel: string;
  adjustedRiskLevel: string;
  preControlRisk: number;
  postControlRisk: number | null;
  isActive: boolean;
  isNotApplicable: boolean;
  clientNotes: string | null;
  controls: HazardControl[];
  controlCoverage: {
    total: number;
    active: number;
    critical: number;
    percentage: number;
  };
}

interface HazardControl {
  mappingId: string;
  controlId: string;
  code: string;
  name: string;
  type: string;
  effectivenessRating: string | null;
  isCriticalControl: boolean;
  isActive: boolean;
}

interface HazardUpdate {
  adjustedRiskLevel?: string;
  isActive?: boolean;
  isNotApplicable?: boolean;
  clientNotes?: string;
}

interface AddControlData {
  clientHazardId: string;
  clientControlId: string;
  isCriticalControl: boolean;
  effectivenessRating?: string;
}

interface AvailableControl {
  id: string;
  clientId: string;
  controlId: string;
  isActive: boolean;
  control: {
    id: string;
    code: string;
    name: string;
    type: string;
    category: string;
  };
}

interface Gap {
  id: string;
  workerId: string;
  workerName: string;
  controlId: string;
  controlCode: string;
  controlName: string;
  controlType: string;
  status: 'Required' | 'Overdue' | 'Expiring';
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  dueDate: Date | string | null;
  daysUntilDue: number | null;
  hazards: string[];
  priority: number;
}

interface GapSummary {
  totalGaps: number;
  criticalGaps: number;
  highGaps: number;
  mediumGaps: number;
  lowGaps: number;
  expiringWithin30Days: number;
  overdue: number;
}

interface GapDetail {
  workerId: string;
  workerName: string;
  controlCode: string;
  controlName: string;
  status: 'Required' | 'Overdue' | 'Expiring';
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  daysUntilDue?: number;
  dueDate?: Date | string | null;
  expiryDate?: Date | string | null;
}

interface GapCoverage {
  overall: number;
  byCriticality: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface GapRecommendation {
  type: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedWorkers?: number;
  actions: string[];
  controls?: GapDetail[];
}

interface GapAnalysisResult {
  summary: GapSummary;
  gaps: GapDetail[];
  coverage: GapCoverage;
  recommendations: GapRecommendation[];
}

interface GapAnalysis {
  summary: GapSummary;
  gaps: Gap[];
  coverage: {
    overall: number;
    byCriticality: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
  };
  recommendations: Recommendation[];
}

interface Recommendation {
  id: string;
  type: 'missing_control' | 'expiring_evidence' | 'overdue_control';
  priority: number;
  title: string;
  description: string;
  affectedWorkers: number;
  actions: string[];
}

declare global {
  interface Window {
    api: {
      // Workers
      listWorkers: (clientId?: string) => Promise<Worker[]>;
      getWorker: (workerId: string) => Promise<Worker | null>;
      getWorkerWithRequiredControls: (workerId: string) => Promise<Worker | null>;
      upsertWorker: (worker: Partial<Worker>) => Promise<Worker>;

      // Roles Management
      listRoles: () => Promise<Role[]>;
      createRole: (payload: {
        name: string;
        description?: string | null;
        activityPackage?: string | null;
      }) => Promise<Role>;
      updateRole: (payload: {
        id: string;
        name: string;
        description?: string | null;
        activityPackage?: string | null;
      }) => Promise<Role>;
      deleteRole: (roleId: string) => Promise<Role>;

      // Worker creation
      createWorker: (payload: {
        firstName: string;
        lastName: string;
        employeeId: string;
        email?: string | null;
        phone?: string | null;
        companyId?: string;
      }) => Promise<{ id: string } & Partial<Worker>>;
      addWorkerRole: (payload: {
        workerId: string;
        roleId: string;
        isPrimary?: boolean;
        type?: string; // if enum added later, narrow here
        clientId?: string;
        siteId?: string;
        startAt?: string | Date;
        endAt?: string | Date;
        notes?: string;
      }) => Promise<any>;
      
      // Assignment / Recompute
      // Accept either a string id or a payload with various identifiers
      recomputeWorker: (
        payload:
          | string
          | { workerId?: string; id?: string; employeeId?: string; clientId?: string; siteId?: string }
      ) => Promise<{ ok?: boolean; success?: boolean; error?: string } | void>;
      recomputeAllWorkers: () => Promise<{ success?: boolean; error?: string } | void>;

      // Temporary Fixes
      createTemporaryFix: (data: {
        requiredControlId: string;
        notes: string;
        validUntil: Date | string;
      }) => Promise<{ success: boolean; evidenceId?: string }>;

      // Evidence Management
      addEvidence: (data: {
        requiredControlId: string;
        type: string;
        filePath?: string;
        checksum?: string;
        fileSize?: number;
        originalName?: string;
        issuedDate: Date | string;
        expiryDate?: Date | string;
        notes?: string;
      }) => Promise<Evidence>;

      
      // File Operations
      selectEvidence: () => Promise<FileData | null>;
      openEvidence: (filePath: string) => Promise<void>;
      bulkAddEvidence: (payload: {
        controlId: string;
        workerIds: string[];
        issuedDate: string | Date;
        expiryDate?: string | Date;
        notes?: string;
        filePath?: string;
        sourcePath?: string;
      }) => Promise<{ created: number; filePath: string | null }>;

      // Hazards
      listHazards: () => Promise<Hazard[]>;
      createHazard?: (data: Partial<Hazard> & { risk?: RiskLabel }) => Promise<Hazard>;
      importHazardPack?: (payload: { kind: string }) => Promise<Hazard[]>;

      // Hazard ↔ Control mapper (NEW types for renderer)
      getHazardControls?: (hazardId: string) => Promise<{ mapped: any[]; available: Control[]; allCount?: number }>;
      addHazardControl?: (payload: { hazardId: string; controlId: string; isCritical?: boolean; priority?: number }) => Promise<any>;
      removeHazardControl?: (payload: { hazardId: string; controlId: string }) => Promise<any>;

      // Controls
      listControls: () => Promise<Control[]>;
      createControl?: (payload: Partial<Control>) => Promise<Control>;
      updateControl?: (payload: Partial<Control> & { id: string }) => Promise<Control>;
      importControlPack?: (payload: { pack: string } | any) => Promise<{ inserted: number }>;

      // Clients
      listClients: () => Promise<Client[]>;
      getClient: (clientId: string) => Promise<Client | null>;
      createClient: (payload: { name: string }) => Promise<Client>;
      updateClient: (payload: { id: string; name?: string }) => Promise<Client>;
      deleteClient: (clientId: string) => Promise<Client>;
      setupClientFramework: (payload: {
        clientId: string;
        industry?: string;
        jurisdiction?: string;
        isoAlignment?: boolean;
      }) => Promise<{ hazardsImported: number; controlsImported: number; mappingsCreated: number }>;

      previewClientHazards: (payload: {
        industry?: string;
        jurisdiction?: string;
        isoAlignment?: boolean;
      }) => Promise<any>;

      setupClientWithRiskUniverse: (payload: {
        name: string;
        industry?: string;
        jurisdiction?: string;
        isoAlignment?: boolean;
        hazardCustomizations?: Array<any>;
      }) => Promise<any>;

      // Sites
      createSite: (payload: { clientId: string; name: string }) => Promise<Site>;
      deleteSite: (siteId: string) => Promise<Site>;

      // Worker Role Management
      removeWorkerRole: (workerRoleId: string) => Promise<any>;

      // Dashboard
      dashboardSummary: (clientId?: string) => Promise<DashboardSummary>;

      // Reports
      buildClient: (filters: any) => Promise<any>;

      getClientRiskMatrix: (clientId: string) => Promise<RiskMatrix>;
      updateClientHazard: (
        hazardId: string,
        updates: HazardUpdate
      ) => Promise<RiskMatrixHazard>;

      addControlToHazard: (data: AddControlData) => Promise<HazardControl>;
      removeControlFromHazard: (mappingId: string) => Promise<void>;

      getAvailableControls: (clientId: string) => Promise<AvailableControl[]>;

      // Gap Analysis - ADDED
      analyzeGaps: (clientId?: string) => Promise<GapAnalysisResult>;
      analyzeClientGaps: (clientId: string) => Promise<GapAnalysis>;
      analyzeWorkerGaps: (workerId: string) => Promise<GapAnalysis>;
      getGapSummary: (clientId?: string) => Promise<GapSummary>;
    };
  }
}
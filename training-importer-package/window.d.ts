
export interface Window {
  api: {
    
    getClientRiskMatrix: (clientId: string) => Promise<RiskMatrix>;
    updateClientHazard: (hazardId: string, updates: HazardUpdate) => Promise<ClientHazard>;
    addControlToHazard: (data: AddControlData) => Promise<void>;
    removeControlFromHazard: (mappingId: string) => Promise<void>;
    getAvailableControls: (clientId: string) => Promise<ClientControl[]>;
    
    // Training Importer Methods
    parseCSV: (filePath: string) => Promise<{
      headers: string[];
      data: any[];
    }>;
    
    parseExcel: (filePath: string) => Promise<{
      headers: string[];
      data: any[];
    }>;

    selectFile: (options?: {
      filters?: Array<{ name: string; extensions: string[] }>;
    }) => Promise<{
      path: string;
      name: string;
    } | null>;

    performSmartMatching: (payload: {
      trainingNames: string[];
      workerNames: string[];
      clientId?: string;
    }) => Promise<{
      trainingMatches: Array<{
        trainingName: string;
        controlId: string | null;
        controlTitle: string;
        confidence: number;
        reason: string;
        manualSelection: boolean;
      }>;
      workerMatches: Array<{
        csvName: string;
        workerId: string | null;
        workerFullName: string;
        confidence: number;
      }>;
      availableControls: Array<{
        id: string;
        title: string;
        code: string;
        type: string;
      }>;
      availableWorkers: Array<{
        id: string;
        name: string;
        employeeId: string;
      }>;
    }>;

    importTrainingRecords: (payload: {
      trainingMatches: Array<{
        trainingName: string;
        controlId: string | null;
        controlTitle: string;
        confidence: number;
        manualSelection?: boolean;
      }>;
      workerMatches: Array<{
        csvName: string;
        workerId: string | null;
        workerFullName: string;
        confidence: number;
      }>;
      parsedRows: Array<{
        workerName: string;
        trainingName: string;
        issuedDate: string;
        expiryDate?: string;
        notes?: string;
      }>;
    }) => Promise<{
      success: boolean;
      imported: number;
      skipped: number;
      errors?: string[];
      error?: string;
    }>;
  };
}

interface RiskMatrix {
  client: {
    id: string;
    name: string;
    industry: string;
    jurisdiction: string;
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
  postControlRisk: number;
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
   control: { id: string; code: string; name: string; type: string; category: string; };
}
export interface RiskMatrix {
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

export interface RiskMatrixHazard {
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

export interface HazardControl {
  mappingId: string;
  controlId: string;
  code: string;
  name: string;
  type: string;
  effectivenessRating: string | null;
  isCriticalControl: boolean;
  isActive: boolean;
}

export interface HazardUpdate {
  adjustedRiskLevel?: string;
  isActive?: boolean;
  isNotApplicable?: boolean;
  clientNotes?: string;
}

export interface AddControlData {
  clientHazardId: string;
  clientControlId: string;
  isCriticalControl: boolean;
  effectivenessRating?: string;
}

export interface AvailableControl {
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

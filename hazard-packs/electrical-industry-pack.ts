/**
 * ELECTRICAL INDUSTRY HAZARD & CONTROL PACK
 * 
 * Comprehensive safety framework for electrical contracting industry
 * Includes hazards, controls, and expected document types for matching
 */

export interface HazardPackItem {
  code: string;
  name: string;
  description: string;
  category: string;
  preControlRisk: number; // 0-25 scale (Likelihood × Consequence)
  industryId: string;
  controls: ControlPackItem[];
}

export interface ControlPackItem {
  code: string;
  title: string;
  type: 'Training' | 'Document' | 'PPE' | 'Inspection' | 'Licence' | 'Verification' | 'Induction';
  description: string;
  reference?: string; // Australian Standards, legislation, etc.
  validityDays?: number | null;
  isCritical: boolean; // Is this a critical control for this hazard?
  expectedDocTypes?: string[]; // Document types that might match this control
  keywords?: string[]; // Keywords for document matching algorithm
}

export const ELECTRICAL_INDUSTRY_HAZARDS: HazardPackItem[] = [
  // ============================================
  // ELECTRICAL HAZARDS (Critical Priority)
  // ============================================
  {
    code: 'HAZ-EL-SHOCK',
    name: 'Electrical Shock',
    description: 'Contact with live electrical conductors causing electric shock',
    category: 'Electrical',
    preControlRisk: 20, // 5 (Almost Certain) × 4 (Major) = Critical
    industryId: 'electrical',
    controls: [
      {
        code: 'LIC-EL-WORKER',
        title: 'Electrical Worker Licence',
        type: 'Licence',
        description: 'State/Territory electrical worker licence (A-Grade, B-Grade, or Restricted)',
        reference: 'Electricity Safety Act',
        validityDays: null, // License has own expiry
        isCritical: true,
        expectedDocTypes: ['Licence', 'Certificate', 'Card'],
        keywords: ['electrical', 'licence', 'license', 'electrician', 'a-grade', 'b-grade', 'restricted']
      },
      {
        code: 'TR-EL-LVR-CPR',
        title: 'LVR + CPR',
        type: 'Training',
        description: 'Low Voltage Rescue + CPR competency',
        reference: 'AS/NZS 4836',
        validityDays: 365,
        isCritical: true,
        expectedDocTypes: ['Certificate', 'Training Record'],
        keywords: ['lvr', 'low voltage rescue', 'cpr', 'first aid', 'emergency']
      },
      {
        code: 'DOC-SWMS-ELEC-GEN',
        title: 'SWMS – General Electrical Work',
        type: 'Document',
        description: 'Safe Work Method Statement for general electrical installation and maintenance',
        reference: 'WHS Regulation 2011',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['SWMS', 'Safe Work Method Statement', 'JSA', 'Job Safety Analysis'],
        keywords: ['swms', 'electrical', 'installation', 'maintenance', 'safe work']
      },
      {
        code: 'PPE-EL-GLOVES',
        title: 'Electrical Insulated Gloves',
        type: 'PPE',
        description: 'Class 00 or higher insulated gloves for electrical work',
        reference: 'AS/NZS 2225',
        validityDays: null,
        isCritical: false,
        expectedDocTypes: ['Certificate', 'Test Report', 'Inspection Record'],
        keywords: ['gloves', 'insulated', 'class 00', 'ppe', 'electrical']
      },
      {
        code: 'VER-ELEC-TEST-TAG',
        title: 'Test & Tag Verification',
        type: 'Verification',
        description: 'Periodic testing and tagging of electrical equipment',
        reference: 'AS/NZS 3760',
        validityDays: 180, // 6 months for construction sites
        isCritical: false,
        expectedDocTypes: ['Test Report', 'Register', 'Checklist'],
        keywords: ['test', 'tag', 'testing', 'tagging', 'equipment', 'appliance']
      },
      {
        code: 'DOC-EL-ISOLATION',
        title: 'Electrical Isolation Procedure',
        type: 'Document',
        description: 'Lock-out/tag-out procedure for electrical isolation',
        reference: 'AS/NZS 4836',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Procedure', 'SOP', 'Standard Operating Procedure'],
        keywords: ['isolation', 'lockout', 'tagout', 'loto', 'de-energise']
      }
    ]
  },

  {
    code: 'HAZ-EL-ARCFLASH',
    name: 'Arc Flash',
    description: 'Explosive release of energy from electrical arc causing severe burns and blast',
    category: 'Electrical',
    preControlRisk: 25, // 5 (Almost Certain) × 5 (Catastrophic) = Critical
    industryId: 'electrical',
    controls: [
      {
        code: 'VER-ARC-STUDY',
        title: 'Arc Flash Risk Assessment',
        type: 'Verification',
        description: 'Arc flash hazard analysis and incident energy calculation',
        reference: 'AS/NZS 4836',
        validityDays: 1825, // 5 years
        isCritical: true,
        expectedDocTypes: ['Study', 'Assessment', 'Report', 'Analysis'],
        keywords: ['arc flash', 'hazard analysis', 'incident energy', 'study']
      },
      {
        code: 'DOC-SWMS-ARCFLASH',
        title: 'SWMS – Arc Flash Work',
        type: 'Document',
        description: 'Safe Work Method Statement for arc flash hazard work',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['SWMS', 'Safe Work Method Statement'],
        keywords: ['swms', 'arc flash', 'energised', 'live work']
      },
      {
        code: 'PPE-ARC-SUIT',
        title: 'Arc-Rated PPE',
        type: 'PPE',
        description: 'Arc flash protective clothing and equipment (rated for calculated incident energy)',
        reference: 'AS/IEC 61482',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Certificate', 'Specification', 'Test Report'],
        keywords: ['arc rated', 'arc flash ppe', 'protective clothing', 'face shield']
      },
      {
        code: 'TR-EL-ARC-AWARENESS',
        title: 'Arc Flash Awareness Training',
        type: 'Training',
        description: 'Recognition and prevention of arc flash hazards',
        validityDays: 1095, // 3 years
        isCritical: false,
        expectedDocTypes: ['Certificate', 'Training Record'],
        keywords: ['arc flash', 'awareness', 'training', 'electrical safety']
      }
    ]
  },

  {
    code: 'HAZ-EL-OVERHEAD',
    name: 'Overhead Powerlines',
    description: 'Contact with or proximity to overhead electrical conductors',
    category: 'Electrical',
    preControlRisk: 20, // Critical
    industryId: 'electrical',
    controls: [
      {
        code: 'TR-EL-OVERHEAD',
        title: 'Overhead Powerline Awareness',
        type: 'Training',
        description: 'Working safely near overhead powerlines',
        reference: 'ESV Powerline Safety Guide',
        validityDays: 1095, // 3 years
        isCritical: true,
        expectedDocTypes: ['Certificate', 'Training Record'],
        keywords: ['overhead', 'powerline', 'powerlines', 'high voltage']
      },
      {
        code: 'DOC-SWMS-OVERHEAD',
        title: 'SWMS – Overhead Powerline Work',
        type: 'Document',
        description: 'Safe Work Method Statement for work near overhead powerlines',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['SWMS', 'Safe Work Method Statement'],
        keywords: ['swms', 'overhead', 'powerline', 'exclusion zone']
      },
      {
        code: 'DOC-PERMIT-OVERHEAD',
        title: 'Work Permit – Overhead Lines',
        type: 'Document',
        description: 'Permit to work near overhead electrical lines',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Permit', 'Permit to Work', 'PTW'],
        keywords: ['permit', 'overhead', 'powerline', 'work permit']
      }
    ]
  },

  // ============================================
  // WORKING AT HEIGHTS (High Priority)
  // ============================================
  {
    code: 'HAZ-WAH-FALL',
    name: 'Fall from Height',
    description: 'Risk of falling from elevated work positions (>2m)',
    category: 'Heights',
    preControlRisk: 20, // Critical
    industryId: 'electrical',
    controls: [
      {
        code: 'TR-WAH',
        title: 'Working at Heights',
        type: 'Training',
        description: 'Safe work practices for elevated work platforms and fall protection',
        reference: 'WHS Regulation 2011',
        validityDays: 730, // 2 years
        isCritical: true,
        expectedDocTypes: ['Certificate', 'Training Record', 'Statement of Attainment'],
        keywords: ['working at heights', 'heights', 'fall protection', 'elevated work']
      },
      {
        code: 'DOC-SWMS-WAH',
        title: 'SWMS – Working at Heights',
        type: 'Document',
        description: 'Safe Work Method Statement for work above 2 metres',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['SWMS', 'Safe Work Method Statement', 'JSA'],
        keywords: ['swms', 'heights', 'fall protection', 'elevated']
      },
      {
        code: 'DOC-RESCUE-PLAN-WAH',
        title: 'Emergency Rescue Plan – Heights',
        type: 'Document',
        description: 'Emergency rescue plan for workers at heights',
        reference: 'AS/NZS 1891',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Rescue Plan', 'Emergency Plan', 'Procedure'],
        keywords: ['rescue', 'emergency', 'heights', 'fall arrest']
      },
      {
        code: 'INSP-HARNESS-6M',
        title: 'Fall Arrest Harness Inspection',
        type: 'Inspection',
        description: 'Pre-use and periodic inspection of fall arrest equipment',
        reference: 'AS/NZS 1891',
        validityDays: 180, // 6 months
        isCritical: true,
        expectedDocTypes: ['Inspection Report', 'Checklist', 'Register'],
        keywords: ['harness', 'inspection', 'fall arrest', 'ppe']
      },
      {
        code: 'INSP-LANYARD-6M',
        title: 'Lanyard Inspection',
        type: 'Inspection',
        description: 'Inspection of energy-absorbing lanyards and connecting devices',
        reference: 'AS/NZS 1891',
        validityDays: 180,
        isCritical: false,
        expectedDocTypes: ['Inspection Report', 'Checklist'],
        keywords: ['lanyard', 'inspection', 'fall arrest', 'shock absorber']
      }
    ]
  },

  // ============================================
  // CONFINED SPACES (Critical Priority)
  // ============================================
  {
    code: 'HAZ-CS-ATMOS',
    name: 'Confined Space - Atmospheric Hazards',
    description: 'Oxygen deficiency, toxic gases, or flammable atmospheres in confined spaces',
    category: 'Confined Space',
    preControlRisk: 25, // Critical
    industryId: 'electrical',
    controls: [
      {
        code: 'TR-CS-ENTRY',
        title: 'Confined Space Entry',
        type: 'Training',
        description: 'Safe entry and work in confined spaces',
        reference: 'AS/NZS 2865',
        validityDays: 1095, // 3 years
        isCritical: true,
        expectedDocTypes: ['Certificate', 'Training Record', 'Statement of Attainment'],
        keywords: ['confined space', 'entry', 'atmospheric testing']
      },
      {
        code: 'DOC-SWMS-CS',
        title: 'SWMS – Confined Space Entry',
        type: 'Document',
        description: 'Safe Work Method Statement for confined space entry',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['SWMS', 'Safe Work Method Statement'],
        keywords: ['swms', 'confined space', 'entry', 'atmospheric']
      },
      {
        code: 'DOC-CS-PERMIT',
        title: 'Confined Space Entry Permit',
        type: 'Document',
        description: 'Formal permit-to-work for confined space entry',
        reference: 'AS/NZS 2865',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Permit', 'Entry Permit', 'Permit to Work'],
        keywords: ['permit', 'confined space', 'entry permit', 'ptw']
      },
      {
        code: 'VER-CS-ATMOS-TEST',
        title: 'Atmospheric Testing',
        type: 'Verification',
        description: 'Pre-entry and continuous atmospheric monitoring',
        reference: 'AS/NZS 2865',
        validityDays: null, // Per entry
        isCritical: true,
        expectedDocTypes: ['Test Results', 'Monitoring Log', 'Record'],
        keywords: ['atmospheric', 'testing', 'gas', 'oxygen', 'monitor']
      },
      {
        code: 'DOC-CS-RESCUE',
        title: 'Confined Space Rescue Plan',
        type: 'Document',
        description: 'Emergency rescue procedures for confined space incidents',
        reference: 'AS/NZS 2865',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Rescue Plan', 'Emergency Plan', 'Procedure'],
        keywords: ['rescue', 'emergency', 'confined space', 'retrieval']
      }
    ]
  },

  // ============================================
  // MANUAL HANDLING (Medium Priority)
  // ============================================
  {
    code: 'HAZ-MH-LIFTING',
    name: 'Manual Handling - Heavy Loads',
    description: 'Musculoskeletal injuries from lifting, carrying, or moving heavy materials',
    category: 'Manual Handling',
    preControlRisk: 12, // High
    industryId: 'electrical',
    controls: [
      {
        code: 'TR-MH-BASIC',
        title: 'Manual Handling Training',
        type: 'Training',
        description: 'Safe lifting and manual handling techniques',
        validityDays: 1095, // 3 years
        isCritical: false,
        expectedDocTypes: ['Certificate', 'Training Record'],
        keywords: ['manual handling', 'lifting', 'ergonomics']
      },
      {
        code: 'DOC-MH-ASSESS',
        title: 'Manual Handling Risk Assessment',
        type: 'Document',
        description: 'Task-specific manual handling risk assessment',
        validityDays: null,
        isCritical: false,
        expectedDocTypes: ['Risk Assessment', 'Assessment', 'Evaluation'],
        keywords: ['manual handling', 'risk assessment', 'ergonomic']
      }
    ]
  },

  // ============================================
  // PLANT & EQUIPMENT (Medium Priority)
  // ============================================
  {
    code: 'HAZ-PLANT-EWP',
    name: 'Elevated Work Platform (EWP)',
    description: 'Risks associated with operating elevated work platforms/cherry pickers',
    category: 'Plant & Equipment',
    preControlRisk: 15, // High
    industryId: 'electrical',
    controls: [
      {
        code: 'LIC-HRWL-EWP',
        title: 'HRWL – Elevating Work Platform',
        type: 'Licence',
        description: 'High Risk Work Licence for boom-type EWP (WP licence)',
        reference: 'WHS Regulation 2011',
        validityDays: null, // 5 year licence
        isCritical: true,
        expectedDocTypes: ['Licence', 'HRWL', 'High Risk Work Licence'],
        keywords: ['hrwl', 'ewp', 'elevated work platform', 'wp licence', 'boom']
      },
      {
        code: 'DOC-SWMS-EWP',
        title: 'SWMS – EWP Operation',
        type: 'Document',
        description: 'Safe Work Method Statement for EWP use',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['SWMS', 'Safe Work Method Statement'],
        keywords: ['swms', 'ewp', 'elevated work platform', 'boom']
      },
      {
        code: 'INSP-EWP-PRESTART',
        title: 'EWP Pre-Start Inspection',
        type: 'Inspection',
        description: 'Daily pre-operational inspection of EWP',
        validityDays: null, // Daily
        isCritical: true,
        expectedDocTypes: ['Checklist', 'Pre-Start', 'Inspection Form'],
        keywords: ['pre-start', 'inspection', 'ewp', 'daily check']
      }
    ]
  },

  {
    code: 'HAZ-PLANT-LADDER',
    name: 'Ladder Use',
    description: 'Falls and injuries from improper ladder use',
    category: 'Plant & Equipment',
    preControlRisk: 9, // Medium
    industryId: 'electrical',
    controls: [
      {
        code: 'TR-LADDER-SAFETY',
        title: 'Ladder Safety Training',
        type: 'Training',
        description: 'Safe use and inspection of ladders',
        reference: 'AS/NZS 1892',
        validityDays: 1095, // 3 years
        isCritical: false,
        expectedDocTypes: ['Certificate', 'Training Record'],
        keywords: ['ladder', 'safety', 'training']
      },
      {
        code: 'INSP-LADDER-MONTHLY',
        title: 'Ladder Inspection',
        type: 'Inspection',
        description: 'Monthly ladder inspection and tagging',
        reference: 'AS/NZS 1892',
        validityDays: 30,
        isCritical: false,
        expectedDocTypes: ['Inspection Record', 'Register', 'Checklist'],
        keywords: ['ladder', 'inspection', 'monthly', 'tag']
      }
    ]
  },

  // ============================================
  // SITE HAZARDS (Medium Priority)
  // ============================================
  {
    code: 'HAZ-SITE-TRAFFIC',
    name: 'Vehicle & Plant Movement',
    description: 'Struck by moving vehicles or mobile plant on site',
    category: 'Site Safety',
    preControlRisk: 12, // High
    industryId: 'electrical',
    controls: [
      {
        code: 'IND-CLIENT-SITE',
        title: 'Client Site Induction',
        type: 'Induction',
        description: 'Site-specific induction covering hazards and controls',
        validityDays: 365, // Annual
        isCritical: true,
        expectedDocTypes: ['Certificate', 'Induction Record', 'Sign-on Sheet'],
        keywords: ['induction', 'site induction', 'onsite', 'site safety']
      },
      {
        code: 'DOC-TMP',
        title: 'Traffic Management Plan',
        type: 'Document',
        description: 'Site-specific traffic and pedestrian management',
        validityDays: null,
        isCritical: false,
        expectedDocTypes: ['Plan', 'Traffic Management Plan', 'TMP'],
        keywords: ['traffic', 'management', 'plan', 'tmp', 'vehicle']
      },
      {
        code: 'PPE-HIVIZ',
        title: 'High Visibility Clothing',
        type: 'PPE',
        description: 'Class D or higher hi-vis vest/shirt',
        reference: 'AS/NZS 4602',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: [],
        keywords: ['hi-vis', 'high visibility', 'vest', 'ppe']
      }
    ]
  },

  {
    code: 'HAZ-SITE-NOISE',
    name: 'Hazardous Noise',
    description: 'Exposure to noise levels exceeding 85 dB(A)',
    category: 'Site Safety',
    preControlRisk: 6, // Medium
    industryId: 'electrical',
    controls: [
      {
        code: 'VER-NOISE-ASSESS',
        title: 'Noise Assessment',
        type: 'Verification',
        description: 'Workplace noise level assessment',
        reference: 'WHS Regulation 2011',
        validityDays: 1825, // 5 years
        isCritical: false,
        expectedDocTypes: ['Assessment', 'Report', 'Survey'],
        keywords: ['noise', 'assessment', 'decibel', 'sound']
      },
      {
        code: 'PPE-HEARING',
        title: 'Hearing Protection',
        type: 'PPE',
        description: 'Earplugs or earmuffs rated for noise level',
        reference: 'AS/NZS 1270',
        validityDays: null,
        isCritical: false,
        expectedDocTypes: [],
        keywords: ['hearing protection', 'earplugs', 'earmuffs', 'ppe']
      }
    ]
  }
];

// Export summary statistics
export const ELECTRICAL_PACK_STATS = {
  totalHazards: ELECTRICAL_INDUSTRY_HAZARDS.length,
  totalControls: ELECTRICAL_INDUSTRY_HAZARDS.reduce(
    (sum, h) => sum + h.controls.length, 
    0
  ),
  categories: [...new Set(ELECTRICAL_INDUSTRY_HAZARDS.map(h => h.category))],
  criticalHazards: ELECTRICAL_INDUSTRY_HAZARDS.filter(h => h.preControlRisk >= 20).length,
  criticalControls: ELECTRICAL_INDUSTRY_HAZARDS.reduce(
    (sum, h) => sum + h.controls.filter(c => c.isCritical).length,
    0
  )
};
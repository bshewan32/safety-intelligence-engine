/**
 * MANUFACTURING INDUSTRY HAZARD & CONTROL PACK
 * 
 * Comprehensive safety framework for manufacturing and industrial facilities
 * Focus on machinery, production processes, and industrial hazards
 */

import { HazardPackItem } from './electrical-industry-pack';

export const MANUFACTURING_INDUSTRY_HAZARDS: HazardPackItem[] = [
  // ============================================
  // MACHINERY HAZARDS (Critical)
  // ============================================
  {
    code: 'HAZ-MACH-ENTANGLE',
    name: 'Machinery Entanglement',
    description: 'Entanglement in moving machinery parts (rollers, conveyors, rotating shafts)',
    category: 'Machinery',
    preControlRisk: 25, // Critical
    industryId: 'manufacturing',
    controls: [
      {
        code: 'TR-MACH-SAFETY',
        title: 'Machinery Safety Training',
        type: 'Training',
        description: 'Safe operation and guarding of industrial machinery',
        reference: 'AS 4024',
        validityDays: 1095, // 3 years
        isCritical: true,
        expectedDocTypes: ['Certificate', 'Training Record'],
        keywords: ['machinery', 'machine safety', 'guarding']
      },
      {
        code: 'DOC-SWMS-MACHINERY',
        title: 'SWMS – Machinery Operation',
        type: 'Document',
        description: 'Safe Work Method Statement for machinery operation',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['SWMS', 'Safe Work Method Statement', 'SOP'],
        keywords: ['swms', 'machinery', 'machine operation']
      },
      {
        code: 'VER-MACHINE-GUARD',
        title: 'Machine Guarding Inspection',
        type: 'Verification',
        description: 'Verification that machinery guarding meets AS 4024 standards',
        reference: 'AS 4024',
        validityDays: 365, // Annual
        isCritical: true,
        expectedDocTypes: ['Inspection Report', 'Certificate', 'Compliance Report'],
        keywords: ['machine guarding', 'guard inspection', 'compliance']
      },
      {
        code: 'DOC-LOTO-PROCEDURE',
        title: 'Lock-Out/Tag-Out Procedure',
        type: 'Document',
        description: 'Energy isolation procedure for machinery maintenance',
        reference: 'AS 4024.1',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Procedure', 'SOP', 'Standard Operating Procedure'],
        keywords: ['lockout', 'tagout', 'loto', 'isolation', 'energy']
      },
      {
        code: 'INSP-LOTO-DEVICES',
        title: 'LOTO Device Inspection',
        type: 'Inspection',
        description: 'Periodic inspection of locks, tags, and isolation devices',
        validityDays: 180, // 6 months
        isCritical: false,
        expectedDocTypes: ['Inspection Record', 'Checklist'],
        keywords: ['loto', 'lock', 'tag', 'inspection']
      }
    ]
  },

  {
    code: 'HAZ-MACH-CRUSH',
    name: 'Crush Injuries - Machinery',
    description: 'Crush or pinch point injuries from press brakes, stamping machines, etc.',
    category: 'Machinery',
    preControlRisk: 20, // Critical
    industryId: 'manufacturing',
    controls: [
      {
        code: 'TR-PRESS-BRAKE',
        title: 'Press Brake Operation',
        type: 'Training',
        description: 'Safe operation of press brakes and bending machines',
        reference: 'AS 4024.3',
        validityDays: 1095,
        isCritical: true,
        expectedDocTypes: ['Certificate', 'Training Record'],
        keywords: ['press brake', 'bending', 'machinery']
      },
      {
        code: 'DOC-SOP-PRESS',
        title: 'SOP – Press Operations',
        type: 'Document',
        description: 'Standard Operating Procedure for press and stamping machines',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['SOP', 'Procedure', 'Work Instruction'],
        keywords: ['sop', 'press', 'stamping', 'procedure']
      },
      {
        code: 'VER-PRESS-INTERLOCK',
        title: 'Press Safety Interlock Test',
        type: 'Verification',
        description: 'Testing of light curtains and safety interlocks',
        reference: 'AS 4024',
        validityDays: 180, // 6 months
        isCritical: true,
        expectedDocTypes: ['Test Certificate', 'Test Report'],
        keywords: ['interlock', 'light curtain', 'safety', 'test']
      }
    ]
  },

  // ============================================
  // CHEMICAL HAZARDS (High Priority)
  // ============================================
  {
    code: 'HAZ-CHEM-EXPOSURE',
    name: 'Hazardous Chemical Exposure',
    description: 'Inhalation, skin contact, or ingestion of hazardous chemicals',
    category: 'Chemicals',
    preControlRisk: 15, // High
    industryId: 'manufacturing',
    controls: [
      {
        code: 'TR-CHEM-HANDLING',
        title: 'Chemical Handling Training',
        type: 'Training',
        description: 'Safe handling, storage, and use of hazardous chemicals',
        reference: 'WHS Regulation 2011',
        validityDays: 1095, // 3 years
        isCritical: true,
        expectedDocTypes: ['Certificate', 'Training Record'],
        keywords: ['chemical', 'hazardous substances', 'handling']
      },
      {
        code: 'DOC-SDS-REGISTER',
        title: 'Safety Data Sheet Register',
        type: 'Document',
        description: 'Current SDS for all hazardous chemicals on site',
        reference: 'WHS Regulation 2011',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Register', 'SDS Register', 'MSDS Register'],
        keywords: ['sds', 'safety data sheet', 'msds', 'register']
      },
      {
        code: 'DOC-CHEM-RISK-ASSESS',
        title: 'Chemical Risk Assessment',
        type: 'Document',
        description: 'Risk assessment for each hazardous chemical used',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Risk Assessment', 'Assessment', 'Hazard Assessment'],
        keywords: ['risk assessment', 'chemical', 'hazardous substances']
      },
      {
        code: 'VER-SPILL-KIT',
        title: 'Spill Kit Inspection',
        type: 'Verification',
        description: 'Verification of spill response equipment availability',
        validityDays: 90, // Quarterly
        isCritical: false,
        expectedDocTypes: ['Inspection Checklist', 'Record'],
        keywords: ['spill kit', 'emergency', 'inspection']
      },
      {
        code: 'PPE-CHEM-GLOVES',
        title: 'Chemical Resistant Gloves',
        type: 'PPE',
        description: 'Gloves rated for specific chemical exposure',
        reference: 'AS/NZS 2161',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: [],
        keywords: ['gloves', 'chemical', 'ppe', 'resistant']
      }
    ]
  },

  // ============================================
  // NOISE & VIBRATION (Medium Priority)
  // ============================================
  {
    code: 'HAZ-NOISE-INDUSTRIAL',
    name: 'Industrial Noise Exposure',
    description: 'Prolonged exposure to high noise levels from machinery and processes',
    category: 'Physical Hazards',
    preControlRisk: 12, // High (long-term health)
    industryId: 'manufacturing',
    controls: [
      {
        code: 'VER-NOISE-SURVEY',
        title: 'Workplace Noise Survey',
        type: 'Verification',
        description: 'Comprehensive noise level monitoring and mapping',
        reference: 'AS/NZS 1269',
        validityDays: 1825, // 5 years
        isCritical: true,
        expectedDocTypes: ['Survey', 'Report', 'Noise Survey'],
        keywords: ['noise', 'survey', 'monitoring', 'decibel']
      },
      {
        code: 'TR-HEARING-CONSERVATION',
        title: 'Hearing Conservation Program',
        type: 'Training',
        description: 'Hearing protection and conservation awareness',
        validityDays: 1095,
        isCritical: false,
        expectedDocTypes: ['Certificate', 'Training Record'],
        keywords: ['hearing', 'conservation', 'noise', 'protection']
      },
      {
        code: 'PPE-HEARING-PROTECTION',
        title: 'Hearing Protection',
        type: 'PPE',
        description: 'Earplugs or earmuffs rated for noise exposure level',
        reference: 'AS/NZS 1270',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: [],
        keywords: ['hearing protection', 'earplugs', 'earmuffs', 'ppe']
      }
    ]
  },

  {
    code: 'HAZ-VIBRATION-HAND',
    name: 'Hand-Arm Vibration',
    description: 'Vibration exposure from handheld power tools causing HAVS',
    category: 'Physical Hazards',
    preControlRisk: 9, // Medium
    industryId: 'manufacturing',
    controls: [
      {
        code: 'VER-VIBRATION-ASSESS',
        title: 'Vibration Risk Assessment',
        type: 'Verification',
        description: 'Assessment of vibration exposure from tools and equipment',
        reference: 'ISO 5349',
        validityDays: 1825, // 5 years
        isCritical: false,
        expectedDocTypes: ['Assessment', 'Report'],
        keywords: ['vibration', 'assessment', 'hand arm vibration']
      },
      {
        code: 'TR-VIBRATION-AWARENESS',
        title: 'Vibration Awareness Training',
        type: 'Training',
        description: 'Recognition and control of vibration hazards',
        validityDays: 1095,
        isCritical: false,
        expectedDocTypes: ['Certificate', 'Training Record'],
        keywords: ['vibration', 'awareness', 'havs']
      }
    ]
  },

  // ============================================
  // MATERIAL HANDLING (Medium Priority)
  // ============================================
  {
    code: 'HAZ-FORKLIFT',
    name: 'Forklift Operations',
    description: 'Pedestrian struck by or collision with forklifts',
    category: 'Material Handling',
    preControlRisk: 16, // High
    industryId: 'manufacturing',
    controls: [
      {
        code: 'LIC-HRWL-FORKLIFT',
        title: 'HRWL – Forklift',
        type: 'Licence',
        description: 'High Risk Work Licence for forklift operation',
        reference: 'WHS Regulation 2011',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Licence', 'HRWL', 'High Risk Work Licence'],
        keywords: ['hrwl', 'forklift', 'lf licence', 'powered industrial truck']
      },
      {
        code: 'DOC-SWMS-FORKLIFT',
        title: 'SWMS – Forklift Operations',
        type: 'Document',
        description: 'Safe Work Method Statement for forklift use',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['SWMS', 'Safe Work Method Statement'],
        keywords: ['swms', 'forklift', 'material handling']
      },
      {
        code: 'INSP-FORKLIFT-PRESTART',
        title: 'Forklift Pre-Start Check',
        type: 'Inspection',
        description: 'Daily pre-operational forklift inspection',
        validityDays: null, // Daily
        isCritical: true,
        expectedDocTypes: ['Checklist', 'Pre-Start', 'Daily Check'],
        keywords: ['forklift', 'pre-start', 'inspection', 'daily']
      },
      {
        code: 'DOC-TMP-WAREHOUSE',
        title: 'Warehouse Traffic Management Plan',
        type: 'Document',
        description: 'Pedestrian and forklift segregation procedures',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Plan', 'Traffic Management Plan'],
        keywords: ['traffic', 'warehouse', 'forklift', 'pedestrian']
      }
    ]
  },

  // ============================================
  // FIRE & EXPLOSION (High Priority)
  // ============================================
  {
    code: 'HAZ-FIRE-FLAM',
    name: 'Fire - Flammable Materials',
    description: 'Fire risk from flammable liquids, gases, or combustible materials',
    category: 'Fire Safety',
    preControlRisk: 16, // High
    industryId: 'manufacturing',
    controls: [
      {
        code: 'TR-FIRE-WARDEN',
        title: 'Fire Warden Training',
        type: 'Training',
        description: 'Fire prevention and emergency response',
        validityDays: 365, // Annual
        isCritical: true,
        expectedDocTypes: ['Certificate', 'Training Record'],
        keywords: ['fire warden', 'fire safety', 'emergency']
      },
      {
        code: 'DOC-FIRE-EVAC-PLAN',
        title: 'Fire Evacuation Plan',
        type: 'Document',
        description: 'Site emergency evacuation procedures',
        reference: 'AS 3745',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Plan', 'Evacuation Plan', 'Emergency Plan'],
        keywords: ['evacuation', 'fire', 'emergency', 'plan']
      },
      {
        code: 'VER-FIRE-EQUIPMENT',
        title: 'Fire Equipment Inspection',
        type: 'Verification',
        description: 'Annual testing of fire extinguishers and equipment',
        reference: 'AS 1851',
        validityDays: 365,
        isCritical: true,
        expectedDocTypes: ['Test Certificate', 'Inspection Tag'],
        keywords: ['fire extinguisher', 'equipment', 'test', 'inspection']
      },
      {
        code: 'DOC-FLAM-STORAGE',
        title: 'Flammable Storage Procedure',
        type: 'Document',
        description: 'Procedures for storage and handling of flammable materials',
        reference: 'AS 1940',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Procedure', 'SOP'],
        keywords: ['flammable', 'storage', 'dangerous goods']
      }
    ]
  },

  // ============================================
  // ENVIRONMENTAL (Medium Priority)
  // ============================================
  {
    code: 'HAZ-WASTE-HAZ',
    name: 'Hazardous Waste',
    description: 'Improper handling or disposal of hazardous waste materials',
    category: 'Environmental',
    preControlRisk: 9, // Medium
    industryId: 'manufacturing',
    controls: [
      {
        code: 'TR-WASTE-MGMT',
        title: 'Hazardous Waste Management',
        type: 'Training',
        description: 'Segregation, storage, and disposal of hazardous waste',
        validityDays: 1095,
        isCritical: false,
        expectedDocTypes: ['Certificate', 'Training Record'],
        keywords: ['waste', 'hazardous waste', 'disposal']
      },
      {
        code: 'DOC-WASTE-PLAN',
        title: 'Waste Management Plan',
        type: 'Document',
        description: 'Site waste segregation and disposal procedures',
        validityDays: null,
        isCritical: false,
        expectedDocTypes: ['Plan', 'Management Plan'],
        keywords: ['waste', 'management plan', 'disposal']
      },
      {
        code: 'VER-WASTE-CONTRACTOR',
        title: 'Waste Contractor Licence',
        type: 'Verification',
        description: 'Verification of licensed hazardous waste contractor',
        validityDays: 365,
        isCritical: false,
        expectedDocTypes: ['Licence', 'Certificate'],
        keywords: ['waste contractor', 'licence', 'epa']
      }
    ]
  },

  // ============================================
  // ERGONOMICS (Medium Priority)
  // ============================================
  {
    code: 'HAZ-ERGO-REPETITIVE',
    name: 'Repetitive Strain Injuries',
    description: 'Musculoskeletal disorders from repetitive tasks or poor workstation design',
    category: 'Ergonomics',
    preControlRisk: 9, // Medium
    industryId: 'manufacturing',
    controls: [
      {
        code: 'VER-ERGO-ASSESS',
        title: 'Ergonomic Assessment',
        type: 'Verification',
        description: 'Workstation and task ergonomic assessment',
        validityDays: 1825, // 5 years
        isCritical: false,
        expectedDocTypes: ['Assessment', 'Report', 'Evaluation'],
        keywords: ['ergonomic', 'assessment', 'workstation', 'rsi']
      },
      {
        code: 'TR-ERGO-AWARENESS',
        title: 'Ergonomics Awareness',
        type: 'Training',
        description: 'Workplace ergonomics and injury prevention',
        validityDays: 1095,
        isCritical: false,
        expectedDocTypes: ['Certificate', 'Training Record'],
        keywords: ['ergonomics', 'awareness', 'musculoskeletal']
      }
    ]
  }
];

// Export summary statistics
export const MANUFACTURING_PACK_STATS = {
  totalHazards: MANUFACTURING_INDUSTRY_HAZARDS.length,
  totalControls: MANUFACTURING_INDUSTRY_HAZARDS.reduce(
    (sum, h) => sum + h.controls.length,
    0
  ),
  categories: [...new Set(MANUFACTURING_INDUSTRY_HAZARDS.map(h => h.category))],
  criticalHazards: MANUFACTURING_INDUSTRY_HAZARDS.filter(h => h.preControlRisk >= 20).length,
  criticalControls: MANUFACTURING_INDUSTRY_HAZARDS.reduce(
    (sum, h) => sum + h.controls.filter(c => c.isCritical).length,
    0
  )
};
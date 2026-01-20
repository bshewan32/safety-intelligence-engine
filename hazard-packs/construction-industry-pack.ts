/**
 * CONSTRUCTION & BUILDING INDUSTRY HAZARD & CONTROL PACK
 * 
 * Comprehensive safety framework for construction and building industry
 * Focus on structural work, excavation, scaffolding, and general construction hazards
 */

import { HazardPackItem } from './electrical-industry-pack';

export const CONSTRUCTION_INDUSTRY_HAZARDS: HazardPackItem[] = [
  // ============================================
  // EXCAVATION & EARTHWORKS (Critical)
  // ============================================
  {
    code: 'HAZ-EXC-COLLAPSE',
    name: 'Excavation Collapse',
    description: 'Collapse of excavation walls or trenches causing burial or crushing',
    category: 'Excavation',
    preControlRisk: 25, // Critical - can be fatal
    industryId: 'construction',
    controls: [
      {
        code: 'TR-EXCAVATION',
        title: 'Excavation Safety Training',
        type: 'Training',
        description: 'Safe excavation practices and trench support systems',
        reference: 'AS 2885',
        validityDays: 1095, // 3 years
        isCritical: true,
        expectedDocTypes: ['Certificate', 'Training Record'],
        keywords: ['excavation', 'trenching', 'shoring', 'trench safety']
      },
      {
        code: 'DOC-SWMS-EXCAVATION',
        title: 'SWMS – Excavation Work',
        type: 'Document',
        description: 'Safe Work Method Statement for excavation and trenching',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['SWMS', 'Safe Work Method Statement', 'JSA'],
        keywords: ['swms', 'excavation', 'trenching', 'earthworks']
      },
      {
        code: 'VER-EXCAVATION-PLAN',
        title: 'Excavation Plan',
        type: 'Verification',
        description: 'Site-specific excavation plan with soil analysis and support design',
        reference: 'AS 2870',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Plan', 'Engineering Plan', 'Design'],
        keywords: ['excavation plan', 'soil analysis', 'engineering', 'trench']
      },
      {
        code: 'INSP-EXCAVATION-DAILY',
        title: 'Daily Excavation Inspection',
        type: 'Inspection',
        description: 'Competent person daily inspection of excavation stability',
        validityDays: null, // Daily
        isCritical: true,
        expectedDocTypes: ['Inspection Record', 'Checklist', 'Daily Log'],
        keywords: ['inspection', 'excavation', 'daily', 'trench']
      },
      {
        code: 'DOC-DIALBEFOREDIG',
        title: 'Dial Before You Dig Response',
        type: 'Document',
        description: 'Underground service location documentation',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['DBYD Response', 'Service Plans', 'Utility Plans'],
        keywords: ['dial before you dig', 'dbyd', 'underground services', 'utilities']
      }
    ]
  },

  // ============================================
  // SCAFFOLDING (Critical)
  // ============================================
  {
    code: 'HAZ-SCAFFOLD-COLLAPSE',
    name: 'Scaffold Collapse',
    description: 'Structural failure of scaffolding causing falls or crushing',
    category: 'Scaffolding',
    preControlRisk: 20, // Critical
    industryId: 'construction',
    controls: [
      {
        code: 'LIC-HRWL-SCAFFOLD-BASIC',
        title: 'HRWL – Scaffolding (Basic)',
        type: 'Licence',
        description: 'High Risk Work Licence for basic scaffolding erection',
        reference: 'WHS Regulation 2011',
        validityDays: null, // 5 year licence
        isCritical: true,
        expectedDocTypes: ['Licence', 'HRWL', 'High Risk Work Licence'],
        keywords: ['hrwl', 'scaffolding', 'scaffold', 'sb licence', 'basic']
      },
      {
        code: 'LIC-HRWL-SCAFFOLD-ADVANCED',
        title: 'HRWL – Scaffolding (Advanced)',
        type: 'Licence',
        description: 'High Risk Work Licence for advanced scaffolding',
        reference: 'WHS Regulation 2011',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Licence', 'HRWL', 'High Risk Work Licence'],
        keywords: ['hrwl', 'scaffolding', 'scaffold', 'sa licence', 'advanced']
      },
      {
        code: 'DOC-SWMS-SCAFFOLD',
        title: 'SWMS – Scaffolding Work',
        type: 'Document',
        description: 'Safe Work Method Statement for scaffold erection/dismantling',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['SWMS', 'Safe Work Method Statement'],
        keywords: ['swms', 'scaffold', 'scaffolding', 'erection']
      },
      {
        code: 'VER-SCAFFOLD-DESIGN',
        title: 'Scaffold Design Documentation',
        type: 'Verification',
        description: 'Engineered scaffold design for complex structures',
        reference: 'AS/NZS 1576',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Design', 'Engineering Certificate', 'Plan'],
        keywords: ['scaffold design', 'engineering', 'structural', 'certificate']
      },
      {
        code: 'INSP-SCAFFOLD-HANDOVER',
        title: 'Scaffold Handover Certificate',
        type: 'Inspection',
        description: 'Competent person inspection and handover certificate',
        reference: 'AS/NZS 4576',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Certificate', 'Handover', 'Inspection Certificate'],
        keywords: ['handover', 'scaffold', 'certificate', 'tag']
      },
      {
        code: 'INSP-SCAFFOLD-ROUTINE',
        title: 'Routine Scaffold Inspection',
        type: 'Inspection',
        description: 'Regular inspections during scaffold use',
        validityDays: 30, // Monthly minimum
        isCritical: false,
        expectedDocTypes: ['Inspection Record', 'Checklist'],
        keywords: ['inspection', 'scaffold', 'routine', 'periodic']
      }
    ]
  },

  // ============================================
  // WORKING AT HEIGHTS (Critical)
  // ============================================
  {
    code: 'HAZ-ROOF-FALL',
    name: 'Fall Through Roof',
    description: 'Fall through fragile roof surfaces or penetrations',
    category: 'Heights',
    preControlRisk: 25, // Critical
    industryId: 'construction',
    controls: [
      {
        code: 'TR-ROOF-WORK',
        title: 'Roof Work Safety Training',
        type: 'Training',
        description: 'Safe work on roofs including fragile surface identification',
        reference: 'WHS Code of Practice',
        validityDays: 1095, // 3 years
        isCritical: true,
        expectedDocTypes: ['Certificate', 'Training Record'],
        keywords: ['roof', 'roofing', 'fragile surface', 'heights']
      },
      {
        code: 'DOC-SWMS-ROOF',
        title: 'SWMS – Roof Work',
        type: 'Document',
        description: 'Safe Work Method Statement for roof access and work',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['SWMS', 'Safe Work Method Statement'],
        keywords: ['swms', 'roof', 'roofing', 'heights']
      },
      {
        code: 'DOC-ROOF-SAFETY-PLAN',
        title: 'Roof Safety Plan',
        type: 'Document',
        description: 'Site-specific roof safety plan including edge protection',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Plan', 'Safety Plan', 'Fall Protection Plan'],
        keywords: ['roof safety plan', 'fall protection', 'edge protection']
      }
    ]
  },

  // ============================================
  // MOBILE PLANT (High Priority)
  // ============================================
  {
    code: 'HAZ-PLANT-MOBILE',
    name: 'Mobile Plant - Struck By',
    description: 'Pedestrians struck by mobile plant (excavators, loaders, trucks)',
    category: 'Plant & Equipment',
    preControlRisk: 20, // Critical
    industryId: 'construction',
    controls: [
      {
        code: 'LIC-HRWL-EXCAVATOR',
        title: 'HRWL – Excavator',
        type: 'Licence',
        description: 'High Risk Work Licence for excavator operation',
        reference: 'WHS Regulation 2011',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Licence', 'HRWL', 'High Risk Work Licence'],
        keywords: ['hrwl', 'excavator', 'ce licence', 'plant']
      },
      {
        code: 'LIC-HRWL-LOADER',
        title: 'HRWL – Loader',
        type: 'Licence',
        description: 'High Risk Work Licence for front-end loader operation',
        reference: 'WHS Regulation 2011',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Licence', 'HRWL', 'High Risk Work Licence'],
        keywords: ['hrwl', 'loader', 'front end loader', 'cl licence']
      },
      {
        code: 'TR-TRAFFIC-CONTROL',
        title: 'Traffic Control Training',
        type: 'Training',
        description: 'Site traffic management and control',
        validityDays: 1095, // 3 years
        isCritical: false,
        expectedDocTypes: ['Certificate', 'Training Record'],
        keywords: ['traffic control', 'traffic management', 'tcp']
      },
      {
        code: 'DOC-TMP-SITE',
        title: 'Site Traffic Management Plan',
        type: 'Document',
        description: 'Site-specific traffic and plant movement management',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Plan', 'Traffic Management Plan', 'TMP'],
        keywords: ['traffic management plan', 'tmp', 'site', 'vehicle']
      },
      {
        code: 'INSP-PLANT-PRESTART',
        title: 'Plant Pre-Start Inspection',
        type: 'Inspection',
        description: 'Daily pre-operational plant inspection',
        validityDays: null, // Daily
        isCritical: true,
        expectedDocTypes: ['Checklist', 'Pre-Start', 'Daily Check'],
        keywords: ['pre-start', 'inspection', 'plant', 'equipment']
      }
    ]
  },

  {
    code: 'HAZ-CRANE-LOAD',
    name: 'Crane Operations - Load Drop',
    description: 'Dropped loads from cranes or lifting equipment',
    category: 'Plant & Equipment',
    preControlRisk: 20, // Critical
    industryId: 'construction',
    controls: [
      {
        code: 'LIC-HRWL-CRANE-C2',
        title: 'HRWL – Crane (C2)',
        type: 'Licence',
        description: 'High Risk Work Licence for mobile crane operation (non-slewing)',
        reference: 'WHS Regulation 2011',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Licence', 'HRWL', 'High Risk Work Licence'],
        keywords: ['hrwl', 'crane', 'c2 licence', 'mobile crane']
      },
      {
        code: 'LIC-HRWL-DOGMAN',
        title: 'HRWL – Dogging',
        type: 'Licence',
        description: 'High Risk Work Licence for dogging/rigging',
        reference: 'WHS Regulation 2011',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Licence', 'HRWL', 'High Risk Work Licence'],
        keywords: ['hrwl', 'dogging', 'dogman', 'dg licence', 'rigging']
      },
      {
        code: 'DOC-LIFT-PLAN',
        title: 'Lift Plan',
        type: 'Document',
        description: 'Engineered lift plan for complex or heavy lifts',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Lift Plan', 'Lifting Plan', 'Engineering Plan'],
        keywords: ['lift plan', 'lifting plan', 'crane', 'rigging']
      },
      {
        code: 'INSP-LIFTING-GEAR',
        title: 'Lifting Gear Inspection',
        type: 'Inspection',
        description: 'Periodic inspection of slings, shackles, and lifting equipment',
        validityDays: 180, // 6 months
        isCritical: true,
        expectedDocTypes: ['Inspection Certificate', 'Register', 'Test Certificate'],
        keywords: ['lifting gear', 'slings', 'shackles', 'inspection']
      }
    ]
  },

  // ============================================
  // STRUCTURAL HAZARDS (High Priority)
  // ============================================
  {
    code: 'HAZ-STRUCT-COLLAPSE',
    name: 'Structural Collapse',
    description: 'Collapse of temporary or permanent structures during construction',
    category: 'Structural',
    preControlRisk: 20, // Critical
    industryId: 'construction',
    controls: [
      {
        code: 'VER-STRUCT-DESIGN',
        title: 'Structural Engineering Certificate',
        type: 'Verification',
        description: 'Professional engineer certification of structural design',
        reference: 'Building Code of Australia',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Certificate', 'Engineering Certificate', 'Design Certificate'],
        keywords: ['structural', 'engineering', 'certificate', 'design']
      },
      {
        code: 'DOC-SWMS-FORMWORK',
        title: 'SWMS – Formwork',
        type: 'Document',
        description: 'Safe Work Method Statement for formwork installation',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['SWMS', 'Safe Work Method Statement'],
        keywords: ['swms', 'formwork', 'concrete', 'shuttering']
      },
      {
        code: 'INSP-FORMWORK',
        title: 'Formwork Inspection',
        type: 'Inspection',
        description: 'Competent person inspection before concrete pour',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Inspection Certificate', 'Checklist'],
        keywords: ['formwork', 'inspection', 'pre-pour', 'concrete']
      }
    ]
  },

  // ============================================
  // MATERIALS & SUBSTANCES (Medium Priority)
  // ============================================
  {
    code: 'HAZ-SILICA-DUST',
    name: 'Silica Dust Exposure',
    description: 'Respirable crystalline silica from cutting, grinding, or drilling',
    category: 'Substances',
    preControlRisk: 15, // High (long-term health impact)
    industryId: 'construction',
    controls: [
      {
        code: 'TR-SILICA-AWARENESS',
        title: 'Silica Awareness Training',
        type: 'Training',
        description: 'Recognition and control of respirable crystalline silica',
        reference: 'WHS Code of Practice',
        validityDays: 1095, // 3 years
        isCritical: true,
        expectedDocTypes: ['Certificate', 'Training Record'],
        keywords: ['silica', 'dust', 'crystalline silica', 'awareness']
      },
      {
        code: 'DOC-SILICA-MANAGEMENT',
        title: 'Silica Dust Management Plan',
        type: 'Document',
        description: 'Site-specific silica dust control measures',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Plan', 'Management Plan', 'Control Plan'],
        keywords: ['silica', 'dust', 'management plan', 'control']
      },
      {
        code: 'VER-AIR-MONITORING',
        title: 'Air Monitoring - Silica',
        type: 'Verification',
        description: 'Workplace air monitoring for silica exposure',
        validityDays: 365, // Annual
        isCritical: false,
        expectedDocTypes: ['Report', 'Monitoring Report', 'Test Results'],
        keywords: ['air monitoring', 'silica', 'exposure', 'hygiene']
      },
      {
        code: 'PPE-RESPIRATOR-P2',
        title: 'P2 Respirator',
        type: 'PPE',
        description: 'P2 rated disposable or reusable respirator for silica dust',
        reference: 'AS/NZS 1716',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Fit Test Certificate'],
        keywords: ['respirator', 'p2', 'dust', 'ppe']
      }
    ]
  },

  {
    code: 'HAZ-ASBESTOS',
    name: 'Asbestos Exposure',
    description: 'Disturbance of asbestos-containing materials during renovation/demolition',
    category: 'Substances',
    preControlRisk: 20, // Critical (carcinogenic)
    industryId: 'construction',
    controls: [
      {
        code: 'TR-ASBESTOS-AWARENESS',
        title: 'Asbestos Awareness Training',
        type: 'Training',
        description: 'Recognition and non-disturbance of asbestos materials',
        reference: 'WHS Regulation 2011',
        validityDays: 1095, // 3 years
        isCritical: true,
        expectedDocTypes: ['Certificate', 'Training Record'],
        keywords: ['asbestos', 'awareness', 'acm', 'hazmat']
      },
      {
        code: 'LIC-ASBESTOS-REMOVAL',
        title: 'Asbestos Removalist Licence',
        type: 'Licence',
        description: 'Class A or B asbestos removal licence',
        reference: 'WHS Regulation 2011',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Licence', 'Asbestos Licence'],
        keywords: ['asbestos', 'removalist', 'licence', 'class a', 'class b']
      },
      {
        code: 'VER-ASBESTOS-SURVEY',
        title: 'Asbestos Survey Report',
        type: 'Verification',
        description: 'Pre-demolition asbestos survey by licensed assessor',
        reference: 'WHS Regulation 2011',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Survey', 'Asbestos Survey', 'Report'],
        keywords: ['asbestos survey', 'assessment', 'register', 'acm']
      },
      {
        code: 'DOC-ASBESTOS-PLAN',
        title: 'Asbestos Removal Control Plan',
        type: 'Document',
        description: 'Written plan for asbestos removal works',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['Plan', 'Control Plan', 'Removal Plan'],
        keywords: ['asbestos', 'removal plan', 'control plan']
      }
    ]
  },

  // ============================================
  // ENVIRONMENT & UTILITIES (Medium Priority)
  // ============================================
  {
    code: 'HAZ-UTILITY-STRIKE',
    name: 'Underground Service Strike',
    description: 'Damage to underground electrical, gas, or water services',
    category: 'Utilities',
    preControlRisk: 20, // Critical
    industryId: 'construction',
    controls: [
      {
        code: 'TR-UTILITY-LOCATION',
        title: 'Underground Service Location Training',
        type: 'Training',
        description: 'Use of cable locators and safe excavation near services',
        validityDays: 1095, // 3 years
        isCritical: true,
        expectedDocTypes: ['Certificate', 'Training Record'],
        keywords: ['utility', 'cable location', 'underground services']
      },
      {
        code: 'DOC-DBYD-RESPONSE',
        title: 'Dial Before You Dig Plans',
        type: 'Document',
        description: 'Current utility service location plans',
        validityDays: 90, // Plans valid for 3 months
        isCritical: true,
        expectedDocTypes: ['DBYD Response', 'Service Plans', 'Utility Plans'],
        keywords: ['dial before you dig', 'dbyd', 'service plans']
      },
      {
        code: 'DOC-UTILITY-SWMS',
        title: 'SWMS – Work Near Services',
        type: 'Document',
        description: 'Safe Work Method Statement for excavation near utilities',
        validityDays: null,
        isCritical: true,
        expectedDocTypes: ['SWMS', 'Safe Work Method Statement'],
        keywords: ['swms', 'utilities', 'services', 'excavation']
      }
    ]
  },

  // ============================================
  // GENERAL CONSTRUCTION (Medium Priority)
  // ============================================
  {
    code: 'HAZ-MANUAL-HANDLING',
    name: 'Manual Handling - Construction Materials',
    description: 'Musculoskeletal injuries from handling heavy building materials',
    category: 'Manual Handling',
    preControlRisk: 12, // High
    industryId: 'construction',
    controls: [
      {
        code: 'TR-MH-CONSTRUCTION',
        title: 'Manual Handling - Construction',
        type: 'Training',
        description: 'Safe manual handling specific to construction materials',
        validityDays: 1095, // 3 years
        isCritical: false,
        expectedDocTypes: ['Certificate', 'Training Record'],
        keywords: ['manual handling', 'materials', 'construction']
      },
      {
        code: 'DOC-MH-ASSESS-CONST',
        title: 'Manual Handling Risk Assessment',
        type: 'Document',
        description: 'Task-specific manual handling assessment',
        validityDays: null,
        isCritical: false,
        expectedDocTypes: ['Risk Assessment', 'Assessment'],
        keywords: ['manual handling', 'risk assessment', 'ergonomic']
      }
    ]
  }
];

// Export summary statistics
export const CONSTRUCTION_PACK_STATS = {
  totalHazards: CONSTRUCTION_INDUSTRY_HAZARDS.length,
  totalControls: CONSTRUCTION_INDUSTRY_HAZARDS.reduce(
    (sum, h) => sum + h.controls.length,
    0
  ),
  categories: [...new Set(CONSTRUCTION_INDUSTRY_HAZARDS.map(h => h.category))],
  criticalHazards: CONSTRUCTION_INDUSTRY_HAZARDS.filter(h => h.preControlRisk >= 20).length,
  criticalControls: CONSTRUCTION_INDUSTRY_HAZARDS.reduce(
    (sum, h) => sum + h.controls.filter(c => c.isCritical).length,
    0
  )
};
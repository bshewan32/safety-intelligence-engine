/**
 * Role Templates for Client Setup Wizard
 * 
 * Defines standard roles that are auto-selected based on client industry.
 * Users can customize selections before client creation.
 */

export interface RoleTemplate {
  name: string;
  description: string;
  category: 'industry' | 'universal';
  hazardCategories?: string[]; // Categories this role is exposed to
  isDefault?: boolean; // Auto-select by default
}

/**
 * Universal roles - applicable to ALL clients regardless of industry
 */
export const UNIVERSAL_ROLES: RoleTemplate[] = [
  {
    name: 'Safety Manager',
    description: 'Overall safety management and compliance',
    category: 'universal',
    hazardCategories: ['All'],
    isDefault: true
  },
  {
    name: 'Supervisor',
    description: 'Team supervision and oversight',
    category: 'universal',
    hazardCategories: ['All'],
    isDefault: true
  },
  {
    name: 'HSR (Health & Safety Representative)',
    description: 'Elected worker safety representative',
    category: 'universal',
    hazardCategories: ['All'],
    isDefault: true
  },
  {
    name: 'Committee Member',
    description: 'Health and safety committee participant',
    category: 'universal',
    hazardCategories: ['All'],
    isDefault: false
  },
  {
    name: 'Manager',
    description: 'Departmental or site management',
    category: 'universal',
    hazardCategories: ['All'],
    isDefault: true
  },
  {
    name: 'Director',
    description: 'Executive leadership',
    category: 'universal',
    hazardCategories: ['All'],
    isDefault: false
  }
];

/**
 * Industry-specific role templates
 */
export const INDUSTRY_ROLES: Record<string, RoleTemplate[]> = {
  'Electrical Contracting': [
    {
      name: 'Licensed Electrician',
      description: 'Qualified electrical contractor',
      category: 'industry',
      hazardCategories: ['Electrical', 'Heights'],
      isDefault: true
    },
    {
      name: 'Apprentice Electrician',
      description: '1st-4th year electrical apprentice',
      category: 'industry',
      hazardCategories: ['Electrical'],
      isDefault: true
    },
    {
      name: 'Electrical Supervisor',
      description: 'Supervises electrical work',
      category: 'industry',
      hazardCategories: ['Electrical', 'Heights'],
      isDefault: true
    },
    {
      name: 'Electrical Engineer',
      description: 'Design and specification work',
      category: 'industry',
      hazardCategories: ['Electrical'],
      isDefault: false
    },
    {
      name: 'Cable Jointer',
      description: 'Specialist cable installation',
      category: 'industry',
      hazardCategories: ['Electrical', 'Confined Space'],
      isDefault: false
    },
    {
      name: 'Lineworker',
      description: 'Overhead and underground lines',
      category: 'industry',
      hazardCategories: ['Electrical', 'Heights'],
      isDefault: false
    }
  ],

  'Construction & Building': [
    {
      name: 'Site Manager',
      description: 'Overall site coordination and control',
      category: 'industry',
      hazardCategories: ['Heights', 'Plant', 'Manual Handling'],
      isDefault: true
    },
    {
      name: 'Trades Worker',
      description: 'General construction trades',
      category: 'industry',
      hazardCategories: ['Heights', 'Manual Handling'],
      isDefault: true
    },
    {
      name: 'Carpenter',
      description: 'Carpentry and formwork',
      category: 'industry',
      hazardCategories: ['Heights', 'Manual Handling'],
      isDefault: true
    },
    {
      name: 'Scaffolder',
      description: 'Scaffold erection and dismantling',
      category: 'industry',
      hazardCategories: ['Heights'],
      isDefault: false
    },
    {
      name: 'Plant Operator',
      description: 'Heavy machinery operation',
      category: 'industry',
      hazardCategories: ['Plant', 'Mobile Equipment'],
      isDefault: true
    },
    {
      name: 'Labourer',
      description: 'General construction labour',
      category: 'industry',
      hazardCategories: ['Manual Handling'],
      isDefault: true
    },
    {
      name: 'Crane Operator',
      description: 'Tower and mobile crane operation',
      category: 'industry',
      hazardCategories: ['Plant', 'Heights'],
      isDefault: false
    }
  ],

  'Manufacturing': [
    {
      name: 'Production Operator',
      description: 'Machine operation and production',
      category: 'industry',
      hazardCategories: ['Plant', 'Noise', 'Chemicals'],
      isDefault: true
    },
    {
      name: 'Maintenance Technician',
      description: 'Equipment maintenance and repair',
      category: 'industry',
      hazardCategories: ['Plant', 'Electrical', 'Heights'],
      isDefault: true
    },
    {
      name: 'Quality Controller',
      description: 'Quality assurance and testing',
      category: 'industry',
      hazardCategories: ['Chemicals'],
      isDefault: false
    },
    {
      name: 'Forklift Operator',
      description: 'Material handling equipment',
      category: 'industry',
      hazardCategories: ['Mobile Equipment'],
      isDefault: true
    },
    {
      name: 'Warehouse Worker',
      description: 'Storage and logistics',
      category: 'industry',
      hazardCategories: ['Manual Handling', 'Mobile Equipment'],
      isDefault: true
    },
    {
      name: 'Welder/Fabricator',
      description: 'Welding and metal fabrication',
      category: 'industry',
      hazardCategories: ['Hot Work', 'Noise', 'Fumes'],
      isDefault: false
    }
  ],

  'Mining & Resources': [
    {
      name: 'Underground Miner',
      description: 'Underground mining operations',
      category: 'industry',
      hazardCategories: ['Confined Space', 'Dust', 'Noise'],
      isDefault: true
    },
    {
      name: 'Drill Operator',
      description: 'Drilling equipment operation',
      category: 'industry',
      hazardCategories: ['Plant', 'Noise', 'Dust'],
      isDefault: true
    },
    {
      name: 'Haul Truck Driver',
      description: 'Heavy vehicle operation',
      category: 'industry',
      hazardCategories: ['Mobile Equipment', 'Fatigue'],
      isDefault: true
    },
    {
      name: 'Shot Firer',
      description: 'Explosives handling and blasting',
      category: 'industry',
      hazardCategories: ['Explosives'],
      isDefault: false
    }
  ],

  'Transport & Logistics': [
    {
      name: 'Heavy Vehicle Driver',
      description: 'Truck and rigid vehicle operation',
      category: 'industry',
      hazardCategories: ['Mobile Equipment', 'Fatigue'],
      isDefault: true
    },
    {
      name: 'Delivery Driver',
      description: 'Light vehicle delivery',
      category: 'industry',
      hazardCategories: ['Mobile Equipment', 'Manual Handling'],
      isDefault: true
    },
    {
      name: 'Forklift Operator',
      description: 'Warehouse forklift operation',
      category: 'industry',
      hazardCategories: ['Mobile Equipment'],
      isDefault: true
    },
    {
      name: 'Yard Operator',
      description: 'Loading dock and yard operations',
      category: 'industry',
      hazardCategories: ['Mobile Equipment', 'Manual Handling'],
      isDefault: true
    }
  ],

  'Healthcare & Medical': [
    {
      name: 'Registered Nurse',
      description: 'Clinical nursing care',
      category: 'industry',
      hazardCategories: ['Biological', 'Manual Handling'],
      isDefault: true
    },
    {
      name: 'Healthcare Assistant',
      description: 'Patient care support',
      category: 'industry',
      hazardCategories: ['Biological', 'Manual Handling'],
      isDefault: true
    },
    {
      name: 'Medical Practitioner',
      description: 'Medical diagnosis and treatment',
      category: 'industry',
      hazardCategories: ['Biological', 'Sharps'],
      isDefault: true
    },
    {
      name: 'Aged Care Worker',
      description: 'Elderly care and support',
      category: 'industry',
      hazardCategories: ['Manual Handling', 'Biological'],
      isDefault: false
    }
  ],

  'General Services': [  // Changed from Agriculture to match wizard options
    {
      name: 'Service Worker',
      description: 'General service delivery',
      category: 'industry',
      hazardCategories: ['Manual Handling', 'Slips'],
      isDefault: true
    },
    {
      name: 'Team Leader',
      description: 'Team coordination and oversight',
      category: 'industry',
      hazardCategories: ['Manual Handling'],
      isDefault: true
    },
    {
      name: 'Maintenance Worker',
      description: 'General maintenance tasks',
      category: 'industry',
      hazardCategories: ['Manual Handling', 'Tools'],
      isDefault: false
    },
    {
      name: 'Cleaner',
      description: 'Cleaning and sanitation',
      category: 'industry',
      hazardCategories: ['Chemicals', 'Slips'],
      isDefault: true
    }
  ],

  'Hospitality & Retail': [
    {
      name: 'Kitchen Staff',
      description: 'Food preparation and cooking',
      category: 'industry',
      hazardCategories: ['Burns', 'Cuts', 'Slips'],
      isDefault: true
    },
    {
      name: 'Wait Staff',
      description: 'Customer service and table service',
      category: 'industry',
      hazardCategories: ['Manual Handling', 'Slips'],
      isDefault: true
    },
    {
      name: 'Cleaner',
      description: 'Cleaning and maintenance',
      category: 'industry',
      hazardCategories: ['Chemicals', 'Slips'],
      isDefault: true
    },
    {
      name: 'Bar Staff',
      description: 'Beverage service',
      category: 'industry',
      hazardCategories: ['Manual Handling', 'Violence'],
      isDefault: false
    }
  ]
};

/**
 * Get role templates for a specific industry
 * Combines industry-specific roles + universal roles
 */
export function getRoleTemplatesForIndustry(industry?: string): RoleTemplate[] {
  const industryRoles = industry ? (INDUSTRY_ROLES[industry] || []) : [];
  return [...industryRoles, ...UNIVERSAL_ROLES];
}

/**
 * Get default-selected roles for an industry
 */
export function getDefaultRolesForIndustry(industry?: string): RoleTemplate[] {
  const allRoles = getRoleTemplatesForIndustry(industry);
  return allRoles.filter(role => role.isDefault);
}
import { IpcMain } from 'electron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


function calculateRiskLevel(riskScore: number): string {
  if (riskScore >= 20) return 'Critical';
  if (riskScore >= 12) return 'High';
  if (riskScore >= 6) return 'Medium';
  return 'Low';
}

export function registerClientSetupHandlers(ipc: IpcMain) {
  
  // ============================================
  // PREVIEW HAZARDS FOR CLIENT
  // ============================================
  
  
  ipc.handle('db:previewClientHazards', async (_e, payload: {
    industry?: string;
    jurisdiction?: string;
    isoAlignment?: boolean;
  }) => {
    try {
      const { industry, jurisdiction, isoAlignment } = payload;
      
      // Build filter for hazard packs
      const hazardFilter: any = {};
      
      // Filter by industry if selected
      if (industry) {
        hazardFilter.industryId = {
          in: getIndustryIds(industry)
        };
      }
      
      // Get all matching hazards from global library
      const hazards = await prisma.hazard.findMany({
        where: hazardFilter,
        include: {
          controls: {
            include: {
              control: true
            }
          }
        },
        orderBy: [
          { category: 'asc' },
          { name: 'asc' }
        ]
      });
      
      // Get jurisdiction-specific controls
      let jurisdictionControls: any[] = [];
      if (jurisdiction) {
        jurisdictionControls = await getJurisdictionControls(jurisdiction);
      }
      
      // Get ISO 45001 controls
      let isoControls: any[] = [];
      if (isoAlignment) {
        isoControls = await getISOControls();
      }
      
      // Collect all unique controls
      const controlSet = new Map();
      
      // Add controls from hazards
      hazards.forEach(hazard => {
        hazard.controls.forEach(hc => {
          if (!controlSet.has(hc.control.id)) {
            controlSet.set(hc.control.id, hc.control);
          }
        });
      });
      
      // Add jurisdiction controls
      jurisdictionControls.forEach(control => {
        if (!controlSet.has(control.id)) {
          controlSet.set(control.id, control);
        }
      });
      
      // Add ISO controls
      isoControls.forEach(control => {
        if (!controlSet.has(control.id)) {
          controlSet.set(control.id, control);
        }
      });
      
      return {
        hazards: hazards.map(h => ({
          id: h.id,
          code: h.code,
          name: h.name,
          description: h.description,
          category: h.category,
          preControlRisk: h.preControlRisk,
          postControlRisk: h.postControlRisk,
          controlCount: h.controls.length
        })),
        controls: Array.from(controlSet.values()),
        stats: {
          totalHazards: hazards.length,
          totalControls: controlSet.size,
          categories: [...new Set(hazards.map(h => h.category))],
          fromIndustry: industry ? hazards.length : 0,
          fromJurisdiction: jurisdictionControls.length,
          fromISO: isoControls.length
        }
      };
      
    } catch (err) {
      console.error('previewClientHazards failed:', err);
      throw err;
    }
  });
  
  // ============================================
  // SETUP CLIENT WITH FULL RISK UNIVERSE
  // ============================================
  // Creates client + imports client-specific hazards, controls, and mappings
  
  ipc.handle('db:setupClientWithRiskUniverse', async (_e, payload: {
    name: string;
    industry?: string;
    jurisdiction?: string;
    isoAlignment?: boolean;
    hazardCustomizations?: Array<{
      hazardId: string;
      customRisk?: number;
      isActive: boolean;
      notes?: string;
    }>;
  }) => {
    try {
      const { name, industry, jurisdiction, isoAlignment, hazardCustomizations = [] } = payload;
      
      // Step 1: Create the client
      const client = await prisma.client.create({
        data: {
          name: name.trim(),
          industry,
          jurisdiction,
          isoAlignment
        }
      });
      
      // Step 2: Get hazards to import (same logic as preview)
      const hazardFilter: any = {};
      if (industry) {
        hazardFilter.industryId = {
          in: getIndustryIds(industry)
        };
      }
      
      const globalHazards = await prisma.hazard.findMany({
        where: hazardFilter,
        include: {
          controls: {
            include: {
              control: true
            }
          }
        }
      });
      
      // Step 3: Get additional controls
      const jurisdictionControls = jurisdiction ? await getJurisdictionControls(jurisdiction) : [];
      const isoControls = isoAlignment ? await getISOControls() : [];
      
      // Step 4: Build customization map
      const customizationMap = new Map(
        hazardCustomizations.map(c => [c.hazardId, c])
      );
      
      // Step 5: Import hazards as ClientHazards
      const importedHazards = [];
      for (const globalHazard of globalHazards) {
        const customization = customizationMap.get(globalHazard.id);
        
        // Skip if marked inactive
        if (customization && !customization.isActive) {
          continue;
        }
        
        const customRisk = customization?.customRisk ?? globalHazard.preControlRisk;
        
        const clientHazard = await prisma.clientHazard.create({
          data: {
            clientId: client.id,
            hazardId: globalHazard.id,
            code: globalHazard.code,
            name: globalHazard.name,
            description: globalHazard.description,
            category: globalHazard.category,
            preControlRisk: customRisk,
            postControlRisk: customRisk, // Will be recalculated based on controls
            isActive: true,
            clientNotes: customization?.notes,
            originalRiskLevel: calculateRiskLevel(customRisk),
          }
        });
        
        importedHazards.push({
          clientHazard,
          globalHazard
        });
      }
      
      // Step 6: Import controls as ClientControls
      const controlSet = new Map();
      
      // Collect all unique controls from hazards
      globalHazards.forEach(hazard => {
        hazard.controls.forEach(hc => {
          if (!controlSet.has(hc.control.id)) {
            controlSet.set(hc.control.id, {
              global: hc.control,
              hazards: []
            });
          }
          controlSet.get(hc.control.id).hazards.push({
            hazardId: hazard.id,
            isCriticalControl: hc.isCritical,
            priority: hc.priority
          });
        });
      });
      
      // Add jurisdiction controls
      jurisdictionControls.forEach(control => {
        if (!controlSet.has(control.id)) {
          controlSet.set(control.id, {
            global: control,
            hazards: []
          });
        }
      });
      
      // Add ISO controls
      isoControls.forEach(control => {
        if (!controlSet.has(control.id)) {
          controlSet.set(control.id, {
            global: control,
            hazards: []
          });
        }
      });
      
      // Import controls
      const importedControls = [];
      for (const [controlId, controlData] of controlSet.entries()) {
        const globalControl = controlData.global;
        
        const clientControl = await prisma.clientControl.create({
          data: {
            clientId: client.id,
            controlId: globalControl.id,
            code: globalControl.code,
            title: globalControl.title,
            type: globalControl.type,
            description: globalControl.description,
            reference: globalControl.reference,
            validityDays: globalControl.validityDays,
            isOptional: true
          }
        });
        
        importedControls.push({
          clientControl,
          hazardMappings: controlData.hazards
        });
      }
      
      // Step 7: Create ClientHazardControl mappings
      const mappings = [];
      for (const { clientControl, hazardMappings } of importedControls) {
        for (const mapping of hazardMappings) {
          // Find the corresponding ClientHazard
          const importedHazard = importedHazards.find(
            h => h.globalHazard.id === mapping.hazardId
          );
          
          if (!importedHazard) continue; // Hazard was disabled
          
          const clientHazardControl = await prisma.clientHazardControl.create({
            data: {
              clientHazardId: importedHazard.clientHazard.id,
              clientControlId: clientControl.id,
              isCriticalControl: mapping.isCriticalControl,
              priority: mapping.priority
            }
          });
          
          mappings.push(clientHazardControl);
        }
      }
      
      // Step 8: Calculate post-control risk scores
      // For each ClientHazard, if it has critical controls, reduce risk
      for (const { clientHazard } of importedHazards) {
        const criticalControlCount = mappings.filter(
          m => m.clientHazardId === clientHazard.id && m.isCriticalControl
        ).length;
        
        // Simple risk reduction: each critical control reduces risk by 1 level (max)
        const riskReduction = Math.min(criticalControlCount, 2);
        const postControlRisk = Math.max(0, clientHazard.preControlRisk - riskReduction);
        
        await prisma.clientHazard.update({
          where: { id: clientHazard.id },
          data: { postControlRisk }
        });
      }
      
      return {
        client,
        stats: {
          hazardsImported: importedHazards.length,
          controlsImported: importedControls.length,
          mappingsCreated: mappings.length,
          hazardsDisabled: globalHazards.length - importedHazards.length,
          riskCustomizations: hazardCustomizations.filter(c => c.customRisk !== undefined).length
        }
      };
      
    } catch (err) {
      console.error('setupClientWithRiskUniverse failed:', err);
      throw err;
    }
  });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Map industry names to industry IDs (customize based on your data)
function getIndustryIds(industry: string): string[] {
  const industryMap: Record<string, string[]> = {
    'Electrical Contracting': ['electrical', 'construction'],
    'Construction & Building': ['construction', 'building'],
    'Manufacturing': ['manufacturing', 'industrial'],
    'Mining & Resources': ['mining', 'resources'],
    'Transport & Logistics': ['transport', 'logistics'],
    'Healthcare & Medical': ['healthcare', 'medical'],
    'Hospitality & Retail': ['hospitality', 'retail'],
    'General Services': ['general']
  };
  
  return industryMap[industry] || ['general'];
}

// Get jurisdiction-specific controls
async function getJurisdictionControls(jurisdiction: string): Promise<any[]> {
  // Extract jurisdiction code (e.g., "VIC" from "VIC (Victoria)")
  const jurisdictionCode = jurisdiction.split(' ')[0];
  
  // Find controls with jurisdiction-specific references
  const controls = await prisma.control.findMany({
    where: {
      OR: [
        { reference: { contains: jurisdictionCode } },
        { description: { contains: jurisdictionCode } },
        { metadata: { contains: jurisdictionCode } }
      ]
    }
  });
  
  // If no specific controls found, return base WHS controls
  if (controls.length === 0) {
    return await prisma.control.findMany({
      where: {
        OR: [
          { code: { startsWith: 'WHS-' } },
          { reference: { contains: 'WHS Act' } }
        ]
      },
      take: 5
    });
  }
  
  return controls;
}

// Get ISO 45001 alignment controls
async function getISOControls(): Promise<any[]> {
  const controls = await prisma.control.findMany({
    where: {
      OR: [
        { reference: { contains: 'ISO 45001' } },
        { code: { startsWith: 'ISO-' } },
        { description: { contains: 'ISO 45001' } },
        { metadata: { contains: 'iso45001' } }
      ]
    }
  });
  
  // If no ISO controls found, return generic management system controls
  if (controls.length === 0) {
    return await prisma.control.findMany({
      where: {
        type: {
          in: ['Policy', 'Procedure', 'Audit', 'Review']
        }
      },
      take: 5
    });
  }
  
  return controls;
}


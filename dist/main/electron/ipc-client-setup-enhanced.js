// ============================================
// CLIENT SETUP WIZARD - ENHANCED IPC HANDLERS
// ============================================
// Add these handlers to your existing electron/ipc.ts file
//
// These handlers support the new 6-step client setup wizard with:
// - Hazard pack preview
// - Client-specific risk universe creation
// - Risk customization
// - Full import statistics
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export function registerClientSetupHandlers(ipc) {
    // ============================================
    // PREVIEW HAZARDS FOR CLIENT
    // ============================================
    // Returns what hazards and controls WOULD be imported based on selections
    // Does NOT create anything - just a preview
    ipc.handle('db:previewClientHazards', async (_e, payload) => {
        try {
            const { industry, jurisdiction, isoAlignment } = payload;
            // Build filter for hazard packs
            const hazardFilter = {};
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
            let jurisdictionControls = [];
            if (jurisdiction) {
                jurisdictionControls = await getJurisdictionControls(jurisdiction);
            }
            // Get ISO 45001 controls
            let isoControls = [];
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
        }
        catch (err) {
            console.error('previewClientHazards failed:', err);
            throw err;
        }
    });
    // ============================================
    // SETUP CLIENT WITH FULL RISK UNIVERSE
    // ============================================
    // Creates client + imports client-specific hazards, controls, and mappings
    ipc.handle('db:setupClientWithRiskUniverse', async (_e, payload) => {
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
            const hazardFilter = {};
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
            const customizationMap = new Map(hazardCustomizations.map(c => [c.hazardId, c]));
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
                        customNotes: customization?.notes
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
                        isCritical: hc.isCritical,
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
                        isRequired: true
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
                    const importedHazard = importedHazards.find(h => h.globalHazard.id === mapping.hazardId);
                    if (!importedHazard)
                        continue; // Hazard was disabled
                    const clientHazardControl = await prisma.clientHazardControl.create({
                        data: {
                            clientHazardId: importedHazard.clientHazard.id,
                            clientControlId: clientControl.id,
                            isCritical: mapping.isCritical,
                            priority: mapping.priority
                        }
                    });
                    mappings.push(clientHazardControl);
                }
            }
            // Step 8: Calculate post-control risk scores
            // For each ClientHazard, if it has critical controls, reduce risk
            for (const { clientHazard } of importedHazards) {
                const criticalControlCount = mappings.filter(m => m.clientHazardId === clientHazard.id && m.isCritical).length;
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
        }
        catch (err) {
            console.error('setupClientWithRiskUniverse failed:', err);
            throw err;
        }
    });
}
// ============================================
// HELPER FUNCTIONS
// ============================================
// Map industry names to industry IDs (customize based on your data)
function getIndustryIds(industry) {
    const industryMap = {
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
async function getJurisdictionControls(jurisdiction) {
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
async function getISOControls() {
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
// ============================================
// TYPE DEFINITIONS FOR WINDOW.D.TS
// ============================================
/*
Add these to your src/types/window.d.ts:

interface ClientSetupAPI {
  // Preview what will be imported
  previewClientHazards: (payload: {
    industry?: string;
    jurisdiction?: string;
    isoAlignment?: boolean;
  }) => Promise<{
    hazards: Array<{
      id: string;
      code: string;
      name: string;
      description: string | null;
      category: string;
      preControlRisk: number;
      postControlRisk: number;
      controlCount: number;
    }>;
    controls: any[];
    stats: {
      totalHazards: number;
      totalControls: number;
      categories: string[];
      fromIndustry: number;
      fromJurisdiction: number;
      fromISO: number;
    };
  }>;

  // Create client with full risk universe
  setupClientWithRiskUniverse: (payload: {
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
  }) => Promise<{
    client: any;
    stats: {
      hazardsImported: number;
      controlsImported: number;
      mappingsCreated: number;
      hazardsDisabled: number;
      riskCustomizations: number;
    };
  }>;
}

// Merge into existing window.api interface
interface Window {
  api: {
    // ... existing methods ...
    previewClientHazards: ClientSetupAPI['previewClientHazards'];
    setupClientWithRiskUniverse: ClientSetupAPI['setupClientWithRiskUniverse'];
  }
}
*/ 

/**
 * HAZARD PACK INTEGRATION MODULE
 * 
 * Central module for managing and importing industry-specific hazard packs
 * Provides functions to seed database with comprehensive hazard/control data
 */

import { PrismaClient } from '@prisma/client';
import {
  ELECTRICAL_INDUSTRY_HAZARDS,
  ELECTRICAL_PACK_STATS,
  HazardPackItem,
  ControlPackItem
} from './electrical-industry-pack';
import {
  CONSTRUCTION_INDUSTRY_HAZARDS,
  CONSTRUCTION_PACK_STATS
} from './construction-industry-pack';
import {
  MANUFACTURING_INDUSTRY_HAZARDS,
  MANUFACTURING_PACK_STATS
} from './manufacturing-industry-pack';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface PackImportResult {
  hazardsCreated: number;
  hazardsUpdated: number;
  controlsCreated: number;
  controlsUpdated: number;
  mappingsCreated: number;
  errors: string[];
}

export interface AvailablePack {
  id: string;
  name: string;
  description: string;
  industryId: string;
  stats: {
    totalHazards: number;
    totalControls: number;
    categories: string[];
    criticalHazards: number;
    criticalControls: number;
  };
}

// ============================================
// AVAILABLE PACKS REGISTRY
// ============================================

export const AVAILABLE_PACKS: Record<string, AvailablePack> = {
  electrical: {
    id: 'electrical',
    name: 'Electrical Contracting',
    description: 'Comprehensive electrical industry hazards including arc flash, shock, heights, and confined spaces',
    industryId: 'electrical',
    stats: ELECTRICAL_PACK_STATS
  },
  construction: {
    id: 'construction',
    name: 'Construction & Building',
    description: 'Construction hazards including excavation, scaffolding, formwork, and mobile plant',
    industryId: 'construction',
    stats: CONSTRUCTION_PACK_STATS
  },
  manufacturing: {
    id: 'manufacturing',
    name: 'Manufacturing',
    description: 'Manufacturing hazards including machinery, chemicals, noise, and material handling',
    industryId: 'manufacturing',
    stats: MANUFACTURING_PACK_STATS
  }
};

// ============================================
// PACK DATA GETTER
// ============================================

export function getPackData(packId: string): HazardPackItem[] {
  switch (packId) {
    case 'electrical':
      return ELECTRICAL_INDUSTRY_HAZARDS;
    case 'construction':
      return CONSTRUCTION_INDUSTRY_HAZARDS;
    case 'manufacturing':
      return MANUFACTURING_INDUSTRY_HAZARDS;
    default:
      return [];
  }
}

// ============================================
// DATABASE IMPORT FUNCTIONS
// ============================================

/**
 * Import a complete hazard pack into the database
 * Uses upsert to be idempotent - safe to run multiple times
 */
export async function importHazardPack(
  prisma: PrismaClient,
  packId: string
): Promise<PackImportResult> {
  const result: PackImportResult = {
    hazardsCreated: 0,
    hazardsUpdated: 0,
    controlsCreated: 0,
    controlsUpdated: 0,
    mappingsCreated: 0,
    errors: []
  };

  const packData = getPackData(packId);
  if (packData.length === 0) {
    result.errors.push(`Unknown pack ID: ${packId}`);
    return result;
  }

  try {
    // Step 1: Import all unique controls from the pack
    const allControls = new Map<string, ControlPackItem>();
    packData.forEach(hazard => {
      hazard.controls.forEach(control => {
        if (!allControls.has(control.code)) {
          allControls.set(control.code, control);
        }
      });
    });

    // Upsert controls
    for (const [code, control] of allControls) {
      try {
        const existing = await prisma.control.findUnique({
          where: { code }
        });

        if (existing) {
          // Update existing control with new metadata
          await prisma.control.update({
            where: { code },
            data: {
              title: control.title,
              type: control.type,
              description: control.description,
              reference: control.reference,
              validityDays: control.validityDays,
              // Store document matching metadata as JSON
              metadata: JSON.stringify({
                expectedDocTypes: control.expectedDocTypes || [],
                keywords: control.keywords || [],
                isCritical: control.isCritical
              })
            }
          });
          result.controlsUpdated++;
        } else {
          // Create new control
          await prisma.control.create({
            data: {
              code: control.code,
              title: control.title,
              type: control.type,
              description: control.description,
              reference: control.reference,
              validityDays: control.validityDays,
              metadata: JSON.stringify({
                expectedDocTypes: control.expectedDocTypes || [],
                keywords: control.keywords || [],
                isCritical: control.isCritical
              })
            }
          });
          result.controlsCreated++;
        }
      } catch (err) {
        result.errors.push(`Failed to import control ${code}: ${err}`);
      }
    }

    // Step 2: Import hazards
    for (const hazard of packData) {
      try {
        const existing = await prisma.hazard.findUnique({
          where: { code: hazard.code }
        });

        let hazardId: string;

        if (existing) {
          // Update existing hazard
          const updated = await prisma.hazard.update({
            where: { code: hazard.code },
            data: {
              name: hazard.name,
              description: hazard.description,
              category: hazard.category,
              preControlRisk: hazard.preControlRisk,
              industryId: hazard.industryId
            }
          });
          hazardId = updated.id;
          result.hazardsUpdated++;
        } else {
          // Create new hazard
          const created = await prisma.hazard.create({
            data: {
              code: hazard.code,
              name: hazard.name,
              description: hazard.description,
              category: hazard.category,
              preControlRisk: hazard.preControlRisk,
              postControlRisk: hazard.preControlRisk, // Initial post = pre
              industryId: hazard.industryId
            }
          });
          hazardId = created.id;
          result.hazardsCreated++;
        }

        // Step 3: Create hazard-control mappings
        for (const control of hazard.controls) {
          try {
            const controlRecord = await prisma.control.findUnique({
              where: { code: control.code }
            });

            if (!controlRecord) {
              result.errors.push(`Control ${control.code} not found for hazard ${hazard.code}`);
              continue;
            }

            // Check if mapping already exists
            const existingMapping = await prisma.hazardControl.findUnique({
              where: {
                hazardId_controlId: {
                  hazardId: hazardId,
                  controlId: controlRecord.id
                }
              }
            });

            if (!existingMapping) {
              await prisma.hazardControl.create({
                data: {
                  hazardId: hazardId,
                  controlId: controlRecord.id,
                  isCritical: control.isCritical,
                  priority: control.isCritical ? 1 : 2
                }
              });
              result.mappingsCreated++;
            }
          } catch (err) {
            result.errors.push(`Failed to map control ${control.code} to hazard ${hazard.code}: ${err}`);
          }
        }
      } catch (err) {
        result.errors.push(`Failed to import hazard ${hazard.code}: ${err}`);
      }
    }

    return result;
  } catch (err) {
    result.errors.push(`Pack import failed: ${err}`);
    return result;
  }
}

/**
 * Import multiple packs at once
 */
export async function importMultiplePacks(
  prisma: PrismaClient,
  packIds: string[]
): Promise<Record<string, PackImportResult>> {
  const results: Record<string, PackImportResult> = {};

  for (const packId of packIds) {
    results[packId] = await importHazardPack(prisma, packId);
  }

  return results;
}

/**
 * Get a preview of pack contents without importing
 */
export function previewPack(packId: string) {
  const packData = getPackData(packId);
  const packInfo = AVAILABLE_PACKS[packId];

  return {
    pack: packInfo,
    hazards: packData.map(h => ({
      code: h.code,
      name: h.name,
      category: h.category,
      riskLevel: h.preControlRisk,
      controlCount: h.controls.length,
      criticalControls: h.controls.filter(c => c.isCritical).length
    })),
    controls: Array.from(
      new Set(
        packData.flatMap(h => h.controls.map(c => c.code))
      )
    ).map(code => {
      const control = packData
        .flatMap(h => h.controls)
        .find(c => c.code === code);
      return {
        code: control!.code,
        title: control!.title,
        type: control!.type,
        expectedDocTypes: control!.expectedDocTypes || []
      };
    })
  };
}

/**
 * Get statistics across all packs
 */
export function getOverallStats() {
  const allPacks = Object.values(AVAILABLE_PACKS);
  
  return {
    totalPacks: allPacks.length,
    totalHazards: allPacks.reduce((sum, p) => sum + p.stats.totalHazards, 0),
    totalControls: allPacks.reduce((sum, p) => sum + p.stats.totalControls, 0),
    totalCriticalHazards: allPacks.reduce((sum, p) => sum + p.stats.criticalHazards, 0),
    totalCriticalControls: allPacks.reduce((sum, p) => sum + p.stats.criticalControls, 0),
    categories: Array.from(
      new Set(allPacks.flatMap(p => p.stats.categories))
    )
  };
}

/**
 * Search for controls across all packs by keyword
 */
export function searchControls(keyword: string): ControlPackItem[] {
  const allPacks = [
    ...ELECTRICAL_INDUSTRY_HAZARDS,
    ...CONSTRUCTION_INDUSTRY_HAZARDS,
    ...MANUFACTURING_INDUSTRY_HAZARDS
  ];

  const lowerKeyword = keyword.toLowerCase();
  const results = new Map<string, ControlPackItem>();

  allPacks.forEach(hazard => {
    hazard.controls.forEach(control => {
      // Check if already found
      if (results.has(control.code)) return;

      // Search in title
      if (control.title.toLowerCase().includes(lowerKeyword)) {
        results.set(control.code, control);
        return;
      }

      // Search in keywords
      if (control.keywords?.some(kw => kw.toLowerCase().includes(lowerKeyword))) {
        results.set(control.code, control);
        return;
      }

      // Search in expected doc types
      if (control.expectedDocTypes?.some(dt => dt.toLowerCase().includes(lowerKeyword))) {
        results.set(control.code, control);
        return;
      }
    });
  });

  return Array.from(results.values());
}

/**
 * Search for hazards across all packs
 */
export function searchHazards(keyword: string): HazardPackItem[] {
  const allPacks = [
    ...ELECTRICAL_INDUSTRY_HAZARDS,
    ...CONSTRUCTION_INDUSTRY_HAZARDS,
    ...MANUFACTURING_INDUSTRY_HAZARDS
  ];

  const lowerKeyword = keyword.toLowerCase();

  return allPacks.filter(hazard =>
    hazard.name.toLowerCase().includes(lowerKeyword) ||
    hazard.description.toLowerCase().includes(lowerKeyword) ||
    hazard.category.toLowerCase().includes(lowerKeyword) ||
    hazard.code.toLowerCase().includes(lowerKeyword)
  );
}

// ============================================
// EXPORT ALL
// ============================================

export {
  ELECTRICAL_INDUSTRY_HAZARDS,
  CONSTRUCTION_INDUSTRY_HAZARDS,
  MANUFACTURING_INDUSTRY_HAZARDS
};
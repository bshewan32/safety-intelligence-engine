// electron/ipc-risk-matrix.ts
import { ipcMain } from 'electron';
import { PrismaClient } from '@prisma/client';
// Initialize Prisma Client
const prisma = new PrismaClient();
export function registerRiskMatrixHandlers() {
    ipcMain.handle('db:getClientRiskMatrix', async (event, clientId) => {
        const client = await prisma.client.findUnique({
            where: { id: clientId },
            include: {
                clientHazards: {
                    include: {
                        hazard: true, // Global hazard data
                        controls: {
                            include: {
                                clientControl: {
                                    include: {
                                        control: true // Global control data
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!client)
            throw new Error('Client not found');
        // Transform data for frontend
        const riskMatrix = {
            client: {
                id: client.id,
                name: client.name,
                industry: client.industry,
                jurisdiction: client.jurisdiction
            },
            summary: {
                totalHazards: client.clientHazards.length,
                activeHazards: client.clientHazards.filter((h) => h.isActive && !h.isNotApplicable).length,
                hazardsWithGaps: client.clientHazards.filter(hazard => {
                    const totalControls = hazard.controls.length;
                    const activeControls = hazard.controls.filter(c => c.clientControl.isActive).length;
                    return totalControls > 0 && activeControls < totalControls;
                })
                    .length,
                overallCoverage: calculateCoverage(client.clientHazards)
            },
            hazards: client.clientHazards.map((hazard) => ({
                id: hazard.id,
                code: hazard.hazard.code,
                name: hazard.hazard.name,
                description: hazard.hazard.description,
                category: hazard.hazard.category,
                originalRiskLevel: hazard.originalRiskLevel,
                adjustedRiskLevel: hazard.adjustedRiskLevel || hazard.originalRiskLevel,
                preControlRisk: hazard.preControlRisk,
                postControlRisk: hazard.postControlRisk,
                isActive: hazard.isActive,
                isNotApplicable: hazard.isNotApplicable,
                clientNotes: hazard.clientNotes,
                controls: hazard.controls.map(mapping => ({
                    mappingId: mapping.id,
                    controlId: mapping.clientControl.id,
                    code: mapping.clientControl.control.code,
                    name: mapping.clientControl.control.name,
                    type: mapping.clientControl.control.type,
                    effectivenessRating: mapping.effectivenessRating,
                    isCriticalControl: mapping.isCriticalControl,
                    isActive: mapping.clientControl.isActive
                })),
                controlCoverage: {
                    total: hazard.controls.length,
                    active: hazard.controls.filter((c) => c.clientControl.isActive).length,
                    critical: hazard.controls.filter((c) => c.isCriticalControl).length,
                    percentage: calculateControlCoverage(hazard.controls)
                }
            }))
        };
        return riskMatrix;
    });
    ipcMain.handle('db:updateClientHazard', async (event, hazardId, updates) => {
        return await prisma.clientHazard.update({
            where: { id: hazardId },
            data: {
                adjustedRiskLevel: updates.adjustedRiskLevel,
                isActive: updates.isActive,
                isNotApplicable: updates.isNotApplicable,
                clientNotes: updates.clientNotes,
                lastReviewedAt: new Date()
            }
        });
    });
    ipcMain.handle('db:addControlToHazard', async (event, data) => {
        return await prisma.clientHazardControl.create({
            data: {
                clientHazardId: data.clientHazardId,
                clientControlId: data.clientControlId,
                isCriticalControl: data.isCriticalControl,
                effectivenessRating: data.effectivenessRating
            }
        });
    });
    ipcMain.handle('db:removeControlFromHazard', async (event, mappingId) => {
        return await prisma.clientHazardControl.delete({
            where: { id: mappingId }
        });
    });
    ipcMain.handle('db:getAvailableControls', async (event, clientId) => {
        return await prisma.clientControl.findMany({
            where: {
                clientId,
                isActive: true
            },
            include: {
                control: true
            }
        });
    });
}
// Helper functions
function calculateCoverage(hazards) {
    const activeHazards = hazards.filter((h) => h.isActive && !h.isNotApplicable);
    if (activeHazards.length === 0)
        return 100;
    const totalControls = activeHazards.reduce((sum, h) => {
        return sum + h.controls.filter((c) => c.isCriticalControl).length;
    }, 0);
    const activeControls = activeHazards.reduce((sum, h) => {
        return sum + h.controls.filter((c) => c.isCriticalControl && c.clientControl.isActive).length;
    }, 0);
    return totalControls > 0 ? Math.round((activeControls / totalControls) * 100) : 0;
}
function calculateControlCoverage(controls) {
    const critical = controls.filter((c) => c.isCriticalControl);
    const activeCritical = critical.filter((c) => c.clientControl.isActive);
    return critical.length > 0 ? Math.round((activeCritical.length / critical.length) * 100) : 100;
}

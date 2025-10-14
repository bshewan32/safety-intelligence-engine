import { dialog, shell, app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { prisma } from '../src/db/prisma';
import { buildClientReport } from './report.js';
import { AssignmentEngine } from '../src/core/AssignmentEngine.js';
export function handleIPC(ipc, win) {
    // ========================================
    // WORKERS
    // ========================================
    ipc.handle('db:listWorkers', async () => {
        return await prisma.worker.findMany({
            include: {
                role: true,
            },
            orderBy: {
                lastName: 'asc',
            },
        });
    });
    ipc.handle('db:getWorker', async (_e, workerId) => {
        return await prisma.worker.findUnique({
            where: { id: workerId },
            include: {
                role: true,
                required: {
                    include: {
                        control: true,
                        evidence: true,
                    },
                },
            },
        });
    });
    ipc.handle('db:getWorkerWithRequiredControls', async (_e, workerId) => {
        return await prisma.worker.findUnique({
            where: { id: workerId },
            include: {
                role: true,
                required: {
                    include: {
                        control: true,
                        evidence: {
                            orderBy: { createdAt: 'desc' },
                        },
                    },
                    orderBy: {
                        status: 'asc', // Required first, then Satisfied
                    },
                },
            },
        });
    });
    ipc.handle('db:upsertWorker', async (_e, worker) => {
        if (worker.id) {
            // Update existing worker
            return await prisma.worker.update({
                where: { id: worker.id },
                data: {
                    firstName: worker.firstName,
                    lastName: worker.lastName,
                    email: worker.email,
                    phone: worker.phone,
                    roleId: worker.roleId,
                },
            });
        }
        else {
            // Create new worker
            return await prisma.worker.create({
                data: {
                    employeeId: worker.employeeId,
                    firstName: worker.firstName,
                    lastName: worker.lastName,
                    email: worker.email,
                    phone: worker.phone,
                    companyId: worker.companyId || 'default',
                    roleId: worker.roleId,
                },
            });
        }
    });
    // ========================================
    // ASSIGNMENT ENGINE
    // ========================================
    ipc.handle('db:recomputeWorker', async (_e, workerId) => {
        try {
            await AssignmentEngine.recomputeWorker(workerId);
            return { success: true };
        }
        catch (error) {
            console.error('Failed to recompute worker:', error);
            return { success: false, error: String(error) };
        }
    });
    ipc.handle('db:recomputeAllWorkers', async () => {
        try {
            await AssignmentEngine.recomputeAll();
            return { success: true };
        }
        catch (error) {
            console.error('Failed to recompute all workers:', error);
            return { success: false, error: String(error) };
        }
    });
    // ========================================
    // TEMPORARY FIXES
    // ========================================
    ipc.handle('db:createTemporaryFix', async (_e, data) => {
        try {
            // Create temporary evidence record
            const evidence = await prisma.evidence.create({
                data: {
                    requiredControlId: data.requiredControlId,
                    type: 'Temporary',
                    status: 'Valid',
                    notes: data.notes,
                    issuedDate: new Date(),
                    expiryDate: new Date(data.validUntil),
                },
            });
            // Update RequiredControl with temporary status
            await prisma.requiredControl.update({
                where: { id: data.requiredControlId },
                data: {
                    status: 'Temporary',
                    tempValidUntil: new Date(data.validUntil),
                    tempEvidenceId: evidence.id,
                    tempNotes: data.notes,
                },
            });
            return { success: true, evidenceId: evidence.id };
        }
        catch (error) {
            console.error('Failed to create temporary fix:', error);
            return { success: false, error: String(error) };
        }
    });
    // ========================================
    // EVIDENCE MANAGEMENT
    // ========================================
    ipc.handle('db:addEvidence', async (_e, data) => {
        try {
            // Create evidence record
            const evidence = await prisma.evidence.create({
                data: {
                    requiredControlId: data.requiredControlId,
                    type: data.type,
                    status: 'Valid',
                    filePath: data.filePath,
                    checksum: data.checksum,
                    fileSize: data.fileSize,
                    originalName: data.originalName,
                    issuedDate: new Date(data.issuedDate),
                    expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
                    notes: data.notes,
                },
            });
            // If this is permanent evidence (not Temporary), update RequiredControl to Satisfied
            if (data.type !== 'Temporary') {
                const requiredControl = await prisma.requiredControl.findUnique({
                    where: { id: data.requiredControlId },
                });
                // Only update if currently Required or Temporary
                if (requiredControl && ['Required', 'Temporary', 'Overdue'].includes(requiredControl.status)) {
                    await prisma.requiredControl.update({
                        where: { id: data.requiredControlId },
                        data: {
                            status: 'Satisfied',
                            tempValidUntil: null,
                            tempEvidenceId: null,
                            tempNotes: null,
                        },
                    });
                }
            }
            return evidence;
        }
        catch (error) {
            console.error('Failed to add evidence:', error);
            throw error;
        }
    });
    // ========================================
    // FILE OPERATIONS
    // ========================================
    ipc.handle('file:selectEvidence', async () => {
        try {
            const result = await dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [
                    { name: 'Documents', extensions: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'] }
                ]
            });
            if (result.canceled || result.filePaths.length === 0) {
                return null;
            }
            const filePath = result.filePaths[0];
            const fileName = path.basename(filePath);
            const uuid = crypto.randomUUID();
            // Create storage path: userData/evidence/YYYY/MM/
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const evidenceDir = path.join(app.getPath('userData'), 'evidence', String(year), month);
            // Ensure directory exists
            await fs.mkdir(evidenceDir, { recursive: true });
            // Create safe filename
            const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
            const newPath = path.join(evidenceDir, `${uuid}_${safeName}`);
            // Copy file to storage
            await fs.copyFile(filePath, newPath);
            // Calculate checksum for integrity verification
            const fileBuffer = await fs.readFile(newPath);
            const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
            const fileSize = fileBuffer.length;
            console.log(`Evidence file stored: ${newPath} (${fileSize} bytes)`);
            return {
                path: newPath,
                checksum,
                size: fileSize,
                originalName: fileName
            };
        }
        catch (error) {
            console.error('Failed to select/store evidence:', error);
            throw error;
        }
    });
    ipc.handle('file:openEvidence', async (_e, filePath) => {
        try {
            await shell.openPath(filePath);
        }
        catch (error) {
            console.error('Failed to open evidence file:', error);
            throw error;
        }
    });
    // ========================================
    // HAZARDS
    // ========================================
    ipc.handle('db:listHazards', async () => {
        return await prisma.hazard.findMany({
            include: {
                controls: {
                    include: {
                        control: true,
                    },
                },
            },
        });
    });
    // ========================================
    // CONTROLS
    // ========================================
    ipc.handle('db:listControls', async () => {
        return await prisma.control.findMany({
            include: {
                hazards: {
                    include: {
                        hazard: true,
                    },
                },
            },
        });
    });
    // ========================================
    // DASHBOARD
    // ========================================
    ipc.handle('db:dashboardSummary', async () => {
        const totalRequired = await prisma.requiredControl.count();
        // Operational readiness: includes Temporary fixes (field-ready)
        const operational = await prisma.requiredControl.count({
            where: {
                status: { in: ['Satisfied', 'Temporary'] },
            },
        });
        // Audit readiness: permanent evidence only (audit-ready)
        const audit = await prisma.requiredControl.count({
            where: { status: 'Satisfied' },
        });
        const operationalReadiness = totalRequired
            ? Math.round((operational / totalRequired) * 100)
            : 100;
        const auditReadiness = totalRequired
            ? Math.round((audit / totalRequired) * 100)
            : 100;
        // Get latest KPI data
        const kpi = await prisma.kPI.findFirst({
            orderBy: { period: 'desc' },
        });
        // Count hazards with high residual risk
        const openHazards = await prisma.hazard.count({
            where: { postControlRisk: { gt: 5 } },
        });
        // Count evidence expiring within 30 days
        const expiringCount = await prisma.evidence.count({
            where: {
                expiryDate: {
                    lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
                status: 'Valid',
            },
        });
        // Count temporary fixes separately (these need replacement with permanent evidence)
        const tempFixCount = await prisma.requiredControl.count({
            where: { status: 'Temporary' },
        });
        return {
            operationalReadiness,
            auditReadiness,
            tempFixCount,
            openHazards,
            expiringSoon: expiringCount,
            trifr: kpi?.hoursWorked ? (kpi.incidents / kpi.hoursWorked) * 1000000 : 0,
            crvRate: kpi?.crvRate || 0,
        };
    });
    // ========================================
    // REPORTS
    // ========================================
    ipc.handle('report:buildClient', async (_e, filters) => {
        return await buildClientReport(filters, win);
    });
}

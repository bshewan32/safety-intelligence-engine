import { dialog, shell, app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { buildClientReport } from './report.js';
import { prisma } from '../src/db/prisma.js';
import { AssignmentEngine } from '../src/core/AssignmentEngine.js';
export function handleIPC(ipc, win) {
    // ========================================
    // WORKERS
    // ========================================
    ipc.handle('db:listWorkers', async () => {
        return await prisma.worker.findMany({
            include: {
                role: true, // legacy single role (to be deprecated)
                roles: { include: { role: true, client: true, site: true } },
            },
            orderBy: {
                lastName: 'asc',
            },
        });
    });
    // ========================================
    // ROLES
    // ========================================
    // List roles for dropdowns
    ipc.handle('db:listRoles', async () => {
        return await prisma.role.findMany({ orderBy: { name: 'asc' } });
    });
    // Create role
    ipc.handle('db:createRole', async (_e, payload) => {
        const { name, description, activityPackage } = payload || {};
        if (!name?.trim())
            throw new Error('Role name is required');
        return await prisma.role.create({
            data: {
                name: name.trim(),
                description: description || null,
                activityPackage: activityPackage || null,
            },
        });
    });
    // Update role
    ipc.handle('db:updateRole', async (_e, payload) => {
        const { id, name, description, activityPackage } = payload || {};
        if (!id)
            throw new Error('Role id is required');
        if (!name?.trim())
            throw new Error('Role name is required');
        return await prisma.role.update({
            where: { id },
            data: {
                name: name.trim(),
                description: description || null,
                activityPackage: activityPackage || null,
            },
        });
    });
    // Delete role
    ipc.handle('db:deleteRole', async (_e, roleId) => {
        if (!roleId)
            throw new Error('Role id is required');
        // This will fail if there are workers with this role due to foreign key constraints
        return await prisma.role.delete({
            where: { id: roleId },
        });
    });
    ipc.handle('db:getWorker', async (_e, workerId) => {
        return await prisma.worker.findUnique({
            where: { id: workerId },
            include: {
                role: true, // legacy
                roles: { include: { role: true, client: true, site: true } },
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
                role: true, // legacy
                roles: { include: { role: true, client: true, site: true } },
                required: {
                    include: {
                        control: true,
                        evidence: {
                            orderBy: { issuedDate: 'desc' },
                        },
                    },
                    orderBy: {
                        status: 'asc',
                    },
                },
            },
        });
    });
    // Create worker (no roles here; roles are added via db:addWorkerRole)
    ipc.handle('db:createWorker', async (_e, payload) => {
        const data = {
            employeeId: String(payload?.employeeId || '').trim(),
            firstName: String(payload?.firstName || '').trim(),
            lastName: String(payload?.lastName || '').trim(),
            email: payload?.email ? String(payload.email).trim() : undefined,
            phone: payload?.phone ? String(payload.phone).trim() : undefined,
            companyId: payload?.companyId || 'default',
        };
        if (!data.employeeId || !data.firstName || !data.lastName) {
            throw new Error('employeeId, firstName, lastName are required');
        }
        const created = await prisma.worker.create({ data });
        return created;
    });
    // Add a role assignment to a worker (handles primary uniqueness)
    ipc.handle('db:addWorkerRole', async (_e, payload) => {
        const { workerId, roleId } = payload || {};
        if (!workerId || !roleId)
            throw new Error('workerId and roleId are required');
        // Coerce dates if provided
        const startAt = payload.startAt ? new Date(payload.startAt) : undefined;
        const endAt = payload.endAt ? new Date(payload.endAt) : undefined;
        // Enforce single primary per active window if requested
        if (payload.isPrimary) {
            const now = new Date();
            const activePrimaries = await prisma.workerRole.findMany({
                where: {
                    workerId,
                    isPrimary: true,
                    OR: [{ endAt: null }, { endAt: { gt: now } }],
                },
            });
            // Close out all current primaries
            await prisma.$transaction(activePrimaries.map(r => prisma.workerRole.update({ where: { id: r.id }, data: { endAt: now } })));
        }
        // Prepare create data; be tolerant if schema does not have some fields
        const createData = {
            workerId,
            roleId,
            isPrimary: !!payload.isPrimary,
        };
        if (typeof payload.clientId === 'string')
            createData.clientId = payload.clientId;
        if (typeof payload.siteId === 'string')
            createData.siteId = payload.siteId;
        if (startAt)
            createData.startAt = startAt;
        if (endAt)
            createData.endAt = endAt;
        if (typeof payload.notes === 'string')
            createData.notes = payload.notes;
        // Optional enum/string type on WorkerRole; set only if your schema defines it
        if (typeof createData.type !== 'undefined' || typeof payload.type === 'string') {
            createData.type = payload.type; // will be ignored by Prisma if field doesn't exist
        }
        const row = await prisma.workerRole.create({ data: createData });
        return row;
    });
    // Set a specific WorkerRole as primary (closes others)
    ipc.handle('db:setPrimaryRole', async (_e, payload) => {
        const { workerId, workerRoleId } = payload || {};
        if (!workerId || !workerRoleId)
            throw new Error('workerId and workerRoleId are required');
        const now = new Date();
        const activePrimaries = await prisma.workerRole.findMany({
            where: { workerId, isPrimary: true, OR: [{ endAt: null }, { endAt: { gt: now } }] },
            select: { id: true },
        });
        await prisma.$transaction([
            ...activePrimaries.map(r => prisma.workerRole.update({ where: { id: r.id }, data: { endAt: now } })),
            prisma.workerRole.update({ where: { id: workerRoleId }, data: { isPrimary: true, startAt: now, endAt: null } }),
        ]);
        return { success: true };
    });
    ipc.handle('db:upsertWorker', async (_e, worker) => {
        if (worker.id) {
            // Update existing worker
            const updated = await prisma.worker.update({
                where: { id: worker.id },
                data: {
                    firstName: worker.firstName,
                    lastName: worker.lastName,
                    email: worker.email,
                    phone: worker.phone,
                    roleId: worker.roleId,
                },
            });
            if (worker.roleId) {
                const now = new Date();
                const currentPrimary = await prisma.workerRole.findFirst({
                    where: { workerId: updated.id, isPrimary: true, OR: [{ endAt: null }, { endAt: { gt: now } }] },
                });
                if (!currentPrimary) {
                    await prisma.workerRole.create({ data: { workerId: updated.id, roleId: worker.roleId, isPrimary: true, startAt: now } });
                }
                else if (currentPrimary.roleId !== worker.roleId) {
                    // Close out old primary and create a new one
                    await prisma.workerRole.update({ where: { id: currentPrimary.id }, data: { endAt: now } });
                    await prisma.workerRole.create({ data: { workerId: updated.id, roleId: worker.roleId, isPrimary: true, startAt: now } });
                }
            }
            return updated;
        }
        else {
            // Create new worker
            const created = await prisma.worker.create({
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
            if (worker.roleId) {
                await prisma.workerRole.create({ data: { workerId: created.id, roleId: worker.roleId, isPrimary: true } });
            }
            return created;
        }
    });
    // ========================================
    // ASSIGNMENT ENGINE
    // ========================================
    ipc.handle('db:recomputeWorker', async (_e, payload) => {
        try {
            const { workerId, clientId, siteId } = payload;
            await AssignmentEngine.recomputeWorker(workerId, { clientId, siteId });
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
    // BULK EVIDENCE UPLOAD
    // ========================================
    ipc.handle('db:bulkAddEvidence', async (_e, payload) => {
        const { controlId, workerIds = [], notes } = payload || {};
        if (!controlId || workerIds.length === 0)
            throw new Error('controlId and workerIds are required');
        const issuedDate = new Date(payload.issuedDate);
        const expiryDate = payload.expiryDate ? new Date(payload.expiryDate) : undefined;
        // 1) Resolve / copy file once (shared path for all)
        let finalFilePath = payload.filePath;
        if (!finalFilePath && payload.sourcePath) {
            const { app } = require('electron');
            const path = require('node:path');
            const fs = require('node:fs/promises');
            const destDir = path.join(app.getPath('userData'), 'evidence', 'batches');
            await fs.mkdir(destDir, { recursive: true });
            const baseName = path.basename(payload.sourcePath);
            const stamped = `${Date.now()}-${baseName}`;
            const destPath = path.join(destDir, stamped);
            await fs.copyFile(payload.sourcePath, destPath);
            finalFilePath = destPath;
        }
        // 2) Fetch or create RequiredControls for each worker
        const rcKeys = workerIds.map(workerId => ({ workerId, controlId }));
        const rcRows = await prisma.requiredControl.findMany({
            where: { OR: rcKeys.map(k => ({ workerId: k.workerId, controlId: k.controlId })) },
            select: { id: true, workerId: true, controlId: true },
        });
        const rcMap = new Map(rcRows.map(r => [`${r.workerId}:${r.controlId}`, r]));
        const createMissingRC = rcKeys
            .filter(k => !rcMap.has(`${k.workerId}:${k.controlId}`))
            .map(k => prisma.requiredControl.upsert({
            where: { workerId_controlId: { workerId: k.workerId, controlId: k.controlId } },
            update: {},
            create: { workerId: k.workerId, controlId: k.controlId, status: 'Required', dueDate: null },
            select: { id: true, workerId: true, controlId: true },
        }));
        const createdRC = createMissingRC.length ? await prisma.$transaction(createMissingRC) : [];
        for (const r of createdRC)
            rcMap.set(`${r.workerId}:${r.controlId}`, r);
        // 3) Create evidence rows (one per worker)
        const evCreates = workerIds.map(workerId => {
            const rc = rcMap.get(`${workerId}:${controlId}`);
            if (!rc)
                throw new Error(`Missing requiredControl for worker ${workerId} and control ${controlId}`);
            return prisma.evidence.create({
                data: {
                    requiredControlId: rc.id,
                    type: 'Attendance',
                    status: 'Valid',
                    issuedDate,
                    expiryDate,
                    filePath: finalFilePath || null,
                    originalName: finalFilePath ? finalFilePath.split(/[\\/]/).pop() : undefined,
                    notes: notes || null,
                },
            });
        });
        const results = await prisma.$transaction(evCreates);
        // 4) Recompute all impacted workers
        for (const workerId of workerIds) {
            try {
                await AssignmentEngine.recomputeWorker(workerId);
            }
            catch (err) {
                console.warn('bulk recompute failed for worker', workerId, err);
            }
        }
        return { created: results.length, filePath: finalFilePath || null };
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
                    { name: 'Documents', extensions: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt'] }
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
    // Helpers for risk label/score conversion
    const riskLabelToScore = (label) => {
        switch ((label || '').toLowerCase()) {
            case 'critical': return 9;
            case 'high': return 7;
            case 'medium': return 4;
            case 'low': return 2;
            default: return 4; // sensible default
        }
    };
    const riskScoreToLabel = (score) => {
        const s = typeof score === 'number' ? score : 4;
        if (s >= 9)
            return 'Critical';
        if (s >= 7)
            return 'High';
        if (s >= 4)
            return 'Medium';
        return 'Low';
    };
    // List hazards
    ipc.handle('db:listHazards', async () => {
        try {
            const rows = await prisma.hazard.findMany({ orderBy: { createdAt: 'desc' } });
            return rows.map((h) => ({ ...h, risk: riskScoreToLabel(h.preControlRisk) }));
        }
        catch (err) {
            console.error('listHazards failed', err);
            return [];
        }
    });
    // Create hazard
    ipc.handle('db:createHazard', async (_e, data) => {
        // incoming: { name, code, category, risk, description }
        try {
            const { risk, ...rest } = data || {};
            const score = riskLabelToScore(risk);
            const created = await prisma.hazard.create({
                data: {
                    ...rest,
                    preControlRisk: score,
                    postControlRisk: score, // initial post-control same as pre until controls mapped
                },
            });
            return { ...created, risk: riskScoreToLabel(created.preControlRisk) };
        }
        catch (err) {
            console.error('createHazard failed', err);
            throw err;
        }
    });
    // Import hazard pack (stub seeds by kind)
    ipc.handle('db:importHazardPack', async (_e, { kind }) => {
        const seedsByKind = {
            industry: [
                { code: 'ELEC-001', name: 'Electric Shock', category: 'Electrical', risk: 'Critical', description: 'Contact with live conductors' },
                { code: 'HGT-001', name: 'Fall From Height', category: 'Heights', risk: 'High', description: 'Work at height without adequate protection' },
            ],
            workMethod: [
                { code: 'HOT-001', name: 'Hot Work', category: 'Hot Work', risk: 'High', description: 'Welding/cutting/grinding ignition sources' },
                { code: 'CSP-001', name: 'Confined Space', category: 'Confined Space', risk: 'Critical', description: 'Atmospheric or engulfment hazards' },
            ],
            jurisdiction: [
                { code: 'LEG-EL-001', name: 'Electrical Licensing Compliance', category: 'Legislation', risk: 'Medium', description: 'State-based electrical licensing and testing obligations' },
            ],
            iso45001: [
                { code: 'MGT-CONS', name: 'Consultation & Participation', category: 'Management', risk: 'Low', description: 'Worker consultation requirements under ISO 45001' },
            ],
        };
        const seeds = seedsByKind[kind] ?? [];
        const created = [];
        for (const h of seeds) {
            const { risk, ...rest } = h;
            const score = riskLabelToScore(risk);
            const row = await prisma.hazard.upsert({
                where: { code: rest.code },
                update: {},
                create: { ...rest, preControlRisk: score, postControlRisk: score },
            });
            created.push({ ...row, risk: riskScoreToLabel(row.preControlRisk) });
        }
        return created;
    });
    // Open hazard→control mapper (placeholder for renderer navigation)
    ipc.handle('ui:openHazardControlMapper', async (_e, hazardId) => {
        return { ok: true, hazardId };
    });
    // ========================================
    // CONTROLS
    // ========================================
    // Fetch mapping + available controls for a hazard
    ipc.handle('db:getHazardControls', async (_e, hazardId) => {
        try {
            const [mapped, all] = await Promise.all([
                prisma.hazardControl.findMany({
                    where: { hazardId },
                    include: { control: true },
                    orderBy: [{ priority: 'asc' }, { id: 'desc' }],
                }),
                prisma.control.findMany({ orderBy: { title: 'asc' } }),
            ]);
            const mappedIds = new Set(mapped.map(m => m.controlId));
            const available = all.filter(c => !mappedIds.has(c.id));
            return { mapped, available, allCount: all.length };
        }
        catch (err) {
            console.error('getHazardControls failed', err);
            return { mapped: [], available: [], allCount: 0 };
        }
    });
    // Add a mapping (idempotent)
    ipc.handle('db:addHazardControl', async (_e, payload) => {
        const { hazardId, controlId } = payload || {};
        if (!hazardId || !controlId)
            throw new Error('hazardId and controlId are required');
        const row = await prisma.hazardControl.upsert({
            where: { hazardId_controlId: { hazardId, controlId } },
            update: {
                isCritical: payload.isCritical ?? undefined,
                priority: typeof payload.priority === 'number' ? payload.priority : undefined,
            },
            create: {
                hazardId,
                controlId,
                isCritical: payload.isCritical ?? false,
                priority: typeof payload.priority === 'number' ? payload.priority : 0,
            },
        });
        try {
            const hasScoped = typeof AssignmentEngine.recomputeByHazard === 'function';
            if (hasScoped) {
                await AssignmentEngine.recomputeByHazard(hazardId);
            }
            else {
                await AssignmentEngine.recomputeAll();
            }
        }
        catch (err) {
            console.warn('recompute after addHazardControl failed', err);
        }
        return row;
    });
    // Remove a mapping by id OR by composite keys
    ipc.handle('db:removeHazardControl', async (_e, payload) => {
        let row;
        try {
            if (typeof payload === 'string') {
                row = await prisma.hazardControl.delete({ where: { id: payload } });
            }
            else if (payload && payload.id) {
                row = await prisma.hazardControl.delete({ where: { id: payload.id } });
            }
            else if (payload && payload.hazardId && payload.controlId) {
                row = await prisma.hazardControl.delete({ where: { hazardId_controlId: { hazardId: payload.hazardId, controlId: payload.controlId } } });
            }
            else {
                throw new Error('Must provide mapping id or {hazardId, controlId}');
            }
        }
        catch (err) {
            console.error('removeHazardControl failed', err);
            throw err;
        }
        try {
            const hazardId = typeof payload === 'string' ? row.hazardId : (payload.hazardId ?? row.hazardId);
            const hasScoped = typeof AssignmentEngine.recomputeByHazard === 'function';
            if (hasScoped) {
                await AssignmentEngine.recomputeByHazard(hazardId);
            }
            else {
                await AssignmentEngine.recomputeAll();
            }
        }
        catch (err) {
            console.warn('recompute after removeHazardControl failed', err);
        }
        return row;
    });
    // List controls
    ipc.handle('db:listControls', async () => {
        try {
            return await prisma.control.findMany({ orderBy: { createdAt: 'desc' } });
        }
        catch (err) {
            console.error('listControls failed', err);
            return [];
        }
    });
    // Create control (sanitize/normalize input)
    ipc.handle('db:createControl', async (_e, payload) => {
        try {
            const data = {
                code: String(payload.code || '').trim(),
                title: String(payload.title || '').trim(),
                type: String(payload.type || 'Document').trim(),
                description: payload.description ? String(payload.description).trim() : undefined,
                reference: payload.reference ? String(payload.reference).trim() : undefined,
                validityDays: payload.validityDays === '' || payload.validityDays === undefined
                    ? null
                    : Number(payload.validityDays),
            };
            if (!data.code || !data.title)
                throw new Error('Code and Title are required');
            return await prisma.control.create({ data });
        }
        catch (err) {
            console.error('createControl failed', err);
            throw err;
        }
    });
    // Update control
    ipc.handle('db:updateControl', async (_e, { id, data }) => {
        try {
            const clean = { ...data };
            if (clean.code !== undefined)
                clean.code = String(clean.code).trim();
            if (clean.title !== undefined)
                clean.title = String(clean.title).trim();
            if (clean.type !== undefined)
                clean.type = String(clean.type).trim();
            if (clean.description !== undefined && clean.description !== null)
                clean.description = String(clean.description).trim();
            if (clean.reference !== undefined && clean.reference !== null)
                clean.reference = String(clean.reference).trim();
            if (clean.validityDays === '')
                clean.validityDays = null;
            if (clean.validityDays !== undefined && clean.validityDays !== null)
                clean.validityDays = Number(clean.validityDays);
            return await prisma.control.update({ where: { id }, data: clean });
        }
        catch (err) {
            console.error('updateControl failed', err);
            throw err;
        }
    });
    // Delete control
    ipc.handle('db:deleteControl', async (_e, id) => {
        try {
            return await prisma.control.delete({ where: { id } });
        }
        catch (err) {
            console.error('deleteControl failed', err);
            throw err;
        }
    });
    // Import control pack (seed controls by kind; idempotent via upsert by code)
    ipc.handle('db:importControlPack', async (_e, { kind }) => {
        const packs = {
            industry: [
                { code: 'TR-EL-LVR-CPR', title: 'LVR + CPR', type: 'Training', description: 'Low Voltage Rescue + CPR competency', reference: 'AS/NZS 4836', validityDays: 365 },
                { code: 'DOC-SWMS-ELEC-GEN', title: 'SWMS – General Electrical', type: 'Document', description: 'Baseline electrical safe work method statement' },
                { code: 'PPE-ARC-GLOVES', title: 'Arc-rated Gloves', type: 'PPE', description: 'Appropriate class for task per arc flash study' },
                { code: 'INSP-HARNESS-6M', title: 'Harness Inspection', type: 'Inspection', description: 'Formal inspection of fall-arrest harness', reference: 'AS/NZS 1891', validityDays: 180 },
                { code: 'LIC-ESA-SPARKY', title: 'Electrical Worker Licence', type: 'Licence', description: 'State/Territory electrical worker licence' },
            ],
            workMethod: [
                { code: 'TR-WAH', title: 'Working at Heights', type: 'Training', validityDays: 730 },
                { code: 'DOC-SWMS-WAH', title: 'SWMS – Working at Heights', type: 'Document' },
                { code: 'DOC-RESCUE-PLAN-WAH', title: 'Rescue Plan – Heights', type: 'Document' },
                { code: 'INSP-LANYARD-6M', title: 'Lanyard Inspection', type: 'Inspection', validityDays: 180 },
                { code: 'IND-CLIENT-GEN', title: 'Client Site Induction', type: 'Induction', validityDays: 365 },
            ],
            jurisdiction: [
                { code: 'DOC-LEG-EL-TEST-TAG', title: 'Test & Tag Procedure', type: 'Document', reference: 'AS/NZS 3760' },
                { code: 'VER-RCD-TEST', title: 'RCD Test Record', type: 'Verification', description: 'Periodic verification and record of RCD tests', validityDays: 180 },
                { code: 'DOC-WHS-CONSULT', title: 'WHS Consultation Procedure', type: 'Document', reference: 'WHS Act s47-49' },
            ],
            iso45001: [
                { code: 'DOC-ISO-POLICY', title: 'OH&S Policy', type: 'Document', reference: 'ISO 45001:2018 cl.5.2' },
                { code: 'DOC-ISO-COMPETENCE', title: 'Competence & Awareness Procedure', type: 'Document', reference: 'ISO 45001:2018 cl.7.2-7.3' },
                { code: 'VER-ISO-AUDIT', title: 'Internal Audit Record', type: 'Verification', reference: 'ISO 45001:2018 cl.9.2', validityDays: 365 },
            ],
        };
        const seed = packs[kind] ?? [];
        const out = [];
        for (const c of seed) {
            const row = await prisma.control.upsert({
                where: { code: c.code },
                update: {}, // keep idempotent; no overwrites for now
                create: c,
            });
            out.push(row);
        }
        return out;
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
    // CLIENTS
    // ========================================
    // List all clients
    ipc.handle('db:listClients', async () => {
        try {
            return await prisma.client.findMany({
                include: {
                    sites: true,
                    _count: {
                        select: { sites: true, workerRoles: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        }
        catch (err) {
            console.error('listClients failed', err);
            return [];
        }
    });
    // Get single client with full details
    ipc.handle('db:getClient', async (_e, clientId) => {
        try {
            return await prisma.client.findUnique({
                where: { id: clientId },
                include: {
                    sites: {
                        orderBy: { name: 'asc' }
                    },
                    workerRoles: {
                        include: {
                            worker: true,
                            role: true,
                            site: true
                        },
                        orderBy: { startAt: 'desc' }
                    }
                }
            });
        }
        catch (err) {
            console.error('getClient failed', err);
            return null;
        }
    });
    // Create new client
    // Create new client
    ipc.handle('db:createClient', async (_e, payload) => {
        try {
            const data = {
                name: String(payload.name || '').trim(),
            };
            if (!data.name)
                throw new Error('Client name is required');
            // Use upsert to handle duplicates gracefully
            const created = await prisma.client.upsert({
                where: { name: data.name },
                update: {},
                create: data
            });
            return created;
        }
        catch (err) {
            console.error('createClient failed', err);
            throw err;
        }
    });
    // Update client
    ipc.handle('db:updateClient', async (_e, payload) => {
        try {
            const { id, ...data } = payload;
            if (!id)
                throw new Error('Client ID is required');
            return await prisma.client.update({
                where: { id },
                data
            });
        }
        catch (err) {
            console.error('updateClient failed', err);
            throw err;
        }
    });
    // Delete client
    ipc.handle('db:deleteClient', async (_e, clientId) => {
        try {
            return await prisma.client.delete({ where: { id: clientId } });
        }
        catch (err) {
            console.error('deleteClient failed', err);
            throw err;
        }
    });
    // ========================================
    // SITES
    // ========================================
    // Create site
    ipc.handle('db:createSite', async (_e, payload) => {
        try {
            const { clientId, name } = payload;
            if (!clientId || !name?.trim()) {
                throw new Error('Client ID and site name are required');
            }
            return await prisma.site.create({
                data: {
                    clientId,
                    name: name.trim(),
                },
            });
        }
        catch (err) {
            console.error('createSite failed', err);
            throw err;
        }
    });
    // Delete site
    ipc.handle('db:deleteSite', async (_e, siteId) => {
        try {
            if (!siteId)
                throw new Error('Site ID is required');
            return await prisma.site.delete({ where: { id: siteId } });
        }
        catch (err) {
            console.error('deleteSite failed', err);
            throw err;
        }
    });
    // Remove worker role assignment
    ipc.handle('db:removeWorkerRole', async (_e, workerRoleId) => {
        try {
            if (!workerRoleId)
                throw new Error('Worker role ID is required');
            return await prisma.workerRole.delete({ where: { id: workerRoleId } });
        }
        catch (err) {
            console.error('removeWorkerRole failed', err);
            throw err;
        }
    });
    //.handle('db:setupClientFramework', async (_e, payload: {
    // Setup client with hazards and controls based on industry/jurisdiction
    ipc.handle('db:setupClientFramework', async (_e, payload) => {
        try {
            const { clientId, industry, jurisdiction, isoAlignment } = payload;
            const results = {
                hazardsImported: 0,
                controlsImported: 0,
                mappingsCreated: 0
            };
            // Import industry controls using upsert
            if (industry) {
                const industryControls = [
                    { code: 'TR-EL-LVR-CPR', title: 'LVR + CPR', type: 'Training', description: 'Low Voltage Rescue + CPR competency', reference: 'AS/NZS 4836', validityDays: 365 },
                    { code: 'DOC-SWMS-ELEC-GEN', title: 'SWMS – General Electrical', type: 'Document', description: 'Baseline electrical safe work method statement', validityDays: null },
                    { code: 'PPE-ARC-GLOVES', title: 'Arc-rated Gloves', type: 'PPE', description: 'Appropriate class for task per arc flash study', validityDays: null },
                    { code: 'INSP-HARNESS-6M', title: 'Harness Inspection', type: 'Inspection', description: 'Formal inspection of fall-arrest harness', reference: 'AS/NZS 1891', validityDays: 180 },
                    { code: 'LIC-ESA-SPARKY', title: 'Electrical Worker Licence', type: 'Licence', description: 'State/Territory electrical worker licence', validityDays: null },
                ];
                for (const control of industryControls) {
                    await prisma.control.upsert({
                        where: { code: control.code },
                        update: {},
                        create: control
                    });
                }
                results.controlsImported += 5;
            }
            // Import jurisdiction controls using upsert
            if (jurisdiction) {
                const jurisdictionControls = [
                    { code: 'DOC-LEG-EL-TEST-TAG', title: 'Test & Tag Procedure', type: 'Document', reference: 'AS/NZS 3760', validityDays: null },
                    { code: 'VER-RCD-TEST', title: 'RCD Test Record', type: 'Verification', description: 'Periodic verification and record of RCD tests', validityDays: 180 },
                    { code: 'DOC-WHS-CONSULT', title: 'WHS Consultation Procedure', type: 'Document', reference: 'WHS Act s47-49', validityDays: null },
                ];
                for (const control of jurisdictionControls) {
                    await prisma.control.upsert({
                        where: { code: control.code },
                        update: {},
                        create: control
                    });
                }
                results.controlsImported += 3;
            }
            // Import ISO controls using upsert
            if (isoAlignment) {
                const isoControls = [
                    { code: 'DOC-ISO-POLICY', title: 'OH&S Policy', type: 'Document', reference: 'ISO 45001:2018 cl.5.2', validityDays: null },
                    { code: 'DOC-ISO-COMPETENCE', title: 'Competence & Awareness Procedure', type: 'Document', reference: 'ISO 45001:2018 cl.7.2-7.3', validityDays: null },
                    { code: 'VER-ISO-AUDIT', title: 'Internal Audit Record', type: 'Verification', reference: 'ISO 45001:2018 cl.9.2', validityDays: 365 },
                ];
                for (const control of isoControls) {
                    await prisma.control.upsert({
                        where: { code: control.code },
                        update: {},
                        create: control
                    });
                }
                results.controlsImported += 3;
            }
            // Import hazards based on industry using upsert
            if (industry === 'Electrical') {
                const hazards = [
                    { code: 'ELEC-001', name: 'Electric Shock', description: 'Contact with live conductors', category: 'Electrical', preControlRisk: 20, postControlRisk: 8 },
                    { code: 'ELEC-002', name: 'Arc Flash', description: 'Electrical arc explosion', category: 'Electrical', preControlRisk: 25, postControlRisk: 10 },
                    { code: 'HEIGHT-001', name: 'Falls from Height', description: 'Work above 2m', category: 'Heights', preControlRisk: 20, postControlRisk: 6 },
                ];
                for (const hazard of hazards) {
                    await prisma.hazard.upsert({
                        where: { code: hazard.code },
                        update: {},
                        create: hazard
                    });
                }
                results.hazardsImported += 3;
            }
            return results;
        }
        catch (err) {
            console.error('setupClientFramework failed', err);
            throw err;
        }
    });
    // ========================================
    // REPORTS
    // ========================================
    ipc.handle('report:buildClient', async (_e, filters) => {
        return await buildClientReport(filters, win);
    });
}

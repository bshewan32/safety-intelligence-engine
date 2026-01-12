// src/core/AssignmentEngine.js
// REFACTORED: Risk-aware with source tracking
// FIXED: Import Prisma client correctly
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const RISK_LEVELS = ['Critical', 'High', 'Medium', 'Low'];
export class AssignmentEngine {
    /**
     * Resolve worker ID from various input formats
     */
    static async _resolveWorkerId(workerRef) {
        if (typeof workerRef === 'string')
            return workerRef;
        const obj = typeof workerRef === 'object' ? workerRef : {};
        if (obj.workerId)
            return obj.workerId;
        if (obj.id)
            return obj.id;
        if (obj.employeeId) {
            const found = await prisma.worker.findUnique({
                where: { employeeId: obj.employeeId },
                select: { id: true }
            });
            return found?.id;
        }
        return undefined;
    }
    /**
     * Map numeric risk (1-25) to severity label
     */
    static _getRiskSeverity(riskValue) {
        if (!riskValue)
            return 'Low';
        if (riskValue >= 15)
            return 'Critical'; // 15-25
        if (riskValue >= 10)
            return 'High'; // 10-14
        if (riskValue >= 5)
            return 'Medium'; // 5-9
        return 'Low'; // 1-4
    }
    /**
     * Get highest severity from multiple values
     */
    static _maxSeverity(...severities) {
        const filtered = severities.filter(Boolean);
        if (filtered.length === 0)
            return 'Low';
        for (const level of RISK_LEVELS) {
            if (filtered.includes(level))
                return level;
        }
        return 'Low';
    }
    /**
     * REFACTORED: Recompute all required controls for a worker based on roles
     * NOW TRACKS: Why each control is required (hazard, severity, role)
     */
    static async recomputeWorker(workerRef, context = {}) {
        const workerId = await this._resolveWorkerId(workerRef);
        if (!workerId)
            throw new Error('recomputeWorker: missing worker id');
        const worker = await prisma.worker.findUnique({
            where: { id: workerId },
            include: { roles: { include: { role: true } } },
        });
        if (!worker) {
            console.log(`Worker ${workerId} not found - skipping`);
            return;
        }
        const roleNames = (worker.roles || []).map(r => r.role?.name).filter(Boolean);
        if (roleNames.length === 0) {
            console.log(`Worker ${workerId} has no roles - skipping`);
            return;
        }
        // Extract hazard categories from role activityPackage
        const relevantCategories = new Set();
        for (const workerRole of worker.roles || []) {
            const role = workerRole.role;
            if (!role)
                continue;
            // Try to parse activityPackage JSON
            if (role.activityPackage) {
                try {
                    const pkg = JSON.parse(role.activityPackage);
                    if (Array.isArray(pkg.hazardCategories)) {
                        pkg.hazardCategories.forEach(cat => relevantCategories.add(cat));
                    }
                }
                catch (e) {
                    console.warn(`Failed to parse activityPackage for role ${role.name}:`, e);
                }
            }
        }
        // Legacy fallback: if no categories found in activityPackage, use hardcoded map
        if (relevantCategories.size === 0) {
            console.log(`No hazard categories in activityPackage, using legacy mapping for roles: ${roleNames.join(', ')}`);
            const roleHazardMap = {
                Electrician: ['Electrical', 'Heights', 'Confined Space'],
                Scaffolder: ['Heights', 'Manual Handling', 'Structural'],
                Supervisor: ['Management', 'Electrical', 'Heights'],
                'General Labourer': ['Manual Handling', 'General'],
                Welder: ['Hot Work', 'Confined Space', 'PPE'],
            };
            roleNames.forEach(name => {
                const cats = roleHazardMap[name] || [];
                cats.forEach(cat => relevantCategories.add(cat));
            });
        }
        if (relevantCategories.size === 0) {
            console.log(`No hazard categories found for roles: ${roleNames.join(', ')}`);
            return;
        }
        const relevantCategoriesArray = Array.from(relevantCategories);
        // Base hazards from role categories (include HazardControl with linked control)
        const roleHazards = await prisma.hazard.findMany({
            where: { category: { in: relevantCategoriesArray } },
            include: {
                controls: {
                    include: { control: true },
                    orderBy: [{ priority: 'asc' }, { id: 'desc' }],
                },
            },
        });
        // TODO: Overlay hazards from client/site (future enhancement)
        const overlayHazards = await this.getOverlayHazards(context);
        const allHazards = [...roleHazards, ...overlayHazards];
        const primaryRole = roleNames[0];
        console.log(`Recomputing controls for ${worker.firstName ?? ''} ${worker.lastName ?? ''} [roles: ${roleNames.join(', ')}], hazards: ${allHazards.length}`);
        // ═══════════════════════════════════════════════════════════════════
        // NEW: Build control sources with risk tracking
        // ═══════════════════════════════════════════════════════════════════
        // Map: controlId → array of sources (hazards that require it)
        const controlSources = new Map();
        // Map: controlId → highest severity
        const controlSeverities = new Map();
        for (const hazard of allHazards) {
            // Get hazard severity from preControlRisk
            const hazardRiskValue = hazard.preControlRisk || 0;
            const hazardSeverity = this._getRiskSeverity(hazardRiskValue);
            for (const hc of hazard.controls ?? []) {
                if (!hc?.control?.id)
                    continue;
                const controlId = hc.control.id;
                // Find which role triggered this hazard
                const sourceRole = worker.roles.find(wr => {
                    const role = wr.role;
                    if (!role)
                        return false;
                    // Check activityPackage
                    if (role.activityPackage) {
                        try {
                            const pkg = JSON.parse(role.activityPackage);
                            if (Array.isArray(pkg.hazardCategories)) {
                                return pkg.hazardCategories.includes(hazard.category);
                            }
                        }
                        catch (e) {
                            // Ignore parse errors
                        }
                    }
                    // Legacy fallback
                    const roleHazardMap = {
                        Electrician: ['Electrical', 'Heights', 'Confined Space'],
                        Scaffolder: ['Heights', 'Manual Handling', 'Structural'],
                        Supervisor: ['Management', 'Electrical', 'Heights'],
                        'General Labourer': ['Manual Handling', 'General'],
                        Welder: ['Hot Work', 'Confined Space', 'PPE'],
                    };
                    const cats = roleHazardMap[role.name] || [];
                    return cats.includes(hazard.category);
                });
                // Create source entry
                const source = {
                    hazardId: hazard.id,
                    hazardName: hazard.name,
                    hazardCode: hazard.code,
                    severity: hazardSeverity,
                    role: sourceRole?.role?.name || primaryRole,
                    roleId: sourceRole?.roleId || worker.roles[0]?.roleId,
                    isMandatory: hc.isCritical || false,
                };
                // Add to sources map
                if (!controlSources.has(controlId)) {
                    controlSources.set(controlId, []);
                }
                controlSources.get(controlId).push(source);
                // Track highest severity for this control
                const currentMax = controlSeverities.get(controlId) || 'Low';
                controlSeverities.set(controlId, this._maxSeverity(currentMax, hazardSeverity));
            }
        }
        const requiredNow = new Set(controlSources.keys());
        console.log(`Required control count: ${requiredNow.size}`);
        // Get existing requirements for this worker
        const existing = await prisma.requiredControl.findMany({
            where: { workerId: worker.id },
            include: { control: true },
        });
        const existingByControl = new Map(existing.map(e => [e.controlId, e]));
        // ═══════════════════════════════════════════════════════════════════
        // NEW: Create/update RequiredControl rows with sources
        // ═══════════════════════════════════════════════════════════════════
        const toUpsert = [];
        for (const controlId of requiredNow) {
            const sources = controlSources.get(controlId);
            const severity = controlSeverities.get(controlId);
            toUpsert.push(prisma.requiredControl.upsert({
                where: {
                    workerId_controlId: {
                        workerId: worker.id,
                        controlId
                    }
                },
                update: {
                    // Update sources and severity on recompute
                    sources: JSON.stringify(sources),
                    severity: severity,
                },
                create: {
                    workerId: worker.id,
                    controlId,
                    status: 'Required',
                    dueDate: null,
                    sources: JSON.stringify(sources),
                    severity: severity,
                },
            }));
        }
        if (toUpsert.length) {
            await prisma.$transaction(toUpsert);
        }
        // Refresh required list after upserts
        const required = await prisma.requiredControl.findMany({
            where: { workerId: worker.id },
            include: { control: true },
        });
        // Evidence lookup: latest evidence per RequiredControl
        const latestMap = await this._latestEvidenceByRequired(required.map(r => r.id));
        // ═══════════════════════════════════════════════════════════════════
        // Update status/dueDate based on evidence; retire obsolete controls
        // ═══════════════════════════════════════════════════════════════════
        const ops = [];
        for (const rc of required) {
            const stillRequired = requiredNow.has(rc.controlId);
            if (!stillRequired) {
                // Keep Satisfied/Temporary (historical) but remove other states
                if (!['Satisfied', 'Temporary'].includes(rc.status)) {
                    ops.push(prisma.requiredControl.delete({ where: { id: rc.id } }));
                }
                continue;
            }
            // Determine status based on evidence
            const latestEv = latestMap.get(rc.id);
            let newStatus = 'Required';
            let newDueDate = null;
            if (latestEv) {
                if (latestEv.type === 'temporary_fix') {
                    newStatus = 'Temporary';
                    newDueDate = latestEv.expiryDate;
                }
                else if (latestEv.expiryDate) {
                    const now = new Date();
                    const expiry = new Date(latestEv.expiryDate);
                    const daysUntil = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    if (expiry < now) {
                        newStatus = 'Overdue';
                    }
                    else if (daysUntil <= 30) {
                        newStatus = 'Expiring';
                    }
                    else {
                        newStatus = 'Satisfied';
                    }
                    newDueDate = expiry;
                }
                else {
                    newStatus = 'Satisfied';
                }
            }
            ops.push(prisma.requiredControl.update({
                where: { id: rc.id },
                data: { status: newStatus, dueDate: newDueDate },
            }));
        }
        if (ops.length)
            await prisma.$transaction(ops);
        // ═══════════════════════════════════════════════════════════════════
        // NEW: Update worker status based on severity-aware gaps
        // ═══════════════════════════════════════════════════════════════════
        await this.updateWorkerStatus(workerId, { controlSeverities });
    }
    /**
     * NEW: Severity-aware worker status update
     * Restricts worker if they have missing Critical or High severity controls
     */
    static async updateWorkerStatus(workerId, options = {}) {
        const { controlSeverities } = options;
        const required = await prisma.requiredControl.findMany({
            where: { workerId },
            include: { control: true },
        });
        // Count gaps by severity
        const criticalGaps = [];
        const highGaps = [];
        for (const rc of required) {
            if (['Satisfied', 'Temporary'].includes(rc.status))
                continue;
            // Get severity from sources (or fall back to parsing sources JSON)
            let severity = rc.severity;
            if (!severity && rc.sources) {
                try {
                    const sources = JSON.parse(rc.sources);
                    const severities = sources.map(s => s.severity);
                    severity = this._maxSeverity(...severities);
                }
                catch (e) {
                    severity = 'Low';
                }
            }
            if (severity === 'Critical') {
                criticalGaps.push(rc);
            }
            else if (severity === 'High') {
                highGaps.push(rc);
            }
        }
        // Determine worker status
        let newStatus = 'active';
        if (criticalGaps.length > 0) {
            newStatus = 'restricted';
            console.log(`Worker ${workerId} restricted due to ${criticalGaps.length} critical gap(s)`);
        }
        else if (highGaps.length >= 3) {
            // Optional: Restrict if 3+ high severity gaps
            newStatus = 'restricted';
            console.log(`Worker ${workerId} restricted due to ${highGaps.length} high severity gap(s)`);
        }
        await prisma.worker.update({
            where: { id: workerId },
            data: { status: newStatus },
        });
    }
    /**
     * Latest evidence per RequiredControl
     */
    static async _latestEvidenceByRequired(requiredControlIds) {
        if (!requiredControlIds.length)
            return new Map();
        const allEvidence = await prisma.evidence.findMany({
            where: { requiredControlId: { in: requiredControlIds } },
            orderBy: { createdAt: 'desc' },
        });
        const map = new Map();
        for (const ev of allEvidence) {
            if (!map.has(ev.requiredControlId)) {
                map.set(ev.requiredControlId, ev);
            }
        }
        return map;
    }
    /**
     * Recompute all workers
     */
    static async recomputeAll() {
        const workers = await prisma.worker.findMany({ select: { id: true } });
        console.log(`Recomputing ${workers.length} workers...`);
        for (const w of workers) {
            try {
                await this.recomputeWorker(w.id);
            }
            catch (err) {
                console.error(`Failed to recompute worker ${w.id}:`, err);
            }
        }
        console.log('Recompute all complete');
    }
    /**
     * Get overlay hazards (client/site specific)
     * TODO: Implement when client-specific hazards are added
     */
    static async getOverlayHazards(context = {}) {
        // For now returns [] safely
        return [];
    }
    /**
     * Calculate due date for a control (if needed)
     */
    static async calculateDueDate(controlId) {
        const control = await prisma.control.findUnique({
            where: { id: controlId },
            select: { validityDays: true },
        });
        if (!control?.validityDays)
            return null;
        const now = new Date();
        const due = new Date(now.getTime() + control.validityDays * 24 * 60 * 60 * 1000);
        return due;
    }
    /**
     * Recompute by hazard (when hazard changes)
     */
    static async recomputeByHazard(hazardId) {
        // Find all workers with roles that include this hazard's category
        const hazard = await prisma.hazard.findUnique({
            where: { id: hazardId },
            select: { category: true },
        });
        if (!hazard)
            return;
        // This would require more complex logic - for now just recompute all
        await this.recomputeAll();
    }
}

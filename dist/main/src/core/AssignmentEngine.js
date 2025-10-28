// src/core/AssignmentEngine.js
import { prisma } from '../db/prisma.js';
export class AssignmentEngine {
    /** Utility: now */
    static _now() { return new Date(); }
    /**
     * Normalize worker reference into a concrete worker id.
     * Accepts: string id OR { workerId | id | employeeId }
     */
    static async _resolveWorkerId(ref) {
        if (!ref)
            return undefined;
        if (typeof ref === 'string')
            return ref;
        const obj = ref && typeof ref === 'object' ? ref : {};
        if (obj.workerId)
            return obj.workerId;
        if (obj.id)
            return obj.id;
        if (obj.employeeId) {
            const found = await prisma.worker.findUnique({ where: { employeeId: obj.employeeId }, select: { id: true } });
            return found?.id;
        }
        return undefined;
    }
    /**
     * Recompute all required controls for a worker based on their roles and optional context (client/site overlays)
     * Non-destructive: preserves Satisfied/Temporary states; deletes only obsolete Required/Overdue.
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
        // MVP Logic: role → hazard categories. Extend by merging overlay hazards below.
        const roleHazardMap = {
            Electrician: ['Electrical', 'Heights', 'Confined Space'],
            Scaffolder: ['Heights', 'Manual Handling', 'Structural'],
            Supervisor: ['Management', 'Electrical', 'Heights'],
            'General Labourer': ['Manual Handling', 'General'],
            Welder: ['Hot Work', 'Confined Space', 'PPE'],
        };
        const relevantCategories = Array.from(new Set(roleNames.flatMap(n => roleHazardMap[n] || [])));
        if (relevantCategories.length === 0) {
            console.log(`No hazard categories mapped for roles: ${roleNames.join(', ')}`);
            return;
        }
        // Base hazards from role categories (include HazardControl with linked control)
        const roleHazards = await prisma.hazard.findMany({
            where: { category: { in: relevantCategories } },
            include: {
                controls: {
                    include: { control: true },
                    orderBy: [{ priority: 'asc' }, { id: 'desc' }],
                },
            },
        });
        // Overlay hazards from client/site (future tables). For now returns [] safely.
        const overlayHazards = await this.getOverlayHazards(context);
        const allHazards = [...roleHazards, ...overlayHazards];
        const primaryRole = roleNames[0];
        console.log(`Recomputing controls for ${worker.firstName ?? ''} ${worker.lastName ?? ''} [roles: ${roleNames.join(', ')}], hazards: ${allHazards.length}`);
        // Collect unique control IDs required now and a set of critical controlIds
        const requiredNow = new Set();
        const criticalControlIds = new Set();
        for (const h of allHazards) {
            for (const hc of h.controls ?? []) {
                if (hc?.control?.id) {
                    requiredNow.add(hc.control.id);
                    if (hc.isCritical)
                        criticalControlIds.add(hc.control.id);
                }
            }
        }
        console.log(`Required control count: ${requiredNow.size} (critical: ${criticalControlIds.size})`);
        // Existing requirements for this worker
        const existing = await prisma.requiredControl.findMany({
            where: { workerId: worker.id },
            include: { control: true },
        });
        const existingByControl = new Map(existing.map(e => [e.controlId, e]));
        // Create any missing requirements (placeholder status; status will be finalized below)
        const toCreate = [];
        for (const controlId of requiredNow) {
            if (!existingByControl.has(controlId)) {
                toCreate.push(prisma.requiredControl.upsert({
                    where: { workerId_controlId: { workerId: worker.id, controlId } },
                    update: {},
                    create: { workerId: worker.id, controlId, status: 'Required', dueDate: null },
                }));
            }
        }
        if (toCreate.length)
            await prisma.$transaction(toCreate);
        // Refresh required list after potential creations
        const required = await prisma.requiredControl.findMany({
            where: { workerId: worker.id },
            include: { control: true },
        });
        // Evidence lookup: latest evidence per RequiredControl
        const latestMap = await this._latestEvidenceByRequired(required.map(r => r.id));
        // Update status/dueDate based on evidence & temp fixes; retire obsolete non-kept
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
            const latestEv = latestMap.get(rc.id);
            const { status, dueDate } = this._statusFromEvidence(rc, latestEv, rc.control);
            // Only send update if something actually changed
            const needsUpdate = status !== rc.status || Number((dueDate?.getTime() || 0)) !== Number((rc.dueDate?.getTime() || 0));
            if (needsUpdate) {
                ops.push(prisma.requiredControl.update({ where: { id: rc.id }, data: { status, dueDate } }));
            }
        }
        if (ops.length)
            await prisma.$transaction(ops);
        await this.updateWorkerStatus(worker.id, { criticalControlIds });
        console.log(`✓ Recompute complete for ${worker.firstName ?? ''} ${worker.lastName ?? ''} (${primaryRole})`);
    }
    /** Calculate due date for a control based on validity period */
    static async calculateDueDate(controlId) {
        const control = await prisma.control.findUnique({ where: { id: controlId } });
        if (!control?.validityDays)
            return null;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + control.validityDays);
        return dueDate;
    }
    /** Evidence → status helper */
    static _statusFromEvidence(rc, latestEv, control) {
        const now = this._now();
        // Temporary fix wins if still valid
        if (rc?.tempValidUntil && rc.tempValidUntil > now) {
            return { status: 'Temporary', dueDate: rc.tempValidUntil };
        }
        if (!latestEv) {
            // No evidence
            const due = control?.validityDays ? new Date(now.getTime() + control.validityDays * 24 * 60 * 60 * 1000) : null;
            return { status: 'Required', dueDate: due };
        }
        // If expiry present use it; else treat as perpetual until superseded
        const isExpired = latestEv.expiryDate ? latestEv.expiryDate <= now : false;
        if (isExpired) {
            return { status: 'Overdue', dueDate: latestEv.expiryDate ?? null };
        }
        return { status: 'Satisfied', dueDate: latestEv.expiryDate ?? null };
    }
    /** Latest evidence per RequiredControl id */
    static async _latestEvidenceByRequired(requiredIds) {
        if (!requiredIds || requiredIds.length === 0)
            return new Map();
        const rows = await prisma.evidence.findMany({
            where: { requiredControlId: { in: requiredIds } },
            orderBy: [{ issuedDate: 'desc' }, { createdAt: 'desc' }],
        });
        const map = new Map();
        for (const ev of rows) {
            if (!map.has(ev.requiredControlId))
                map.set(ev.requiredControlId, ev);
        }
        return map;
    }
    /** Update worker status based on compliance; critical controls influence status */
    static async updateWorkerStatus(workerId, { criticalControlIds = new Set() } = {}) {
        const req = await prisma.requiredControl.findMany({ where: { workerId } });
        if (req.length === 0) {
            await prisma.worker.update({ where: { id: workerId }, data: { status: 'active' } });
            return;
        }
        const covered = req.filter(rc => ['Satisfied', 'Temporary'].includes(rc.status)).length;
        const coverage = covered / req.length;
        const isCriticalMissing = req.some(rc => criticalControlIds.has(rc.controlId) && !['Satisfied', 'Temporary'].includes(rc.status));
        let newStatus = 'active';
        if (isCriticalMissing)
            newStatus = 'restricted';
        else if (coverage < 0.8)
            newStatus = 'restricted';
        await prisma.worker.update({ where: { id: workerId }, data: { status: newStatus } });
    }
    /** Fetch hazards from client/site overlays if implemented. MVP stub returns []. */
    static async getOverlayHazards({ clientId, siteId } = {}) {
        // TODO: when ClientHazard/SiteHazard tables exist, join them here and include controls.
        return [];
    }
    /** Recompute all workers */
    static async recomputeAll() {
        const workers = await prisma.worker.findMany({ where: { status: { not: 'inactive' } } });
        console.log(`Starting recompute for ${workers.length} workers...`);
        for (const worker of workers) {
            await this.recomputeWorker(worker.id);
        }
        console.log('✓ All workers recomputed');
    }
    /** Recompute a scoped set of workers impacted by a hazard (simple heuristic by category) */
    static async recomputeByHazard(hazardId) {
        const hazard = await prisma.hazard.findUnique({ where: { id: hazardId } });
        if (!hazard)
            return;
        const roleHazardMap = {
            Electrician: ['Electrical', 'Heights', 'Confined Space'],
            Scaffolder: ['Heights', 'Manual Handling', 'Structural'],
            Supervisor: ['Management', 'Electrical', 'Heights'],
            'General Labourer': ['Manual Handling', 'General'],
            Welder: ['Hot Work', 'Confined Space', 'PPE'],
        };
        const workers = await prisma.worker.findMany({ include: { roles: { include: { role: true } } } });
        const impacted = workers.filter(w => {
            const cats = new Set((w.roles || []).flatMap(r => roleHazardMap[r.role?.name] || []));
            return cats.has(hazard.category);
        });
        for (const w of impacted) {
            await this.recomputeWorker(w.id);
        }
    }
}

// src/core/AssignmentEngine.js
import { prisma } from '../db/prisma.js';
export class AssignmentEngine {
    /**
     * Recompute all required controls for a worker based on their role
     * This is the MVP version - assigns controls based on hazard category matching
     */
    static async recomputeWorker(workerId) {
        const worker = await prisma.worker.findUnique({
            where: { id: workerId },
            include: { role: true },
        });
        if (!worker?.role) {
            console.log(`Worker ${workerId} has no role assigned - skipping`);
            return;
        }
        console.log(`Recomputing controls for ${worker.firstName} ${worker.lastName} (${worker.role.name})`);
        // MVP Logic: Match role name to hazard categories
        // In production, you'd use the activityPackage JSON to be more sophisticated
        const roleHazardMap = {
            'Electrician': ['Electrical', 'Heights', 'Confined Space'],
            'Scaffolder': ['Heights', 'Manual Handling', 'Structural'],
            'Supervisor': ['Management', 'Electrical', 'Heights'],
            'General Labourer': ['Manual Handling', 'General'],
            'Welder': ['Hot Work', 'Confined Space', 'PPE'],
        };
        const relevantCategories = roleHazardMap[worker.role.name] || [];
        if (relevantCategories.length === 0) {
            console.log(`No hazard categories mapped for role: ${worker.role.name}`);
            return;
        }
        // Find all hazards matching these categories
        const hazards = await prisma.hazard.findMany({
            where: {
                category: { in: relevantCategories },
            },
            include: {
                controls: {
                    include: {
                        control: true,
                    },
                },
            },
        });
        console.log(`Found ${hazards.length} relevant hazards for ${worker.role.name}`);
        // Collect all unique controls from these hazards
        const controlIds = new Set();
        hazards.forEach(hazard => {
            hazard.controls.forEach(hc => {
                controlIds.add(hc.control.id);
            });
        });
        console.log(`Found ${controlIds.size} unique controls to assign`);
        // Create or update RequiredControl records
        for (const controlId of controlIds) {
            await prisma.requiredControl.upsert({
                where: {
                    workerId_controlId: {
                        workerId: worker.id,
                        controlId: controlId,
                    },
                },
                update: {
                // Don't overwrite status if it already exists
                // This preserves Satisfied/Temporary states
                },
                create: {
                    workerId: worker.id,
                    controlId: controlId,
                    status: 'Required',
                    dueDate: await this.calculateDueDate(controlId),
                },
            });
        }
        // Update worker status based on compliance
        await this.updateWorkerStatus(workerId);
        console.log(`✓ Recompute complete for ${worker.firstName} ${worker.lastName}`);
    }
    /**
     * Calculate due date for a control based on validity period
     */
    static async calculateDueDate(controlId) {
        const control = await prisma.control.findUnique({
            where: { id: controlId },
        });
        if (!control?.validityDays)
            return null;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + control.validityDays);
        return dueDate;
    }
    /**
     * Update worker status based on their control compliance
     */
    static async updateWorkerStatus(workerId) {
        const required = await prisma.requiredControl.findMany({
            where: { workerId },
        });
        const totalCount = required.length;
        const satisfiedCount = required.filter(rc => rc.status === 'Satisfied' || rc.status === 'Temporary').length;
        // If worker has 100% coverage (including temporary), mark as active
        // If below 80%, mark as restricted
        const complianceRate = totalCount > 0 ? satisfiedCount / totalCount : 1;
        let newStatus = 'active';
        if (complianceRate < 0.8) {
            newStatus = 'restricted';
        }
        await prisma.worker.update({
            where: { id: workerId },
            data: { status: newStatus },
        });
    }
    /**
     * Recompute all workers (useful for system-wide changes)
     */
    static async recomputeAll() {
        const workers = await prisma.worker.findMany({
            where: { status: { not: 'inactive' } },
        });
        console.log(`Starting recompute for ${workers.length} workers...`);
        for (const worker of workers) {
            await this.recomputeWorker(worker.id);
        }
        console.log(`✓ All workers recomputed`);
    }
    /**
     * Check if a worker needs recomputation (called after role change)
     */
    static async checkIfRecomputeNeeded(workerId, oldRoleId, newRoleId) {
        if (!oldRoleId || !newRoleId)
            return true;
        return oldRoleId !== newRoleId;
    }
}

// electron/gap-analysis.ts
// UPDATED: Risk-aware with GapAnalysisEngine class export (maintains API compatibility)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
/**
 * Parse sources from RequiredControl to extract severity and hazards
 */
function parseControlSources(sources) {
    if (!sources)
        return { severity: 'Low', hazards: [] };
    try {
        const parsed = JSON.parse(sources);
        if (!Array.isArray(parsed))
            return { severity: 'Low', hazards: [] };
        // Extract hazard names
        const hazards = parsed.map((s) => s.hazardName).filter(Boolean);
        // Get highest severity
        const severities = parsed.map((s) => s.severity).filter(Boolean);
        const severity = ['Critical', 'High', 'Medium', 'Low'].find(level => severities.includes(level)) || 'Low';
        return { severity, hazards, sources: parsed };
    }
    catch (e) {
        console.error('Failed to parse control sources:', e);
        return { severity: 'Low', hazards: [] };
    }
}
/**
 * Generate actionable recommendations based on gaps
 */
function generateRecommendations(gaps, summary) {
    const recommendations = [];
    // Critical gaps
    if (summary.criticalGaps > 0) {
        const criticalGaps = gaps.filter(g => g.riskLevel === 'Critical');
        const uniqueWorkers = new Set(criticalGaps.map(g => g.workerId)).size;
        recommendations.push({
            id: 'critical-gaps',
            type: 'missing_control',
            priority: 100,
            title: `${summary.criticalGaps} Critical Safety Gap${summary.criticalGaps > 1 ? 's' : ''}`,
            description: `${uniqueWorkers} worker${uniqueWorkers > 1 ? 's' : ''} cannot work safely due to missing critical controls`,
            affectedWorkers: uniqueWorkers,
            actions: [
                'Review critical gaps immediately',
                'Upload evidence or create temporary fixes',
                'Consider restricting workers until resolved',
            ],
        });
    }
    // Overdue controls
    if (summary.overdue > 0) {
        const overdueGaps = gaps.filter(g => g.status === 'Overdue');
        const uniqueWorkers = new Set(overdueGaps.map(g => g.workerId)).size;
        recommendations.push({
            id: 'overdue-controls',
            type: 'overdue_control',
            priority: 90,
            title: `${summary.overdue} Overdue Control${summary.overdue > 1 ? 's' : ''}`,
            description: `Evidence has expired for ${uniqueWorkers} worker${uniqueWorkers > 1 ? 's' : ''}`,
            affectedWorkers: uniqueWorkers,
            actions: [
                'Schedule renewals for expired controls',
                'Upload updated evidence',
                'Review worker operational status',
            ],
        });
    }
    // Expiring soon
    if (summary.expiringWithin30Days > 0) {
        const expiringGaps = gaps.filter(g => g.status === 'Expiring');
        const uniqueWorkers = new Set(expiringGaps.map(g => g.workerId)).size;
        recommendations.push({
            id: 'expiring-controls',
            type: 'expiring_evidence',
            priority: 70,
            title: `${summary.expiringWithin30Days} Control${summary.expiringWithin30Days > 1 ? 's' : ''} Expiring Soon`,
            description: `${uniqueWorkers} worker${uniqueWorkers > 1 ? 's' : ''} need${uniqueWorkers === 1 ? 's' : ''} renewal within 30 days`,
            affectedWorkers: uniqueWorkers,
            actions: [
                'Schedule renewals before expiry',
                'Send reminders to affected workers',
                'Plan for potential operational impact',
            ],
        });
    }
    return recommendations.sort((a, b) => b.priority - a.priority);
}
/**
 * GapAnalysisEngine class - maintains API compatibility
 */
export class GapAnalysisEngine {
    /**
     * Analyze compliance gaps for a client or worker
     */
    static async analyzeClient(clientId, workerId) {
        const where = {};
        if (workerId) {
            where.workerId = workerId;
        }
        else if (clientId) {
            // Get all workers for this client
            const workerRoles = await prisma.workerRole.findMany({
                where: { clientId },
                select: { workerId: true },
            });
            const workerIds = [...new Set(workerRoles.map(wr => wr.workerId))];
            if (workerIds.length > 0) {
                where.workerId = { in: workerIds };
            }
        }
        // Get all required controls with gaps
        const requiredControls = await prisma.requiredControl.findMany({
            where: {
                ...where,
                status: { in: ['Required', 'Overdue', 'Expiring'] },
            },
            include: {
                worker: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true,
                    },
                },
                control: {
                    select: {
                        id: true,
                        code: true,
                        title: true,
                        type: true,
                    },
                },
            },
        });
        // Build gaps with severity from sources
        const gaps = requiredControls.map((rc) => {
            const { severity, hazards, sources } = parseControlSources(rc.sources);
            let daysUntilDue = null;
            if (rc.dueDate) {
                const now = new Date();
                const due = new Date(rc.dueDate);
                daysUntilDue = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            }
            // Priority: Critical overdue = 100, Critical = 90, High overdue = 80, etc.
            let priority = 50;
            if (severity === 'Critical') {
                priority = rc.status === 'Overdue' ? 100 : 90;
            }
            else if (severity === 'High') {
                priority = rc.status === 'Overdue' ? 80 : 70;
            }
            else if (severity === 'Medium') {
                priority = rc.status === 'Overdue' ? 60 : 50;
            }
            else {
                priority = rc.status === 'Overdue' ? 40 : 30;
            }
            return {
                id: rc.id,
                workerId: rc.worker.id,
                workerName: `${rc.worker.firstName} ${rc.worker.lastName}`,
                controlId: rc.control.id,
                controlCode: rc.control.code,
                controlName: rc.control.title,
                controlType: rc.control.type,
                status: rc.status,
                riskLevel: severity,
                dueDate: rc.dueDate,
                daysUntilDue,
                hazards, // NEW: Hazard names from sources
                sources, // NEW: Full source objects
                priority,
            };
        });
        // Sort by priority
        gaps.sort((a, b) => b.priority - a.priority);
        // Calculate summary
        const summary = {
            totalGaps: gaps.length,
            criticalGaps: gaps.filter(g => g.riskLevel === 'Critical').length,
            highGaps: gaps.filter(g => g.riskLevel === 'High').length,
            mediumGaps: gaps.filter(g => g.riskLevel === 'Medium').length,
            lowGaps: gaps.filter(g => g.riskLevel === 'Low').length,
            expiringWithin30Days: gaps.filter(g => g.status === 'Expiring').length,
            overdue: gaps.filter(g => g.status === 'Overdue').length,
        };
        // Calculate coverage
        const totalRequired = await prisma.requiredControl.count({ where });
        const satisfied = await prisma.requiredControl.count({
            where: {
                ...where,
                status: { in: ['Satisfied', 'Temporary'] },
            },
        });
        // Coverage by criticality
        const allRequired = await prisma.requiredControl.findMany({
            where,
            select: { id: true, status: true, sources: true, severity: true },
        });
        const countBySeverity = {
            critical: { total: 0, satisfied: 0 },
            high: { total: 0, satisfied: 0 },
            medium: { total: 0, satisfied: 0 },
            low: { total: 0, satisfied: 0 },
        };
        for (const rc of allRequired) {
            // Use severity field if available, otherwise parse sources
            let severity = rc.severity;
            if (!severity && rc.sources) {
                const { severity: parsedSeverity } = parseControlSources(rc.sources);
                severity = parsedSeverity;
            }
            severity = severity || 'Low';
            const key = severity.toLowerCase();
            if (countBySeverity[key]) {
                countBySeverity[key].total++;
                if (['Satisfied', 'Temporary'].includes(rc.status)) {
                    countBySeverity[key].satisfied++;
                }
            }
        }
        const coverage = {
            overall: totalRequired > 0 ? Math.round((satisfied / totalRequired) * 100) : 100,
            byCriticality: {
                critical: countBySeverity.critical.total > 0
                    ? Math.round((countBySeverity.critical.satisfied / countBySeverity.critical.total) * 100)
                    : 100,
                high: countBySeverity.high.total > 0
                    ? Math.round((countBySeverity.high.satisfied / countBySeverity.high.total) * 100)
                    : 100,
                medium: countBySeverity.medium.total > 0
                    ? Math.round((countBySeverity.medium.satisfied / countBySeverity.medium.total) * 100)
                    : 100,
                low: countBySeverity.low.total > 0
                    ? Math.round((countBySeverity.low.satisfied / countBySeverity.low.total) * 100)
                    : 100,
            },
        };
        // Generate recommendations
        const recommendations = generateRecommendations(gaps, summary);
        return {
            summary,
            gaps,
            coverage,
            recommendations,
        };
    }
    /**
     * Analyze worker-specific gaps
     */
    static async analyzeWorker(workerId) {
        return this.analyzeClient(undefined, workerId);
    }
}

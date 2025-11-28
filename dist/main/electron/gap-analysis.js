// electron/gap-analysis.ts
// Gap Analysis Engine - The Intelligence Layer
// FIXED VERSION with proper Prisma types
import { prisma } from '../src/db/prisma.js';
export class GapAnalysisEngine {
    /**
     * Analyze gaps for a specific client
     */
    static async analyzeClient(clientId) {
        // Get all workers for this client with their required controls
        const workers = await prisma.worker.findMany({
            where: {
                roles: {
                    some: {
                        clientId,
                        OR: [
                            { endAt: null },
                            { endAt: { gt: new Date() } }
                        ]
                    }
                }
            },
            include: {
                required: {
                    where: {
                        status: { in: ['Required', 'Overdue', 'Temporary'] }
                    },
                    include: {
                        control: true,
                        evidence: {
                            where: { status: 'Valid' },
                            orderBy: { issuedDate: 'desc' },
                            take: 1
                        }
                    }
                }
            }
        });
        const gaps = [];
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        // Analyze each worker's required controls
        for (const worker of workers) {
            for (const rc of worker.required) {
                // Check if this is a gap
                const isGap = rc.status === 'Required' || rc.status === 'Overdue';
                const latestEvidence = rc.evidence[0];
                const isExpiring = latestEvidence?.expiryDate
                    && new Date(latestEvidence.expiryDate) <= thirtyDaysFromNow;
                if (isGap || isExpiring) {
                    // Get hazards for this control
                    const hazardControls = await prisma.hazardControl.findMany({
                        where: { controlId: rc.control.id },
                        include: { hazard: true }
                    });
                    // Determine risk level from associated hazards
                    const riskLevel = this.determineRiskLevel(hazardControls);
                    // Calculate days until due
                    let daysUntilDue = null;
                    if (rc.dueDate) {
                        daysUntilDue = Math.floor((new Date(rc.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    }
                    else if (latestEvidence?.expiryDate) {
                        daysUntilDue = Math.floor((new Date(latestEvidence.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    }
                    // Determine status
                    let status;
                    if (rc.status === 'Overdue') {
                        status = 'Overdue';
                    }
                    else if (isExpiring) {
                        status = 'Expiring';
                    }
                    else {
                        status = 'Required';
                    }
                    gaps.push({
                        id: rc.id,
                        workerId: worker.id,
                        workerName: `${worker.firstName} ${worker.lastName}`,
                        controlId: rc.control.id,
                        controlCode: rc.control.code,
                        controlName: rc.control.title,
                        controlType: rc.control.type,
                        status,
                        riskLevel,
                        dueDate: rc.dueDate,
                        daysUntilDue,
                        hazards: hazardControls.map(hc => hc.hazard.name),
                        priority: this.calculatePriority(riskLevel, daysUntilDue, status)
                    });
                }
            }
        }
        // Sort gaps by priority (highest first)
        gaps.sort((a, b) => b.priority - a.priority);
        // Calculate summary stats
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
        const coverage = await this.calculateCoverage(clientId, gaps);
        // Generate recommendations
        const recommendations = this.generateRecommendations(gaps);
        return {
            summary,
            gaps,
            coverage,
            recommendations
        };
    }
    /**
     * Analyze gaps for a specific worker
     */
    static async analyzeWorker(workerId) {
        const worker = await prisma.worker.findUnique({
            where: { id: workerId },
            include: {
                required: {
                    where: {
                        status: { in: ['Required', 'Overdue', 'Temporary'] }
                    },
                    include: {
                        control: true,
                        evidence: {
                            where: { status: 'Valid' },
                            orderBy: { issuedDate: 'desc' },
                            take: 1
                        }
                    }
                }
            }
        });
        if (!worker) {
            throw new Error('Worker not found');
        }
        const gaps = [];
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        for (const rc of worker.required) {
            const isGap = rc.status === 'Required' || rc.status === 'Overdue';
            const latestEvidence = rc.evidence[0];
            const isExpiring = latestEvidence?.expiryDate
                && new Date(latestEvidence.expiryDate) <= thirtyDaysFromNow;
            if (isGap || isExpiring) {
                // Get hazards for this control
                const hazardControls = await prisma.hazardControl.findMany({
                    where: { controlId: rc.control.id },
                    include: { hazard: true }
                });
                const riskLevel = this.determineRiskLevel(hazardControls);
                let daysUntilDue = null;
                if (rc.dueDate) {
                    daysUntilDue = Math.floor((new Date(rc.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                }
                else if (latestEvidence?.expiryDate) {
                    daysUntilDue = Math.floor((new Date(latestEvidence.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                }
                let status;
                if (rc.status === 'Overdue') {
                    status = 'Overdue';
                }
                else if (isExpiring) {
                    status = 'Expiring';
                }
                else {
                    status = 'Required';
                }
                gaps.push({
                    id: rc.id,
                    workerId: worker.id,
                    workerName: `${worker.firstName} ${worker.lastName}`,
                    controlId: rc.control.id,
                    controlCode: rc.control.code,
                    controlName: rc.control.title,
                    controlType: rc.control.type,
                    status,
                    riskLevel,
                    dueDate: rc.dueDate,
                    daysUntilDue,
                    hazards: hazardControls.map(hc => hc.hazard.name),
                    priority: this.calculatePriority(riskLevel, daysUntilDue, status)
                });
            }
        }
        gaps.sort((a, b) => b.priority - a.priority);
        const summary = {
            totalGaps: gaps.length,
            criticalGaps: gaps.filter(g => g.riskLevel === 'Critical').length,
            highGaps: gaps.filter(g => g.riskLevel === 'High').length,
            mediumGaps: gaps.filter(g => g.riskLevel === 'Medium').length,
            lowGaps: gaps.filter(g => g.riskLevel === 'Low').length,
            expiringWithin30Days: gaps.filter(g => g.status === 'Expiring').length,
            overdue: gaps.filter(g => g.status === 'Overdue').length,
        };
        // For single worker, coverage is simpler
        const totalRequired = worker.required.length;
        const satisfied = await prisma.requiredControl.count({
            where: {
                workerId: worker.id,
                status: 'Satisfied'
            }
        });
        const coverage = {
            overall: totalRequired > 0 ? Math.round((satisfied / totalRequired) * 100) : 100,
            byCriticality: {
                critical: 100, // Simplified for now
                high: 100,
                medium: 100,
                low: 100,
            }
        };
        const recommendations = this.generateRecommendations(gaps);
        return {
            summary,
            gaps,
            coverage,
            recommendations
        };
    }
    /**
     * Determine risk level from hazard associations
     */
    static determineRiskLevel(hazardControls) {
        if (hazardControls.length === 0)
            return 'Low';
        // Get the highest risk from associated hazards
        const maxRisk = Math.max(...hazardControls.map((hc) => hc.hazard.preControlRisk));
        if (maxRisk >= 9)
            return 'Critical';
        if (maxRisk >= 7)
            return 'High';
        if (maxRisk >= 4)
            return 'Medium';
        return 'Low';
    }
    /**
     * Calculate priority score (1-100)
     */
    static calculatePriority(riskLevel, daysUntilDue, status) {
        // Base score by risk level
        let score = 0;
        switch (riskLevel) {
            case 'Critical':
                score = 90;
                break;
            case 'High':
                score = 70;
                break;
            case 'Medium':
                score = 50;
                break;
            case 'Low':
                score = 30;
                break;
        }
        // Boost for overdue
        if (status === 'Overdue') {
            score += 10;
        }
        // Boost for expiring soon
        if (daysUntilDue !== null && daysUntilDue < 30) {
            score += Math.max(0, 10 - Math.floor(daysUntilDue / 3));
        }
        return Math.min(100, score);
    }
    /**
     * Calculate coverage statistics
     */
    static async calculateCoverage(clientId, gaps) {
        // Get total required controls for client
        const totalRequired = await prisma.requiredControl.count({
            where: {
                worker: {
                    roles: {
                        some: {
                            clientId,
                            OR: [
                                { endAt: null },
                                { endAt: { gt: new Date() } }
                            ]
                        }
                    }
                }
            }
        });
        const satisfied = await prisma.requiredControl.count({
            where: {
                worker: {
                    roles: {
                        some: {
                            clientId,
                            OR: [
                                { endAt: null },
                                { endAt: { gt: new Date() } }
                            ]
                        }
                    }
                },
                status: 'Satisfied'
            }
        });
        const overall = totalRequired > 0 ? Math.round((satisfied / totalRequired) * 100) : 100;
        // Calculate by criticality (simplified approximation)
        const criticalGaps = gaps.filter(g => g.riskLevel === 'Critical').length;
        const highGaps = gaps.filter(g => g.riskLevel === 'High').length;
        const mediumGaps = gaps.filter(g => g.riskLevel === 'Medium').length;
        const lowGaps = gaps.filter(g => g.riskLevel === 'Low').length;
        const totalByLevel = {
            critical: Math.max(1, criticalGaps + Math.floor(satisfied / 4)),
            high: Math.max(1, highGaps + Math.floor(satisfied / 4)),
            medium: Math.max(1, mediumGaps + Math.floor(satisfied / 4)),
            low: Math.max(1, lowGaps + Math.floor(satisfied / 4)),
        };
        return {
            overall,
            byCriticality: {
                critical: Math.round(((totalByLevel.critical - criticalGaps) / totalByLevel.critical) * 100),
                high: Math.round(((totalByLevel.high - highGaps) / totalByLevel.high) * 100),
                medium: Math.round(((totalByLevel.medium - mediumGaps) / totalByLevel.medium) * 100),
                low: Math.round(((totalByLevel.low - lowGaps) / totalByLevel.low) * 100),
            }
        };
    }
    /**
     * Generate actionable recommendations
     */
    static generateRecommendations(gaps) {
        const recommendations = [];
        // Critical gaps recommendation
        const criticalGaps = gaps.filter(g => g.riskLevel === 'Critical');
        if (criticalGaps.length > 0) {
            const uniqueWorkers = new Set(criticalGaps.map(g => g.workerId)).size;
            recommendations.push({
                id: 'critical-gaps',
                type: 'missing_control',
                priority: 100,
                title: `${criticalGaps.length} Critical Safety Gaps Detected`,
                description: `${uniqueWorkers} worker(s) have critical safety controls missing or expired. Immediate action required.`,
                affectedWorkers: uniqueWorkers,
                actions: [
                    'Review critical gaps immediately',
                    'Assign temporary fixes if needed',
                    'Schedule training or evidence collection',
                    'Consider work restrictions until resolved'
                ]
            });
        }
        // Expiring evidence recommendation
        const expiring = gaps.filter(g => g.status === 'Expiring');
        if (expiring.length > 0) {
            const uniqueWorkers = new Set(expiring.map(g => g.workerId)).size;
            recommendations.push({
                id: 'expiring-evidence',
                type: 'expiring_evidence',
                priority: 80,
                title: `${expiring.length} Controls Expiring Within 30 Days`,
                description: `${uniqueWorkers} worker(s) have evidence expiring soon. Schedule renewals now to prevent gaps.`,
                affectedWorkers: uniqueWorkers,
                actions: [
                    'Schedule refresher training',
                    'Book assessment dates',
                    'Send renewal reminders to workers',
                    'Update calendar with renewal deadlines'
                ]
            });
        }
        // Overdue recommendation
        const overdue = gaps.filter(g => g.status === 'Overdue');
        if (overdue.length > 0) {
            const uniqueWorkers = new Set(overdue.map(g => g.workerId)).size;
            recommendations.push({
                id: 'overdue-controls',
                type: 'overdue_control',
                priority: 95,
                title: `${overdue.length} Overdue Controls`,
                description: `${uniqueWorkers} worker(s) have overdue controls. These workers may need work restrictions.`,
                affectedWorkers: uniqueWorkers,
                actions: [
                    'Implement work restrictions if applicable',
                    'Contact workers to schedule updates',
                    'Apply temporary fixes if work must continue',
                    'Escalate to management if unresolved'
                ]
            });
        }
        // Sort by priority
        recommendations.sort((a, b) => b.priority - a.priority);
        return recommendations;
    }
}

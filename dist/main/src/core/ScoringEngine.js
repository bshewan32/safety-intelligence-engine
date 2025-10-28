/**
 * Risk-Based Control Score (RBCS) Calculator
 */
class ScoringEngine {
    constructor(db) {
        this.db = db;
        this.weights = {
            coverage: 0.40,
            quality: 0.25,
            effectiveness: 0.25,
            velocity: 0.10,
        };
    }
    /**
     * Calculate RBCS for a worker
     */
    async calculateWorkerScore(workerId) {
        const required = await this.getRequiredControls(workerId);
        const evidence = await this.getWorkerEvidence(workerId);
        const coverage = this.calculateCoverage(required, evidence);
        const quality = this.calculateQuality(evidence);
        const effectiveness = await this.calculateEffectiveness(workerId);
        const velocity = await this.calculateVelocity(workerId);
        const rbcs = (this.weights.coverage * coverage +
            this.weights.quality * quality +
            this.weights.effectiveness * effectiveness +
            this.weights.velocity * velocity) * 100;
        return {
            rbcs: Math.round(rbcs),
            coverage: Math.round(coverage * 100),
            quality: Math.round(quality * 100),
            effectiveness: Math.round(effectiveness * 100),
            velocity: Math.round(velocity * 100),
        };
    }
    /**
     * Calculate coverage score (required vs implemented)
     */
    calculateCoverage(required, evidence) {
        if (required.length === 0)
            return 1;
        const implementedCount = required.filter(req => {
            return evidence.some(ev => ev.control_id === req.control_id &&
                ev.status === 'valid');
        }).length;
        return implementedCount / required.length;
    }
    /**
     * Calculate quality score (valid evidence)
     */
    calculateQuality(evidence) {
        if (evidence.length === 0)
            return 1;
        const validCount = evidence.filter(ev => {
            if (!ev.expiry_date)
                return ev.status === 'valid';
            return ev.status === 'valid' && new Date(ev.expiry_date) > new Date();
        }).length;
        return validCount / evidence.length;
    }
    /**
     * Calculate effectiveness (incident-based)
     */
    async calculateEffectiveness(workerId) {
        // TODO: Implement incident rate calculation
        // For now, return baseline
        return 0.85;
    }
    /**
     * Calculate velocity (action closure speed)
     */
    async calculateVelocity(workerId) {
        // TODO: Implement action velocity calculation
        return 0.80;
    }
    async getRequiredControls(workerId) {
        // TODO: Implement via AssignmentEngine
        return [];
    }
    async getWorkerEvidence(workerId) {
        const sql = `
      SELECT * FROM evidence 
      WHERE worker_id = ? 
      ORDER BY created_at DESC
    `;
        return await this.db.query(sql, [workerId]);
    }
}
export default ScoringEngine;

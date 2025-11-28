import { GapAnalysisEngine } from './gap-analysis.js';
export function registerGapAnalysisHandlers(ipc) {
    // Get gap analysis for a client
    ipc.handle('db:analyzeClientGaps', async (_e, clientId) => {
        try {
            console.log('[Gap Analysis] Analyzing client:', clientId);
            const result = await GapAnalysisEngine.analyzeClient(clientId);
            console.log('[Gap Analysis] Found', result.summary.totalGaps, 'gaps');
            return result;
        }
        catch (error) {
            console.error('[Gap Analysis] Failed to analyze client gaps:', error);
            throw error;
        }
    });
    // Get gap analysis for a worker
    ipc.handle('db:analyzeWorkerGaps', async (_e, workerId) => {
        try {
            console.log('[Gap Analysis] Analyzing worker:', workerId);
            const result = await GapAnalysisEngine.analyzeWorker(workerId);
            console.log('[Gap Analysis] Worker has', result.summary.totalGaps, 'gaps');
            return result;
        }
        catch (error) {
            console.error('[Gap Analysis] Failed to analyze worker gaps:', error);
            throw error;
        }
    });
    // Get quick gap summary (for dashboard)
    ipc.handle('db:getGapSummary', async (_e, clientId) => {
        try {
            if (clientId) {
                console.log('[Gap Analysis] Getting summary for client:', clientId);
                const analysis = await GapAnalysisEngine.analyzeClient(clientId);
                return analysis.summary;
            }
            else {
                console.log('[Gap Analysis] Getting global summary');
                // TODO: Implement global gap summary across all clients
                return {
                    totalGaps: 0,
                    criticalGaps: 0,
                    highGaps: 0,
                    mediumGaps: 0,
                    lowGaps: 0,
                    expiringWithin30Days: 0,
                    overdue: 0,
                };
            }
        }
        catch (error) {
            console.error('[Gap Analysis] Failed to get gap summary:', error);
            throw error;
        }
    });
    console.log('[IPC] Gap Analysis handlers registered');
}

// /electron/ipc-training.ts
// Add these handlers to your main ipc.ts file

import type { IpcMain } from 'electron';
import { dialog } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { prisma } from '../src/db/prisma.js';
import { matchTrainingToControl, matchWorkerByName } from './matching-algorithm.js';
import { AssignmentEngine } from '../src/core/AssignmentEngine.js';

export function handleTrainingIPC(ipc: IpcMain) {
  
  // ========================================
  // CSV PARSING
  // ========================================
  
  ipc.handle('file:selectFile', async (_e, options?: { filters?: any[] }) => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: options?.filters || [
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }

      return {
        path: result.filePaths[0],
        name: path.basename(result.filePaths[0])
      };
    } catch (error) {
      console.error('File select failed:', error);
      throw error;
    }
  });

  ipc.handle('api:parseCSV', async (_e, filePath: string) => {
    try {
      // For now, use a simple CSV parser
      // In production, you might want to use papaparse or similar
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }

      // Parse headers
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      
      // Parse data rows
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row: any = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });
        return row;
      });

      return { headers, data };
    } catch (error: any) {
      console.error('CSV parse failed:', error);
      throw new Error(`Failed to parse CSV: ${error.message}`);
    }
  });

  // Handle Excel files (XLSX)
  ipc.handle('api:parseExcel', async (_e, filePath: string) => {
    try {
      // This is a placeholder - in production you'd use a library like 'xlsx'
      // For MVP, we'll just handle CSV files
      throw new Error('Excel parsing not yet implemented. Please convert to CSV.');
    } catch (error: any) {
      console.error('Excel parse failed:', error);
      throw error;
    }
  });

  // ========================================
  // SMART MATCHING
  // ========================================

  ipc.handle('api:performSmartMatching', async (_e, payload: {
    trainingNames: string[];
    workerNames: string[];
    clientId?: string;
  }) => {
    try {
      const { trainingNames, workerNames, clientId } = payload;

      // Fetch all controls
      const controls = await prisma.control.findMany({
        select: { id: true, title: true, code: true, type: true }
      });

      // Fetch all workers (optionally filtered by client)
      const workers = await prisma.worker.findMany({
        select: { id: true, firstName: true, lastName: true, employeeId: true },
        ...(clientId && {
          where: {
            roles: {
              some: { clientId }
            }
          }
        })
      });

      // Fetch existing training mappings (for learning)
      const existingMappings = await prisma.trainingMapping.findMany({
        select: { trainingName: true, controlId: true, confidence: true }
      });

      // Match training names to controls
      const trainingMatches = trainingNames.map(trainingName => {
        const match = matchTrainingToControl(trainingName, controls, existingMappings);
        return {
          trainingName,
          controlId: match?.id || null,
          controlTitle: match?.title || 'No Match',
          confidence: match?.confidence || 0,
          reason: match?.reason || 'No similar control found',
          manualSelection: false,
        };
      });

      // Match worker names to database workers
      const workerMatches = workerNames.map(csvName => {
        const match = matchWorkerByName(csvName, workers);
        return {
          csvName,
          workerId: match?.workerId || null,
          workerFullName: match?.fullName || 'Not Found',
          confidence: match?.confidence || 0,
        };
      });

      return {
        trainingMatches,
        workerMatches,
        availableControls: controls,
        availableWorkers: workers.map(w => ({
          id: w.id,
          name: `${w.firstName} ${w.lastName}`,
          employeeId: w.employeeId,
        })),
      };
    } catch (error) {
      console.error('Smart matching failed:', error);
      throw error;
    }
  });

  // ========================================
  // BULK IMPORT
  // ========================================

  ipc.handle('api:importTrainingRecords', async (_e, payload: {
    trainingMatches: Array<{
      trainingName: string;
      controlId: string | null;
      controlTitle: string;
      confidence: number;
      manualSelection?: boolean;
    }>;
    workerMatches: Array<{
      csvName: string;
      workerId: string | null;
      workerFullName: string;
      confidence: number;
    }>;
    parsedRows: Array<{
      workerName: string;
      trainingName: string;
      issuedDate: string;
      expiryDate?: string;
      notes?: string;
    }>;
  }) => {
    try {
      const { trainingMatches, workerMatches, parsedRows } = payload;

      // Create lookup maps
      const trainingMap = new Map(
        trainingMatches
          .filter(tm => tm.controlId)
          .map(tm => [tm.trainingName, tm])
      );
      
      const workerMap = new Map(
        workerMatches
          .filter(wm => wm.workerId)
          .map(wm => [wm.csvName, wm])
      );

      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];
      const impactedWorkers = new Set<string>();

      // Process each row
      for (const row of parsedRows) {
        try {
          // Find matches
          const trainingMatch = trainingMap.get(row.trainingName);
          const workerMatch = workerMap.get(row.workerName);

          if (!trainingMatch || !workerMatch) {
            skipped++;
            continue;
          }

          const { controlId } = trainingMatch;
          const { workerId } = workerMatch;

          // Skip if either is null
          if (!controlId || !workerId) {
            skipped++;
            continue;
          }

          // Parse dates
          const issuedDate = new Date(row.issuedDate);
          const expiryDate = row.expiryDate ? new Date(row.expiryDate) : null;

          // Ensure RequiredControl exists
          const requiredControl = await prisma.requiredControl.upsert({
            where: {
              workerId_controlId: {
                workerId,
                controlId,
              },
            },
            update: {},
            create: {
              workerId,
              controlId,
              status: 'Required',
              dueDate: null,
            },
          });

          // Create evidence
          await prisma.evidence.create({
            data: {
              requiredControlId: requiredControl.id,
              type: 'Training',
              status: 'Valid',
              issuedDate,
              expiryDate,
              notes: row.notes || null,
            },
          });

          // Save mapping for learning (upsert to avoid duplicates)
          await prisma.trainingMapping.upsert({
            where: {
              trainingName_controlId: {
                trainingName: row.trainingName,
                controlId,
              },
            },
            update: {
              confidence: Math.max(trainingMatch.confidence, 90), // Boost confidence when user confirms
              source: trainingMatch.manualSelection ? 'user' : 'algorithm',
            },
            create: {
              trainingName: row.trainingName,
              controlId,
              confidence: trainingMatch.manualSelection ? 100 : trainingMatch.confidence,
              source: trainingMatch.manualSelection ? 'user' : 'algorithm',
            },
          });

          imported++;
          impactedWorkers.add(workerId);
        } catch (err: any) {
          console.error('Failed to import row:', row, err);
          errors.push(`${row.workerName} - ${row.trainingName}: ${err.message}`);
          skipped++;
        }
      }

      // Recompute all impacted workers
      for (const workerId of impactedWorkers) {
        try {
          await AssignmentEngine.recomputeWorker(workerId);
        } catch (err) {
          console.warn('Recompute failed for worker', workerId, err);
        }
      }

      return {
        success: true,
        imported,
        skipped,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error: any) {
      console.error('Bulk import failed:', error);
      return {
        success: false,
        error: error.message,
        imported: 0,
        skipped: 0,
      };
    }
  });
}

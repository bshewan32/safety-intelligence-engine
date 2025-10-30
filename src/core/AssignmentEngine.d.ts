export class AssignmentEngine {
  static recomputeWorker(workerRef: string | any, context?: any): Promise<void>;
  static recomputeAll(): Promise<void>;
  static recomputeByHazard(hazardId: string): Promise<void>;
  static calculateDueDate(controlId: string): Promise<Date | null>;
  static updateWorkerStatus(workerId: string, options?: { criticalControlIds?: Set<string> }): Promise<void>;
  static getOverlayHazards(context?: { clientId?: string; siteId?: string }): Promise<any[]>;
}
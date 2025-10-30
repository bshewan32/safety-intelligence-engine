// Add these type definitions to your existing src/types/window.d.ts file

export interface Window {
  api: {
    // ... your existing methods ...

    // Training Importer Methods
    parseCSV: (filePath: string) => Promise<{
      headers: string[];
      data: any[];
    }>;
    
    parseExcel: (filePath: string) => Promise<{
      headers: string[];
      data: any[];
    }>;

    selectFile: (options?: {
      filters?: Array<{ name: string; extensions: string[] }>;
    }) => Promise<{
      path: string;
      name: string;
    } | null>;

    performSmartMatching: (payload: {
      trainingNames: string[];
      workerNames: string[];
      clientId?: string;
    }) => Promise<{
      trainingMatches: Array<{
        trainingName: string;
        controlId: string | null;
        controlTitle: string;
        confidence: number;
        reason: string;
        manualSelection: boolean;
      }>;
      workerMatches: Array<{
        csvName: string;
        workerId: string | null;
        workerFullName: string;
        confidence: number;
      }>;
      availableControls: Array<{
        id: string;
        title: string;
        code: string;
        type: string;
      }>;
      availableWorkers: Array<{
        id: string;
        name: string;
        employeeId: string;
      }>;
    }>;

    importTrainingRecords: (payload: {
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
    }) => Promise<{
      success: boolean;
      imported: number;
      skipped: number;
      errors?: string[];
      error?: string;
    }>;
  };
}

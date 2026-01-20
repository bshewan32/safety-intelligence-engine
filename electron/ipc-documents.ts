import { IpcMainInvokeEvent } from 'electron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DocumentImportPayload {
  documents: Array<{
    documentName: string;
    documentType: string;
    filePath: string;
    version?: string;
    issuedDate?: string;
    expiryDate?: string;
    notes?: string;
    controlId?: string | null;
    clientId?: string | null;
  }>;
}

export function handleDocumentIPC(ipcMain: any) {
  
  // Match documents to controls using fuzzy matching + metadata
  ipcMain.handle(
    'documents:matchToControls',
    async (
      _event: IpcMainInvokeEvent,
      documents: Array<{ documentName: string; documentType: string }>
    ) => {
      const controls = await prisma.control.findMany({
        where: { type: 'Document' }
      });

      const matches = documents.map(doc => {
        return matchDocumentToControl(doc.documentName, doc.documentType, controls);
      });

      return matches;
    }
  );

  // Import documents and create Document + DocumentControlMapping records
  ipcMain.handle(
    'documents:import',
    async (_event: IpcMainInvokeEvent, payload: DocumentImportPayload) => {
      const { documents } = payload;
      const results = [];

      for (const doc of documents) {
        // Create Document record
        const created = await prisma.document.create({
          data: {
            name: doc.documentName,
            type: doc.documentType,
            filePath: doc.filePath,
            version: doc.version,
            issuedDate: doc.issuedDate ? new Date(doc.issuedDate) : new Date(),
            expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
            clientId: doc.clientId,
            status: 'Active',
            notes: doc.notes
          }
        });

        // If matched to a control, create DocumentControlMapping
        if (doc.controlId) {
          await prisma.documentControlMapping.create({
            data: {
              documentId: created.id,
              controlId: doc.controlId,
              isMandatory: true,
              relevance: 'Primary'
            }
          });

          // Save to learning system
          await prisma.documentMapping.upsert({
            where: {
              documentName_documentType_controlId: {
                documentName: doc.documentName,
                documentType: doc.documentType,
                controlId: doc.controlId
              }
            },
            update: {
              confidence: 100,
              source: 'user'
            },
            create: {
              documentName: doc.documentName,
              documentType: doc.documentType,
              controlId: doc.controlId,
              confidence: 100,
              source: 'user',
              matchMethod: 'user_confirmed'
            }
          });
        }

        results.push(created);
      }

      return { imported: results.length, documents: results };
    }
  );
}

// Helper function for matching
function matchDocumentToControl(
  documentName: string,
  documentType: string,
  controls: any[]
) {
  let bestMatch = {
    documentName,
    documentType,
    controlId: null as string | null,
    controlTitle: 'No match found',
    confidence: 0,
    reason: 'No suitable control found'
  };

  for (const control of controls) {
    let score = 0;
    const reasons: string[] = [];

    // Parse metadata
    let metadata: any = {};
    try {
      if (control.metadata) {
        metadata = JSON.parse(control.metadata);
      }
    } catch (e) {
      // Skip if metadata can't be parsed
      continue;
    }

    const expectedDocTypes = metadata.expectedDocTypes || [];
    const keywords = metadata.keywords || [];

    // 1. Document Type Match (40 points)
    if (expectedDocTypes.length > 0) {
      const typeMatch = expectedDocTypes.some((type: string) =>
        documentType.toLowerCase().includes(type.toLowerCase()) ||
        type.toLowerCase().includes(documentType.toLowerCase())
      );

      if (typeMatch) {
        score += 40;
        reasons.push(`Type: ${documentType}`);
      }
    }

    // 2. Keyword Match (up to 40 points)
    const docNameLower = documentName.toLowerCase();
    const matchedKeywords = keywords.filter((kw: string) =>
      docNameLower.includes(kw.toLowerCase())
    );

    if (matchedKeywords.length > 0) {
      const keywordScore = Math.min(matchedKeywords.length * 10, 40);
      score += keywordScore;
      reasons.push(`Keywords: ${matchedKeywords.slice(0, 3).join(', ')}`);
    }

    // 3. Control Title Similarity (up to 20 points)
    const titleWords = control.title.toLowerCase().split(/\s+/);
    const docWords = documentName.toLowerCase().split(/\s+/);
    const commonWords = titleWords.filter((w: string) => docWords.includes(w));

    if (commonWords.length > 0) {
      const titleScore = Math.min(commonWords.length * 5, 20);
      score += titleScore;
      reasons.push(`Similar: ${commonWords.slice(0, 2).join(', ')}`);
    }

    // Check if this is the best match
    if (score > bestMatch.confidence) {
      bestMatch = {
        documentName,
        documentType,
        controlId: control.id,
        controlTitle: control.title,
        confidence: score,
        reason: reasons.join('; ')
      };
    }
  }

  return bestMatch;
}
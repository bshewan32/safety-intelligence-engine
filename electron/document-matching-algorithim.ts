/**
 * Document-to-Control Matching Algorithm
 * Uses control metadata (expectedDocTypes, keywords) from hazard packs
 */

interface Control {
  id: string;
  code: string;
  title: string;
  type: string;
  metadata?: string | null;
}

interface MatchResult {
  controlId: string | null;
  controlTitle: string;
  confidence: number;
  reason: string;
}

export function matchDocumentToControl(
  documentName: string,
  documentType: string,
  controls: Control[]
): MatchResult {
  let bestMatch: MatchResult = {
    controlId: null,
    controlTitle: 'No match found',
    confidence: 0,
    reason: 'No suitable control found'
  };

  for (const control of controls) {
    let score = 0;
    let reasons: string[] = [];

    // Parse metadata
    let metadata: any = {};
    try {
      if (control.metadata) {
        metadata = JSON.parse(control.metadata);
      }
    } catch (e) {
      // Skip if metadata can't be parsed
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
        reasons.push(`Type match: ${documentType}`);
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
    const commonWords = titleWords.filter(w => docWords.includes(w));

    if (commonWords.length > 0) {
      const titleScore = Math.min(commonWords.length * 5, 20);
      score += titleScore;
      reasons.push(`Title similarity: ${commonWords.join(', ')}`);
    }

    // Check if this is the best match so far
    if (score > bestMatch.confidence) {
      bestMatch = {
        controlId: control.id,
        controlTitle: control.title,
        confidence: score,
        reason: reasons.join('; ')
      };
    }
  }

  return bestMatch;
}

/**
 * Check learned mappings first (from DocumentMapping table)
 */
export async function matchWithLearning(
  documentName: string,
  documentType: string,
  prisma: any
): Promise<MatchResult | null> {
  const learned = await prisma.documentMapping.findFirst({
    where: {
      documentName,
      documentType
    },
    include: {
      control: true
    },
    orderBy: {
      confidence: 'desc'
    }
  });

  if (learned && learned.confidence >= 70) {
    return {
      controlId: learned.controlId,
      controlTitle: learned.control.title,
      confidence: 100, // User confirmed = 100%
      reason: 'Previously learned mapping'
    };
  }

  return null;
}
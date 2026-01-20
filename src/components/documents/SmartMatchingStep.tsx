import React, { useState, useEffect } from 'react';
import { Target, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { DocumentMatch, ParsedRow } from './document-importer';

interface SmartMatchingStepProps {
  parsedRows: ParsedRow[];
  clientId?: string;
  onComplete: (matches: DocumentMatch[]) => void;
  onBack: () => void;
}

export function SmartMatchingStep({
  parsedRows,
  clientId,
  onComplete,
  onBack,
}: SmartMatchingStepProps) {
  const [documentMatches, setDocumentMatches] = useState<DocumentMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    matchDocuments();
  }, []);

  const matchDocuments = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all Document-type controls
      const controls = await window.api.listControls();
      const documentControls = controls.filter((c: any) => c.type === 'Document');

      // Match each document to controls
      const matches: DocumentMatch[] = [];

      for (const row of parsedRows) {
        // Try to find learned mapping first
        const learnedMatch = await checkLearnedMapping(row.documentName, row.documentType);
        
        if (learnedMatch) {
          matches.push(learnedMatch);
        } else {
          // Use algorithm to find best match
          const match = findBestMatch(row, documentControls);
          matches.push(match);
        }
      }

      setDocumentMatches(matches);
    } catch (err: any) {
      console.error('Matching failed:', err);
      setError(err.message || 'Failed to match documents to controls');
    } finally {
      setLoading(false);
    }
  };

  const checkLearnedMapping = async (
    documentName: string,
    documentType: string
  ): Promise<DocumentMatch | null> => {
    try {
      // Check if we have a learned mapping for this document
      const response = await fetch('/api/document-mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentName, documentType })
      });

      if (response.ok) {
        const learned = await response.json();
        if (learned && learned.confidence >= 70) {
          return {
            documentName,
            documentType,
            controlId: learned.controlId,
            controlTitle: learned.controlTitle,
            confidence: 100,
            reason: 'Previously learned mapping'
          };
        }
      }
    } catch (err) {
      console.log('No learned mapping found');
    }

    return null;
  };

  const findBestMatch = (row: ParsedRow, controls: any[]): DocumentMatch => {
    let bestMatch: DocumentMatch = {
      documentName: row.documentName,
      documentType: row.documentType,
      controlId: null,
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
      }

      const expectedDocTypes = metadata.expectedDocTypes || [];
      const keywords = metadata.keywords || [];

      // 1. Document Type Match (40 points)
      if (expectedDocTypes.length > 0) {
        const typeMatch = expectedDocTypes.some((type: string) =>
          row.documentType.toLowerCase().includes(type.toLowerCase()) ||
          type.toLowerCase().includes(row.documentType.toLowerCase())
        );

        if (typeMatch) {
          score += 40;
          reasons.push(`Type: ${row.documentType}`);
        }
      }

      // 2. Keyword Match (up to 40 points)
      const docNameLower = row.documentName.toLowerCase();
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
      const docWords = row.documentName.toLowerCase().split(/\s+/);
      const commonWords = titleWords.filter((w: string) => docWords.includes(w));

      if (commonWords.length > 0) {
        const titleScore = Math.min(commonWords.length * 5, 20);
        score += titleScore;
        reasons.push(`Similar: ${commonWords.slice(0, 2).join(', ')}`);
      }

      // Check if this is the best match
      if (score > bestMatch.confidence) {
        bestMatch = {
          documentName: row.documentName,
          documentType: row.documentType,
          controlId: control.id,
          controlTitle: control.title,
          confidence: score,
          reason: reasons.join('; ')
        };
      }
    }

    return bestMatch;
  };

  const handleManualMatch = (index: number, controlId: string, controlTitle: string) => {
    setDocumentMatches((prev) =>
      prev.map((dm, idx) =>
        idx === index
          ? {
              ...dm,
              controlId,
              controlTitle,
              confidence: 100,
              reason: 'Manually selected',
              manualSelection: true
            }
          : dm
      )
    );
  };

  const handleProceed = () => {
    onComplete(documentMatches);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50';
    if (confidence >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <CheckCircle size={16} />;
    if (confidence >= 50) return <AlertCircle size={16} />;
    return <AlertCircle size={16} />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-600">Matching documents to controls...</p>
        <p className="text-sm text-gray-500 mt-2">
          Analyzing {parsedRows.length} documents
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-medium text-red-900">Matching Failed</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={matchDocuments}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const autoMatched = documentMatches.filter((dm) => dm.confidence >= 80).length;
  const needsReview = documentMatches.filter(
    (dm) => dm.confidence >= 50 && dm.confidence < 80
  ).length;
  const noMatch = documentMatches.filter((dm) => dm.confidence < 50).length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Document-to-Control Matching
        </h3>
        <p className="text-gray-600 text-sm">
          Review the suggested control mappings. High-confidence matches are auto-selected.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Auto-Matched</p>
              <p className="text-2xl font-bold text-green-900">{autoMatched}</p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Needs Review</p>
              <p className="text-2xl font-bold text-yellow-900">{needsReview}</p>
            </div>
            <AlertCircle className="text-yellow-600" size={32} />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">No Match</p>
              <p className="text-2xl font-bold text-red-900">{noMatch}</p>
            </div>
            <AlertCircle className="text-red-600" size={32} />
          </div>
        </div>
      </div>

      {/* Match List */}
      <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
        {documentMatches.map((dm, idx) => (
          <div key={idx} className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between space-x-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {dm.documentName}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                    {dm.documentType}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${getConfidenceColor(
                      dm.confidence
                    )}`}
                  >
                    {getConfidenceIcon(dm.confidence)}
                    <span>{dm.confidence}%</span>
                  </div>
                  <Target size={12} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{dm.controlTitle}</span>
                </div>
                {dm.reason && (
                  <p className="text-xs text-gray-500 mt-1">{dm.reason}</p>
                )}
              </div>

              {/* Manual selection option for low-confidence matches */}
              {dm.confidence < 80 && (
                <select
                  value={dm.controlId || ''}
                  onChange={(e) =>
                    handleManualMatch(
                      idx,
                      e.target.value,
                      e.target.options[e.target.selectedIndex].text
                    )
                  }
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="">Select control...</option>
                  {/* This would be populated with available controls */}
                </select>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleProceed}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Continue to Review
        </button>
      </div>
    </div>
  );
}
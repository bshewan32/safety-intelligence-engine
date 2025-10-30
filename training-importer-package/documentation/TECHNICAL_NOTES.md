# Technical Notes - Training Importer
## For Developers

This document provides technical details about the matching algorithm, architecture decisions, and extension points.

---

## Algorithm Design

### Why Levenshtein Distance?

**Chosen because:**
- Simple to implement (no dependencies)
- Works offline (critical for Electron app)
- Fast O(n*m) performance
- Well-understood edit distance metric
- Catches common typos and variations

**Example:**
```
"CPR Training" vs "CPR + LVR Training"
Distance: 8 edits
Similarity: 71% match
```

### Why Not Just Use Fuse.js?

**Decision:** Pure JavaScript implementation

**Reasoning:**
1. **No dependencies** - Package remains lightweight
2. **Customizable** - Full control over matching logic
3. **Domain-specific** - Can add safety industry rules
4. **Educational** - Team understands the algorithm

**Note:** You can easily swap in Fuse.js later if needed:

```typescript
import Fuse from 'fuse.js';

const fuse = new Fuse(controls, {
  keys: ['title', 'code'],
  threshold: 0.3,
});

const results = fuse.search(trainingName);
```

---

## Matching Algorithm Breakdown

### Stage 1: Preprocessing

```typescript
// Normalize inputs
const clean = (str: string) => str.toLowerCase().trim();

// Extract meaningful keywords
const keywords = extractKeywords(trainingName);
// Input: "CPR and First Aid Training Course"
// Output: ["cpr", "first", "aid"]
```

### Stage 2: Scoring

Each control gets a composite score:

```typescript
score = max(
  exactMatchScore,        // 100 points
  codeMatchScore,         // 95 points
  levenshteinScore,       // 0-99 points
  keywordScore,           // 0-60 points
  acronymScore            // 75 points
) * typeBoost;            // 1.15x for Training/Licence
```

### Stage 3: Thresholding

```typescript
if (score >= 100) return "Auto-accept";
if (score >= 50)  return "Suggest to user";
if (score < 50)   return "Manual selection";
```

---

## Performance Characteristics

### Time Complexity

- **Levenshtein Distance:** O(n*m) where n,m are string lengths
- **Overall Matching:** O(T * C * L) where:
  - T = number of training types (~20-50)
  - C = number of controls (~50-200)
  - L = average string length (~20-50)

### Typical Performance

- 50 training types × 100 controls = 5,000 comparisons
- Each comparison: ~1ms
- **Total matching time: ~5 seconds**

### Optimization Opportunities

1. **Early termination** - Stop at 100% match
2. **Caching** - Store results in TrainingMapping
3. **Indexing** - Pre-index controls by first letter
4. **Parallelization** - Worker threads for large batches

```typescript
// Example: Early termination
if (score === 100) {
  return match; // Don't check remaining controls
}
```

---

## Extension Points

### 1. Add Industry-Specific Rules

```typescript
// In matchTrainingToControl()
if (trainingName.includes('electrical')) {
  if (control.category === 'Electrical') {
    score += 20; // Boost electrical controls
  }
}

if (trainingName.includes('height') || trainingName.includes('fall')) {
  if (control.title.includes('height') || control.title.includes('fall')) {
    score += 15; // Boost height-related controls
  }
}
```

### 2. Add Synonym Dictionary

```typescript
const synonyms: Record<string, string[]> = {
  'cpr': ['cardiopulmonary', 'resuscitation', 'cardiac'],
  'lvr': ['low voltage', 'rescue', 'electrical'],
  'wah': ['working at heights', 'fall protection', 'height safety'],
  'forklift': ['lift truck', 'powered industrial truck'],
};

// Use in keyword matching
function expandWithSynonyms(keywords: string[]): string[] {
  return keywords.flatMap(k => [k, ...(synonyms[k] || [])]);
}
```

### 3. Add Machine Learning

```typescript
// Collect user corrections
const corrections = await prisma.trainingMapping.findMany({
  where: { source: 'user' }
});

// Build feature vectors
const features = corrections.map(c => ({
  levenshtein: calculateDistance(c.trainingName, c.control.title),
  keywords: keywordOverlap(c.trainingName, c.control.title),
  isTraining: c.control.type === 'Training' ? 1 : 0,
}));

// Train simple model (e.g., logistic regression)
const weights = trainModel(features, corrections.map(c => 1));

// Use for future predictions
const predictedScore = predictMatch(weights, newFeatures);
```

### 4. Integrate AI (Optional)

See README.md "Future Enhancements" section for Claude API integration.

---

## Database Design

### TrainingMapping Table

**Purpose:** Learning system - improves matching over time

**Schema:**
```prisma
model TrainingMapping {
  trainingName String  // CSV input
  controlId    String  // What it matched to
  confidence   Int     // How confident
  source       String  // "user" | "algorithm" | "ai"
}
```

**Usage Flow:**
1. User imports CSV
2. Algorithm suggests matches
3. User accepts/rejects
4. Accepted matches saved with source="user", confidence=100
5. Next import checks this table first
6. If found, skip algorithm and auto-match

**Benefits:**
- Speeds up repeat imports
- Learns client-specific naming conventions
- Reduces user fatigue

---

## Error Handling

### CSV Parsing

```typescript
try {
  const content = await fs.readFile(filePath, 'utf-8');
  // Parse...
} catch (err) {
  if (err.code === 'ENOENT') {
    return { error: 'File not found' };
  }
  if (err.code === 'EACCES') {
    return { error: 'Permission denied' };
  }
  return { error: 'Invalid CSV format' };
}
```

### Date Parsing

```typescript
function parseDate(dateStr: string): Date | null {
  // Try multiple formats
  const formats = [
    /^\d{4}-\d{2}-\d{2}$/,        // ISO: 2024-01-15
    /^\d{2}\/\d{2}\/\d{4}$/,      // US: 01/15/2024
    /^\d{2}-\d{2}-\d{4}$/,        // AU: 15-01-2024
  ];
  
  for (const format of formats) {
    if (format.test(dateStr)) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }
  
  return null; // Invalid date
}
```

### Transaction Safety

```typescript
// Wrap bulk import in transaction
await prisma.$transaction(async (tx) => {
  // Create all RequiredControls
  for (const rc of requiredControls) {
    await tx.requiredControl.upsert({ ... });
  }
  
  // Create all Evidence
  for (const ev of evidence) {
    await tx.evidence.create({ ... });
  }
  
  // Save mappings
  for (const tm of mappings) {
    await tx.trainingMapping.upsert({ ... });
  }
});

// If any step fails, entire import is rolled back
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('matchTrainingToControl', () => {
  it('should match exact names', () => {
    const match = matchTrainingToControl('CPR Training', controls, []);
    expect(match.confidence).toBe(100);
  });

  it('should match with typos', () => {
    const match = matchTrainingToControl('CPR Trainng', controls, []); // typo
    expect(match.confidence).toBeGreaterThan(80);
  });

  it('should match acronyms', () => {
    const match = matchTrainingToControl('LVR', controls, []);
    expect(match.title).toContain('Low Voltage Rescue');
  });
});
```

### Integration Tests

```typescript
describe('Training Import E2E', () => {
  it('should import CSV successfully', async () => {
    const result = await importTrainingRecords({
      trainingMatches: [...],
      workerMatches: [...],
      parsedRows: [...]
    });
    
    expect(result.imported).toBe(20);
    expect(result.skipped).toBe(0);
  });
});
```

---

## Security Considerations

### File Upload

- **Validate file size** - Reject > 10MB files
- **Validate format** - Only accept CSV/XLSX
- **Sanitize paths** - Prevent directory traversal

```typescript
if (fileSize > 10 * 1024 * 1024) {
  throw new Error('File too large (max 10MB)');
}

const ext = path.extname(filePath).toLowerCase();
if (!['.csv', '.xlsx', '.xls'].includes(ext)) {
  throw new Error('Invalid file type');
}
```

### SQL Injection

Not applicable - using Prisma ORM with parameterized queries.

### CSV Injection

Sanitize cell values that start with special characters:

```typescript
const sanitize = (value: string): string => {
  if (/^[=+\-@]/.test(value)) {
    return "'" + value; // Prefix with single quote
  }
  return value;
};
```

---

## Monitoring & Analytics

### Track Matching Quality

```typescript
// In importTrainingRecords()
const metrics = {
  totalRecords: parsedRows.length,
  autoMatched: trainingMatches.filter(t => t.confidence === 100).length,
  suggested: trainingMatches.filter(t => t.confidence >= 50 && t.confidence < 100).length,
  manual: trainingMatches.filter(t => t.confidence < 50).length,
  importDuration: Date.now() - startTime,
};

// Log to analytics
console.log('Import metrics:', metrics);
// OR: await analytics.track('training_import', metrics);
```

### User Feedback Loop

```typescript
// After import, show feedback prompt
<button onClick={() => {
  // Ask: "How accurate were the matches?"
  // Track: accuracy_rating, user_corrections_count
  // Use to tune algorithm
}}>
  Rate Matching Accuracy
</button>
```

---

## Known Limitations

### 1. Simple CSV Parser

Current implementation splits on commas - doesn't handle:
- Quoted commas: `"Smith, John"`
- Multiline cells
- Different encodings

**Solution:** Use PapaParse library:

```typescript
import Papa from 'papaparse';

const result = Papa.parse(csvContent, {
  header: true,
  skipEmptyLines: true,
});
```

### 2. No Fuzzy Date Parsing

Dates must be in recognizable format.

**Solution:** Use date-fns or moment.js for robust parsing.

### 3. Memory Usage

Large CSVs (10,000+ rows) load entirely into memory.

**Solution:** Stream processing with csv-parser:

```typescript
import csv from 'csv-parser';

fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (row) => {
    // Process row by row
  });
```

---

## Future Roadmap

### Phase 2A (Current)
- ✅ Algorithm-based matching
- ✅ Learning system
- ✅ Bulk import

### Phase 2B (Next - AI Enhancement)
- [ ] Claude API integration
- [ ] Semantic similarity matching
- [ ] Confidence calibration
- [ ] A/B test algorithm vs AI

### Phase 3 (Advanced)
- [ ] Custom ML model trained on corrections
- [ ] Excel XLSX support (not just CSV)
- [ ] Batch scheduling (import multiple files)
- [ ] Template library (save column mappings)

---

## Resources

### Algorithms
- [Levenshtein Distance](https://en.wikipedia.org/wiki/Levenshtein_distance)
- [Fuzzy String Matching](https://www.freecodecamp.org/news/fuzzy-string-matching-with-postgresql/)

### Libraries (if you want to extend)
- [Fuse.js](https://fusejs.io/) - Fuzzy search
- [PapaParse](https://www.papaparse.com/) - CSV parsing
- [XLSX](https://docs.sheetjs.com/) - Excel files

### AI APIs (optional)
- [Anthropic Claude](https://docs.anthropic.com/)
- [OpenAI GPT](https://platform.openai.com/)

---

## Contributing

To extend the matching algorithm:

1. Fork `matching-algorithm.ts`
2. Add your matching logic
3. Test with sample data
4. Submit PR with benchmarks

**Guidelines:**
- Keep matching < 10 seconds for 100 trainings
- Maintain 90%+ accuracy on common cases
- Document any new parameters/thresholds
- Add unit tests

---

**Questions?** Check the main README.md or review the inline code comments.

**Built by:** Claude (Anthropic)  
**Date:** October 31, 2025  
**Version:** 1.0.0

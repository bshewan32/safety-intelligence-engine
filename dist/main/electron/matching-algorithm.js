// /electron/matching-algorithm.ts
// Smart matching algorithm for training records → controls and workers
/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    const matrix = [];
    for (let i = 0; i <= s2.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= s1.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= s2.length; i++) {
        for (let j = 1; j <= s1.length; j++) {
            if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            }
            else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
            }
        }
    }
    return matrix[s2.length][s1.length];
}
/**
 * Extract meaningful keywords from text
 */
function extractKeywords(text) {
    const stopWords = [
        'the', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'to', 'for',
        'training', 'course', 'certificate', 'certification', 'program',
    ];
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.includes(word));
}
/**
 * Check if one string is an acronym of another
 */
function isAcronymMatch(short, long) {
    const acronym = short
        .toUpperCase()
        .replace(/[^A-Z]/g, '');
    if (acronym.length < 2)
        return false;
    const words = long.split(/\s+/);
    if (words.length < 2)
        return false;
    const candidate = words
        .map(w => w[0])
        .join('')
        .toUpperCase();
    return candidate === acronym || long.toUpperCase().includes(acronym);
}
/**
 * Match training name to control
 */
export function matchTrainingToControl(trainingName, controls, existingMappings) {
    // Check existing mappings first (learned matches)
    const learned = existingMappings.find(m => m.trainingName.toLowerCase() === trainingName.toLowerCase());
    if (learned) {
        const control = controls.find(c => c.id === learned.controlId);
        if (control) {
            return {
                id: control.id,
                title: control.title,
                confidence: 100,
                reason: 'Previously learned match',
            };
        }
    }
    let bestMatch = null;
    let bestScore = 0;
    for (const control of controls) {
        let score = 0;
        const reasons = [];
        // 1. Exact match (case-insensitive)
        if (trainingName.toLowerCase() === control.title.toLowerCase()) {
            return {
                id: control.id,
                title: control.title,
                confidence: 100,
                reason: 'Exact match',
            };
        }
        // 2. Code match (if training name looks like a code)
        if (control.code && trainingName.toUpperCase().includes(control.code.toUpperCase())) {
            score = 95;
            reasons.push('Code match');
        }
        // 3. Levenshtein similarity
        const distance = levenshteinDistance(trainingName, control.title);
        const maxLen = Math.max(trainingName.length, control.title.length);
        const similarity = ((maxLen - distance) / maxLen) * 100;
        if (similarity > 70) {
            score = Math.max(score, similarity);
            reasons.push(`${Math.round(similarity)}% string match`);
        }
        // 4. Keyword matching
        const trainingKeywords = extractKeywords(trainingName);
        const controlKeywords = extractKeywords(control.title);
        const commonKeywords = trainingKeywords.filter(k => controlKeywords.includes(k));
        if (commonKeywords.length > 0) {
            const keywordScore = (commonKeywords.length / Math.max(trainingKeywords.length, 1)) * 60;
            score = Math.max(score, keywordScore);
            reasons.push(`Keywords: ${commonKeywords.slice(0, 3).join(', ')}`);
        }
        // 5. Acronym matching
        if (isAcronymMatch(trainingName, control.title) || isAcronymMatch(control.code, trainingName)) {
            score = Math.max(score, 75);
            reasons.push('Acronym match');
        }
        // 6. Type boost for training/licence controls
        if (control.type === 'Training' || control.type === 'Licence') {
            score = Math.min(score * 1.15, 99);
        }
        // Update best match
        if (score > bestScore && score >= 50) {
            bestScore = score;
            bestMatch = {
                id: control.id,
                title: control.title,
                confidence: Math.round(Math.min(score, 99)),
                reason: reasons.join(' • '),
            };
        }
    }
    return bestMatch;
}
/**
 * Match CSV worker name to database worker
 */
export function matchWorkerByName(csvName, workers) {
    const cleanCsv = csvName.toLowerCase().trim();
    for (const worker of workers) {
        const fullName = `${worker.firstName} ${worker.lastName}`.toLowerCase().trim();
        const reverseName = `${worker.lastName} ${worker.firstName}`.toLowerCase().trim();
        // Exact match
        if (cleanCsv === fullName || cleanCsv === reverseName) {
            return {
                workerId: worker.id,
                fullName: `${worker.firstName} ${worker.lastName}`,
                confidence: 100,
            };
        }
        // Employee ID match
        if (worker.employeeId && cleanCsv.includes(worker.employeeId.toLowerCase())) {
            return {
                workerId: worker.id,
                fullName: `${worker.firstName} ${worker.lastName}`,
                confidence: 100,
            };
        }
        // Fuzzy match on full name
        const distance = levenshteinDistance(cleanCsv, fullName);
        const similarity = ((fullName.length - distance) / fullName.length) * 100;
        if (similarity >= 80) {
            return {
                workerId: worker.id,
                fullName: `${worker.firstName} ${worker.lastName}`,
                confidence: Math.round(similarity),
            };
        }
        // Check if both first and last name are present
        const firstNamePresent = cleanCsv.includes(worker.firstName.toLowerCase());
        const lastNamePresent = cleanCsv.includes(worker.lastName.toLowerCase());
        if (firstNamePresent && lastNamePresent) {
            return {
                workerId: worker.id,
                fullName: `${worker.firstName} ${worker.lastName}`,
                confidence: 90,
            };
        }
    }
    return null;
}

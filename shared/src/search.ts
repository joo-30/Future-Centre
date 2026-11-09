/**
 * Arabic & Multilingual Search Intelligence Engine
 * Handles normalization, fuzzy matching, and relevance ranking.
 */

export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove tashkeel
    .replace(/[٠-٩]/g, (c) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))) // arabic digits
    .replace(/[۰-۹]/g, (c) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))) // persian digits
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/[ؤ]/g, 'و')
    .replace(/[ئ]/g, 'ي');
}

/**
 * Builds a regex pattern that matches all Arabic variants (hamzas, taa marbuta, etc.)
 */
export function buildArabicPattern(query: string): string {
  if (!query) return '';
  const clean = query.trim();
  let pattern = '';

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (/[اأإآٱ]/.test(char)) {
      pattern += '[اأإآٱ]';
    } else if (/[ةه]/.test(char)) {
      pattern += '[ةه]';
    } else if (/[يىئ]/.test(char)) {
      pattern += '[يىئ]';
    } else if (/[ؤو]/.test(char)) {
      pattern += '[ؤو]';
    } else if (/[.*+?^${}()|[\]\\]/.test(char)) {
      pattern += '\\' + char;
    } else {
      pattern += char;
    }
  }

  return pattern;
}

export function buildArabicRegex(query: string, flags = 'i'): RegExp {
  return new RegExp(buildArabicPattern(query), flags);
}

/**
 * Calculates relevance score between candidate text and a search query.
 * Higher score = more relevant.
 * 0 = no match.
 */
export function calculateRelevance(
  candidateName: string,
  candidatePhone: string | undefined,
  query: string,
  candidateRef?: string | undefined,
  candidateFileNumber?: number | undefined,
): number {
  const trimmed = query.trim();
  if (!trimmed) return 100; // neutral match

  const normQuery = normalizeArabic(trimmed);
  const normName = normalizeArabic(candidateName || '');
  const digitsQuery = trimmed.replace(/\D/g, '');
  const cleanPhone = (candidatePhone || '').replace(/\D/g, '');

  let score = 0;

  // 0. Patient File Number matching (e.g. 1, 2, 21, 150, #3, ملف 3)
  if (candidateFileNumber !== undefined && candidateFileNumber !== null && digitsQuery.length >= 1) {
    const fileNumStr = String(candidateFileNumber);
    if (fileNumStr === digitsQuery) {
      score += 3500; // exact file number match (e.g. user typed "3" or "#3" or "ملف 3")
    } else if (digitsQuery.length <= fileNumStr.length && fileNumStr.startsWith(digitsQuery)) {
      score += 2200;
    } else if (digitsQuery.length <= fileNumStr.length && fileNumStr.includes(digitsQuery)) {
      score += 1600;
    }
  }

  // 1. Reference matching (e.g. "FC-4A2B", "FC-", booking code)
  if (candidateRef) {
    const normRef = candidateRef.trim().toUpperCase();
    const upperQuery = trimmed.toUpperCase();
    if (normRef === upperQuery) {
      score += 3000; // exact reference match
    } else if (normRef.startsWith(upperQuery)) {
      score += 2500;
    } else if (normRef.includes(upperQuery)) {
      score += 2000;
    }
  }

  // 2. Phone matching
  if (digitsQuery.length >= 2 && cleanPhone) {
    if (cleanPhone === digitsQuery) {
      score += 1500;
    } else if (cleanPhone.endsWith(digitsQuery) || cleanPhone.startsWith(digitsQuery)) {
      score += 1200;
    } else if (cleanPhone.includes(digitsQuery)) {
      score += 1000;
    }
  }

  // 3. Name matching
  if (normName && normQuery) {
    if (normName === normQuery) {
      score += 2000; // exact match
    } else if (normName.startsWith(normQuery)) {
      // Direct prefix match: Candidate starts with query (e.g. "إسلام" matches "إسلام الوكيل")
      score += 1200;
    } else {
      const words = normName.split(/\s+/).filter(Boolean);
      const queryWords = normQuery.split(/\s+/).filter(Boolean);

      // Check if any word starts with the query
      const wordPrefixMatchIndex = words.findIndex((w) => w.startsWith(normQuery));
      if (wordPrefixMatchIndex !== -1) {
        // Words earlier in the name get much higher priority
        score += Math.max(800 - wordPrefixMatchIndex * 200, 300);
      } else if (normName.includes(normQuery)) {
        score += 250;
      }

      // Check multi-token matching (e.g. "اسلام وكيل")
      if (queryWords.length > 1) {
        const allMatched = queryWords.every((qw) => words.some((w) => w.includes(qw)));
        if (allMatched) {
          score += 600;
        }
      }
    }
  }

  return score;
}

/**
 * Sorts an array of items by relevance to a query.
 */
export function rankByRelevance<T>(
  items: T[],
  query: string,
  getName: (item: T) => string,
  getPhone?: (item: T) => string | undefined,
  getRef?: (item: T) => string | undefined,
  getFileNumber?: (item: T) => number | undefined,
): T[] {
  if (!query || !query.trim()) return items;

  const scored = items.map((item) => ({
    item,
    score: calculateRelevance(
      getName(item),
      getPhone ? getPhone(item) : undefined,
      query,
      getRef ? getRef(item) : undefined,
      getFileNumber ? getFileNumber(item) : undefined,
    ),
    nameLen: (getName(item) || '').length,
  }));

  // Filter only matches (score > 0)
  const matches = scored.filter((s) => s.score > 0);

  // Sort descending by relevance score, then by shorter name length
  matches.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.nameLen - b.nameLen;
  });

  return matches.map((m) => m.item);
}

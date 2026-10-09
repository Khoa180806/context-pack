import { VI_EN_SYNONYMS, removeVietnameseAccents } from './clientDictionary';
import type { VirtualFile } from '@/types/playground';

export interface RankedVirtualFile extends VirtualFile {
  score: number;
}

const COMMON_STOP_WORDS = new Set([
  // English stop words
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'this', 'but', 'they',
  // Vietnamese stop words
  'cua', 'va', 'cho', 'trong', 'cac', 'nhung', 'de', 'o', 'tai',
  've', 'la', 'mot', 'nay', 'do', 'ra', 'vao', 'nhu',
]);

export function extractKeywords(task: string): string[] {
  if (!task || !task.trim()) return [];

  const rawLower = task.toLowerCase();
  const normalizedTask = removeVietnameseAccents(rawLower);

  const keywords = new Set<string>();

  // Match multi-word phrases from dictionary first
  for (const [phrase, synonyms] of Object.entries(VI_EN_SYNONYMS)) {
    if (normalizedTask.includes(phrase)) {
      for (const syn of synonyms) {
        keywords.add(syn);
      }
    }
  }

  // Tokenize individual words
  const tokens = normalizedTask
    .split(/[^a-z0-9_]+/)
    .filter((word) => word.length > 1 && !COMMON_STOP_WORDS.has(word));

  for (const token of tokens) {
    keywords.add(token);
    // Expand single-word synonyms if present in dictionary
    if (VI_EN_SYNONYMS[token]) {
      for (const syn of VI_EN_SYNONYMS[token]) {
        keywords.add(syn);
      }
    }
  }

  return Array.from(keywords);
}

export function scoreContentRelevance(
  content: string,
  keywords: string[],
  fileName = '',
): number {
  if (!keywords.length) return 0.5;
  if (!content && !fileName) return 0;

  const normalizedContent = (content || '').toLowerCase();
  const normalizedPath = (fileName || '').toLowerCase();

  let matchedCount = 0;
  let totalOccurrences = 0;
  let pathBonus = 0;

  for (const keyword of keywords) {
    let matchedInFile = false;

    if (normalizedContent.includes(keyword)) {
      matchedInFile = true;
      const count = normalizedContent.split(keyword).length - 1;
      totalOccurrences += count;
    }

    // Boost score if keyword directly appears in the file path/name
    if (normalizedPath.includes(keyword)) {
      matchedInFile = true;
      pathBonus += 0.05;
    }

    if (matchedInFile) {
      matchedCount += 1;
    }
  }

  if (matchedCount === 0) return 0;

  // Weighted score combining keyword coverage, occurrence density and path relevance
  const coverageScore = matchedCount / keywords.length;
  const frequencyBonus = Math.min(0.2, (totalOccurrences - matchedCount) * 0.02);
  const finalScore = Math.min(1.0, coverageScore * 0.7 + frequencyBonus + pathBonus + 0.1);

  return Number(finalScore.toFixed(3));
}

export function rankFiles(
  files: VirtualFile[],
  task: string,
  minRelevance = 0,
): RankedVirtualFile[] {
  const keywords = extractKeywords(task);

  const scored: RankedVirtualFile[] = files.map((f) => ({
    ...f,
    score: scoreContentRelevance(f.content, keywords, f.name),
  }));

  // Sort descending by score; fallback to file name alphabetical order
  scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  return scored.filter((item) => item.score >= minRelevance);
}

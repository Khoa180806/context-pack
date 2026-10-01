export interface FileToRank {
  file: string;
  content: string;
}

export interface RankedFile {
  file: string;
  content: string;
  score: number;
}

const COMMON_STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'the', 'this', 'but', 'they',
]);

export function extractKeywords(task: string): string[] {
  if (!task) return [];

  // Tokenize words, convert to lowercase, filter out stop words and short tokens
  const tokens = task
    .toLowerCase()
    .split(/[^a-z0-9_]+/)
    .filter((word) => word.length > 1 && !COMMON_STOP_WORDS.has(word));

  return Array.from(new Set(tokens));
}

export function scoreFileRelevance(
  content: string,
  keywords: string[],
  filePath = '',
): number {
  if (!keywords.length) return 0.5;
  if (!content && !filePath) return 0;

  const normalizedContent = (content || '').toLowerCase();
  const normalizedPath = (filePath || '').toLowerCase();

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
  files: FileToRank[],
  task: string,
  minRelevance = 0,
): RankedFile[] {
  const keywords = extractKeywords(task);

  const scored: RankedFile[] = files.map((f) => ({
    file: f.file,
    content: f.content,
    score: scoreFileRelevance(f.content, keywords, f.file),
  }));

  // Sort descending by score; fallback to file path alphabetical order
  scored.sort((a, b) => b.score - a.score || a.file.localeCompare(b.file));

  return scored.filter((item) => item.score >= minRelevance);
}

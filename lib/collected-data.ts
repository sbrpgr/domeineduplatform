import fs from 'node:fs';
import path from 'node:path';

export type CollectedTerm = {
  id: string;
  term_ko: string;
  term_en: string;
  difficulty: 'novice' | 'beginner' | 'intermediate' | 'advanced';
  category: string[];
};

const root = process.cwd();
const fullDir = path.join(root, 'data', 'generated', 'full');

export function loadCollectedTerms(domain: string): CollectedTerm[] {
  const file = path.join(fullDir, `${domain}.terms.json`);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8')) as CollectedTerm[];
}

export function loadCollectionSummary(): { domains: { slug: string; count: number }[]; total_terms: number } {
  const file = path.join(fullDir, 'summary.json');
  if (!fs.existsSync(file)) {
    return { domains: [], total_terms: 0 };
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function difficultyDistribution(items: CollectedTerm[]) {
  const base = { novice: 0, beginner: 0, intermediate: 0, advanced: 0 };
  for (const item of items) {
    base[item.difficulty] += 1;
  }
  return base;
}

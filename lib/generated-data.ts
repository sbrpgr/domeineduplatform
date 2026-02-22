import fs from 'node:fs';
import path from 'node:path';

type GeneratedTermRaw = {
  id: string;
  slug: string;
  term_ko: string;
  term_en: string;
  difficulty: 'novice' | 'beginner' | 'intermediate' | 'advanced';
  one_line_definition: string;
  definitions: {
    novice: string;
    beginner: string;
    intermediate: string;
    advanced: string;
  };
  usage_examples?: Array<{
    context: string;
    example: string;
  }>;
  domain: string[];
  tags: string[];
};

type GeneratedEdge = {
  from: string;
  to: string;
  relation: 'parent' | 'sibling' | 'child' | 'opposite';
};

type GeneratedQuiz = {
  id: string;
  type: 'multiple_choice' | 'ox' | 'matching';
  question: string;
  options?: string[];
  answer: number | boolean | string;
  explanation: string;
};

export type GeneratedTerm = {
  id: string;
  slug: string;
  termKo: string;
  termEn: string;
  domainSlug: string;
  difficulty: 'novice' | 'beginner' | 'intermediate' | 'advanced';
  oneLineDefinition: string;
  definitions: GeneratedTermRaw['definitions'];
  usageExamples: Array<{
    context: string;
    example: string;
  }>;
  tags: string[];
};

const root = process.cwd();
const fullDir = path.join(root, 'data', 'generated', 'full');
const relationshipDir = path.join(root, 'data', 'relationships');
const diagnosticsDir = path.join(root, 'data', 'diagnostics');

let termCache: GeneratedTerm[] | null = null;
const edgeCache = new Map<string, GeneratedEdge[]>();
const quizCache = new Map<string, GeneratedQuiz[]>();

const listFiles = (dir: string, suffix: string) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter((file) => file.endsWith(suffix)) : [];

const parseJson = <T>(filePath: string): T => {
  const text = fs.readFileSync(filePath, 'utf8');
  const normalized = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  return JSON.parse(normalized) as T;
};

export function loadAllGeneratedTerms(): GeneratedTerm[] {
  if (termCache) return termCache;

  const files = listFiles(fullDir, '.terms.json');
  const all: GeneratedTerm[] = [];

  for (const file of files) {
    const domainSlug = file.replace('.terms.json', '');
    const items = parseJson<GeneratedTermRaw[]>(path.join(fullDir, file));

    for (const item of items) {
      all.push({
        id: item.id,
        slug: item.slug,
        termKo: item.term_ko,
        termEn: item.term_en,
        domainSlug,
        difficulty: item.difficulty,
        oneLineDefinition: item.one_line_definition,
        definitions: item.definitions,
        usageExamples: item.usage_examples ?? [],
        tags: item.tags
      });
    }
  }

  termCache = all;
  return all;
}

export function searchGeneratedTerms(query?: string, domain?: string, difficulty?: string, limit = 50): GeneratedTerm[] {
  const normalized = query?.toLowerCase().trim();
  const terms = loadAllGeneratedTerms();

  return terms
    .filter((term) => {
      const matchQ =
        !normalized || term.termKo.toLowerCase().includes(normalized) || term.termEn.toLowerCase().includes(normalized);
      const matchDomain = !domain || term.domainSlug === domain;
      const matchDifficulty = !difficulty || term.difficulty === difficulty;
      return matchQ && matchDomain && matchDifficulty;
    })
    .slice(0, limit);
}

export function loadGeneratedEdges(domain: string): GeneratedEdge[] {
  if (edgeCache.has(domain)) {
    return edgeCache.get(domain) ?? [];
  }

  const file = path.join(relationshipDir, `${domain}.edges.json`);
  if (!fs.existsSync(file)) {
    edgeCache.set(domain, []);
    return [];
  }

  const items = parseJson<GeneratedEdge[]>(file);
  edgeCache.set(domain, items);
  return items;
}

export function loadGeneratedDiagnosticQuiz(domain: string): GeneratedQuiz[] {
  if (quizCache.has(domain)) {
    return quizCache.get(domain) ?? [];
  }

  const file = path.join(diagnosticsDir, `${domain}.diagnostic.15.json`);
  if (!fs.existsSync(file)) {
    quizCache.set(domain, []);
    return [];
  }

  const items = parseJson<GeneratedQuiz[]>(file);
  quizCache.set(domain, items);
  return items;
}

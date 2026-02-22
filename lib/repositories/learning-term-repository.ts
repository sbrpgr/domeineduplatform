import { getPrismaClient } from '@/lib/db';
import { sampleTerms } from '@/lib/data';
import { searchGeneratedTerms } from '@/lib/generated-data';
import type { Difficulty } from '@/lib/types';

export type LearningTerm = {
  id: string;
  slug: string;
  termKo: string;
  termEn: string;
  difficulty: Difficulty;
  oneLineDefinition: string;
  definitions: {
    novice: string;
    beginner: string;
    intermediate: string;
    advanced: string;
  };
  usageExamples: Array<{ context: string; example: string }>;
};

type PrismaRow = {
  id: string;
  slug: string;
  termKo: string;
  termEn: string | null;
  difficulty: Difficulty;
  oneLineDefinition: string;
};

const asDefinitionSet = (
  oneLine: string,
  defs: Array<{ level: Difficulty; content: string }>
): LearningTerm['definitions'] => {
  const map = new Map(defs.map((item) => [item.level, item.content]));
  return {
    novice: map.get('novice') ?? oneLine,
    beginner: map.get('beginner') ?? oneLine,
    intermediate: map.get('intermediate') ?? oneLine,
    advanced: map.get('advanced') ?? oneLine
  };
};

export async function listLearningTerms(domain: string, limit = 40): Promise<LearningTerm[]> {
  const prisma = getPrismaClient();
  const withTimeout = async <T>(promise: Promise<T>, ms = 1500): Promise<T> => {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('query_timeout')), ms))
    ]);
  };

  if (prisma) {
    try {
      const rows = (await withTimeout(
        prisma.term.findMany({
        where: { domain: { slug: domain } },
        select: {
          id: true,
          slug: true,
          termKo: true,
          termEn: true,
          difficulty: true,
          oneLineDefinition: true
        },
        take: limit
      })
      )) as unknown as PrismaRow[];

      if (rows.length > 0) {
        const definitions = (await withTimeout(prisma.$queryRaw`
          SELECT td.term_id::text AS term_id, td.level::text AS level, td.content
          FROM term_definitions td
          JOIN terms t ON t.id = td.term_id
          JOIN domains d ON d.id = t.domain_id
          WHERE d.slug = ${domain}
        `)) as Array<{ term_id: string; level: string; content: string }>;
        const examples = (await withTimeout(prisma.$queryRaw`
          SELECT te.term_id::text AS term_id, te.context, te.example
          FROM term_examples te
          JOIN terms t ON t.id = te.term_id
          JOIN domains d ON d.id = t.domain_id
          WHERE d.slug = ${domain}
          ORDER BY te.created_at ASC
        `)) as Array<{ term_id: string; context: string; example: string }>;

        const defsByTerm = new Map<string, Array<{ level: Difficulty; content: string }>>();
        for (const item of definitions) {
          const list = defsByTerm.get(item.term_id) ?? [];
          list.push({ level: item.level as Difficulty, content: item.content });
          defsByTerm.set(item.term_id, list);
        }

        const exByTerm = new Map<string, Array<{ context: string; example: string }>>();
        for (const item of examples) {
          const list = exByTerm.get(item.term_id) ?? [];
          if (list.length < 2) {
            list.push({ context: item.context, example: item.example });
            exByTerm.set(item.term_id, list);
          }
        }

        return rows.map((row) => ({
          id: row.id,
          slug: row.slug,
          termKo: row.termKo,
          termEn: row.termEn ?? '',
          difficulty: row.difficulty,
          oneLineDefinition: row.oneLineDefinition,
          definitions: asDefinitionSet(row.oneLineDefinition, defsByTerm.get(row.id) ?? []),
          usageExamples: exByTerm.get(row.id) ?? []
        }));
      }
    } catch {
      // fallback below
    }
  }

  const generated = searchGeneratedTerms(undefined, domain, undefined, limit);
  if (generated.length > 0) {
    return generated.map((item) => ({
      id: item.id,
      slug: item.slug,
      termKo: item.termKo,
      termEn: item.termEn,
      difficulty: item.difficulty,
      oneLineDefinition: item.oneLineDefinition,
      definitions: item.definitions,
      usageExamples: item.usageExamples
    }));
  }

  return sampleTerms
    .filter((item) => item.domain === domain)
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      slug: item.slug,
      termKo: item.termKo,
      termEn: item.termEn,
      difficulty: item.difficulty,
      oneLineDefinition: item.oneLineDefinition,
      definitions: item.definitions,
      usageExamples: item.usageExamples
    }));
}

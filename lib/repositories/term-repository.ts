import { getPrismaClient } from '@/lib/db';
import { sampleTerms } from '@/lib/data';
import { loadAllGeneratedTerms, searchGeneratedTerms } from '@/lib/generated-data';

export type RepositoryTerm = {
  id: string;
  slug: string;
  termKo: string;
  termEn: string;
  domain: string;
  difficulty: string;
  oneLineDefinition: string;
  level2Category?: string;
  level3Category?: string;
  lastReviewedAt?: string;
};

export type SitemapTermRoute = {
  domainSlug: string;
  categorySlug: string;
  slug: string;
  lastModified: Date;
};

type SqlTermRow = {
  id: string;
  slug: string;
  term_ko: string;
  term_en: string | null;
  one_line_definition: string;
  difficulty: string;
  domain_slug: string;
  level2_category: string | null;
  level3_category: string | null;
  updated_at: Date;
};

type SqlSitemapRow = {
  domain_slug: string;
  category_slug: string | null;
  slug: string;
  updated_at: Date;
};

const toCategorySlug = (value?: string) => (value ?? 'general').toLowerCase().trim().replace(/\s+/g, '-');

const mapSqlTerm = (row: SqlTermRow): RepositoryTerm => ({
  id: row.id,
  slug: row.slug,
  termKo: row.term_ko,
  termEn: row.term_en ?? '',
  domain: row.domain_slug,
  difficulty: row.difficulty,
  oneLineDefinition: row.one_line_definition,
  level2Category: row.level2_category ?? undefined,
  level3Category: row.level3_category ?? undefined,
  lastReviewedAt: row.updated_at.toISOString()
});

export async function searchTerms(query?: string, domain?: string, difficulty?: string): Promise<RepositoryTerm[]> {
  const prisma = getPrismaClient();

  if (prisma) {
    try {
      const conditions: string[] = [];
      const params: unknown[] = [];

      if (domain) {
        params.push(domain);
        conditions.push(`d.slug = $${params.length}`);
      }

      if (difficulty) {
        params.push(difficulty);
        conditions.push(`t.difficulty::text = $${params.length}`);
      }

      if (query) {
        params.push(`%${query}%`);
        const q1 = `$${params.length}`;
        params.push(`%${query}%`);
        const q2 = `$${params.length}`;
        conditions.push(`(t.term_ko ILIKE ${q1} OR COALESCE(t.term_en, '') ILIKE ${q2})`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const sql = `
        SELECT
          t.id::text AS id,
          t.slug,
          t.term_ko,
          t.term_en,
          t.one_line_definition,
          t.difficulty::text AS difficulty,
          d.slug AS domain_slug,
          c2.name_ko AS level2_category,
          c3.name_ko AS level3_category,
          t.updated_at
        FROM terms t
        JOIN domains d ON d.id = t.domain_id
        LEFT JOIN categories c ON c.id = t.category_id
        LEFT JOIN categories c2 ON c2.id = CASE WHEN c.level = 3 THEN c.parent_id ELSE c.id END
        LEFT JOIN categories c3 ON c3.id = CASE WHEN c.level = 3 THEN c.id ELSE NULL END
        ${whereClause}
        ORDER BY t.updated_at DESC
        LIMIT 50
      `;

      const rows = (await prisma.$queryRawUnsafe<SqlTermRow[]>(sql, ...params)) as SqlTermRow[];

      return rows.map(mapSqlTerm);
    } catch {
      // Fallback to generated/sample data when DB schema is partial.
    }
  }

  const generated = searchGeneratedTerms(query, domain, difficulty, 50);
  if (generated.length > 0) {
    return generated.map((term) => ({
      id: term.id,
      slug: term.slug,
      termKo: term.termKo,
      termEn: term.termEn,
      domain: term.domainSlug,
      difficulty: term.difficulty,
      oneLineDefinition: term.oneLineDefinition,
      level2Category: undefined,
      level3Category: undefined,
      lastReviewedAt: new Date().toISOString()
    }));
  }

  return sampleTerms
    .filter((term) => {
      const matchQ = !query || term.termKo.includes(query) || term.termEn.toLowerCase().includes(query.toLowerCase());
      const matchD = !domain || term.domain === domain;
      const matchLv = !difficulty || term.difficulty === difficulty;
      return matchQ && matchD && matchLv;
    })
    .map((term) => ({
      id: term.id,
      slug: term.slug,
      termKo: term.termKo,
      termEn: term.termEn,
      domain: term.domain,
      difficulty: term.difficulty,
      oneLineDefinition: term.oneLineDefinition,
      level2Category: term.level2Category,
      level3Category: term.level3Category,
      lastReviewedAt: term.lastReviewedAt
    }));
}

export async function findTermByIdOrSlug(value: string): Promise<RepositoryTerm | null> {
  const prisma = getPrismaClient();
  if (prisma) {
    try {
      const rows = (await prisma.$queryRawUnsafe<SqlTermRow[]>(
        `
        SELECT
          t.id::text AS id,
          t.slug,
          t.term_ko,
          t.term_en,
          t.one_line_definition,
          t.difficulty::text AS difficulty,
          d.slug AS domain_slug,
          c2.name_ko AS level2_category,
          c3.name_ko AS level3_category,
          t.updated_at
        FROM terms t
        JOIN domains d ON d.id = t.domain_id
        LEFT JOIN categories c ON c.id = t.category_id
        LEFT JOIN categories c2 ON c2.id = CASE WHEN c.level = 3 THEN c.parent_id ELSE c.id END
        LEFT JOIN categories c3 ON c3.id = CASE WHEN c.level = 3 THEN c.id ELSE NULL END
        WHERE t.id::text = $1 OR t.slug = $1
        ORDER BY t.updated_at DESC
        LIMIT 1
      `,
        value
      )) as SqlTermRow[];

      if (rows.length > 0) return mapSqlTerm(rows[0]);
    } catch {
      // Fallback to generated/sample data when DB schema is partial.
    }
  }

  const generated = loadAllGeneratedTerms().find((term) => term.id === value || term.slug === value);
  if (generated) {
    return {
      id: generated.id,
      slug: generated.slug,
      termKo: generated.termKo,
      termEn: generated.termEn,
      domain: generated.domainSlug,
      difficulty: generated.difficulty,
      oneLineDefinition: generated.oneLineDefinition,
      lastReviewedAt: new Date().toISOString()
    };
  }

  const sample = sampleTerms.find((term) => term.id === value || term.slug === value);
  if (!sample) return null;

  return {
    id: sample.id,
    slug: sample.slug,
    termKo: sample.termKo,
    termEn: sample.termEn,
    domain: sample.domain,
    difficulty: sample.difficulty,
    oneLineDefinition: sample.oneLineDefinition,
    level2Category: sample.level2Category,
    level3Category: sample.level3Category,
    lastReviewedAt: sample.lastReviewedAt
  };
}

export async function listTermsForSitemap(limit = 5000): Promise<SitemapTermRoute[]> {
  const prisma = getPrismaClient();
  if (prisma) {
    try {
      const safeLimit = Math.max(1, Math.min(limit, 10000));
      const rows = (await prisma.$queryRawUnsafe<SqlSitemapRow[]>(
        `
        SELECT
          d.slug AS domain_slug,
          c2.slug AS category_slug,
          t.slug,
          t.updated_at
        FROM terms t
        JOIN domains d ON d.id = t.domain_id
        LEFT JOIN categories c ON c.id = t.category_id
        LEFT JOIN categories c2 ON c2.id = CASE WHEN c.level = 3 THEN c.parent_id ELSE c.id END
        ORDER BY t.updated_at DESC
        LIMIT $1
      `,
        safeLimit
      )) as SqlSitemapRow[];

      return rows.map((row) => ({
        domainSlug: row.domain_slug,
        categorySlug: row.category_slug ?? 'general',
        slug: row.slug,
        lastModified: row.updated_at
      }));
    } catch {
      // Fallback to generated/sample data when DB schema is partial.
    }
  }

  const generated = loadAllGeneratedTerms();
  if (generated.length > 0) {
    return generated.slice(0, limit).map((term) => ({
      domainSlug: term.domainSlug,
      categorySlug: 'general',
      slug: term.slug,
      lastModified: new Date()
    }));
  }

  return sampleTerms.slice(0, limit).map((term) => ({
    domainSlug: term.domain,
    categorySlug: toCategorySlug(term.level2Category),
    slug: term.slug,
    lastModified: new Date(term.lastReviewedAt)
  }));
}

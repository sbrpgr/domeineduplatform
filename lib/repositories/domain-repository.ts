import { getPrismaClient } from '@/lib/db';
import { domains as sampleDomains } from '@/lib/data';
import type { Domain, Priority } from '@/lib/types';

type DomainRow = {
  slug: string;
  nameKo: string;
  nameEn: string;
  targetTermCount: number;
  priority: string;
};

type CategoryRow = {
  id: string;
  domain_slug: string;
  level: number;
  parent_id: string | null;
  name_ko: string;
};

const isPriority = (value: string): value is Priority => value === 'P1' || value === 'P2' || value === 'P3';

export async function listDomains(): Promise<Domain[]> {
  const prisma = getPrismaClient();
  if (!prisma) return sampleDomains;

  try {
    const domainRows = (await prisma.domain.findMany({
      orderBy: [{ priority: 'asc' }, { slug: 'asc' }]
    })) as unknown as DomainRow[];

    if (domainRows.length === 0) return sampleDomains;

    const categoryRows = (await prisma.$queryRaw`
      SELECT
        c.id::text AS id,
        d.slug AS domain_slug,
        c.level,
        c.parent_id::text AS parent_id,
        c.name_ko
      FROM categories c
      JOIN domains d ON d.id = c.domain_id
      ORDER BY d.slug, c.level, c.name_ko
    `) as CategoryRow[];

    const categoriesByDomain = new Map<string, CategoryRow[]>();
    for (const row of categoryRows) {
      const current = categoriesByDomain.get(row.domain_slug) ?? [];
      current.push(row);
      categoriesByDomain.set(row.domain_slug, current);
    }

    return domainRows.map((row) => {
      const rows = categoriesByDomain.get(row.slug) ?? [];
      const level2Rows = rows.filter((item) => item.level === 2);
      const level3Rows = rows.filter((item) => item.level === 3);

      const level3ByParent = new Map<string, string[]>();
      for (const l3 of level3Rows) {
        if (!l3.parent_id) continue;
        const current = level3ByParent.get(l3.parent_id) ?? [];
        current.push(l3.name_ko);
        level3ByParent.set(l3.parent_id, current);
      }

      const categoryTree = level2Rows.map((l2) => ({
        level2: l2.name_ko,
        level3: level3ByParent.get(l2.id) ?? []
      }));

      return {
        slug: row.slug,
        nameKo: row.nameKo,
        nameEn: row.nameEn,
        targetTermCount: row.targetTermCount,
        priority: isPriority(row.priority) ? row.priority : 'P3',
        categoryTree
      };
    });
  } catch {
    return sampleDomains;
  }
}

export async function findDomainBySlug(slug: string): Promise<Domain | null> {
  const items = await listDomains();
  return items.find((domain) => domain.slug === slug) ?? null;
}

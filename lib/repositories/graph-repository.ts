import { getPrismaClient } from '@/lib/db';
import { sampleRelationships } from '@/lib/data';
import { loadGeneratedEdges } from '@/lib/generated-data';
import type { RelationshipEdge } from '@/lib/types';

type GraphEdgeRow = {
  from: string;
  to: string;
  relation: string;
};

const toRelation = (value: string): RelationshipEdge['relation'] => {
  if (value === 'parent' || value === 'sibling' || value === 'child' || value === 'opposite') return value;
  return 'sibling';
};

export async function listGraphEdges(domain?: string): Promise<RelationshipEdge[]> {
  const prisma = getPrismaClient();

  if (prisma) {
    try {
      const rows = domain
        ? ((await prisma.$queryRaw`
            SELECT ft.slug AS "from", tt.slug AS "to", tr.relation::text AS relation
            FROM term_relationships tr
            JOIN terms ft ON ft.id = tr.from_term_id
            JOIN terms tt ON tt.id = tr.to_term_id
            JOIN domains d ON d.id = ft.domain_id
            WHERE d.slug = ${domain}
            ORDER BY ft.slug, tt.slug
            LIMIT 5000
          `) as GraphEdgeRow[])
        : ((await prisma.$queryRaw`
            SELECT ft.slug AS "from", tt.slug AS "to", tr.relation::text AS relation
            FROM term_relationships tr
            JOIN terms ft ON ft.id = tr.from_term_id
            JOIN terms tt ON tt.id = tr.to_term_id
            ORDER BY ft.slug, tt.slug
            LIMIT 5000
          `) as GraphEdgeRow[]);

      if (rows.length > 0) {
        return rows.map((row) => ({
          from: row.from,
          to: row.to,
          relation: toRelation(row.relation)
        }));
      }
    } catch {
      // fallback below
    }
  }

  const generated = domain ? loadGeneratedEdges(domain) : [];
  if (generated.length > 0) return generated;
  return sampleRelationships;
}

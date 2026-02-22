import type { MetadataRoute } from 'next';
import { listDomains } from '@/lib/repositories/domain-repository';
import { listTermsForSitemap } from '@/lib/repositories/term-repository';

const base = 'https://domain-glossary.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/explore',
    '/search',
    '/onboarding',
    '/login',
    '/signup',
    '/learn',
    '/dashboard',
    '/glossary',
    '/contribute'
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date('2026-02-20T00:00:00.000Z'),
    changeFrequency: 'weekly',
    priority: 0.7
  }));

  const [domains, terms] = await Promise.all([listDomains(), listTermsForSitemap()]);

  const termRoutes: MetadataRoute.Sitemap = terms.map((term) => ({
    url: `${base}/term/${term.domainSlug}/${term.categorySlug}/${term.slug}`,
    lastModified: term.lastModified,
    changeFrequency: 'monthly',
    priority: 0.8
  }));

  const domainRoutes: MetadataRoute.Sitemap = domains.map((domain) => ({
    url: `${base}/learn/${domain.slug}`,
    lastModified: new Date('2026-02-20T00:00:00.000Z'),
    changeFrequency: 'weekly',
    priority: 0.75
  }));

  return [...staticRoutes, ...domainRoutes, ...termRoutes];
}

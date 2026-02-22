export type SeoTermMeta = {
  termKo: string;
  termEn: string;
  oneLineDefinition: string;
  imageUrl?: string;
  path: string;
};

const siteUrl = 'https://domain-glossary.com';

export function buildTermMetadata(input: SeoTermMeta) {
  const title = `${input.termKo} (${input.termEn}) 뜻 | 도메인 용어 백과사전`;
  const description = `${input.oneLineDefinition} 도메인 용어 백과사전에서 ${input.termKo}의 의미와 활용법을 알아보세요.`;
  const canonical = `${siteUrl}${input.path}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: canonical,
        en: `${canonical}?lang=en`
      }
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      images: input.imageUrl ? [input.imageUrl] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}

export function buildDefinedTermJsonLd(input: SeoTermMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: input.termKo,
    inDefinedTermSet: '도메인 용어 백과사전',
    termCode: input.termEn,
    description: input.oneLineDefinition,
    url: `${siteUrl}${input.path}`
  };
}

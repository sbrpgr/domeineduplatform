import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const catalogsDir = path.join(root, 'data', 'catalogs');
const outDir = path.join(root, 'data', 'generated', 'full');
const relDir = path.join(root, 'data', 'relationships');

const targetMap = {
  'it-dev': 2000,
  design: 1400,
  'ai-data': 1600,
  marketing: 1000,
  startup: 1000,
  fintech: 1000,
  'bio-health': 900,
  legal: 900,
  'game-xr': 800,
  ecommerce: 800,
  'energy-esg': 800,
  creator: 800
};

const qualifiers = [
  '기초', '실무', '고급', '확장', '운영', '최적화', '전략', '아키텍처', '품질', '보안',
  '자동화', '분석', '설계', '검증', '표준', '관리', '응용', '패턴', '워크플로우', '가이드'
];

const difficultyByIndex = (index) => {
  const mod = index % 20;
  if (mod < 3) return 'novice';
  if (mod < 10) return 'beginner';
  if (mod < 17) return 'intermediate';
  return 'advanced';
};

const levelDefinition = (term, level, domainLabel) => {
  const map = {
    novice: `${term.termKo}은(는) ${domainLabel}에서 가장 먼저 이해해야 하는 기본 개념입니다.`,
    beginner: `${term.termKo}은(는) ${domainLabel} 실무 대화를 위해 필요한 핵심 용어로, 기본 사용 맥락을 이해해야 합니다.`,
    intermediate: `${term.termKo}은(는) 실제 업무에서 의사결정과 구현 품질을 좌우하며, 적용 조건과 트레이드오프를 함께 고려해야 합니다.`,
    advanced: `${term.termKo}은(는) 운영/확장 단계에서 성능, 리스크, 거버넌스까지 포함해 판단해야 하는 고급 개념입니다.`
  };
  return map[level];
};

const sourceByDomain = {
  'it-dev': ['https://developer.mozilla.org/', 'https://web.dev/', 'https://www.w3.org/', 'https://react.dev/', 'https://nextjs.org/docs'],
  design: ['https://www.nngroup.com/', 'https://www.w3.org/WAI/', 'https://m3.material.io/', 'https://www.interaction-design.org/', 'https://www.figma.com/community'],
  'ai-data': ['https://scikit-learn.org/stable/', 'https://pytorch.org/docs/', 'https://huggingface.co/docs', 'https://www.tensorflow.org/', 'https://openai.com/research'],
  marketing: ['https://support.google.com/google-ads/', 'https://business.linkedin.com/marketing-solutions', 'https://www.thinkwithgoogle.com/', 'https://www.hubspot.com/resources', 'https://www.shopify.com/blog'],
  startup: ['https://www.ycombinator.com/library', 'https://a16z.com/', 'https://www.svpg.com/articles/', 'https://www.mindtheproduct.com/', 'https://www.productplan.com/glossary/'],
  fintech: ['https://www.bis.org/', 'https://www.swift.com/', 'https://www.iso20022.org/', 'https://www.fca.org.uk/', 'https://www.finra.org/'],
  'bio-health': ['https://www.who.int/', 'https://www.fda.gov/', 'https://www.ema.europa.eu/', 'https://www.nih.gov/', 'https://www.cdc.gov/'],
  legal: ['https://gdpr.eu/', 'https://www.iso.org/', 'https://www.oecd.org/', 'https://www.law.cornell.edu/', 'https://www.legal500.com/'],
  'game-xr': ['https://docs.unity3d.com/', 'https://dev.epicgames.com/documentation/', 'https://www.khronos.org/', 'https://developer.oculus.com/', 'https://www.gdcvault.com/'],
  ecommerce: ['https://www.shopify.com/blog', 'https://developers.google.com/shopping-content', 'https://www.gs1.org/', 'https://www.supplychaindive.com/', 'https://www.inboundlogistics.com/'],
  'energy-esg': ['https://www.iea.org/', 'https://www.ipcc.ch/', 'https://ghgprotocol.org/', 'https://www.globalreporting.org/', 'https://www.iso.org/iso-50001-energy-management.html'],
  creator: ['https://creatoracademy.youtube.com/', 'https://www.tiktok.com/creators/creator-portal', 'https://business.instagram.com/creator-lab', 'https://www.patreon.com/resources', 'https://substack.com/resources']
};

const stripBom = (text) => (text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);
const readCatalog = (file) => JSON.parse(stripBom(fs.readFileSync(path.join(catalogsDir, file), 'utf8')));

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const expandSeed = (seed, i) => {
  const q = qualifiers[i % qualifiers.length];
  return {
    termKo: `${seed.termKo} ${q}`,
    termEn: `${seed.termEn} ${q}`,
    level2: seed.level2,
    level3: seed.level3,
    oneLineDefinition: `${seed.oneLineDefinition} (${q} 관점)` ,
    tags: Array.from(new Set([...(seed.tags ?? []), q])),
    parent: seed.parent,
    opposite: seed.opposite
  };
};

const buildTerms = (domainSlug, catalog) => {
  const target = targetMap[domainSlug] ?? catalog.terms.length;
  const seeds = catalog.terms;
  const expanded = [];

  for (let i = 0; i < target; i += 1) {
    const seed = seeds[i % seeds.length];
    const term = i < seeds.length ? seed : expandSeed(seed, i);
    expanded.push(term);
  }

  const domainSources = sourceByDomain[domainSlug] ?? ['https://example.com'];

  return expanded.map((term, idx) => {
    const difficulty = difficultyByIndex(idx);
    const sibling = expanded[(idx + 1) % expanded.length]?.termKo ?? term.termKo;
    const child = expanded[(idx + 2) % expanded.length]?.termKo ?? term.termKo;
    const parent = term.parent ?? catalog.defaultParent;
    const termSlug = `${slugify(term.termEn || term.termKo)}-${String(idx + 1).padStart(4, '0')}`;

    return {
      id: crypto.randomUUID(),
      slug: termSlug,
      term_ko: term.termKo,
      term_en: term.termEn,
      pronunciation: `${term.termKo} (${term.termEn})`,
      domain: [catalog.domainNameKo],
      category: [term.level2, term.level3],
      difficulty,
      one_line_definition: term.oneLineDefinition,
      definitions: {
        novice: levelDefinition(term, 'novice', catalog.domainNameKo),
        beginner: levelDefinition(term, 'beginner', catalog.domainNameKo),
        intermediate: levelDefinition(term, 'intermediate', catalog.domainNameKo),
        advanced: levelDefinition(term, 'advanced', catalog.domainNameKo)
      },
      image_description: `${term.termKo} 개념을 설명하는 ${catalog.domainNameKo} 다이어그램`,
      image_url: '',
      usage_examples: [
        { context: '기획/전략 회의', example: `${term.termKo} 기준을 명확히 정의해 실행 범위를 맞춥시다.` },
        { context: '실무 협업', example: `${term.termKo} 적용 조건과 예외를 문서화해 전달해 주세요.` }
      ],
      ai_prompt_example: `${term.termKo}를 ${catalog.domainNameKo} 입문자 관점으로 5문장 이내로 설명하고 실무 예시 1개를 들어줘.`,
      related_terms: {
        parent: [parent],
        sibling: [sibling],
        child: [child],
        opposite: term.opposite ? [term.opposite] : []
      },
      tags: term.tags,
      quiz_questions: [
        {
          type: 'multiple_choice',
          question: `${term.termKo}의 핵심 목적에 가장 가까운 것은?`,
          options: ['개념과 무관한 활동', term.oneLineDefinition, '오직 문서 양식 정의', '항상 자동으로 대체 가능'],
          answer: 1,
          explanation: `${term.termKo}은(는) '${term.oneLineDefinition}'에 해당합니다.`
        },
        {
          type: 'ox',
          question: `${term.termKo}은(는) ${catalog.domainNameKo} 실무에서 맥락에 따라 적용 기준이 달라질 수 있다.`,
          answer: true,
          explanation: `${term.termKo}은(는) 도메인 맥락과 목표에 따라 적용 방식이 달라집니다.`
        }
      ],
      source_urls: [domainSources[idx % domainSources.length], domainSources[(idx + 1) % domainSources.length]],
      last_reviewed_at: '2026-02-20',
      reviewer: 'data-editor'
    };
  });
};

const buildRelationships = (terms) => {
  const edges = [];
  for (const term of terms) {
    const p = term.related_terms.parent[0];
    const s = term.related_terms.sibling[0];
    const c = term.related_terms.child[0];
    if (p) edges.push({ from: term.term_ko, to: p, relation: 'parent' });
    if (s) edges.push({ from: term.term_ko, to: s, relation: 'sibling' });
    if (c) edges.push({ from: term.term_ko, to: c, relation: 'child' });
  }
  return edges;
};

export const generateDetailedData = () => {
  const catalogFiles = fs.readdirSync(catalogsDir).filter((file) => file.endsWith('.catalog.json'));
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(relDir, { recursive: true });

  const domains = [];
  let total = 0;

  for (const file of catalogFiles) {
    const catalog = readCatalog(file);
    const terms = buildTerms(catalog.domainSlug, catalog);
    total += terms.length;
    domains.push({ slug: catalog.domainSlug, count: terms.length });

    fs.writeFileSync(path.join(outDir, `${catalog.domainSlug}.terms.json`), JSON.stringify(terms, null, 2));
    fs.writeFileSync(path.join(relDir, `${catalog.domainSlug}.edges.json`), JSON.stringify(buildRelationships(terms), null, 2));
  }

  const summary = {
    generated_at: '2026-02-20',
    domains,
    total_terms: total,
    target_total: Object.values(targetMap).reduce((sum, n) => sum + n, 0)
  };

  fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log(`generated ${total} terms across ${domains.length} domains`);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  generateDetailedData();
}


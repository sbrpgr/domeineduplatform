import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const root = process.cwd();
const fullDir = path.join(root, 'data', 'generated', 'full');

const domainMeta = {
  'it-dev': { nameKo: 'IT 개발', nameEn: 'IT Development', priority: 'P1' },
  design: { nameKo: '디자인', nameEn: 'Design', priority: 'P1' },
  'ai-data': { nameKo: 'AI / 데이터 사이언스', nameEn: 'AI / Data Science', priority: 'P1' },
  marketing: { nameKo: '마케팅 / 그로스 해킹', nameEn: 'Marketing / Growth', priority: 'P1' },
  startup: { nameKo: '스타트업 / PM / 경영', nameEn: 'Startup / PM / Management', priority: 'P1' },
  fintech: { nameKo: '핀테크 / 금융', nameEn: 'Fintech / Finance', priority: 'P2' },
  'bio-health': { nameKo: '바이오 / 헬스케어', nameEn: 'Bio / Healthcare', priority: 'P2' },
  legal: { nameKo: '법률 / 컴플라이언스', nameEn: 'Legal / Compliance', priority: 'P2' },
  'game-xr': { nameKo: '게임 / 메타버스 / XR', nameEn: 'Game / Metaverse / XR', priority: 'P2' },
  ecommerce: { nameKo: '이커머스 / 물류 / SCM', nameEn: 'E-commerce / SCM', priority: 'P3' },
  'energy-esg': { nameKo: '에너지 / 스마트팩토리 / ESG', nameEn: 'Energy / Smart Factory / ESG', priority: 'P3' },
  creator: { nameKo: '크리에이터 이코노미', nameEn: 'Creator Economy', priority: 'P3' }
};

const relationKeys = ['parent', 'sibling', 'child', 'opposite'];

const stripBom = (text) => (text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);
const readJson = (filePath) => JSON.parse(stripBom(fs.readFileSync(filePath, 'utf8')));

const chunk = (items, size) => {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

const difficultyBeta = (difficulty) => {
  if (difficulty === 'novice') return 1.5;
  if (difficulty === 'beginner') return 2.5;
  if (difficulty === 'intermediate') return 3.5;
  return 4.5;
};

async function upsertDomain(slug, count) {
  const meta = domainMeta[slug] ?? { nameKo: slug, nameEn: slug, priority: 'P3' };
  return prisma.domain.upsert({
    where: { slug },
    update: {
      nameKo: meta.nameKo,
      nameEn: meta.nameEn,
      priority: meta.priority,
      targetTermCount: count
    },
    create: {
      slug,
      nameKo: meta.nameKo,
      nameEn: meta.nameEn,
      priority: meta.priority,
      targetTermCount: count
    }
  });
}

async function resetDerivedRows(domainId) {
  await prisma.$executeRaw`
    DELETE FROM quiz_options
    WHERE question_id IN (SELECT id FROM quiz_questions WHERE domain_id = ${domainId}::uuid)
  `;

  await prisma.$executeRaw`
    DELETE FROM quiz_questions
    WHERE domain_id = ${domainId}::uuid
  `;

  await prisma.$executeRaw`
    DELETE FROM term_relationships tr
    USING terms t
    WHERE tr.from_term_id = t.id
      AND t.domain_id = ${domainId}::uuid
  `;

  await prisma.$executeRaw`
    DELETE FROM term_examples te
    USING terms t
    WHERE te.term_id = t.id
      AND t.domain_id = ${domainId}::uuid
  `;
}

async function insertTermExamples(terms, idBySlug) {
  let count = 0;
  for (const item of terms) {
    const termId = idBySlug.get(item.slug);
    if (!termId || !Array.isArray(item.usage_examples)) continue;

    for (const ex of item.usage_examples) {
      if (!ex?.context || !ex?.example) continue;
      await prisma.$executeRaw`
        INSERT INTO term_examples (id, term_id, context, example, created_at)
        VALUES (${crypto.randomUUID()}::uuid, ${termId}::uuid, ${ex.context}, ${ex.example}, NOW())
      `;
      count += 1;
    }
  }
  return count;
}

async function insertRelationships(terms, idBySlug, idByTermKo) {
  let count = 0;
  for (const item of terms) {
    const fromId = idBySlug.get(item.slug);
    if (!fromId || !item.related_terms) continue;

    for (const relation of relationKeys) {
      const labels = Array.isArray(item.related_terms[relation]) ? item.related_terms[relation] : [];
      for (const label of labels) {
        const toId = idByTermKo.get(label);
        if (!toId || fromId === toId) continue;

        await prisma.$executeRaw`
          INSERT INTO term_relationships (id, from_term_id, to_term_id, relation, created_at)
          VALUES (${crypto.randomUUID()}::uuid, ${fromId}::uuid, ${toId}::uuid, ${relation}, NOW())
          ON CONFLICT (from_term_id, to_term_id, relation) DO NOTHING
        `;
        count += 1;
      }
    }
  }

  return count;
}

async function insertQuizRows(terms, domainId, idBySlug) {
  let questionCount = 0;
  let optionCount = 0;

  for (const item of terms) {
    const termId = idBySlug.get(item.slug);
    if (!termId || !Array.isArray(item.quiz_questions)) continue;

    for (const q of item.quiz_questions) {
      const questionId = crypto.randomUUID();
      await prisma.$executeRaw`
        INSERT INTO quiz_questions (id, term_id, domain_id, question_type, prompt, difficulty_beta, created_at)
        VALUES (
          ${questionId}::uuid,
          ${termId}::uuid,
          ${domainId}::uuid,
          ${q.type ?? 'multiple_choice'},
          ${q.question ?? ''},
          ${difficultyBeta(item.difficulty)},
          NOW()
        )
      `;
      questionCount += 1;

      const options = Array.isArray(q.options) ? q.options : [];
      for (let idx = 0; idx < options.length; idx += 1) {
        const opt = options[idx];
        const isCorrect = typeof q.answer === 'number' ? q.answer === idx : String(q.answer) === String(opt);
        await prisma.$executeRaw`
          INSERT INTO quiz_options (id, question_id, option_text, is_correct, option_order)
          VALUES (${crypto.randomUUID()}::uuid, ${questionId}::uuid, ${opt}, ${isCorrect}, ${idx + 1})
        `;
        optionCount += 1;
      }
    }
  }

  return { questionCount, optionCount };
}

async function seedDomain(slug) {
  const file = path.join(fullDir, `${slug}.terms.json`);
  if (!fs.existsSync(file)) {
    return { slug, inserted: 0, definitions: 0, examples: 0, relationships: 0, quizQuestions: 0, quizOptions: 0 };
  }

  const terms = readJson(file);
  const domain = await upsertDomain(slug, terms.length);
  let inserted = 0;
  let definitionInserted = 0;

  const termChunks = chunk(terms, 300);
  for (const group of termChunks) {
    const payload = group.map((item) => ({
      slug: item.slug,
      termKo: item.term_ko,
      termEn: item.term_en,
      pronunciation: item.pronunciation,
      domainId: domain.id,
      difficulty: item.difficulty,
      oneLineDefinition: item.one_line_definition,
      imageDescription: item.image_description,
      imageUrl: item.image_url || null,
      tags: item.tags
    }));

    const created = await prisma.term.createMany({ data: payload, skipDuplicates: true });
    inserted += created.count;

    const slugs = group.map((item) => item.slug);
    const rows = await prisma.term.findMany({ where: { slug: { in: slugs } }, select: { id: true, slug: true } });
    const idBySlug = new Map(rows.map((row) => [row.slug, row.id]));

    const defs = [];
    for (const item of group) {
      const termId = idBySlug.get(item.slug);
      if (!termId) continue;
      defs.push({ termId, level: 'novice', content: item.definitions.novice });
      defs.push({ termId, level: 'beginner', content: item.definitions.beginner });
      defs.push({ termId, level: 'intermediate', content: item.definitions.intermediate });
      defs.push({ termId, level: 'advanced', content: item.definitions.advanced });
    }

    const defCreated = await prisma.termDefinition.createMany({ data: defs, skipDuplicates: true });
    definitionInserted += defCreated.count;
  }

  const domainTerms = await prisma.term.findMany({
    where: { domainId: domain.id },
    select: { id: true, slug: true, termKo: true }
  });
  const idBySlug = new Map(domainTerms.map((row) => [row.slug, row.id]));
  const idByTermKo = new Map();
  for (const row of domainTerms) {
    if (!idByTermKo.has(row.termKo)) {
      idByTermKo.set(row.termKo, row.id);
    }
  }

  await resetDerivedRows(domain.id);
  const examples = await insertTermExamples(terms, idBySlug);
  const relationships = await insertRelationships(terms, idBySlug, idByTermKo);
  const quizStats = await insertQuizRows(terms, domain.id, idBySlug);

  return {
    slug,
    inserted,
    definitions: definitionInserted,
    examples,
    relationships,
    quizQuestions: quizStats.questionCount,
    quizOptions: quizStats.optionCount
  };
}

async function main() {
  const files = fs.readdirSync(fullDir).filter((file) => file.endsWith('.terms.json'));
  const slugs = files.map((file) => file.replace('.terms.json', ''));

  const results = [];
  for (const slug of slugs) {
    const result = await seedDomain(slug);
    results.push(result);
    console.log(
      `[seed] ${slug}: terms +${result.inserted}, definitions +${result.definitions}, examples +${result.examples}, ` +
      `relationships +${result.relationships}, quiz_q +${result.quizQuestions}, quiz_opt +${result.quizOptions}`
    );
  }

  const totalTerms = results.reduce((sum, item) => sum + item.inserted, 0);
  const totalDefs = results.reduce((sum, item) => sum + item.definitions, 0);
  const totalExamples = results.reduce((sum, item) => sum + item.examples, 0);
  const totalRels = results.reduce((sum, item) => sum + item.relationships, 0);
  const totalQuizQ = results.reduce((sum, item) => sum + item.quizQuestions, 0);
  const totalQuizOpt = results.reduce((sum, item) => sum + item.quizOptions, 0);

  console.log(
    `[seed] done. terms +${totalTerms}, definitions +${totalDefs}, examples +${totalExamples}, ` +
    `relationships +${totalRels}, quiz_q +${totalQuizQ}, quiz_opt +${totalQuizOpt}`
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

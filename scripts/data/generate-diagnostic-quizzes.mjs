import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const termsDir = path.join(root, 'data', 'generated', 'full');
const outDir = path.join(root, 'data', 'diagnostics');
const selfAssessment = ['들어봤다', '설명할 수 있다', '직접 사용해봤다'];

const buildQuiz = (domainSlug, terms) => {
  const selected = terms.slice(0, 15);
  return selected.map((term, idx) => {
    const type = idx % 3 === 0 ? 'multiple_choice' : idx % 3 === 1 ? 'ox' : 'matching';
    if (type === 'multiple_choice') {
      return {
        id: `${domainSlug}-diag-${String(idx + 1).padStart(2, '0')}`,
        type,
        question: `${term.term_ko}의 가장 적절한 설명은 무엇인가?`,
        options: ['도메인과 무관한 개념', term.one_line_definition, '항상 동일한 고정 UI 요소', '문서 포맷 이름'],
        answer: 1,
        explanation: `${term.term_ko}의 핵심은 '${term.one_line_definition}'입니다.`,
        self_assessment: selfAssessment
      };
    }

    if (type === 'ox') {
      return {
        id: `${domainSlug}-diag-${String(idx + 1).padStart(2, '0')}`,
        type,
        question: `${term.term_ko}은(는) 실무 맥락에 따라 적용 기준이 달라질 수 있다.`,
        answer: true,
        explanation: `${term.term_ko}은(는) 목적/맥락에 따라 적용 방식이 달라집니다.`,
        self_assessment: selfAssessment
      };
    }

    return {
      id: `${domainSlug}-diag-${String(idx + 1).padStart(2, '0')}`,
      type,
      question: `${term.term_ko}와 가장 관련된 상위 개념을 고르세요.`,
      options: [term.related_terms.parent[0], term.related_terms.sibling[0], term.related_terms.child[0]],
      answer: term.related_terms.parent[0],
      explanation: `${term.term_ko}의 상위 개념은 ${term.related_terms.parent[0]}입니다.`,
      self_assessment: selfAssessment
    };
  });
};

export const generateDiagnosticQuizzes = () => {
  fs.mkdirSync(outDir, { recursive: true });
  const termFiles = fs.readdirSync(termsDir).filter((file) => file.endsWith('.terms.json'));

  for (const file of termFiles) {
    const domainSlug = file.replace('.terms.json', '');
    const terms = JSON.parse(fs.readFileSync(path.join(termsDir, file), 'utf8'));
    const quiz = buildQuiz(domainSlug, terms);
    fs.writeFileSync(path.join(outDir, `${domainSlug}.diagnostic.15.json`), JSON.stringify(quiz, null, 2));
  }

  const rubric = {
    assigned_at: '2026-02-20',
    score_rubric: {
      novice: '0-3',
      beginner: '4-7',
      intermediate: '8-11',
      advanced: '12-15'
    }
  };
  fs.writeFileSync(path.join(outDir, 'rubric.json'), JSON.stringify(rubric, null, 2));

  console.log(`generated diagnostic quizzes for ${termFiles.length} domains`);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  generateDiagnosticQuizzes();
}

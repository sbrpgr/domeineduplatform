import { getPrismaClient } from '@/lib/db';
import { diagnosticQuizzes } from '@/lib/data';
import { loadGeneratedDiagnosticQuiz } from '@/lib/generated-data';
import type { QuizQuestion } from '@/lib/types';

type QuizRow = {
  id: string;
  type: string;
  prompt: string;
  options: { text: string; is_correct: boolean; option_order: number }[];
};

const toQuizType = (value: string): QuizQuestion['type'] => {
  if (value === 'multiple_choice' || value === 'ox' || value === 'matching') return value;
  return 'multiple_choice';
};

const getAnswer = (row: QuizRow): number | boolean | string => {
  if (row.type === 'ox') {
    const correct = row.options.find((item) => item.is_correct)?.text?.toLowerCase();
    if (correct === 'o' || correct === 'true' || correct === 'yes') return true;
    if (correct === 'x' || correct === 'false' || correct === 'no') return false;
    return true;
  }

  if (row.type === 'matching') {
    const correct = row.options.find((item) => item.is_correct);
    return correct?.text ?? '';
  }

  const index = row.options.findIndex((item) => item.is_correct);
  return index >= 0 ? index : 0;
};

export async function listDiagnosticQuiz(domain: string): Promise<QuizQuestion[]> {
  const prisma = getPrismaClient();
  if (prisma) {
    try {
      const rows = (await prisma.$queryRaw`
        SELECT
          q.id::text AS id,
          q.question_type::text AS type,
          q.prompt,
          COALESCE(
            json_agg(
              json_build_object(
                'text', o.option_text,
                'is_correct', o.is_correct,
                'option_order', o.option_order
              )
              ORDER BY o.option_order
            ) FILTER (WHERE o.id IS NOT NULL),
            '[]'::json
          ) AS options
        FROM quiz_questions q
        JOIN domains d ON d.id = q.domain_id
        LEFT JOIN quiz_options o ON o.question_id = q.id
        WHERE d.slug = ${domain}
        GROUP BY q.id, q.question_type, q.prompt, q.created_at
        ORDER BY q.created_at ASC
        LIMIT 15
      `) as QuizRow[];

      if (rows.length > 0) {
        return rows.map((row) => ({
          id: row.id,
          type: toQuizType(row.type),
          question: row.prompt,
          options: row.type === 'ox' ? undefined : row.options.map((item) => item.text),
          answer: getAnswer(row),
          explanation: 'Diagnostic quiz answer.'
        }));
      }
    } catch {
      // fallback below
    }
  }

  const generated = loadGeneratedDiagnosticQuiz(domain);
  if (generated.length > 0) return generated;
  return diagnosticQuizzes[domain] ?? [];
}

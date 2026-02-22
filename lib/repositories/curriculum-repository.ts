import { getPrismaClient } from '@/lib/db';
import { getTermsByDomain } from '@/lib/data';
import { searchGeneratedTerms } from '@/lib/generated-data';
import type { Difficulty } from '@/lib/types';

type QueueReason = 'review_due' | 'weak_term' | 'new';

type QueueItem = {
  term_id: string;
  reason: QueueReason;
  priority: number;
};

type CurriculumResponse = {
  user_id: string;
  domain: string;
  user_level: Difficulty;
  learning_goal: string;
  daily_target_terms: number;
  today_queue: QueueItem[];
  weekly_plan: Record<string, string[]>;
  estimated_completion_days: number;
};

type LearningRecordRow = {
  termId: string;
  attempts: number;
  correctCount: number;
  nextReviewAt: Date | null;
};

const weekDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const inferLevel = (records: LearningRecordRow[]): Difficulty => {
  if (records.length === 0) return 'beginner';

  const attempts = records.reduce((sum, item) => sum + item.attempts, 0);
  const correct = records.reduce((sum, item) => sum + item.correctCount, 0);
  if (attempts === 0) return 'beginner';

  const accuracy = correct / attempts;
  if (accuracy < 0.45) return 'novice';
  if (accuracy < 0.7) return 'beginner';
  if (accuracy < 0.85) return 'intermediate';
  return 'advanced';
};

const buildWeeklyPlan = (queue: QueueItem[]): Record<string, string[]> => {
  const out: Record<string, string[]> = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };

  queue.forEach((item, idx) => {
    const day = weekDays[idx % weekDays.length];
    out[day].push(item.term_id);
  });

  return out;
};

const fallbackCurriculum = (domain: string, userId: string): CurriculumResponse => {
  const generated = searchGeneratedTerms(undefined, domain, undefined, 12);
  const sample = getTermsByDomain(domain).slice(0, 12);

  const ids = (generated.length > 0 ? generated.map((term) => term.id) : sample.map((term) => term.id)).slice(0, 10);
  const todayQueue = ids.map((termId, idx) => ({
    term_id: termId,
    reason: idx < 3 ? 'review_due' : idx < 6 ? 'weak_term' : 'new',
    priority: idx + 1
  })) as QueueItem[];

  return {
    user_id: userId,
    domain,
    user_level: 'beginner',
    learning_goal: 'ai_communication',
    daily_target_terms: 10,
    today_queue: todayQueue,
    weekly_plan: buildWeeklyPlan(todayQueue),
    estimated_completion_days: domain === 'design' ? 30 : 45
  };
};

export async function getLearningCurriculum(domain: string, userId: string): Promise<CurriculumResponse> {
  const prisma = getPrismaClient();
  if (!prisma || userId === 'anonymous') {
    return fallbackCurriculum(domain, userId);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      return fallbackCurriculum(domain, userId);
    }

    const domainRow = await prisma.domain.findUnique({ where: { slug: domain }, select: { id: true } });
    if (!domainRow) {
      return fallbackCurriculum(domain, userId);
    }

    const now = new Date();
    const records = (await prisma.userLearningRecord.findMany({
      where: {
        userId: user.id,
        term: { domain: { slug: domain } }
      },
      select: {
        termId: true,
        attempts: true,
        correctCount: true,
        nextReviewAt: true
      }
    })) as LearningRecordRow[];

    const seenSet = new Set(records.map((item) => item.termId));

    const reviewDue = records
      .filter((item) => item.nextReviewAt && item.nextReviewAt <= now)
      .sort((a, b) => Number((a.nextReviewAt ?? now).getTime() - (b.nextReviewAt ?? now).getTime()))
      .slice(0, 4)
      .map((item) => ({ term_id: item.termId, reason: 'review_due' as const }));

    const weakTerms = records
      .filter((item) => {
        const accuracy = item.attempts > 0 ? item.correctCount / item.attempts : 0;
        return item.attempts >= 3 && accuracy < 0.6;
      })
      .filter((item) => !reviewDue.some((q) => q.term_id === item.termId))
      .slice(0, 3)
      .map((item) => ({ term_id: item.termId, reason: 'weak_term' as const }));

    const domainTerms = await prisma.term.findMany({
      where: { domainId: domainRow.id },
      select: { id: true },
      take: 1200
    });

    const newTerms = domainTerms
      .filter((item) => !seenSet.has(item.id))
      .slice(0, 10)
      .map((item) => ({ term_id: item.id, reason: 'new' as const }));

    const merged = [...reviewDue, ...weakTerms, ...newTerms].slice(0, 10);
    const todayQueue: QueueItem[] = merged.map((item, idx) => ({ ...item, priority: idx + 1 }));

    const total = domainTerms.length;
    const learned = seenSet.size;
    const dailyTarget = 10;
    const remaining = Math.max(0, total - learned);

    return {
      user_id: user.id,
      domain,
      user_level: inferLevel(records),
      learning_goal: user.profile?.learningGoal ?? 'ai_communication',
      daily_target_terms: dailyTarget,
      today_queue: todayQueue,
      weekly_plan: buildWeeklyPlan(todayQueue),
      estimated_completion_days: Math.max(1, Math.ceil(remaining / dailyTarget))
    };
  } catch {
    return fallbackCurriculum(domain, userId);
  }
}

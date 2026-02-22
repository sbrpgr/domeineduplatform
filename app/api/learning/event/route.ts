import { z } from 'zod';
import { NextResponse } from 'next/server';
import type { Difficulty } from '@/lib/types';
import { calculateNextReview } from '@/lib/learning/sm2';

const learningEventSchema = z.object({
  user_id: z.string().min(1),
  term_id: z.string().min(1),
  event_type: z.enum(['card_view', 'definition_expand', 'ai_explain', 'quiz_answer', 'bookmark', 'graph_explore']),
  metadata: z
    .object({
      domain: z.string().optional(),
      dwell_time_ms: z.number().int().nonnegative().optional(),
      level_viewed: z.enum(['novice', 'beginner', 'intermediate', 'advanced']).optional(),
      quiz_correct: z.boolean().optional(),
      quality: z.number().int().min(0).max(5).optional(),
      flip_count: z.number().int().nonnegative().optional(),
      rating: z.enum(['easy', 'normal', 'hard']).optional()
    })
    .default({}),
  timestamp: z.string().datetime()
});

type DailyMissionState = {
  date: string;
  cards: number;
  quizzes: number;
  graph: number;
  completed: boolean;
};

type UserProgressState = {
  totalXp: number;
  level: Difficulty;
  streak: number;
  streakCreditedDate: string | null;
  lastActiveDate: string | null;
  missions: DailyMissionState;
  unlockedBadges: string[];
  totalCardViews: number;
  totalQuizCorrect: number;
  totalGraphExplore: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __learning_progress__: Map<string, UserProgressState> | undefined;
}

const getStore = () => {
  if (!global.__learning_progress__) {
    global.__learning_progress__ = new Map<string, UserProgressState>();
  }
  return global.__learning_progress__;
};

const toDateKey = (iso: string) => iso.slice(0, 10);

const getPreviousDateKey = (dateKey: string) => {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
};

const levelFromXp = (xp: number): Difficulty => {
  if (xp >= 2000) return 'advanced';
  if (xp >= 500) return 'intermediate';
  if (xp >= 100) return 'beginner';
  return 'novice';
};

const uniquePush = (arr: string[], value: string) => {
  if (!arr.includes(value)) arr.push(value);
};

const getXpGain = (
  eventType: z.infer<typeof learningEventSchema>['event_type'],
  metadata: z.infer<typeof learningEventSchema>['metadata']
) => {
  if (eventType === 'card_view') {
    if (metadata.rating === 'easy') return 20;
    if (metadata.rating === 'normal') return 12;
    if (metadata.rating === 'hard') return 8;
    return 10;
  }
  if (eventType === 'quiz_answer') {
    return metadata.quiz_correct ? 20 : 5;
  }
  if (eventType === 'graph_explore') return 5;
  if (eventType === 'bookmark') return 5;
  if (eventType === 'ai_explain') return 5;
  if (eventType === 'definition_expand') return 2;
  return 0;
};

const createInitialState = (dateKey: string): UserProgressState => ({
  totalXp: 0,
  level: 'novice',
  streak: 0,
  streakCreditedDate: null,
  lastActiveDate: null,
  missions: {
    date: dateKey,
    cards: 0,
    quizzes: 0,
    graph: 0,
    completed: false
  },
  unlockedBadges: [],
  totalCardViews: 0,
  totalQuizCorrect: 0,
  totalGraphExplore: 0
});

export async function POST(request: Request) {
  const body = await request.json();
  const parse = learningEventSchema.safeParse(body);

  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });
  }

  const payload = parse.data;
  const todayKey = toDateKey(payload.timestamp);
  const store = getStore();
  const state = store.get(payload.user_id) ?? createInitialState(todayKey);

  if (state.missions.date !== todayKey) {
    state.missions = { date: todayKey, cards: 0, quizzes: 0, graph: 0, completed: false };
  }

  const xpGain = getXpGain(payload.event_type, payload.metadata);

  if (payload.event_type === 'card_view') {
    state.totalCardViews += 1;
    state.missions.cards += 1;
  }

  if (payload.event_type === 'quiz_answer') {
    state.missions.quizzes += 1;
    if (payload.metadata.quiz_correct) state.totalQuizCorrect += 1;
  }

  if (payload.event_type === 'graph_explore') {
    state.totalGraphExplore += 1;
    state.missions.graph += 1;
  }

  let bonusXp = 0;
  if (
    !state.missions.completed
    && state.missions.cards >= 5
    && state.missions.quizzes >= 5
    && state.missions.graph >= 3
  ) {
    state.missions.completed = true;
    bonusXp += 50;
  }

  if (state.missions.cards >= 5 && state.streakCreditedDate !== todayKey) {
    const previousDay = getPreviousDateKey(todayKey);
    state.streak = state.lastActiveDate === previousDay ? state.streak + 1 : 1;
    state.streakCreditedDate = todayKey;
    state.lastActiveDate = todayKey;
  }

  const previousLevel = state.level;
  state.totalXp += xpGain + bonusXp;
  state.level = levelFromXp(state.totalXp);
  const levelUp = previousLevel !== state.level;

  const newBadges: string[] = [];
  if (state.totalCardViews >= 1 && !state.unlockedBadges.includes('first_learning')) {
    uniquePush(state.unlockedBadges, 'first_learning');
    newBadges.push('first_learning');
  }
  if (state.totalQuizCorrect >= 3 && !state.unlockedBadges.includes('quiz_rookie')) {
    uniquePush(state.unlockedBadges, 'quiz_rookie');
    newBadges.push('quiz_rookie');
  }
  if (state.totalGraphExplore >= 10 && !state.unlockedBadges.includes('graph_explorer')) {
    uniquePush(state.unlockedBadges, 'graph_explorer');
    newBadges.push('graph_explorer');
  }
  if (state.streak >= 7 && !state.unlockedBadges.includes('streak_7')) {
    uniquePush(state.unlockedBadges, 'streak_7');
    newBadges.push('streak_7');
  }
  if (state.totalXp >= 500 && !state.unlockedBadges.includes('xp_500')) {
    uniquePush(state.unlockedBadges, 'xp_500');
    newBadges.push('xp_500');
  }

  store.set(payload.user_id, state);

  const sm2 = payload.event_type === 'quiz_answer' && payload.metadata.quality !== undefined
    ? calculateNextReview({ repetitions: 0, interval: 1, easinessFactor: 2.5 }, payload.metadata.quality)
    : null;

  return NextResponse.json({
    ok: true,
    xp_gained: xpGain,
    bonus_xp: bonusXp,
    total_xp: state.totalXp,
    previous_level: previousLevel,
    new_level: state.level,
    level_up: levelUp,
    streak: state.streak,
    badges_unlocked: newBadges,
    missions: {
      cards: state.missions.cards,
      quizzes: state.missions.quizzes,
      graph: state.missions.graph,
      cards_target: 5,
      quizzes_target: 5,
      graph_target: 3,
      completed: state.missions.completed
    },
    sm2_preview: sm2
  });
}

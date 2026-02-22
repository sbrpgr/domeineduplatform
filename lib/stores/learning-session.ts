'use client';

import { create } from 'zustand';
import type { Difficulty } from '@/lib/types';

type SessionTermMetric = {
  termId: string;
  dwellTimeSeconds: number;
  flipCount: number;
  aiExplainCount: number;
  quizResult: 'correct' | 'incorrect' | 'skipped';
  difficulty: Difficulty;
};

type LearningSessionState = {
  metrics: SessionTermMetric[];
  addMetric: (metric: SessionTermMetric) => void;
  reset: () => void;
};

export const useLearningSessionStore = create<LearningSessionState>((set) => ({
  metrics: [],
  addMetric: (metric) => set((state) => ({ metrics: [...state.metrics, metric] })),
  reset: () => set({ metrics: [] })
}));

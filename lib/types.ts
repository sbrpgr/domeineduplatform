export type Difficulty = 'novice' | 'beginner' | 'intermediate' | 'advanced';

export type Priority = 'P1' | 'P2' | 'P3';

export type Domain = {
  slug: string;
  nameKo: string;
  nameEn: string;
  targetTermCount: number;
  priority: Priority;
  categoryTree: {
    level2: string;
    level3: string[];
  }[];
};

export type TermDefinitionSet = {
  novice: string;
  beginner: string;
  intermediate: string;
  advanced: string;
};

export type QuizQuestion = {
  id: string;
  type: 'multiple_choice' | 'ox' | 'matching';
  question: string;
  options?: string[];
  answer: number | boolean | string;
  explanation: string;
};

export type Term = {
  id: string;
  slug: string;
  termKo: string;
  termEn: string;
  pronunciation: string;
  domain: string;
  level2Category: string;
  level3Category: string;
  difficulty: Difficulty;
  oneLineDefinition: string;
  definitions: TermDefinitionSet;
  usageExamples: { context: string; example: string }[];
  aiPromptExample: string;
  relatedTerms: {
    parent: string[];
    sibling: string[];
    child: string[];
    opposite: string[];
  };
  tags: string[];
  sourceUrls: string[];
  lastReviewedAt: string;
  reviewer: string;
};

export type RelationshipEdge = {
  from: string;
  to: string;
  relation: 'parent' | 'sibling' | 'child' | 'opposite';
};

export type LearningEventType =
  | 'card_view'
  | 'definition_expand'
  | 'ai_explain'
  | 'quiz_answer'
  | 'bookmark'
  | 'graph_explore';

export type LearningEvent = {
  userId: string;
  termId: string;
  eventType: LearningEventType;
  metadata: {
    domain?: string;
    dwellTimeMs?: number;
    levelViewed?: Difficulty;
    quizCorrect?: boolean;
    flipCount?: number;
    rating?: 'easy' | 'normal' | 'hard';
  };
  timestamp: string;
};

export type Sm2Record = {
  repetitions: number;
  interval: number;
  easinessFactor: number;
  nextReviewAt?: string;
};

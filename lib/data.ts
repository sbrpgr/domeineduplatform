import type { Domain, QuizQuestion, RelationshipEdge, Term } from '@/lib/types';

export const domains: Domain[] = [
  {
    slug: 'it-dev',
    nameKo: 'IT 개발',
    nameEn: 'IT Development',
    targetTermCount: 500,
    priority: 'P1',
    categoryTree: [
      { level2: '프론트엔드', level3: ['컴포넌트', '상태관리', '라우팅'] },
      { level2: '백엔드', level3: ['API', '인증', '데이터모델링'] },
      { level2: '인프라', level3: ['배포', '관측성', '보안'] }
    ]
  },
  {
    slug: 'design',
    nameKo: '디자인',
    nameEn: 'Design',
    targetTermCount: 220,
    priority: 'P1',
    categoryTree: [
      { level2: 'UX', level3: ['리서치', '정보구조', '사용성 테스트'] },
      { level2: 'UI', level3: ['레이아웃', '타이포그래피', '컴포넌트'] },
      { level2: '브랜드', level3: ['톤앤매너', '비주얼 시스템', '가이드라인'] }
    ]
  },
  { slug: 'ai-data', nameKo: 'AI / 데이터 사이언스', nameEn: 'AI / Data Science', targetTermCount: 300, priority: 'P1', categoryTree: [] },
  { slug: 'marketing', nameKo: '마케팅 / 그로스 해킹', nameEn: 'Marketing / Growth', targetTermCount: 250, priority: 'P1', categoryTree: [] },
  { slug: 'startup', nameKo: '스타트업 / PM / 경영', nameEn: 'Startup / PM / Management', targetTermCount: 200, priority: 'P1', categoryTree: [] },
  { slug: 'fintech', nameKo: '핀테크 / 금융', nameEn: 'Fintech / Finance', targetTermCount: 250, priority: 'P2', categoryTree: [] },
  { slug: 'bio-health', nameKo: '바이오 / 헬스케어', nameEn: 'Bio / Healthcare', targetTermCount: 200, priority: 'P2', categoryTree: [] },
  { slug: 'legal', nameKo: '법률 / 컴플라이언스', nameEn: 'Legal / Compliance', targetTermCount: 200, priority: 'P2', categoryTree: [] },
  { slug: 'game-xr', nameKo: '게임 / 메타버스 / XR', nameEn: 'Game / Metaverse / XR', targetTermCount: 180, priority: 'P2', categoryTree: [] },
  { slug: 'ecommerce', nameKo: '이커머스 / 물류 / SCM', nameEn: 'Ecommerce / SCM', targetTermCount: 180, priority: 'P3', categoryTree: [] },
  { slug: 'energy-esg', nameKo: '에너지 / 스마트팩토리 / ESG', nameEn: 'Energy / Smart Factory / ESG', targetTermCount: 180, priority: 'P3', categoryTree: [] },
  { slug: 'creator', nameKo: '크리에이터 이코노미', nameEn: 'Creator Economy', targetTermCount: 150, priority: 'P3', categoryTree: [] }
];

export const sampleTerms: Term[] = [
  {
    id: 't-modal',
    slug: 'modal',
    termKo: '모달',
    termEn: 'Modal',
    pronunciation: '모달 (Modal)',
    domain: 'it-dev',
    level2Category: '프론트엔드',
    level3Category: '컴포넌트',
    difficulty: 'beginner',
    oneLineDefinition: '현재 작업을 잠시 중단시키고 위에 띄우는 UI 팝업',
    definitions: {
      novice: '확인/취소를 묻는 작은 팝업 창입니다.',
      beginner: '배경을 비활성화하고 반드시 반응을 요구하는 오버레이 컴포넌트입니다.',
      intermediate: '포커스 트랩, ESC 닫기, 백드롭 처리가 필요합니다.',
      advanced: 'aria 속성과 대체 패턴(드로어/시트)까지 고려해 선택합니다.'
    },
    usageExamples: [
      { context: '기획', example: '삭제 확인 모달을 띄워 오동작을 줄입시다.' },
      { context: '개발', example: 'ESC와 백드롭 클릭 닫기를 모두 지원해 주세요.' }
    ],
    aiPromptExample: '로그인 모달을 접근성 기준(ESC, focus trap)으로 구현해줘.',
    relatedTerms: {
      parent: ['오버레이'],
      sibling: ['드로어', '다이얼로그'],
      child: ['백드롭', '모달 헤더'],
      opposite: ['인라인 편집']
    },
    tags: ['UI', '컴포넌트'],
    sourceUrls: ['https://developer.mozilla.org/', 'https://www.w3.org/'],
    lastReviewedAt: '2026-02-20',
    reviewer: 'editor'
  },
  {
    id: 't-design-system',
    slug: 'design-system',
    termKo: '디자인 시스템',
    termEn: 'Design System',
    pronunciation: '디자인 시스템 (Design System)',
    domain: 'design',
    level2Category: 'UI',
    level3Category: '컴포넌트',
    difficulty: 'beginner',
    oneLineDefinition: '제품 전반의 UI/브랜드 일관성을 유지하는 규칙과 자산 체계',
    definitions: {
      novice: '팀이 같은 방식으로 화면을 만들게 돕는 공통 규칙입니다.',
      beginner: '색상, 타이포, 버튼 같은 UI 기준을 모아 재사용성을 높입니다.',
      intermediate: '토큰, 컴포넌트 API, 문서화를 통해 설계/개발 협업 비용을 줄입니다.',
      advanced: '버전 전략, 거버넌스, 다중 제품군 확장을 포함한 운영 체계입니다.'
    },
    usageExamples: [
      { context: '디자인 리뷰', example: '신규 배너는 디자인 시스템 버튼 변형을 재사용합시다.' },
      { context: '개발 협업', example: '토큰 네이밍을 시스템 기준으로 통일해 주세요.' }
    ],
    aiPromptExample: '핀테크 앱용 디자인 시스템 아키텍처를 단계별로 설계해줘.',
    relatedTerms: {
      parent: ['UI 거버넌스'],
      sibling: ['스타일 가이드'],
      child: ['디자인 토큰', '컴포넌트 라이브러리'],
      opposite: ['화면별 임시 스타일']
    },
    tags: ['디자인', '협업', '일관성'],
    sourceUrls: ['https://designsystems.com/', 'https://www.nngroup.com/'],
    lastReviewedAt: '2026-02-20',
    reviewer: 'editor'
  },
  {
    id: 't-typography-scale',
    slug: 'typography-scale',
    termKo: '타이포그래피 스케일',
    termEn: 'Typography Scale',
    pronunciation: '타이포그래피 스케일 (Typography Scale)',
    domain: 'design',
    level2Category: 'UI',
    level3Category: '타이포그래피',
    difficulty: 'intermediate',
    oneLineDefinition: '텍스트 계층을 일관성 있게 설계하기 위한 글자 크기 체계',
    definitions: {
      novice: '제목/본문 글씨 크기를 규칙적으로 정한 표입니다.',
      beginner: 'H1~Caption 간 시각적 위계를 정의해 가독성을 높입니다.',
      intermediate: '반응형 기준과 줄간격/자간까지 함께 설계해 품질을 유지합니다.',
      advanced: '언어별 렌더링 차이와 접근성 대비(최소 크기/명도비)를 포함합니다.'
    },
    usageExamples: [
      { context: '브랜딩', example: '마케팅 페이지와 제품 UI의 타이포 스케일을 통일합시다.' },
      { context: '개발', example: '텍스트 토큰을 t-heading-2 같은 키로 매핑해 주세요.' }
    ],
    aiPromptExample: '모바일 우선 SaaS에 맞는 타이포 스케일을 제안해줘.',
    relatedTerms: {
      parent: ['타이포그래피'],
      sibling: ['레이아웃 그리드'],
      child: ['폰트 사이즈 토큰'],
      opposite: ['임의 폰트 크기 지정']
    },
    tags: ['타이포', '토큰'],
    sourceUrls: ['https://material.io/', 'https://www.w3.org/WAI/'],
    lastReviewedAt: '2026-02-20',
    reviewer: 'editor'
  }
];

export const sampleRelationships: RelationshipEdge[] = [
  { from: 'modal', to: 'overlay', relation: 'parent' },
  { from: 'modal', to: 'drawer', relation: 'sibling' },
  { from: 'modal', to: 'backdrop', relation: 'child' },
  { from: 'design-system', to: 'style-guide', relation: 'sibling' },
  { from: 'design-system', to: 'design-token', relation: 'child' }
];

export const diagnosticQuizzes: Record<string, QuizQuestion[]> = {
  'it-dev': [
    {
      id: 'it-q1',
      type: 'multiple_choice',
      question: 'API의 가장 핵심 역할은 무엇인가?',
      options: ['데이터 시각화', '시스템 간 기능 호출 규약', 'UI 색상 지정', '문서 번역'],
      answer: 1,
      explanation: 'API는 시스템 간 통신 규약입니다.'
    }
  ],
  design: [
    {
      id: 'design-q1',
      type: 'ox',
      question: '디자인 시스템은 디자이너만 사용하는 문서다.',
      answer: false,
      explanation: '설계/개발/기획이 함께 사용하는 제품 운영 자산입니다.'
    }
  ]
};

export function getTermBySlug(slug: string): Term | undefined {
  return sampleTerms.find((term) => term.slug === slug);
}

export function getDomainBySlug(slug: string): Domain | undefined {
  return domains.find((domain) => domain.slug === slug);
}

export function getTermsByDomain(domainSlug: string): Term[] {
  return sampleTerms.filter((term) => term.domain === domainSlug);
}

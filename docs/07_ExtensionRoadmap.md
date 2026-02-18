# VibePrompt OS - 확장성 로드맵

## 개요

이 문서는 VibePrompt OS의 향후 확장 계획과 기능 로드맵을 정의합니다.
초기 시스템(v1.0)을 기반으로 단계적 확장을 진행합니다.

---

## 버전 로드맵

```
v1.0 (현재) ─── v1.1 ─── v1.2 ─── v2.0 ─── v2.1 ─── v3.0
   │            │         │         │         │         │
   │            │         │         │         │         └─ 팀 협업
   │            │         │         │         └─ 외부 연동
   │            │         │         └─ 멀티 프로젝트
   │            │         └─ 대화 맥락 유지
   │            └─ UI 개선
   └─ 기초 기능 (현재)
```

---

## Phase 1: 기초 완성 (v1.0 - v1.1)

### v1.0 - 초기 시스템 ✅

**완료된 기능:**
- [x] 프로젝트 코어 관리
- [x] 에이전트 CRUD
- [x] 에이전트 템플릿 시스템
- [x] 프롬프트 생성 (OpenAI API)
- [x] 설정 관리 시스템
- [x] API 엔드포인트
- [x] Vercel/GitHub Pages 배포

### v1.1 - UI 개선

**계획된 기능:**
- [ ] 에이전트 관리 UI (생성/수정/삭제)
- [ ] 템플릿 선택 UI
- [ ] 프로젝트 설정 페이지
- [ ] 다크 모드 지원
- [ ] 반응형 레이아웃 개선

**예상 작업:**
```typescript
// 새로운 페이지 구조
/app
├── page.tsx              // 메인 (프롬프트 생성)
├── settings/
│   └── page.tsx          // 프로젝트 설정
├── agents/
│   ├── page.tsx          // 에이전트 목록
│   ├── new/
│   │   └── page.tsx      // 에이전트 생성
│   └── [id]/
│       └── page.tsx      // 에이전트 편집
└── templates/
    └── page.tsx          // 템플릿 브라우저
```

---

## Phase 2: 기능 확장 (v1.2 - v2.0)

### v1.2 - 대화 맥락 유지

**계획된 기능:**
- [ ] OpenAI Responses API `store` 패턴 적용
- [ ] `previous_response_id` 기반 대화 연속성
- [ ] 세션 히스토리 저장/복원
- [ ] 프롬프트 히스토리 뷰어

**기술 상세:**
```typescript
// lib/session.ts
interface Session {
  id: string;
  projectId: string;
  responseId?: string;  // OpenAI response ID
  history: HistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

// API 호출 시
const response = await client.responses.create({
  model: "gpt-4o-mini",
  input: [...],
  store: true,  // 대화 저장
  previous_response_id: session.responseId,  // 이전 맥락 연결
});
```

### v2.0 - 멀티 프로젝트

**계획된 기능:**
- [ ] 여러 프로젝트 동시 관리
- [ ] 프로젝트 전환 UI
- [ ] 프로젝트별 독립 에이전트
- [ ] 프로젝트 내보내기/가져오기
- [ ] 프로젝트 템플릿

**디렉토리 구조:**
```
/data
├── config.json
├── projects/
│   ├── default/
│   │   ├── project.core.md
│   │   └── agents/
│   ├── project-a/
│   │   ├── project.core.md
│   │   └── agents/
│   └── project-b/
│       ├── project.core.md
│       └── agents/
└── templates/
```

---

## Phase 3: 통합 확장 (v2.1 - v3.0)

### v2.1 - 외부 연동

**계획된 기능:**
- [ ] GitHub 연동
  - 저장소 설계 문서 동기화
  - PR 기반 설계 결정 추적
- [ ] Notion 연동
  - 설계 문서 양방향 동기화
  - 데이터베이스 매핑
- [ ] VS Code 확장
  - 에디터 내 프롬프트 생성
  - 컨텍스트 자동 감지

**예상 인터페이스:**
```typescript
// lib/integrations/github.ts
interface GitHubIntegration {
  connect(token: string): Promise<void>;
  syncDesignDocs(repoUrl: string): Promise<void>;
  watchPRs(callback: (pr: PR) => void): void;
}

// lib/integrations/notion.ts
interface NotionIntegration {
  connect(token: string): Promise<void>;
  syncToNotion(projectId: string): Promise<void>;
  syncFromNotion(databaseId: string): Promise<void>;
}
```

### v3.0 - 팀 협업

**계획된 기능:**
- [ ] 사용자 인증 시스템
- [ ] 프로젝트 공유
- [ ] 역할 기반 권한 관리
- [ ] 실시간 협업 편집
- [ ] 변경 이력 추적
- [ ] 코멘트 및 리뷰

**데이터 모델 확장:**
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
}

interface ProjectPermission {
  projectId: string;
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
}

interface ChangeHistory {
  id: string;
  projectId: string;
  userId: string;
  type: 'project' | 'agent';
  targetId: string;
  changes: Record<string, { before: string; after: string }>;
  createdAt: string;
}
```

---

## 확장 포인트

### 플러그인 시스템 (v2.0+)

```typescript
// 플러그인 인터페이스
interface VibepromptPlugin {
  name: string;
  version: string;
  description: string;

  // 라이프사이클 훅
  onInit?: (context: PluginContext) => void;
  onDestroy?: () => void;

  // 컴파일 훅
  beforeCompile?: (input: CompileInput) => CompileInput;
  afterCompile?: (output: CompileOutput) => CompileOutput;

  // UI 확장
  renderSettings?: () => ReactNode;
  renderAgentExtras?: (agent: Agent) => ReactNode;
}

// 플러그인 등록
registerPlugin({
  name: 'custom-compiler',
  version: '1.0.0',
  description: 'Custom prompt compilation rules',

  beforeCompile: (input) => {
    // 커스텀 전처리
    return input;
  },

  afterCompile: (output) => {
    // 커스텀 후처리
    return output;
  }
});
```

### 커스텀 모델 지원 (v1.2+)

```typescript
// 다양한 AI 모델 지원
interface ModelProvider {
  name: string;
  models: string[];

  generatePrompt(input: GenerateInput): Promise<GenerateOutput>;
}

// 지원 예정 모델
const providers: ModelProvider[] = [
  {
    name: 'openai',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  },
  {
    name: 'anthropic',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  },
  {
    name: 'local',
    models: ['ollama/llama2', 'ollama/mistral'],
  }
];
```

### 웹훅 시스템 (v2.1+)

```typescript
// 이벤트 기반 웹훅
interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
}

type WebhookEvent =
  | 'project.created'
  | 'project.updated'
  | 'agent.created'
  | 'agent.updated'
  | 'prompt.generated';

// 웹훅 트리거
await triggerWebhook('prompt.generated', {
  projectId: 'default',
  agents: ['auth', 'api'],
  prompt: generatedPrompt,
});
```

---

## 기술 부채 관리

### v1.1에서 해결

- [ ] 에러 핸들링 표준화
- [ ] 로깅 시스템 구축
- [ ] 단위 테스트 추가
- [ ] TypeScript strict 모드 완전 적용

### v1.2에서 해결

- [ ] API 응답 형식 통일
- [ ] 입력 검증 강화
- [ ] 성능 프로파일링
- [ ] 문서화 자동화

### v2.0에서 해결

- [ ] 데이터 마이그레이션 도구
- [ ] 백업/복원 기능
- [ ] 모니터링 대시보드

---

## 마이그레이션 전략

### v1.x → v2.0 마이그레이션

```typescript
// migration/v1-to-v2.ts
async function migrateToV2() {
  // 1. 기존 단일 프로젝트 → default 프로젝트로 이동
  await moveToProjectDir('default');

  // 2. config.json 스키마 업그레이드
  await upgradeConfig();

  // 3. 에이전트 파일에 frontmatter 추가
  await addFrontmatterToAgents();

  // 4. 세션 데이터 마이그레이션
  await migrateSessions();
}
```

---

## 우선순위 기준

### 높음 (다음 버전)
- 사용자 경험 직접 개선
- 핵심 워크플로우 지원
- 버그 및 안정성

### 중간 (2-3 버전 후)
- 생산성 향상 기능
- 통합 기능
- 성능 최적화

### 낮음 (장기 계획)
- 팀 기능
- 고급 자동화
- 엔터프라이즈 기능

---

## 피드백 반영

이 로드맵은 사용자 피드백에 따라 조정됩니다.
피드백 제출: GitHub Issues

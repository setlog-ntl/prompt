# VibePrompt OS - 시스템 아키텍처

## 1. 시스템 개요

VibePrompt OS는 바이브코딩 워크플로우를 가속화하기 위한 프롬프트 관리 시스템입니다.
초기 버전에서는 **단일 프로젝트 지원**을 기본으로 하며, 향후 **멀티 프로젝트** 확장을 고려한 구조로 설계합니다.

```
┌─────────────────────────────────────────────────────────────────┐
│                     VibePrompt OS Web                           │
├─────────────────────────────────────────────────────────────────┤
│  [UI Layer]                                                     │
│  ├── 프로젝트 선택 (v2)                                         │
│  ├── 에이전트 관리                                              │
│  ├── 프롬프트 입력                                              │
│  └── 결과 출력/복사                                             │
├─────────────────────────────────────────────────────────────────┤
│  [API Layer]                                                    │
│  ├── /api/projects     → 프로젝트 CRUD                         │
│  ├── /api/agents       → 에이전트 CRUD                         │
│  ├── /api/generate     → 프롬프트 생성                         │
│  └── /api/config       → 설정 관리                             │
├─────────────────────────────────────────────────────────────────┤
│  [Core Layer]                                                   │
│  ├── lib/vibeprompt.ts → 프롬프트 컴파일러                     │
│  ├── lib/project.ts    → 프로젝트 관리 (NEW)                   │
│  ├── lib/agent.ts      → 에이전트 관리 (NEW)                   │
│  └── lib/config.ts     → 설정 관리 (NEW)                       │
├─────────────────────────────────────────────────────────────────┤
│  [Data Layer]                                                   │
│  ├── /data/config.json       → 시스템 설정                     │
│  ├── /data/project.core.md   → 프로젝트 코어 (default)         │
│  ├── /data/agents/*.md       → 에이전트 정의                   │
│  └── /data/templates/*.md    → 에이전트 템플릿 (NEW)           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 디렉토리 구조

### 2.1 현재 구조 (v1)

```
/data
├── project.core.md          # 단일 프로젝트 코어
└── agents/
    └── sample.auth.md       # 에이전트 정의
```

### 2.2 확장 구조 (v2 - 멀티 프로젝트)

```
/data
├── config.json              # 시스템 설정
├── projects/                # 프로젝트별 디렉토리
│   ├── default/             # 기본 프로젝트
│   │   ├── project.core.md
│   │   └── agents/
│   │       ├── auth.md
│   │       └── api.md
│   └── {project-id}/        # 추가 프로젝트
│       ├── project.core.md
│       └── agents/
└── templates/               # 공용 템플릿
    ├── agents/
    │   ├── auth.template.md
    │   ├── api.template.md
    │   ├── ui.template.md
    │   └── database.template.md
    └── project.template.md
```

---

## 3. 데이터 모델

### 3.1 시스템 설정 (config.json)

```json
{
  "version": "1.0.0",
  "activeProject": "default",
  "defaults": {
    "outputMode": "prompt",
    "model": "gpt-4o-mini"
  },
  "projects": [
    {
      "id": "default",
      "name": "Default Project",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 3.2 프로젝트 코어 (project.core.md)

```markdown
---
id: default
name: My Project
createdAt: 2024-01-01T00:00:00Z
---

# Project Core

## Purpose
- 프로젝트의 핵심 목적

## Philosophy / Principles
- 설계 원칙들

## Long-term Direction
- 장기 방향성
```

### 3.3 에이전트 정의 (agents/*.md)

```markdown
---
id: auth
name: Auth Agent
category: security
createdAt: 2024-01-01T00:00:00Z
---

# Sub-Agent: Auth

## Role
- 에이전트의 역할

## Design Decisions
- 설계 결정 사항들

## Constraints
- 제약 조건들

## Prompt Blueprint (옵션)
- 프롬프트 청사진
```

### 3.4 에이전트 템플릿 (templates/agents/*.md)

```markdown
---
templateId: auth-basic
name: 기본 인증 에이전트
category: security
description: JWT/Session 기반 인증 처리를 위한 기본 템플릿
---

# Sub-Agent: {{AGENT_NAME}}

## Role
- 인증/인가 흐름의 책임

## Design Decisions
- [ ] 인증 방식 선택: JWT / Session / OAuth
- [ ] 토큰 저장 위치: HttpOnly Cookie / LocalStorage
- 인증 상태는 서버에서 검증한다

## Constraints
- API Key는 반드시 서버에서만 사용한다
- 민감 정보는 클라이언트에 노출하지 않는다

## Prompt Blueprint (옵션)
- 인증 관련 변경 요청 시 보안 검토 우선
```

---

## 4. API 엔드포인트

### 4.1 프로젝트 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/projects` | 프로젝트 목록 조회 |
| GET | `/api/projects/[id]` | 프로젝트 상세 조회 |
| POST | `/api/projects` | 프로젝트 생성 |
| PUT | `/api/projects/[id]` | 프로젝트 수정 |
| DELETE | `/api/projects/[id]` | 프로젝트 삭제 |

### 4.2 에이전트 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/agents` | 에이전트 목록 조회 |
| GET | `/api/agents/[id]` | 에이전트 상세 조회 |
| POST | `/api/agents` | 에이전트 생성 |
| PUT | `/api/agents/[id]` | 에이전트 수정 |
| DELETE | `/api/agents/[id]` | 에이전트 삭제 |

### 4.3 템플릿 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/templates` | 템플릿 목록 조회 |
| GET | `/api/templates/[id]` | 템플릿 상세 조회 |
| POST | `/api/agents/from-template` | 템플릿으로 에이전트 생성 |

### 4.4 설정 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/config` | 설정 조회 |
| PUT | `/api/config` | 설정 수정 |

---

## 5. 핵심 모듈

### 5.1 lib/project.ts

```typescript
// 프로젝트 관리 모듈
export interface Project {
  id: string;
  name: string;
  createdAt: string;
  core: ProjectCore;
}

export async function listProjects(): Promise<Project[]>
export async function getProject(id: string): Promise<Project>
export async function createProject(data: CreateProjectInput): Promise<Project>
export async function updateProject(id: string, data: UpdateProjectInput): Promise<Project>
export async function deleteProject(id: string): Promise<void>
```

### 5.2 lib/agent.ts

```typescript
// 에이전트 관리 모듈
export interface Agent {
  id: string;
  name: string;
  category?: string;
  role: string;
  designDecisions: string;
  constraints: string;
  promptBlueprint?: string;
  createdAt: string;
}

export async function listAgents(projectId?: string): Promise<Agent[]>
export async function getAgent(id: string, projectId?: string): Promise<Agent>
export async function createAgent(data: CreateAgentInput): Promise<Agent>
export async function updateAgent(id: string, data: UpdateAgentInput): Promise<Agent>
export async function deleteAgent(id: string): Promise<void>
```

### 5.3 lib/template.ts

```typescript
// 템플릿 관리 모듈
export interface AgentTemplate {
  templateId: string;
  name: string;
  category: string;
  description: string;
  content: string;
}

export async function listTemplates(): Promise<AgentTemplate[]>
export async function getTemplate(id: string): Promise<AgentTemplate>
export async function createAgentFromTemplate(
  templateId: string,
  agentName: string,
  projectId?: string
): Promise<Agent>
```

### 5.4 lib/config.ts

```typescript
// 설정 관리 모듈
export interface SystemConfig {
  version: string;
  activeProject: string;
  defaults: {
    outputMode: 'prompt' | 'prompt+md';
    model: string;
  };
  projects: ProjectMeta[];
}

export async function getConfig(): Promise<SystemConfig>
export async function updateConfig(data: Partial<SystemConfig>): Promise<SystemConfig>
```

---

## 6. 상태 관리

### 6.1 클라이언트 상태 (React State)

```typescript
interface AppState {
  // 프로젝트
  activeProject: string;
  projects: Project[];

  // 에이전트
  availableAgents: Agent[];
  selectedAgents: string[];

  // 입력/출력
  selectedScope: 'project' | 'sub-agent';
  userInput: string;
  outputMode: 'prompt' | 'prompt+md';

  // 결과
  generatedPrompt: string;
  generatedDoc: string;

  // UI 상태
  isLoading: boolean;
  error: string | null;
}
```

### 6.2 서버 상태 (선택적)

Responses API의 `store`/`previous_response_id` 패턴으로 대화 맥락 유지 가능 (Phase 3)

---

## 7. 보안 고려사항

### 7.1 API Key 보호

```
✓ OPENAI_API_KEY는 서버 환경변수로만 관리
✓ 클라이언트 코드에 절대 노출 금지
✓ .env 파일은 .gitignore에 포함
```

### 7.2 입력 검증

```typescript
// 모든 사용자 입력 검증
const validateInput = (input: string): boolean => {
  if (!input || input.trim().length === 0) return false;
  if (input.length > 10000) return false; // 최대 길이 제한
  return true;
};
```

### 7.3 파일 시스템 접근

```typescript
// 경로 검증으로 디렉토리 탈출 방지
const safePath = (basePath: string, relativePath: string): string => {
  const resolved = path.resolve(basePath, relativePath);
  if (!resolved.startsWith(basePath)) {
    throw new Error('Invalid path');
  }
  return resolved;
};
```

---

## 8. 확장 포인트

### 8.1 플러그인 시스템 (Future)

```typescript
interface VibepromptPlugin {
  name: string;
  version: string;
  hooks: {
    beforeCompile?: (context: CompileContext) => void;
    afterCompile?: (result: CompileResult) => void;
  };
}
```

### 8.2 커스텀 컴파일러 (Future)

```typescript
interface CustomCompiler {
  name: string;
  compile: (input: CompileInput) => Promise<CompileOutput>;
}
```

### 8.3 외부 연동 (Future)

- GitHub 연동: 프로젝트 문서 동기화
- Notion 연동: 설계 결정 자동 동기화
- Slack 연동: 프롬프트 공유

---

## 9. 마이그레이션 가이드

### v1 → v2 마이그레이션

1. 기존 `data/project.core.md` → `data/projects/default/project.core.md`
2. 기존 `data/agents/` → `data/projects/default/agents/`
3. `data/config.json` 생성
4. 프론트매터 추가 (id, name, createdAt)

---

## 10. 성능 고려사항

### 10.1 캐싱 전략

- 프로젝트/에이전트 목록: 메모리 캐시 (5분)
- 템플릿 목록: 앱 시작 시 로드
- 생성된 프롬프트: 캐시 안 함 (항상 최신)

### 10.2 최적화

- Markdown 파싱: 필요 시점에 lazy 로드
- 대용량 프로젝트: 페이지네이션 지원 (v2)

# VibePrompt OS - 초기 세팅 가이드

## 목차

1. [환경 요구사항](#1-환경-요구사항)
2. [설치 및 실행](#2-설치-및-실행)
3. [프로젝트 초기 설정](#3-프로젝트-초기-설정)
4. [에이전트 설정](#4-에이전트-설정)
5. [배포 설정](#5-배포-설정)
6. [문제 해결](#6-문제-해결)

---

## 1. 환경 요구사항

### 필수 환경

| 항목 | 버전 | 비고 |
|------|------|------|
| Node.js | 18.x 이상 | LTS 권장 |
| npm | 9.x 이상 | Node.js와 함께 설치됨 |
| Git | 2.x 이상 | 버전 관리 |

### 선택 환경

| 항목 | 용도 |
|------|------|
| OpenAI API Key | 프롬프트 컴파일 기능 (Vercel 배포 시) |
| Vercel 계정 | 서버 기능 포함 배포 |
| GitHub 계정 | GitHub Pages 배포 |

---

## 2. 설치 및 실행

### 2.1 프로젝트 클론

```bash
git clone https://github.com/your-username/prompt.git
cd prompt
```

### 2.2 의존성 설치

```bash
npm install
```

### 2.3 환경 변수 설정

```bash
# env.example을 복사하여 .env.local 생성
cp env.example .env.local

# .env.local 파일 편집
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

> **주의**: API Key는 절대 클라이언트에 노출되지 않습니다. 서버에서만 사용됩니다.

### 2.4 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

---

## 3. 프로젝트 초기 설정

### 3.1 시스템 설정 확인

`data/config.json` 파일에서 시스템 설정을 확인합니다.

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
      "name": "VibePrompt OS",
      "description": "바이브코딩 시 프로젝트의 판단 맥락을 보존하는 프롬프트 관리 시스템",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 3.2 프로젝트 코어 수정

`data/project.core.md` 파일을 프로젝트에 맞게 수정합니다.

```markdown
# Project Core

## Purpose
- (프로젝트의 핵심 목적을 정의하세요)

## Philosophy / Principles
- (설계 원칙을 정의하세요)

## Long-term Direction
- (장기 방향성을 정의하세요)
```

### 3.3 API를 통한 프로젝트 관리

```bash
# 프로젝트 목록 조회
curl http://localhost:3000/api/projects

# 프로젝트 생성
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "id": "my-project",
    "name": "My Project",
    "purpose": "프로젝트 목적",
    "principles": "설계 원칙",
    "direction": "장기 방향"
  }'

# 프로젝트 조회
curl http://localhost:3000/api/projects/my-project

# 프로젝트 수정
curl -X PUT http://localhost:3000/api/projects/my-project \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Project Name"
  }'
```

---

## 4. 에이전트 설정

### 4.1 기본 에이전트 구조

에이전트 파일은 `data/agents/` 디렉토리에 위치합니다.

```
data/
└── agents/
    ├── auth.md
    ├── api.md
    └── ui.md
```

### 4.2 에이전트 파일 형식

```markdown
# Sub-Agent: Auth

## Role
- 에이전트의 책임 영역

## Design Decisions
- 이 영역에서 이미 결정된 사항들

## Constraints
- 반드시 지켜야 할 제약 조건

## Prompt Blueprint (옵션)
- 프롬프트 생성 시 특별 지침
```

### 4.3 템플릿에서 에이전트 생성

제공된 템플릿을 활용하여 빠르게 에이전트를 생성할 수 있습니다.

```bash
# 템플릿 목록 조회
curl http://localhost:3000/api/templates

# 템플릿에서 에이전트 생성
curl -X POST http://localhost:3000/api/agents/from-template \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "auth-basic",
    "agentId": "user-auth",
    "agentName": "User Authentication"
  }'
```

### 4.4 사용 가능한 템플릿

| 템플릿 ID | 이름 | 카테고리 | 설명 |
|-----------|------|----------|------|
| auth-basic | 인증/보안 에이전트 | security | JWT/Session 기반 인증 처리 |
| api-basic | API 에이전트 | backend | REST/GraphQL API 설계 |
| ui-basic | UI/UX 에이전트 | frontend | 사용자 인터페이스 설계 |
| database-basic | 데이터베이스 에이전트 | backend | 데이터 모델링 및 쿼리 |
| testing-basic | 테스트 에이전트 | quality | 테스트 전략 및 품질 보증 |

### 4.5 직접 에이전트 생성

```bash
curl -X POST http://localhost:3000/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "id": "custom-agent",
    "name": "Custom Agent",
    "role": "커스텀 역할 정의",
    "designDecisions": "- 결정 1\n- 결정 2",
    "constraints": "- 제약 1\n- 제약 2"
  }'
```

---

## 5. 배포 설정

### 5.1 Vercel 배포 (권장)

API 기능을 완전히 사용하려면 Vercel 배포를 권장합니다.

1. Vercel 계정 생성 및 로그인
2. GitHub 저장소 연결
3. 환경 변수 설정:
   - `OPENAI_API_KEY`: OpenAI API 키

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

### 5.2 GitHub Pages 배포

정적 호스팅으로 UI만 배포합니다 (API 기능 제한).

1. `next.config.ts`에서 `output: 'export'` 확인
2. GitHub Actions 워크플로우 활성화

```bash
# 수동 빌드
GITHUB_PAGES=true npm run build
```

### 5.3 배포 환경 비교

| 기능 | Vercel | GitHub Pages |
|------|--------|--------------|
| 정적 UI | ✅ | ✅ |
| API 라우트 | ✅ | ❌ |
| 프롬프트 생성 | ✅ | ❌ |
| 무료 티어 | ✅ | ✅ |

---

## 6. 문제 해결

### 6.1 API Key 오류

```
Error: OpenAI API key not configured
```

**해결방법**:
1. `.env.local` 파일에 `OPENAI_API_KEY` 설정 확인
2. 개발 서버 재시작

### 6.2 에이전트 로드 실패

```
Error: Agent not found: xxx
```

**해결방법**:
1. `data/agents/` 디렉토리에 파일 존재 확인
2. 파일명 형식 확인 (소문자, 하이픈, 점만 허용)

### 6.3 빌드 오류

```
Error: Cannot find module 'xxx'
```

**해결방법**:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### 6.4 GitHub Pages 배포 후 API 동작 안 함

이는 정상적인 동작입니다. GitHub Pages는 정적 호스팅만 지원하므로 API 라우트가 동작하지 않습니다.

**해결방법**: Vercel로 배포하거나 로컬에서 개발 서버 사용

---

## 체크리스트

### 초기 세팅 완료 확인

- [ ] Node.js 18.x 이상 설치
- [ ] 의존성 설치 (`npm install`)
- [ ] 환경 변수 설정 (`.env.local`)
- [ ] 개발 서버 실행 확인 (`npm run dev`)
- [ ] 프로젝트 코어 수정 (`data/project.core.md`)
- [ ] 에이전트 생성 (최소 1개)

### 배포 전 확인

- [ ] 빌드 성공 (`npm run build`)
- [ ] API Key 환경 변수 설정 (배포 플랫폼)
- [ ] .env 파일이 .gitignore에 포함되어 있는지 확인

---

## 다음 단계

1. **에이전트 추가**: 프로젝트에 필요한 에이전트들을 템플릿에서 생성하거나 직접 작성
2. **프롬프트 테스트**: 다양한 변경 요청으로 프롬프트 생성 테스트
3. **문서화**: 설계 결정사항을 지속적으로 에이전트에 반영

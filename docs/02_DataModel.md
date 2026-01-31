# Data Model — Markdown 기반 (MVP)

## 1) Project Core: /data/project.core.md
필수 3요소만 저장한다.

### Template
# Project Core

## Purpose
- ...

## Philosophy / Principles
- ...

## Long-term Direction
- ...

---

## 2) Sub-Agent: /data/agents/{name}.md
기억은 설계 결정만 저장한다.

### Template
# Sub-Agent: {Name}

## Role
- 이 모듈의 책임 범위
- 다른 모듈과의 경계

## Design Decisions
- 결정 1 (왜? + 전제)
- 결정 2 (왜? + 전제)

## Constraints
- 반드시 지켜야 할 조건
- 바꾸면 안 되는 것

## Prompt Blueprint (옵션)
- 이 모듈 변경 시 반복적으로 쓰는 지시 형태
- 없으면 공통 템플릿 사용

---

## 3) In-App State (웹 UI 상태)
- selectedScope: "project" | "agent"
- selectedAgents: string[]
- userInput: string
- outputMode: "prompt" | "prompt+md"
- generatedPrompt: string
- generatedDoc?: string

---

## 4) (옵션) Responses API 기반 상태 유지
- response_id 저장 (마지막 생성 결과)
- 다음 요청 시 previous_response_id로 연결 가능
- store=true를 사용하면 turn-to-turn 맥락 유지 패턴을 활용 가능


Responses API의 store, previous_response_id 같은 “상태 유지” 패턴은 공식 가이드/베스트 프랙티스에서 안내됩니다.


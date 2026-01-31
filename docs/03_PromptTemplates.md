# Prompt Templates (MVP)

## 0) 공통 규칙
- 새로운 설계 결정을 "발명"하지 말 것
- 제공된 Design Decisions / Constraints를 우선 적용
- 일부 재구성(문장 정리/중복 제거/순서 재배치)은 허용
- 모호하면 질문을 먼저 하도록 유도

---

## 1) 실행용 프롬프트 (기본)

# SYSTEM CONTEXT
You are assisting with a software project.
Do not invent new design decisions.
Only work within the given context.

---

# PROJECT CONTEXT

## Purpose
{Project Purpose}

## Philosophy / Principles
{Principles}

## Long-term Direction
{Direction}

---

# SUB-AGENT CONTEXT
## Role
{Role}

## Design Decisions
{Design Decisions}

## Constraints
{Constraints}

---

# CHANGE REQUEST
{User Free Input}

---

# TASK
- Apply the requested change only where relevant
- Respect all existing design decisions
- If something is ambiguous, ask questions before implementing
- Output the result for immediate use in vibe coding

---

## 2) (옵션) 문서 업데이트용 프롬프트
- 산출물을 "코드" 대신 "업데이트된 MD"로 유도

# TASK (Doc Mode)
- Update the affected markdown docs:
  - /data/project.core.md or /data/agents/{agent}.md
- Keep decisions consistent and explicit.
- Output the full updated markdown content.

---

## 3) Sub-Agent Prompt Blueprint가 있는 경우
- Prompt Blueprint를 TASK 앞에 삽입해 강화한다.


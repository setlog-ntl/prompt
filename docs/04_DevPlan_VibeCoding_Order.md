# 개발 진행 순서 (Vibe Coding용)

## Phase 1 — 최소 기능(1~2시간 MVP)
1) 저장소/프레임 선택
- Next.js(추천) 또는 Vite+React

2) 데이터 준비
- /data/project.core.md 작성
- /data/agents/*.md 2개만 먼저 만들기 (auth, ui 같은)

3) UI 1페이지 만들기
- 좌측: Scope 선택(Project / Sub-Agent)
- Sub-Agent 선택 드롭다운/체크
- 자유 입력 textarea
- outputMode 토글
- "Generate" 버튼
- 결과 프롬프트 출력 + Copy 버튼

4) 서버 라우트(API) 만들기
- POST /api/generate
- 입력: selectedScope, selectedAgents, userInput, outputMode
- 내부: core.md + agent.md 로드 후 prompt compose
- OpenAI Responses API 호출 후 결과 반환

5) 동작 확인
- “선택 → 입력 → 생성” 루프가 끊김 없이 되는지

---

## Phase 2 — 품질 고도화(반나절)
6) Sub-Agent 문서 템플릿 생성 버튼
- UI에서 "새 Sub-Agent 생성"
- Name/Role/Decisions/Constraints 입력 → md 파일 생성(또는 DB 저장)

7) “결정만 기억” 강제
- UI에서 Design Decisions 입력이 핵심이 되도록 폼 설계
- 실패 로그/잡설 입력은 최소화

8) 프롬프트 일부 재구성 룰 반영
- 중복 제거
- 섹션 순서 고정
- 빈 섹션 제거

---

## Phase 3 — (옵션) 상태 유지 / 재사용
9) Responses API store 사용 여부 결정
- store=true로 response_id 저장
- 다음 생성 시 previous_response_id로 연결해 맥락 유지 가능
- 단, MVP에서는 문서가 곧 맥락이므로 굳이 필수는 아님

---

## 보안 필수
- OpenAI API Key는 반드시 서버에서만 사용
- 클라이언트 번들에 절대 포함하지 않기
- 환경변수로 관리

---

## OpenAI API 구현 메모
- Responses API를 기본으로 사용
- Assistants API는 deprecated 흐름이 명시되어 있어 신규는 지양


Responses API 중심, Assistants deprecated 흐름은 공식 문서에 명시되어 있습니다.

---

## 1) 개발 시작 “전달 순서” (너가 바이브코딩에 넣을 순서)

아래 순서대로 Claude Code / GPT에 던지면, 산만해지지 않고 빠르게 뽑힙니다.

요구사항 고정 프롬프트

“이 프로젝트는 1인용, 실행용 프롬프트 생성 페이지”

“문서는 MD로 저장, 기억은 Design Decisions만”

파일 트리 생성 요청

/docs + /data + /api + /app 구성

UI 1페이지 스캐폴딩

Scope 선택 / Agent 선택 / 자유 입력 / Generate

서버 라우트 구현

core/agent 기억 로드 → prompt compose → Responses API 호출

프롬프트 템플릿 고정

위 docs/03 템플릿 그대로 적용

샘플 데이터로 E2E 확인

core + auth agent로 한번 생성해 보고 개선

---

## 2) 너의 MVP 기준 “완료 정의(DoD)”

Project Core 로드됨

Sub-Agent 선택 가능

자유 입력으로 실행 프롬프트 생성됨

OpenAI Responses API 호출 성공

결과 복사 가능

API Key 클라이언트 노출 없음


# VibePrompt OS Web (1인용)

## 목적
- 바이브코딩 시 프로젝트의 "판단 맥락"을 보존하고,
- 사용자의 자유 입력을 즉시 실행 가능한 프롬프트로 변환하는 웹 페이지를 만든다.

## 핵심 원칙
- 기억은 "설계 결정(Design Decisions)"만 저장한다.
- 프로젝트 메인 맥락은 Purpose / Principles / Long-term Direction만 고정한다.
- 사용자는 자유 입력한다.
- 변경 단위는 사용자가 선택한다 (Project / Sub-Agent).

## 1차 산출물
- 실행용 프롬프트(Claude Code/GPT/Cursor에 바로 투입)
- 옵션: Markdown 문서 출력 (사용자 선택)

## OpenAI API 방향
- Responses API 기반으로 구현 (권장)
- store / previous_response_id 기반 상태 유지 패턴은 옵션 (MVP는 비저장도 가능)

## 빠른 시작 체크리스트
- [ ] /data/project.core.md 작성
- [ ] /data/agents/*.md 2~5개 생성
- [ ] 웹에서 "변경 단위 선택 → 자유 입력 → 프롬프트 생성" 동작 확인


# Handoff — 2026-05-01 — BE Standards Definition Cycle

<!-- Proprietary — Copyright © 2026 홍혁준. See LICENSE. -->

> Tier 2 (Document & Clear) 적용. 본 문서는 fact 가 아닌 **hypothesis** 로 다룬다 — 새 세션은 인용된 파일을 직접 Read 도구로 읽고 코드/실제 상태와 대조 검증한 후 작업을 이어간다.
>
> **STATUS — 2026-05-01 사이클 종료 ✅** — 모든 산출물 작성·검증 완료. 참고안 3개 (`.claude/{1,2,3}_백엔드_아키텍처_참고_문서.md`) 사용자 직접 제거 완료. FE 이전 사이클은 다음 세션에서 진행 결정. 본 문서의 Open Work 체크박스는 §Open Work 에서 갱신.

## Summary

천기망 *기존 문서·에이전트 정합성 보강 사이클* 종료 (50건+ 변경, 양 저장소 2단계 커밋 완료, rename 2건 포함). BE 표준 정의 사이클은 *대규모 작업* 으로 판단되어 별도 세션에서 진행. 하네스 호출 트리거 프롬프트는 [`2026-05-01-be-harness-trigger.md`](./2026-05-01-be-harness-trigger.md) 에 보관. 새 세션은 본 핸드오프 + 트리거 문서를 검증한 후 사용자가 트리거 입력 → `harness:harness` 스킬 발동 → Phase 0–6 자동 실행 흐름.

## Key Decisions

- **BE 표준 정의 = 사용자 방향성 + 하네스 세부 설계 위임**
  근거: 사용자가 2026-05-01 직접 결정 — "이 모든 건 하네스가 직접 설계한다". 분담 매트릭스 변경 (사용자 직영 → 하네스 자동, 방향성은 사용자 유지).
- **헥사고날 = 공통 모듈 금지** (강한 제약)
  근거: 사용자 직접 강조. 횡단 관심사 (AOP·Filter·Annotation·DB 설정) 는 (a) 도메인 모듈 자체 보유 / (b) infra 모듈 통합 / (c) 최외곽 진입점 모듈 중 하네스 결정.
- **inbound/outbound = 풀네임 사용**
  근거: 사용자 직접 결정. `in/out` 단축 사용 금지.
- **infra 순수 분리 채택** (참고안 의견 2)
  근거: adaptor/outbound = Port 구현 + 변환/조합 / infra = 순수 기술 (domain 모름).
- **도메인 미확정**
  근거: 추후 도메인 설계 사이클에서 확정. 현 src/entities/ 6개 (level/art/faction/title/fortune/misc) 는 *FE 데이터 구조* 일 뿐 BE 도메인 확정안 아님. 산출물에 *플레이스홀더* (`<domain>/`) 표기.
- **참고안 3개 = 임시 자료, 사이클 후 제거**
  근거: `.claude/{1,2,3}_백엔드_아키텍처_참고_문서.md` 는 *패턴 차용용* 임시 자료. 하네스가 *링크 인용 금지* (곧 사라지므로 dead link 화).
- **별도 세션 진행**
  근거: 사이클 변경량 매우 클 것으로 예상 (BE SSOT 7개 placeholder + 에이전트 2~3개 + 가이드 2개 + 멀티 모듈 빌드 설정). 현 세션 토큰 부담 회피.

## Traps to Avoid

- 참고안 (`.claude/{1,2,3}_*`) 의 **링크 인용 금지** — 곧 사라질 파일을 산출물에 박으면 dead link 발생. 패턴만 차용해서 천기망 컨텍스트로 재해석.
- 참고안의 **`config/`·`framework/` 같은 공통 모듈 패턴 차용 금지** — 사용자가 명시적으로 헥사고날 공통 모듈 금지를 강조.
- 도메인 *예시* 사용 금지 — 천기망 6개 도메인은 미확정. 산출물에는 플레이스홀더 (`<domain>/`) 만 표기.
- **절대경로 하드코딩 금지** (이식성 자기모순) — 모든 인용 상대경로.
- **LICENSE 헤더 (옵션 A 표준) 누락 금지** — 모든 .md H1 다음 줄에 `<!-- Proprietary — Copyright © 2026 홍혁준. See LICENSE. -->`.
- **FE SSOT (`fe_reference_prompt.md`) 변경 금지** — BE 측 보강만. FE↔BE 통신은 OpenAPI 명세 단일 진실 (대칭 유지).
- 명명 규약 위반 — `agent-{scope}-{role}.md` / frontmatter `martial-arts-{scope}-{role}` 패턴 강제.
- 변경 이력 누적 누락 — `harness-state.md` 변경 이력 표에 본 사이클 모든 변경 누적 의무.
- harness Phase 진행 중 *결정 항목* 사용자 confirm 없이 자동 진행 — 멀티 모듈 분리 / 횡단 관심사 / BDD 도구 등은 사용자 confirm 받기.

## Working Agreements

- 명시적 지시는 **우회 없이 직접 실행** — 대안 제시·허가 확인 없이.
- 외부 글은 **원본 URL 로만 참조** (verbatim 사본 repo 저장 금지 — 저작권).
- **2단계 커밋** — 서브모듈(`.private-config`) 먼저 커밋·푸시, 메인 저장소가 포인터 갱신.
- **제안 → 확인 → 수정의 순차 진행** (일괄 수정 금지).
- **Closure Discipline** — 커밋 메시지 SSOT 는 plan 의 "제안 커밋 메시지 초안" (`vibe-coding-flow.md §6`).
- **Synchronous Update** — 변경 시 SSOT 역전파 (`vibe-coding-flow.md §3.3`).
- 변경 이력은 [`harness-state.md`](../harness/harness-state.md) 의 표에 누적.

## Relevant Files

### 본 사이클 진입 필수 문서

- [`2026-05-01-be-harness-trigger.md`](./2026-05-01-be-harness-trigger.md) — **하네스 호출 입력 (트리거 프롬프트)**. 이 파일의 코드 블록을 그대로 채팅에 입력하면 `harness:harness` 스킬 자동 발동.

### 산출물 영향 영역 (사이클 후 갱신·생성 대상)

- [`docs/readme/harness/harness-state.md`](../harness/harness-state.md):L131-170 — **변경 이력 SSOT**. 본 사이클 변경 누적 의무.
- [`docs/readme/harness/harness-integration.md`](../harness/harness-integration.md):L49-72 — **§2 분담 매트릭스 BE 행 갱신 대상** (사용자 직영 → 하네스 자동).
- `.private-config/shared/prompt/read_only/backend/be_reference_prompt.md` *(private)* — **BE SSOT 보강 대상**. §1 (TBD) + §4-10 placeholder 7개 채움.
- `.private-config/claude/claude-agents/agent-backend.md` *(private)* — **코디네이터 본문 채울 대상** (현재 골격).
- `.private-config/claude/claude-agents/agent-backend-reviewer.md` *(private)* — **신규 생성 대상**.

### 메타·정합성 참조

- [`vibe-coding-flow.md`](../../../.private-config/shared/prompt/read_only/vibe-coding-flow.md) *(private)* — 메타 워크플로우 SSOT.
- [`harness-setup.md §5`](../harness/harness-setup.md#5-결과-검증-정합성-체크) — 산출물 정합성 7항목 체크.
- [`fe_reference_prompt.md`](../../../.private-config/shared/prompt/read_only/frontend/fe_reference_prompt.md) *(private)* — FE 대칭 참조 (변경 금지).
- [`fe-architecture.md`](../fe-architecture.md) — FE 아키텍처 (BE 가이드와 대칭 가이드 작성 시 참조).

### 참고안 (사이클 후 제거 — **2026-05-01 사용자 직접 제거 완료 ✅**)

- ~~`.claude/1_백엔드_아키텍처_참고_문서.md`~~ — team/outbound 도메인 디렉토리 구조 + 의존성 다이어그램 (제거됨)
- ~~`.claude/2_백엔드_아키텍처_참고_문서.md`~~ — 1번과 동일 (위 277줄 풀버전, 제거됨)
- ~~`.claude/3_백엔드_아키텍처_참고_문서.md`~~ — 의견 2 (adaptor/out vs infra 분리) 발췌 (제거됨)

> 위 3개 파일은 사이클 후 사용자가 직접 제거했다. 본 사이클 산출물 어디에도 인용 링크 없음 — dead link 위험 없이 안전 제거.

## Open Work (상태 서술형)

- ~~BE 표준 정의 사이클 *미실행*~~ — **2026-05-01 사이클 실행 완료 ✅**. 산출물 11종 + 메타 3종 = 총 14파일 변경.
- ~~분담 매트릭스 (`harness-integration.md §2` BE 행) *미갱신*~~ — **갱신 완료 ✅** (사용자 직영 → 하네스 자동, 방향성은 사용자).
- ~~참고안 3개 (`.claude/{1,2,3}_백엔드_아키텍처_참고_문서.md`) *미제거*~~ — **2026-05-01 사용자 직접 제거 완료 ✅**.
- ~~`harness-integration.md §4.1` 매트릭스에 BE 산출물 *미반영*~~ — **반영 완료 ✅** (BE 산출물 위치 매트릭스 추가).
- *FE 디렉토리 이전 + 기본 프로젝트 구조 셋팅* — **다음 세션 진행 결정 (사용자 결정 2026-05-01)**. 본 사이클은 BE 한정.
- `agent-fe-tester` 시범 생성 *미실행* — BE 사이클 종료 후 또는 병행 트랙. 별도 진행.

---

> 본 사이클은 위 6개 Open Work 중 4개 완료 + 1개 다음 세션 분리 + 1개 별도 트랙으로 종료된다.

## Prompt for New Chat

```
천기망 BE 표준 정의 사이클을 시작한다.

다음 파일을 실제로 Read 도구로 읽고 본 핸드오프 / 트리거 문서의 주장을
코드/실제 상태와 대조 검증한 후, 트리거 호출을 안내해:

1. docs/readme/handoff/2026-05-01-be-harness-cycle.md (본 핸드오프 — SSOT)
2. docs/readme/handoff/2026-05-01-be-harness-trigger.md (하네스 호출 입력)
3. docs/readme/harness/harness-state.md (천기망 하네스 현 상태 + 변경 이력)
4. docs/readme/harness/harness-integration.md §2 (BE 행 갱신 대상)
5. .private-config/shared/prompt/read_only/backend/be_reference_prompt.md (BE SSOT 보강 대상)
6. .private-config/claude/claude-agents/agent-backend.md (코디네이터 골격)

CLAUDE.md 에 이미 적힌 내용은 다시 설명하지 마.

검증 후 사용자에게 다음 안내:
(a) 트리거 .md 의 트리거 프롬프트 코드 블록 복사 → 채팅 입력으로 하네스 호출 시작
(b) Phase 0–6 진행 중 결정 항목 (멀티 모듈 분리 / 횡단 관심사 (a/b/c) / BDD 도구 등) 사용자 confirm 받기
(c) 산출물 검증 (트리거의 정합성 의무 8항목 + harness-setup.md §5 7항목)
(d) 사이클 종료 시 분담 매트릭스 갱신 + 참고안 3개 제거 + harness-state.md 변경 이력 누적
```
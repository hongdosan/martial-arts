# 하네스 (Harness) 도입 가이드

<!-- Proprietary — Copyright © 2026 홍혁준. See LICENSE. -->

천기망(天機網) 프로젝트가 [revfactory/harness](https://github.com/revfactory/harness) 를 도입하는 절차와 분담 원칙을 정의한다. 본 문서는 *계획·절차* 문서이며, 도입 후 실행 상태와 진화는 [harness-state.md](harness-state.md) 에 사실 기반으로 누적한다.

## 목차

- [1. 하네스란](#1-하네스란)
- [2. 천기망의 분담 원칙](#2-천기망의-분담-원칙)
- [3. 도입 절차 (Phase 0–5)](#3-도입-절차-phase-05)
- [4. 산출물 위치 / 명명 규칙](#4-산출물-위치--명명-규칙)
- [5. 검증 / 진화 — harness 패턴 차용](#5-검증--진화--harness-패턴-차용)
- [6. vibe-coding-flow 와의 관계](#6-vibe-coding-flow-와의-관계)
- [7. 참고](#7-참고)

---

## 1. 하네스란

[`revfactory/harness`](https://github.com/revfactory/harness) 는 **Claude Code 용 메타 스킬**이다. 도메인 한 줄을 입력받아 전문 에이전트 팀과 그들이 사용할 스킬을 자동 생성한다.

- **저장소**: https://github.com/revfactory/harness
- **라이선스**: Apache 2.0
- **참고 논문**: Hwang, M. (2026). *Harness: Structured Pre-Configuration for Enhancing LLM Code Agent Output Quality*

### 1.1 핵심 철학

- **도메인 → 팀 자동화**: 수작업 에이전트 작성을 대체
- **6가지 아키텍처 패턴 카탈로그**: 파이프라인 / 팬아웃·인 / 전문가 풀 / 생성-검증 / 감독자 / 계층적 위임
- **진화 가능성**: 사용자 피드백을 변경 이력에 누적, 일정 조건에서 자동 진화 트리거 발동
- **스킬-에이전트 분리**: "스킬 = 어떻게 / 에이전트 = 누가"

### 1.2 8 Phase 워크플로우 (Phase 0–7)

| Phase | 역할 | 산출물 |
|-------|------|--------|
| 0 | 현황 감사 | 실행 모드 분기 (신규/확장/유지보수) |
| 1 | 도메인 분석 | 핵심 작업 유형 + 기술 스택 |
| 2 | 팀 아키텍처 설계 | 6패턴 중 선택 |
| 3 | 에이전트 정의 | `.claude/agents/{name}.md` |
| 4 | 스킬 생성 | `.claude/skills/{name}/SKILL.md` |
| 5 | 통합·오케스트레이션 | orchestrator 스킬 + CLAUDE.md 포인터 |
| 6 | 검증·테스트 | 구조 / 모드 / 실행 / 트리거 / 드라이런 / 시나리오 |
| 7 | 진화 | 피드백 → 매핑 → 변경 이력 |

---

## 2. 천기망의 분담 원칙

천기망은 **하네스를 부분적으로** 도입한다. 도메인별 작성 주체가 다르다.

| 영역 | 담당 | 근거 |
|------|------|------|
| **BE 스킬·기술 스택·아키텍처** | 사용자 직접 정의 | 사용자가 BE 방향성을 직접 제시 |
| **FE 스택·아키텍처·에이전트** | 이미 결정 (변경 없음) | `fe_reference_prompt.md` SSOT 완성, `agent-frontend.md` / `agent-frontend-reviewer.md` 작성 완료 |
| **그 외 에이전트 / 스킬** | 하네스 자동 생성 | 테스터 · 코디네이터 · 도메인 분석 · 기타 횡단(cross-cutting) 에이전트 |

> **분담의 의미**: BE/FE 의 *도메인 지식* 은 사람이 결정하고, 그 외 *프로세스·검증·조율* 영역만 하네스로 자동화한다.

### 2.1 하네스 대상 (현 시점 매트릭스)

| 에이전트 | 현 상태 | 도입 방식 |
|---------|--------|----------|
| `agent-backend.md` | 골격 | **사용자 정의** (BE 영역) |
| `agent-backend-reviewer.md` | 미작성 | **사용자 정의** (BE 영역) |
| `agent-frontend.md` | 완성 | 변경 없음 |
| `agent-frontend-reviewer.md` | 완성 | 변경 없음 |
| `agent-game-master.md` | 완성 (게임 도메인) | 변경 없음 |
| `agent-tester.md` | 미작성 | **하네스** |
| `agent-reviewer.md` (코디네이터) | 미작성 | **하네스** (BE/FE 양측 합류 후) |
| 도메인 분석 / 리서치 / 스파이크 | 미정 | **하네스** |

---

## 3. 도입 절차 (Phase 0–5)

### Phase 0 — 사전 준비

1. **라이선스 확인**: Apache 2.0 → 사용 가능. 본 프로젝트 LICENSE(Proprietary) 와 충돌 없음. 단, 하네스가 *생성*하는 산출물에는 천기망 LICENSE 적용.
2. **플러그인 설치 환경 검증**: Claude Code CLI 최신 버전, `.claude-plugin/` 디렉토리 사용 가능 여부 확인.
3. **분담 원칙 합의 확정**: §2 매트릭스를 본 문서로 SSOT 처리.

### Phase 1 — 플러그인 설치

1. harness 저장소 README 의 권장 설치 방법 확인.
2. 천기망 루트에서 플러그인 설치 명령 실행.
3. 설치 후 등가 위치(`.claude/skills/harness/` 또는 플러그인 매니페스트)에 SKILL.md 노출 확인.

### Phase 2 — 시범 생성 (첫 도메인)

1. **첫 대상 선정**: 우선순위 높은 횡단 에이전트 1개. 권장 = `agent-tester.md`.
2. `/harness` 또는 등가 명령으로 도메인 한 줄 입력. 예:
   > *"BDD 스타일 E2E 테스트 작성·검증 에이전트. FE 영역 한정. 천기망 FE 표준(`fe_reference_prompt.md`) 준수. Vitest 또는 Playwright 후보."*
3. harness Phase 1–6 자동 실행.
4. 산출물 위치 확인:
   - `.claude/agents/agent-tester.md` (실제 파일은 `.private-config/claude/claude-agents/`)
   - `.claude/skills/{생성된-스킬-이름}/SKILL.md`
   - `_workspace/01_*.md` (중간 산출물)

### Phase 3 — 산출물 검토 (정합성 확인)

하네스 산출물이 **천기망 고유 원칙**과 정합하는지 검증한다.

| # | 검증 항목 | 통과 조건 |
|---|----------|----------|
| 1 | frontmatter `name` | `martial-arts-{scope}-{role}` 패턴 |
| 2 | FE 영역 검증 시 SSOT 인용 | `fe_reference_prompt.md` 명시 참조 |
| 3 | BE 영역 침범 여부 | BE 미결정 단계라면 BE 검토 항목 미포함 |
| 4 | Closure Discipline 인지 | 커밋 메시지 초안 형식 호환 (vibe-coding-flow §6) |
| 5 | Synchronous Update 인지 | 변경 시 SSOT 역전파 절차 인지 |
| 6 | symlink 인지 | `.claude/agents/` 가 `.private-config/claude/claude-agents/` 의 symlink 임을 알고 실제 파일 경로 정정 |
| 7 | 라이선스 표기 | frontmatter 다음 줄에 HTML 주석 1줄: `<!-- Proprietary — Copyright © 2026 홍혁준. See LICENSE. -->` (사용자 직영·harness 자동 생성 모두 동일 — 표기 표준 2026-04-30 확정) |

검증 실패 항목은 **수동 보정** → [harness-state.md](harness-state.md) 변경 이력에 사유 기록.

### Phase 4 — vibe-coding-flow 와 통합

1. 생성된 에이전트가 vibe-coding-flow Step 03(Roadmap Design) 의 **plan 산출물** 을 입력으로 받을 수 있도록 입력 스키마 확인.
2. Step 06(Commit & Close) 의 **제안 커밋 메시지 초안** 형식과 맞도록 출력 스키마 보강 (필요 시 수동 편집).
3. orchestrator 스킬이 생성되었다면 vibe-coding-flow 6단계와 harness phase 매핑 명시:

| vibe-coding-flow Step | harness Phase | 비고 |
|----------------------|---------------|------|
| 01 Context Definition | 1 도메인 분석 | 입력 매핑 |
| 02 Prompt QA | 6 검증·테스트 (일부) | 트리거·구조 검증 |
| 03 Roadmap Design | — | vibe 고유 |
| 04 Technical Review | 6 검증·테스트 (전체) | 6단계 검증 흡수 |
| 05 Adaptive Execution | — | vibe 고유 |
| 06 Commit & Close | 7 진화 | 변경 이력 누적 |

### Phase 5 — 진화 사이클 정착

1. 첫 실주행 후 피드백을 `harness-state.md` 의 변경 이력 표에 기록.
2. 동일 피드백 2회 반복 시 **자동 진화** 트리거 발동 — 해당 스킬/에이전트 수정.
3. 분기별 하네스 산출물 vs 천기망 SSOT 정합성 sample audit.

---

## 4. 산출물 위치 / 명명 규칙

### 4.1 천기망 기존 구조와의 정합

| 하네스 기본 위치 | 천기망 실제 위치 | 비고 |
|----------------|----------------|------|
| `.claude/agents/{name}.md` | `.private-config/claude/claude-agents/{name}.md` | symlink 통해 `.claude/agents/` 노출 |
| `.claude/skills/{name}/SKILL.md` | `.private-config/claude/claude-skills/{name}/SKILL.md` | **신규 디렉토리** — Phase 1 도입 시 결정 |
| `_workspace/{phase}_{agent}_{artifact}.{ext}` | `.private-config/shared/prompt/_workspace/...` 또는 `prompt/plan/<topic>/_workspace/...` | **위치 결정 보류** — Phase 2 시점에 확정 |

### 4.2 명명 규칙 (천기망 기존 패턴 우선)

| 대상 | 패턴 | 예시 |
|------|------|------|
| 에이전트 파일 | `agent-{scope}-{role}.md` | `agent-fe-tester.md` |
| frontmatter `name` | `martial-arts-{scope}-{role}` | `martial-arts-fe-tester` |
| 스킬 디렉토리 | kebab-case 도메인 | `fe-bdd-test/` |
| 중간 산출물 | `{NN}-{agent}-{artifact}.{ext}` | `01-tester-cases.md` |

> 하네스 생성 결과가 위 패턴과 다르면 수동 정정 후 변경 이력에 기록.

---

## 5. 검증 / 진화 — harness 패턴 차용

### 5.1 검증 (Phase 6 6단계)

1. **구조 검증**: 파일 위치 · frontmatter 존재 · 에이전트 간 참조 일관성
2. **실행 모드 검증**: 팀 / 서브 / 하이브리드 모드별 데이터 경로
3. **실행 테스트**: with-skill vs without-skill 비교
4. **트리거 검증**: should-trigger 8–10개 + should-NOT 8–10개
5. **드라이런**: phase 순서 논리성 · dead link 부재
6. **시나리오**: 정상 1개 + 에러 1개 이상

### 5.2 진화 트리거

- 동일 피드백 **2회 이상 반복**
- 에이전트 **반복 실패 패턴** 발견
- 사용자가 **오케스트레이터 우회**하여 수동 작업

위 트리거 발동 시 → 해당 스킬/에이전트 수정 → 변경 이력 표 갱신.

### 5.3 변경 이력 (Where)

- **중앙 누적**: [harness-state.md](harness-state.md) 결론 표 아래 "변경 이력" 섹션 신설 검토.
- **에이전트 단위**: 각 `agent-*.md` frontmatter 하단에 변경 이력 표.

> **운영 원칙**: 모든 진화 변경은 변경 이력에 *날짜 / 변경 내용 / 대상 / 사유* 4컬럼 기록.

---

## 6. vibe-coding-flow 와의 관계

천기망의 vibe-coding-flow 와 harness 는 **상보 관계**다.

| 시스템 | 역할 |
|-------|------|
| **vibe-coding-flow** | 일상 사이클을 *어떻게 돌리는가* (Closure Discipline · Synchronous Update · 인간 선택 기반) |
| **harness** | 그 사이클을 *어떻게 생성·검증·진화* 시키는가 (자동화 · 패턴 카탈로그 · 정형 검증) |

**충돌이 발생할 경우 우선 순위**: 천기망 vibe-coding-flow > harness 출력. 이유: vibe-coding-flow 의 Closure Discipline 과 Synchronous Update 는 천기망 고유 원칙으로, harness 산출물은 이를 보강하는 위치에 둔다.

---

## 7. 참고

- harness 저장소: https://github.com/revfactory/harness
- harness SKILL.md: https://github.com/revfactory/harness/blob/main/skills/harness/SKILL.md
- 천기망 메타 워크플로우: `.private-config/shared/prompt/read_only/vibe-coding-flow.md` *(private)*
- 천기망 하네스 현 상태 분석: [harness-state.md](harness-state.md)
- 프라이빗 설정 관리: [private-config.md](../private-config.md)
- FE 단일 기준점: `.private-config/shared/prompt/read_only/frontend/fe_reference_prompt.md` *(private)*

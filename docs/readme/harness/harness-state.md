# AI 에이전트 하네스 (Agent Harness)

<!-- Proprietary — Copyright © 2026 홍혁준. See LICENSE. -->

천기망(天機網) 프로젝트의 AI 협업 구조를 정의하는 메타 레이어 문서. 본 프로젝트가 어떤 형태의 하네스를 도입했는지 사실 기반으로 정의한다.

## 목차

- [정의](#정의)
- [구성 요소](#구성-요소)
- [정량 측정값](#정량-측정값)
- [비판적 사실 분석](#비판적-사실-분석)
- [결론](#결론)
- [참고](#참고)

## 정의

천기망은 자체 런타임을 구축하지 않고 [Claude Code](https://claude.com/claude-code) 런타임 위에 **문서 기반 프로세스 하네스 (Documentation-Driven Process Harness)** 를 얹은 구조다.

| 층위 | 정의 | 본 프로젝트 |
|---|---|---|
| Runtime Harness | LLM 호출·도구 디스패치·상태·실행 흐름을 코드로 묶은 시스템 | Claude Code (재사용) |
| Process / Documentation Harness | 페르소나·SSOT·워크플로우·산출물 형식을 문서로 강제하는 메타 레이어 | **본 프로젝트가 정의** |

## 구성 요소

천기망 하네스를 구성하는 12개 요소.

| # | 요소 | 위치 |
|---|------|------|
| 1 | 페르소나/역할 정의 | 각 에이전트 frontmatter + §0 |
| 2 | 다중 전문 에이전트 분리 | `.claude/agents/agent-{backend,frontend,game-master,frontend-reviewer}.md` |
| 3 | 단일 기준점 (SSOT) | `prompt/read_only/{backend,frontend}/*_reference_prompt.md` *(private)* |
| 4 | 단계별 워크플로우 | `prompt/read_only/vibe-coding-flow.md` Step 01–06 *(private)* |
| 5 | 템플릿 계층화 | `read_only/` → `custom/` → `plan/` |
| 6 | AI 자가 검증 절차 | `agent-frontend-reviewer.md §3` |
| 7 | 산출물 스키마 | DoD 체크박스, Critical/Major/Minor 보고 형식, "제안 커밋 메시지 초안" |
| 8 | 핸드오프 프로토콜 | "제안 → 확인 → 수정의 순차 진행" |
| 9 | 역전파 (Synchronous Update) | vibe-coding-flow 핵심 원칙 §3 |
| 10 | Closure Discipline | 커밋 메시지 SSOT (vibe-coding-flow 핵심 원칙 §4) |
| 11 | 도구 우선순위 | `.claude/CLAUDE.md` Tooling (Serena MCP 우선) |
| 12 | Adapter Pattern | FE 라이브러리 격리 (TanStack/HTTP/Tailwind/OpenAPI 어댑터 위치 명시) |

> *(private)* 표시 항목은 프라이빗 서브모듈(`.private-config/`)에 위치하며 접근 권한이 있는 협업자만 열람 가능.

## 정량 측정값

### 에이전트 인벤토리

| 에이전트 | 상태 | 분량 |
|---------|------|------|
| `agent-backend.md` | 골격 | 1,634 B / 46행 |
| `agent-frontend.md` | 완성 | 11,257 B / ~250행 |
| `agent-game-master.md` | 완성 (게임 도메인) | 21,515 B |
| `agent-frontend-reviewer.md` | 완성 | 8,450 B / 159행 |
| `agent-backend-reviewer.md` | 미작성 | — |
| `agent-reviewer.md` (코디네이터) | 미작성 | — |
| `agent-tester.md` | 미작성 | — |

작성률: 4/7 (57%) — `agent-backend.md` 본문이 빈 골격이므로 실질 3.5/7 (50%).

### SSOT 완성도

| 문서 | 완성률 |
|------|--------|
| `fe_reference_prompt.md` | 91% (10/11 섹션) |
| `be_reference_prompt.md` | 42% (5/12 섹션, 나머지 placeholder) |

### 자동 강제 메커니즘

| 항목 | 존재 |
|------|------|
| FSD 레이어 lint (`eslint-plugin-boundaries` 등) | 없음 |
| Pre-commit hook (`husky` / `lint-staged`) | 없음 |
| 출력 스키마 검증 | 없음 |
| 슬라이스 public API import 가드 | 없음 |
| TypeScript Strict (`tsconfig.json:9`) | **유일한 LLM-외부 강제 장치** |

자동 강제: 1건 (TS Strict). 그 외 모든 규칙은 LLM 순응에 의존.

### 표준-코드 정합성

| 결정 표준 | 현재 코드 | 정합 |
|----------|---------|------|
| Vite | `react-scripts@5.0.1` (CRA) | ❌ |
| TanStack Query | 의존성 0 | ❌ |
| Tailwind CSS | 의존성 0 | ❌ |
| TypeScript Strict | `strict: true` | ✅ |
| FSD 레이어 | `processes/` 미사용, 나머지 존재 | △ |

5개 핵심 항목 중 1개 완전 일치 (20%).

## 비판적 사실 분석

### 내부 모순

1. **FE 리뷰어 가동 시 거의 모든 파일이 위반 보고 대상**.
   - `agent-frontend-reviewer.md §2.2` 는 TanStack Query 어댑터 경유를 검토하나, `package.json` 에 의존성 0 → 어댑터 자체가 존재할 수 없음.
   - §2.5 Tailwind 검토도 동일한 코드-표준 충돌.
2. **vibe-coding-flow.md 가 자기 디렉토리(`read_only/`) 안에 위치**. 상대경로 References 가 디렉토리 재구성에 취약 (이전 1회 깨진 전례).

### 비대칭

1. **FE/BE 비대칭**: FE 는 표준 → 참고서 → 개발자/리뷰어 → 템플릿 → README 까지 닫힌 루프. BE 는 골격 단계.
2. **참고서 비대칭**: FE 91% vs BE 42%. BE 결정 시 §4~§10 7개 영역(API·DB·테스트·도메인 상수·보안·성능·코드 스타일) 표준 결정 필요.
3. **코디네이터 부재**: 분기 대상이 FE 1개라 현 시점은 정당화 가능. BE 합류 시 도입 필수.

### 강제력 부재

모든 규칙이 LLM 순응에 의존. 사람이 표준 위반 코드를 직접 PR 하면 막을 자동 장치 부재. 리뷰어 출력 형식 위반조차 자동 검출 불가.

## 결론

| 차원 | 상태 |
|------|------|
| 설계 | 도입 완료 (12개 요소 모두 정의) |
| FE 사이클 | 표준-에이전트-리뷰어까지 닫힌 루프 |
| BE 사이클 | 골격 단계 |
| 강제력 | LLM 순응 의존 (TS Strict 외 자동화 0) |
| 표준-코드 정합 | 20% (1/5) |

천기망 하네스는 **설계 차원에서 도입 완료된 문서 기반 프로세스 하네스**다. 다음 강화 우선순위는:

1. **Harness 플러그인 설치** ([revfactory/harness](https://github.com/revfactory/harness)) — [harness-setup.md](./harness-setup.md) 절차에 따라 설치 → 환경 플래그 활성화 → 디렉토리 정합화
2. **시범 생성 — `agent-fe-tester`** — harness Phase 1–6 자동 실행으로 FE BDD E2E 테스트 에이전트 생성, [harness-integration.md Phase 3](./harness-integration.md#phase-3--산출물-검토-정합성-확인) 정합성 체크 7항목 통과
3. **표준-코드 정합화** — CRA → Vite 마이그레이션, TanStack Query / Tailwind CSS 도입
4. **자동 강제 도입** — `eslint-plugin-boundaries` (FSD 레이어 lint), `husky` + `lint-staged` (pre-commit), PR 템플릿에 리뷰 체크리스트 박기

> **BE 사이클 완료** — 현 사이클에서 보류. 사용자가 BE 방향성(스킬·기술 스택·아키텍처)을 직접 정의 예정. 그 전까지는 BE placeholder 유지.

## 변경 이력 (Change History)

harness Phase 7 패턴을 차용한 변경 이력. 모든 진화 변경은 *날짜 / 변경 내용 / 대상 / 사유* 4컬럼으로 기록.

| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-04-26 | 공용 프롬프트 템플릿 천기망 맞춤 최소 개선 | `prompt/read_only/{backend,frontend,common}/*` | mk119 잔재 제거, 천기망 BE/FE 분담 placeholder 도입 |
| 2026-04-26 | FE 단일 기준점(SSOT) 결정·작성 | `fe_reference_prompt.md` | TS Strict / React / Vite / TanStack Query / Tailwind / FSD 표준 확정 |
| 2026-04-28 | FE 정보 README 반영 | `README.md`, `fe-architecture.md` | 결정된 FE 표준 공개 문서화 |
| 2026-04-28 | FE 리뷰어 에이전트 작성 | `agent-frontend-reviewer.md` | FE 사이클 닫힌 루프 완성 |
| 2026-04-28 | 본 하네스 분석 문서 작성 | `harness-state.md` | 현 상태 사실 기반 정의 |
| 2026-04-29 | Harness 도입 가이드 작성 | `harness-integration.md` | 도입 절차·BE/FE/기타 분담 원칙 명시 |
| 2026-04-29 | Harness 플러그인 설치·적용 가이드 작성 | `harness-setup.md` | 실제 설치~첫 적용 절차 정형화 |
| 2026-04-29 | 하네스 관련 문서를 `docs/readme/harness/` 로 그룹화 | 디렉토리 재구성 | 주제별 문서 묶음 |
| 2026-04-29 | BE 사이클 보류 결정 | 본 문서 결론 | 사용자가 BE 방향성을 직접 제시 예정 |
| 2026-04-30 | 세션 Context Handoff 4-Tier 전략 도입 | `docs/readme/handoff/README.md` + `2026-04-30-harness-install.md` | 세션 재기동 전 컨텍스트 보존 — codex.epril.com 4계층 전략 차용 |
| 2026-04-30 | harness 플러그인 설치 (Marketplace 옵션 A) | `~/.claude/plugins/installed_plugins.json`, 마켓플레이스 등록명 `harness-marketplace` | 천기망 첫 plugin 도입 — 글로벌 스킬로 로드되어 root 디렉토리 영향 없음 확인 |
| 2026-04-30 | `harness-setup.md` §2 install 명령·§2.1 가설 정정 | `docs/readme/harness/harness-setup.md` | 실측에 따른 SSOT 동기화 — 마켓플레이스 등록명 일치, root 자동 생성 가설 무효화 |
| 2026-04-30 | `agent-frontend.md` 정합성 보강 (Symlink/SSOT 헤더, §1 SSOT 확정값 반영, §2.4 OpenAPI 어댑터, §8 SSOT 동기화 체크, §10 도구 우선순위, §11 메타 워크플로우 신설) | `.private-config/claude/claude-agents/agent-frontend.md` | 하네스 감사 결과 Major 4건·Minor 4건 일괄 보정 |
| 2026-04-30 | LICENSE 표기 표준 확정 (옵션 A) — agent/skill .md frontmatter 다음 HTML 주석 1줄 | 4개 agent .md + `harness-integration.md §3` + `harness-setup.md §5` | 체크 항목 #7 의 사문(死文) 상태 해소, harness 자동 생성물 포함 강제력 확보 |
| 2026-04-30 | `agent-frontend-reviewer.md` 정합성 보강 (Symlink target 헤더, §1 표 절대경로→상대경로 + 표기 통일, §5 vibe-coding-flow 정렬·도구 우선순위) | `.private-config/claude/claude-agents/agent-frontend-reviewer.md` | 하네스 감사 결과 Major 1건(이식성 자기모순)·Minor 4건 보정 |
| 2026-04-30 | `agent-game-master.md` 정합성 보강 (Symlink target + 메타 워크플로우 헤더, JSON 정본 위치 placeholder 명시) | `.private-config/claude/claude-agents/agent-game-master.md` | 하네스 감사 결과 Major 1건(자체 SSOT 위치 불명) placeholder 명시·Minor 보정. 사용자 확정 시 (a)/(b) 모델 결정 |
| 2026-04-30 | `.claude/CLAUDE.md` 정합성 보강 8건 일괄 (H1, LICENSE, Symlink target, 변경 사이클, 빈 링크 2건, 도메인 분석 placeholder, agent-game-master 트리거, 변경 이력 H2) | `.private-config/claude/CLAUDE.md` | 협업자 가이드 SSOT 로 정체성 재정의 — 매 세션 자동 로드 + 천기망 내부 개발자 공용 문서 관점 반영 |
| 2026-04-30 | `.private-config/README.md` 디렉토리 트리 정합성 정정 — FE/BE 표준 프롬프트 8개 (`*_reference/develop/improvement/review_prompt.md`), placeholder README 4개, `frontend/env/.gitkeep` 트리 반영 | `.private-config/README.md` (L23-51) | 디렉토리 정합성 — 트리 SSOT 가 실제 파일 시스템과 일치. 단일 파일 점검 사이클 진입 전 선행 정정 |
| 2026-04-30 | `.private-config/README.md` 단일 파일 정합성 보강 (git commit 예시 → 천기망 표준 prefix `[<TICKET-KEY>]`, Closure Discipline + Synchronous Update 콜아웃, 관련 문서에 prompt 4쌍 위계 1줄 추가, LICENSE 헤더 옵션 A 확장 적용) | `.private-config/README.md` (L3, L113-127, L196-201) | 하네스 감사 결과 Minor 5건 보정 — vibe-coding-flow §6 정렬 + SSOT 역전파 명시 + 협업자 가이드 .md 까지 LICENSE 표기 표준 확장 |
| 2026-04-30 | `vibe-coding-flow.md` (천기망 메타 SSOT) 보강 4건 — LICENSE 헤더, 천기망 메타 SSOT 정체성 헤더, L19 References 직접 링크화, 변경 이력 H2 신설 | `.private-config/shared/prompt/read_only/vibe-coding-flow.md` | 하네스 감사 결과 Minor 4건 보정 — 모든 에이전트 참조 SSOT 의 변경 추적성 확보 |
| 2026-04-30 | `fe_reference_prompt.md` (FE SSOT) 보강 6건 — LICENSE 헤더, SSOT 변경 영향 범위 헤더, 절대경로 3건 → 상대경로 (Major), §11 번호 부여 + Closure Discipline 인용, §12 변경 이력 H2 신설 | `.private-config/shared/prompt/read_only/frontend/fe_reference_prompt.md` | 하네스 감사 결과 Major 1건(이식성 자기모순)·Minor 6건 보정 |
| 2026-04-30 | `fe_develop_prompt.md` 보강 3건 — LICENSE 헤더, 절대경로 3건 → 상대경로 (Major), DoD 에 Synchronous Update + Closure Discipline 항목 2개 추가 | `.private-config/shared/prompt/read_only/frontend/fe_develop_prompt.md` | 하네스 감사 결과 Major 1건(이식성 자기모순)·Minor 3건 보정 |
| 2026-04-30 | `fe_improvement_prompt.md` 보강 3건 — 동일 패턴 (LICENSE / 절대경로 3건 → 상대경로 / DoD 에 Synchronous Update + Closure Discipline 항목 2개 추가) | `.private-config/shared/prompt/read_only/frontend/fe_improvement_prompt.md` | 하네스 감사 결과 Major 1건·Minor 3건 보정 |
| 2026-04-30 | `fe_review_prompt.md` 보강 4건 — LICENSE 헤더, 절대경로 5건 → 상대경로, **임시 위임처 정정 (`agent-frontend.md` → `agent-frontend-reviewer.md`)**, 리뷰 SSOT 결함 명시·Closure Discipline 인용 | `.private-config/shared/prompt/read_only/frontend/fe_review_prompt.md` | 하네스 감사 결과 Major 2건(이식성 + 위임처 stale)·Minor 2건 보정 |
| 2026-04-30 | BE 4개 prompt (`be_reference / be_develop / be_improvement / be_review`) 표면 정합성만 보강 — LICENSE 헤더 + 절대경로 → 상대경로 (각 파일 2~5건). 옵션 B 적용 (BE 도메인 결정 영역은 미접근) | `.private-config/shared/prompt/read_only/backend/be_*.md` | BE 표준이 사용자 직영 영역이라 도메인 결정 사항 (DoD Synchronous Update / Closure Discipline 인용 / 변경 이력 H2 등) 은 BE 표준 결정 사이클로 분리 |
| 2026-04-30 | placeholder README 2개 (`shared/guideline/README.md`, `shared/issue/README.md`) LICENSE 헤더 추가 | `.private-config/shared/{guideline,issue}/README.md` | 옵션 A 확장 일관 적용 — 두 README 는 절대경로 부재로 헤더 외 수정 불필요 |
| 2026-04-30 | placeholder README 2개 (`shared/prompt/custom/README.md`, `shared/prompt/plan/README.md`) LICENSE 헤더 추가 | `.private-config/shared/prompt/{custom,plan}/README.md` | 옵션 A 확장 일관 적용 — 두 README 는 절대경로 부재 + vibe-coding-flow/Closure Discipline 이미 인용 ✓ |
| 2026-04-30 | `docs/issue` symlink 폐기 — issue 영역을 `.private-config/shared/issue/` 단일 위치로 통일 | 메인 `.gitignore` (L49 `/docs/issue` 제거), `docs/readme/private-config.md` (3곳 정정), `docs/issue/` symlink 제거 | 협업자 혼선 방지 — 두 위치 (docs/issue ↔ .private-config/shared/issue) 가 같은 README 보유로 모호. private-config.md 의 `rm symlink/file` 함정 가이드 추가 (symlink target 파일 삭제 위험 경고) |
| 2026-04-30 | `docs/readme/README.md` + `docs/readme/harness/README.md` 신설 — 디렉토리 진입점 일관 회복 | `docs/readme/README.md`, `docs/readme/harness/README.md` (둘 다 신규) | 디렉토리 정합성 — `git/`, `handoff/` 와 동일 패턴 (각 디렉토리에 README.md 진입점). docs/readme/README.md 는 카테고리별 인덱스, harness/README.md 는 3종 문서 진입 순서 안내 |
| 2026-04-30 | `docs/readme/` 단일 파일 점검 사이클 — 16개 .md 모두 LICENSE 헤더 적용 + 잔존 절대경로 정정 (`private-config.md` L264) | `docs/readme/**/*.md` (16개 — architecture, private-config, getting-started, env-var-convention, data, claude-artifact, harness 3종, handoff 2종, git 5종) | 옵션 A 표준 적용 범위를 `docs/readme/` 전체 가이드 .md 까지 확장 — 협업자 가이드 일관성 완성 |
| 2026-04-30 | `agent-harness.md` → **`harness-state.md`** rename — 명명 컨벤션 충돌 해소 | 본 파일 (rename) + 23개 인용 위치 일괄 정정 (메인 `README.md` · `vibe-coding-flow.md` · `handoff/` 2종 · `docs/readme/README.md` · `harness/{README,setup,integration}.md` · 본 파일 자체 변경 이력) | `agent-` prefix 는 천기망에서 *Claude 에이전트 정의* (`.claude/agents/agent-*.md`) 에 일관 사용되는데, 본 문서는 *하네스 분석/변경 이력 SSOT* 로 카테고리가 다름. 협업자가 파일명만 보고 *에이전트 정의* 로 오해할 위험 차단 |
| 2026-04-30 | A 사이클 — 미점검 영역 보강 (메인 `README.md` LICENSE 헤더 / `scripts/init-private.sh` LICENSE 주석) + LICENSE 파일 점검 (실질 결함 없음, `©` vs `(c)` 미세 표기 차이는 별도 사이클로 분리) | `README.md` (L7) · `scripts/init-private.sh` (L4) · `LICENSE` (점검만) | 옵션 A 표준의 적용 범위를 *프로젝트 root 진입점* 까지 확장 — 협업자가 처음 보는 README/스크립트도 일관 표기 |
| 2026-05-01 | `architecture.md` → **`fe-architecture.md`** rename — 명명 일반/특정 정합 | 본 파일 (rename) + 7개 인용 위치 일괄 정정 (메인 `README.md` L58 · `env-var-convention.md` L212 · `docs/readme/README.md` L12 · `handoff/README.md` ×2 · `harness-state.md` ×2 자체 변경 이력) | 본문이 *FE 한정* (FSD/Vite/TanStack/Tailwind) 인데 명칭이 *전체 아키텍처* 같은 인상 → BE 합류 시 명명 충돌 우려. `fe-architecture.md` 로 명명하여 향후 `be-architecture.md` 대칭 확보 |

> 다음 진화 트리거: `agent-fe-tester` 시범 생성 후 인벤토리·정량 측정값 표 갱신.

## 참고

- 메타 워크플로우: `.private-config/shared/prompt/read_only/vibe-coding-flow.md` *(private)*
- FE 단일 기준점: `.private-config/shared/prompt/read_only/frontend/fe_reference_prompt.md` *(private)*
- BE 단일 기준점: `.private-config/shared/prompt/read_only/backend/be_reference_prompt.md` *(private)*
- 에이전트 디렉토리: [`.claude/agents/`](../../../.claude/agents/) (symlink → `.private-config/claude/claude-agents/`)
- 코드 아키텍처: [fe-architecture.md](../fe-architecture.md)
- 프라이빗 설정 관리: [private-config.md](../private-config.md)
- Harness 도입 가이드: [harness-integration.md](./harness-integration.md)
- Harness 설치·적용 가이드: [harness-setup.md](./harness-setup.md)
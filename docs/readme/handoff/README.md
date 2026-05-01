# Claude 세션 Context Handoff — 천기망 4-Tier 적용 가이드

<!-- Proprietary — Copyright © 2026 홍혁준. See LICENSE. -->

천기망(天機網) 프로젝트가 [Claude 세션 간 Context Handoff: 4계층 전략](https://codex.epril.com/claude-session-context-handoff-4-layer-strategy)(codex.epril.com, 2026-04-23) 을 도입하는 운영 매뉴얼.

> Tier 가 올라갈수록 영속성과 구조화 강도가 높아진다. 현 사이클: **Tier 1 + Tier 2 즉시 적용**, **Tier 3 점진 도입**, **Tier 4 부분 운영** (Spec-Driven · Master-Clone 즉시, ADR 은 BE 합류 후).

## 목차

- [목적](#목적)
- [Tier 1 — In-Session Context Management](#tier-1--in-session-context-management)
- [Tier 2 — Short-Term Handoff (Document & Clear)](#tier-2--short-term-handoff-document--clear)
- [Tier 3 — Persistent Context (영구 메모리)](#tier-3--persistent-context-영구-메모리)
- [Tier 4 — Cross-Session Orchestration](#tier-4--cross-session-orchestration)
- [천기망 디렉토리 매핑](#천기망-디렉토리-매핑)
- [작성 규칙 (천기망 채택)](#작성-규칙-천기망-채택)
- [안티 패턴 (피해야 할 것)](#안티-패턴-피해야-할-것)
- [End-of-Session 한 줄 프롬프트](#end-of-session-한-줄-프롬프트)
- [참고](#참고)

---

## 목적

세 가지 문제를 동시에 해결한다.

| 문제 | 천기망에서의 발현 | 본 전략의 해법 |
|------|------------------|---------------|
| Context rot | 1M 컨텍스트라도 60% 근방부터 품질 저하 (커뮤니티 경험치) | Tier 1 능동 개입 |
| Auto-compact 비대칭 | 가장 둔해진 순간에 발동, 다음 턴 필수 정보 누락 | Tier 1 `/compact [focus]` 명시 + Tier 2 우회 |
| Context amnesia | 새 세션은 백지 — "어제 어떤 접근을 폐기했는지" 미전달 | Tier 2/3 영속화 |

목표: 세션을 *일회성 대화* 가 아닌 **지식 자산** 으로 전환.

---

## Tier 1 — In-Session Context Management

현 세션 안에서의 능동 개입.

### 사용 도구

| 도구 | 용도 | 천기망 운영 원칙 |
|------|------|---------------|
| `/rewind` (Esc Esc 두 번) | 실패한 시도 직후 되돌리기 — 학습은 다음 프롬프트에 녹임 | 가장 적극 활용. 실패 흔적이 컨텍스트에 남으면 다음 턴이 같은 함정에 빠짐 |
| `/compact [focus]` | 부분 요약 — focus 인자 **필수** | 무인자 호출 금지. 예: `/compact focus on FE 어댑터 결정 사항, drop 디렉토리 탐색 로그` |
| Subagent (Task/Explore 등) | "main context 를 더럽히고 싶지 않은 탐색" | 읽기 전용 탐색에만. write 작업은 main agent 가 직접 (Tier 4 Master-Clone 정책) |
| `/context` | 컨텍스트 사용률 확인 | 70% 이상이면 Tier 2 핸드오프 작성 후 `/clear` |

### 진행 결정 기준

- **In-session 연속**: 같은 task 계속 진행 → 그대로 이어가기
- **실패 후 재시도**: `/rewind` + 학습 반영 프롬프트
- **무관한 task 발생**: `/clear`
- **컨텍스트 60% 초과 + 같은 task**: Tier 2 로 전환

---

## Tier 2 — Short-Term Handoff (Document & Clear)

같은 프로젝트에서 세션만 새로 시작해야 할 때 신뢰할 만한 패턴. **3단계**.

1. Claude 가 현재 상태를 `.md` 로 dump
2. `/clear` 또는 세션 재기동
3. 새 세션에서 "X.md 를 읽고 이어서 작업해" + **검증 지시**

### 천기망 핸드오프 문서 구조

`docs/readme/handoff/<YYYY-MM-DD>-<topic>.md` 형식. 예: `2026-04-30-harness-install.md`.

필수 섹션:

| 섹션 | 작성 규칙 |
|------|---------|
| **Summary** | 이번 세션 완료 사항 (1–3문장) |
| **Key Decisions** | 결정과 *근거* 함께 |
| **Traps to Avoid** | 실패한 접근, 새 세션이 빠지기 쉬운 함정 |
| **Working Agreements** | 사용자 선호 (예: "명시적 지시는 우회 없이 직접 실행") |
| **Relevant Files** | `path:Lxx-Lyy — 왜 중요한지` 형식. 라인 번호 필수 |
| **Open Work** | **상태 서술형** ("X is not yet implemented"). 명령형 금지 ("Implement X") |
| **Prompt for New Chat** | 새 세션에 그대로 붙여넣을 프롬프트. 끝에 **검증 지시** 필수 — "나열된 파일을 실제로 Read 도구로 읽고 이 문서의 주장을 코드와 대조해 검증해" |

### 핵심 원칙

> **Handoff 는 fact 가 아니라 hypothesis 로 다룬다.** 이전 세션이 혼동 상태에서 작성했을 가능성을 새 세션이 의심해야 한다.

### 천기망 즉시 적용 사례

- [`2026-04-30-harness-install.md`](./2026-04-30-harness-install.md) — 환경 플래그 활성화 → 플러그인 설치 직전 단계의 핸드오프

### 토큰 예산

- 핸드오프 문서 자체: **2,000 토큰 이내**
- 상세 내용은 별도 리포트(향후 `.claude/reports/`)로 분리, 핸드오프는 registry 수준 참조만

---

## Tier 3 — Persistent Context (영구 메모리)

반복되는 컨텍스트의 영속화.

### 천기망 채택 항목

#### 3.1 CLAUDE.md 계층 (이미 운영)

| 위치 | 용도 | 변경 정책 |
|------|------|---------|
| `~/.claude/CLAUDE.md` | 글로벌 사용자 규약 | 사용자 개인 영역 |
| `.claude/CLAUDE.md` (symlink → `.private-config/claude/CLAUDE.md`) | 천기망 에이전트 위임 가이드 | 변하지 않는 규약만 |
| `docs/readme/architecture.md` | FE 아키텍처 SSOT | 표준 결정 시점에 갱신 |
| `.private-config/shared/prompt/read_only/{frontend,backend}/*_reference_prompt.md` | FE/BE 단일 기준점 | 표준 결정 시점에 갱신 |

**Pruning 원칙**: "변하는 것" (현재 작업 상태, 진행 중 결정) 은 CLAUDE.md 에 넣지 않는다 — 매 세션 토큰 낭비. 그런 정보는 Tier 2 핸드오프 또는 `harness-state.md` 변경 이력으로.

#### 3.2 Report Registry 패턴 (점진 도입)

원문 권장 구조를 천기망 패턴에 맞춰:

| 원문 카테고리 | 천기망 매핑 (현 시점) | 비고 |
|--------------|---------------------|------|
| `_registry.md` | (미도입 — 한도 50줄 인덱스) | 핸드오프가 누적되면 신설 |
| `analysis/` | `.private-config/shared/issue/` | 이슈/티켓 메모와 통합 |
| `arch/` | `docs/readme/architecture.md`, `docs/readme/harness/`, `harness-state.md` 변경 이력 | 메인 리포트 |
| `bugs/` | `.private-config/shared/issue/` | issue 와 통합 |
| `commits/` | git log 자체 (별도 디렉토리 X) | `git log --oneline` 으로 |
| `design/` | (미정 — 디자인 시스템 결정 후) | |
| **`handoff/`** | `docs/readme/handoff/` | **본 디렉토리** |
| `impl/` | `.private-config/shared/prompt/plan/<topic>/` | vibe-coding-flow Step 03 산출물 |
| `review/` | (임시 — 리뷰어 에이전트 결과) | `agent-frontend-reviewer.md` 출력물 |
| `tests/` | (BE 표준 결정 후) | |
| `archive/` | 각 디렉토리 하위 `archive/` | 완료 항목 보관 |

**핵심**: main agent 가 5,000줄 전체 리포트가 아닌 50줄 registry 만 읽도록 한다.

#### 3.3 천기망 auto-memory (이미 운영)

`/Users/hongdosan/.claude/projects/-Users-hongdosan-IdeaProjects-martial-arts/memory/` — 사용자 선호·피드백 영속화. 추가 도구 없이 그대로 유지.

---

## Tier 4 — Cross-Session Orchestration

여러 세션·여러 에이전트가 같은 프로젝트에서 공존할 때의 상위 구조.

### 4.1 Spec-Driven Development (이미 부분 운영)

| 천기망 매체 | 역할 |
|------------|------|
| `vibe-coding-flow.md` Step 02 → `prompt/custom/<file>` | 개별 프롬프트 인스턴스 (의도 명시) |
| `vibe-coding-flow.md` Step 03 → `prompt/plan/<topic>/NN-*.md` | 구현 계획서 (PRD 등가) |
| `agent-frontend-reviewer.md §4` | 리뷰 보고 형식 |

### 4.2 ADR (Architecture Decision Record) — 향후 도입

핸드오프 문서의 "Key Decisions" 섹션이 동일 주제로 반복되면 ADR 로 승격.

| 도입 시점 | 위치 후보 |
|----------|---------|
| BE 표준 결정 시 | `.private-config/shared/guideline/adr/NN-<topic>.md` |
| 기타 결정 누적 시 | 동일 |

### 4.3 Git commit + ADR 이중 기록

원문이 지적한 한계 — commit message 는 *왜 그 결정을 내렸는지·어떤 대안을 배제했는지* 미포함. 천기망의 해법:

- Git commit message: `[<TICKET-KEY>] <변경 요약>` (vibe-coding-flow §6 Closure Discipline)
- 결정 근거: ADR 또는 핸드오프 문서로 분리
- 둘을 commit message 에서 참조: `(see docs/readme/handoff/2026-04-30-...md)`

### 4.4 Master-Clone 정책 (천기망 채택)

원문의 두 모델 중 천기망은 **Master-Clone** 채택:

| 모델 | 특징 | 천기망 채택 여부 |
|------|------|---------------|
| **Master-Clone** | main agent 에 모든 컨텍스트, Task/Explore 로 자기 복제본에 위임 | ✓ 채택 |
| Lead-Specialist | custom subagent 다수, main agent 가 조율 | ✗ — 조율 오버헤드 > 작업 |

**예외**: `agent-frontend-reviewer.md` 같이 *책임이 명확한 1인 1역할* 은 specialist 로 두되, 호출은 main agent 가 하는 *준-Master-Clone* 형태로 운영.

> revfactory/harness 도입 후에도 같은 정책. 자동 생성된 에이전트도 Master-Clone 친화적으로 보정.

---

## 천기망 디렉토리 매핑

원문 권장 위치 ↔ 천기망 실제 위치 요약.

| 원문 | 천기망 |
|------|------|
| `.claude/reports/handoff/` | `docs/readme/handoff/` (현재). registry 패턴 본격 도입 시 `.claude/reports/handoff/` 로 이동 검토 |
| `.claude/reports/_registry.md` | (미도입) |
| `.claude/skills/handoff/SKILL.md` | (harness 플러그인 도입 후 검토) |
| 핸드오프 파일 명명 | `<YYYY-MM-DD>-<topic>.md` (예: `2026-04-30-harness-install.md`) |

---

## 작성 규칙 (천기망 채택)

원문의 실전 규칙을 그대로 채택.

1. **명령형 금지** — Open Work 는 상태 서술형. "Implement X" ✗ → "X is not yet implemented" ✓
2. **파일 참조는 라인 번호까지** — `src/auth/TokenService.kt:L45-L72 — refresh 로직, race condition 의심됨`
3. **CLAUDE.md 중복 금지** — Prompt for New Chat 끝에 "Read CLAUDE.md first. Do NOT restate anything already covered there"
4. **실패를 명시적으로 기록** — "Traps to Avoid" 섹션이 핸드오프 가치를 가장 많이 올림
5. **토큰 예산 의식** — 2,000 토큰 이내. 상세는 별도 리포트로 분리

---

## 안티 패턴 (피해야 할 것)

- Auto-compact 맹신 — 가장 안 좋은 순간에 발동
- 파일 전체를 컨텍스트에 dump — 20줄 필요한데 2,000줄 통째로
- Long-running session 집착 — 새 task 는 이전 맥락의 10% 만 필요
- Subagent 과다 — Master-Clone 정책 위반
- 핸드오프 없는 무중단 세션 — `/clear` 사고 시 복구 불가

---

## End-of-Session 한 줄 프롬프트

세션 종료 직전, Tier 2 핸드오프 문서를 자동 작성하기 위한 압축 프롬프트. 원문 아이디어를 바탕으로 천기망 디렉토리·작성 규칙·토큰 예산을 반영해 자체 작성.

```
세션 종료 핸드오프를 docs/readme/handoff/<YYYY-MM-DD>-<topic>.md 에 작성한다.

포함 섹션:
- Summary (완료 사항 1–3문장)
- Key Decisions (결정 + 근거)
- Traps to Avoid (실패한 접근, 함정)
- Working Agreements (사용자 운영 원칙)
- Relevant Files (path:Lxx-Lyy — 라인 번호 필수)
- Open Work (상태 서술형, 명령형 금지)
- Prompt for New Chat (검증 지시 포함)

규칙:
- 2,000 토큰 이내
- Open Work 는 "X is not yet implemented" 식 (명령형 X)
- Prompt for New Chat 끝에 "나열된 파일을 Read 도구로 읽고 본 문서의 주장을 코드와 대조해 검증해" 명시
- CLAUDE.md 에 이미 적힌 내용은 재기술 금지
```

향후 `.claude/skills/handoff/SKILL.md` 로 단축키 등록 검토 (revfactory/harness 도입 후 합류 가능).

---

## 참고

- **원문 (외부)**: <https://codex.epril.com/claude-session-context-handoff-4-layer-strategy> — *Claude 세션 간 Context Handoff: 4계층 전략* (codex.epril.com, 2026-04-23). 본 README 의 4-Tier 명칭·구조·실전 규칙·안티 패턴은 모두 원문에서 차용했으며, 천기망 컨텍스트에 맞춰 매핑·해석한 결과물입니다. 정확한 원문은 위 링크를 참조하세요.
- 천기망 하네스 분석: [`../harness/harness-state.md`](../harness/harness-state.md)
- 천기망 Harness 도입 가이드: [`../harness/harness-integration.md`](../harness/harness-integration.md)
- 메타 워크플로우 (vibe-coding-flow): `.private-config/shared/prompt/read_only/vibe-coding-flow.md` *(private)*
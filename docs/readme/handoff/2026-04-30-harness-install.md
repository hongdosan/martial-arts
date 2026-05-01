# Handoff — 2026-04-30 — Harness Plugin Install

<!-- Proprietary — Copyright © 2026 홍혁준. See LICENSE. -->

> Tier 2 (Document & Clear) 적용. 본 문서는 fact 가 아닌 **hypothesis** 로 다룬다 — 새 세션은 인용된 파일을 직접 Read 도구로 읽고 코드/실제 상태와 대조 검증한 후 작업을 이어간다.

## Summary

천기망 FE 표준 결정·SSOT 작성·FE 리뷰어 에이전트 작성·Harness 도입 가이드 3종 작성 완료. `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 을 새 터미널에 설정했으나 현재 Claude Code 세션에는 미반영 상태. 세션 재기동 후 Marketplace 옵션 (`/plugin marketplace add` + `/plugin install`) 으로 harness 플러그인 설치 직전 단계.

## Key Decisions

- **FE 표준 = TypeScript Strict / React 19 / Vite / TanStack Query / Tailwind CSS / FSD**
  근거: 사용자가 2026-04-28 에 직접 결정. `fe_reference_prompt.md` 가 SSOT.
- **BE 표준 = 보류**
  근거: 사용자가 BE 방향성(skill·기술 스택·아키텍처)을 직접 정의 예정. 현 사이클에서 다루지 않음.
- **Harness 분담 원칙**
  - BE/FE 도메인 = 사용자 직접 정의
  - 그 외(테스터·코디네이터·도메인 분석) = `revfactory/harness` 자동 생성
  근거: `harness-integration.md §2` 매트릭스.
- **세션 핸드오프 = 4-Tier 전략 (codex.epril.com 원문) 도입**
  - Tier 1+2 즉시 적용, Tier 3 점진, Tier 4 BE 합류 후
  - 핸드오프 위치 = `docs/readme/handoff/<YYYY-MM-DD>-<topic>.md`
- **Master-Clone 정책 채택**
  근거: subagent 과다 시 main agent 컨텍스트 빼앗김. 단 `agent-frontend-reviewer.md` 같은 1인 1역할 specialist 는 예외.
- **외부 글의 verbatim 복사본을 repo 에 두지 않음 (저작권)**
  README/문서에서는 항상 원본 URL 만 참조. 저장소에 verbatim 사본 X.

## Traps to Avoid

- `init-private.sh` 의 `link()` 함수가 *파일 symlink* (예: `.claude/CLAUDE.md`) 에 false-negative WARN 출력. **신규 환경엔 영향 없음** — 첫 실행 시 정상 생성. 기존 환경 재실행 시 WARN 메시지에 휘둘려 `rm` 하면 일시적으로 깨질 수 있음.
- `.claude/agents/` 는 `.private-config/claude/claude-agents/` 로의 **symlink**. harness 가 `.claude/agents/` 에 쓰면 자동으로 서브모듈에 들어감 ✓. 하지만 `.claude/skills/` 는 아직 symlink 화 안 됨 — harness 설치 후 첫 작업으로 `.private-config/claude/claude-skills/` 신설 + symlink 처리 필요.
- `revfactory/harness` 자동 생성 시 frontmatter `name` 이 천기망 패턴 (`martial-arts-{scope}-{role}`) 을 따르지 않을 가능성 — 트리거 프롬프트에 명명 규약 명시 필수 (`harness-setup.md §4.1` 예시 참조).
- `agent-frontend-reviewer.md` 가 `.private-config` 서브모듈에서 `AM` 상태 — 9건 수정 반영본이 staged 안 됨. 커밋 전 `git add` 재실행 필요.
- `harness-integration.md §4.1` 표의 "(미정 — Phase 1 도입 시 결정)" 항목 — `.claude/skills/` 위치는 위 처리 후 정정해야 표가 정확해짐.
- `.gitignore` 에 `.claude/skills/` 미추가 — symlink 화하기 전에 plugin 이 main repo 에 추적 노이즈 만들 수 있음.

## Working Agreements

- 명시적 지시는 **우회 없이 직접 실행** — 대안 제시·허가 확인 없이.
- 외부 글은 **원본 URL 로만 참조** (verbatim 사본 repo 저장 금지 — 저작권).
- **2단계 커밋** — 서브모듈(`.private-config`) 먼저 커밋·푸시, 메인 저장소가 포인터 갱신.
- **제안 → 확인 → 수정 의 순차 진행** (일괄 수정 금지).
- **Closure Discipline** — 커밋 메시지 SSOT 는 plan 의 "제안 커밋 메시지 초안" (`vibe-coding-flow.md §6`).
- **Synchronous Update** — 변경 시 SSOT 역전파 (`vibe-coding-flow.md §3 핵심 원칙`).
- 변경 이력은 `harness-state.md` 의 표에 누적.

## Relevant Files

- [`docs/readme/harness/harness-state.md`](../harness/harness-state.md) — 천기망 하네스 현 상태 + 변경 이력. **재기동 후 첫 정독 권장**.
- [`docs/readme/harness/harness-integration.md`](../harness/harness-integration.md) — 도입 가이드. §2 분담 원칙, §4.1 미정 표.
- [`docs/readme/harness/harness-setup.md`](../harness/harness-setup.md) — 설치~첫 적용 절차. **§2 가 다음 액션**.
  - `§1` 사전 요구사항 (환경 플래그 포함)
  - `§2.1` 디렉토리 정합 (`.claude/skills/` symlink 처리)
  - `§4.1` agent-tester 트리거 프롬프트 예시
  - `§5` 결과 검증 7항목
- [`docs/readme/handoff/README.md`](./README.md) — 4-Tier 전략 천기망 적용 가이드.
- [`scripts/init-private.sh`](../../../scripts/init-private.sh):106-109 — symlink link 라인 (방금 수정). harness 설치 후 `.claude/skills` 라인 추가 필요.
- [`.private-config/README.md`](../../../.private-config/README.md) — 디렉토리 트리·매핑 표 동기화 완료본.
- `.private-config/claude/claude-agents/agent-frontend-reviewer.md` — 9건 수정 반영본, **`AM` 상태**.

## Open Work (상태 서술형)

- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 는 새 세션에서 활성 확인됨 (해소 ✓).
- Marketplace 플러그인 설치 완료 — 마켓플레이스 등록명 `harness-marketplace`, install 명령 `/plugin install harness@harness-marketplace` (해소 ✓).
- `.claude/skills/` symlink 정합화는 *산출물 발생 시점* 에 발동 — plugin 자체는 글로벌 위치에서 로드되어 root 영향 없음. agent-tester 생성 시 `.claude/skills/` 가 처음 만들어지면 `harness-setup.md §2.1` 절차 적용.
- agent-tester 시범 생성 (`harness-setup.md §4`) 미실행.
- 양 저장소 git status 미커밋 (사용자가 직접 커밋 의도). 미커밋 변경 = README/architecture/harness 3종/init-private.sh/`.private-config` README + agent-frontend-reviewer.md `AM` + 본 정정.
- `harness-integration.md §4.1` 의 "(미정)" 항목 정정 미반영 — `.claude/skills/` symlink 처리 결정 후 갱신.

## Prompt for New Chat

```
천기망 하네스 도입 작업을 이어서 진행한다.

현재 위치: docs/readme/harness/harness-setup.md §Step 2 (플러그인 설치) 직전.
컨텍스트는 본 핸드오프 문서가 SSOT.

다음 파일을 실제로 Read 도구로 읽고 본 핸드오프 문서의 주장을
코드와 대조해 검증한 후, 내 다음 지시를 기다려:

1. docs/readme/handoff/2026-04-30-harness-install.md (본 핸드오프)
2. docs/readme/handoff/README.md (4-Tier 전략 운영 가이드)
3. docs/readme/harness/harness-state.md (천기망 하네스 분석 + 변경 이력)
4. docs/readme/harness/harness-setup.md (설치 절차 §1 ~ §5)
5. scripts/init-private.sh (symlink 자동화 — line 106-109 최근 수정)

CLAUDE.md 에 이미 적힌 내용은 다시 설명하지 마.
환경변수 CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 활성 여부를
Bash 로 확인 후, 활성이면 harness-setup.md §2 (Marketplace 옵션 A) 절차를 안내해.
미활성이면 활성화 절차를 다시 안내해.
```
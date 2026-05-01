# Harness 플러그인 설치 → 적용 가이드

<!-- Proprietary — Copyright © 2026 홍혁준. See LICENSE. -->

[`revfactory/harness`](https://github.com/revfactory/harness) 플러그인을 천기망(天機網) 프로젝트에 설치하고 첫 에이전트를 생성하기까지의 실무 절차. 상위 도입 계획·분담 원칙은 [harness-integration.md](./harness-integration.md) 를 우선 참조.

## 목차

- [1. 사전 요구사항](#1-사전-요구사항)
- [2. 설치](#2-설치)
- [3. 설치 검증](#3-설치-검증)
- [4. 첫 적용 — agent-tester 시범 생성](#4-첫-적용--agent-tester-시범-생성)
- [5. 결과 검증 (정합성 체크)](#5-결과-검증-정합성-체크)
- [6. 후속 작업](#6-후속-작업)
- [7. 롤백 / 제거](#7-롤백--제거)
- [8. 트러블슈팅](#8-트러블슈팅)
- [9. 참고](#9-참고)

---

## 1. 사전 요구사항

| 항목 | 요건 | 확인 방법 |
|------|------|----------|
| Claude Code | 플러그인·실험 플래그 지원 버전 | `claude --version` |
| Agent Teams 실험 플래그 | `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` | 셸 환경변수 또는 `.env` |
| 분담 원칙 합의 | [harness-integration.md §2](./harness-integration.md#2-천기망의-분담-원칙) 매트릭스 확정 | 문서 git 추적 |
| 천기망 LICENSE 검토 | Apache 2.0 (harness) ↔ Proprietary (천기망) 충돌 없음 — 생성 산출물은 천기망 LICENSE 적용 | LICENSE 파일 |
| `.private-config/` 서브모듈 권한 | 쓰기 권한 보유 | `git -C .private-config status` |

### 1.1 환경 플래그 활성화

```bash
# 단발성 (현 셸에서만)
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1

# 영구 적용 (zsh 예시)
echo 'export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1' >> ~/.zshrc
source ~/.zshrc
```

> 미활성화 시 harness 가 *팀 모드* 산출물을 생성하지 못하거나 일부 절차가 동작하지 않음.

---

## 2. 설치

두 가지 옵션. **천기망은 옵션 A(Marketplace) 권장** — 업데이트·제거가 표준화됨.

### 옵션 A — Marketplace (권장)

```
/plugin marketplace add revfactory/harness
/plugin install harness@harness-marketplace
```

> 위 명령은 Claude Code CLI 내부 슬래시 커맨드. 셸이 아닌 Claude Code 세션에서 실행.
>
> **마켓플레이스 이름 주의** — `/plugin marketplace add revfactory/harness` 는 등록명을 `harness-marketplace` 로 부여한다 (`/plugin marketplace list` 로 확인). 따라서 install 시 `harness@harness-marketplace` 가 정확.

### 옵션 B — Direct (Global Skill)

```bash
# harness 저장소 클론 후
cp -r skills/harness ~/.claude/skills/harness
```

> 글로벌 스킬로 모든 프로젝트에서 공통 사용. 천기망에 한정하려면 옵션 A 권장.

### 2.1 천기망 디렉토리 정합 (산출물 기준)

> **2026-04-30 검증 결과**: Marketplace 옵션 A 로 설치된 plugin 자체는 **글로벌 위치**(`~/.claude/plugins/marketplaces/harness-marketplace/skills/harness/SKILL.md`)에서 로드된다. plugin 설치만으로 천기망 root 의 `.claude/skills/` 가 자동 생성되지 **않는다**. 따라서 §2.1 처리는 *plugin 설치 직후* 가 아니라 *harness 가 산출물(에이전트·스킬 정의)을 root 에 처음 쓸 때* 발동한다.

천기망은 `.claude/` 일부가 `.private-config/claude/` 로 symlink 되어 있다. 산출물이 root 에 떨어질 때 다음 매트릭스에 따라 처리:

| 디렉토리 | 현재 | 산출물 발생 시 처리 |
|---------|------|------------------|
| `.claude/agents/` | symlink → `.private-config/claude/claude-agents/` | 그대로 (생성물이 자동으로 서브모듈에 들어감 ✓) |
| `.claude/skills/` | **부재** | 산출물 발생 시 → **즉시 symlink 화** 후 진행 |
| `.claude/CLAUDE.md` | symlink → `.private-config/claude/CLAUDE.md` | 그대로 |

`.claude/skills/` 가 산출물로 처음 만들어진 경우 즉시 symlink 처리:

```bash
# harness 가 .claude/skills/<skill-name>/ 를 만들었다면 먼저 이동
mkdir -p .private-config/claude/claude-skills
mv .claude/skills/<skill-name> .private-config/claude/claude-skills/

# 기존 .claude/skills/ 비우고 symlink 생성
rmdir .claude/skills 2>/dev/null
ln -s ../.private-config/claude/claude-skills .claude/skills

# init-private.sh 에 link 라인 추가 (멱등 보장)
#   link ".private-config/claude/claude-skills" ".claude/skills"

# 검증
ls -la .claude/skills    # → symlink 표시 (lrwxr-xr-x)
ls .claude/skills/       # → <skill-name>/ 보임
```

> symlink 화하지 않고 `.claude/skills/` 를 그대로 두면 본 저장소가 산출물을 추적하게 된다 — `.gitignore` 처리하거나 위 symlink 적용 둘 중 택일.

---

## 3. 설치 검증

### 3.1 플러그인 로드 확인

```
/plugin list
```

`harness` 항목이 노출되는지 확인.

### 3.2 환경 플래그 확인

```bash
echo "$CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS"   # 1 출력되어야 정상
```

### 3.3 SKILL.md 위치 확인

```bash
find . ~/.claude -name "SKILL.md" -path "*harness*" 2>/dev/null
```

옵션 A 설치 시 → 플러그인 캐시 위치, 옵션 B 설치 시 → `~/.claude/skills/harness/SKILL.md`.

---

## 4. 첫 적용 — agent-tester 시범 생성

천기망의 첫 하네스 도입 대상은 **`agent-tester`** (FE 영역 한정). [harness-integration.md §2.1](./harness-integration.md#21-하네스-대상-현-시점-매트릭스) 매트릭스에 따른 결정.

### 4.1 트리거 프롬프트 (예시)

Claude Code 세션에서 다음 자연어 프롬프트를 입력:

```
하네스 구성해줘.

도메인: BDD 스타일 E2E 테스트 작성·검증 에이전트.
범위: FE 영역 한정 (BE 미결정 단계라 BE 검토 항목 제외).
표준: 천기망 FE 단일 기준점(.private-config/shared/prompt/read_only/frontend/fe_reference_prompt.md) 준수.
기술 후보: Vitest 또는 Playwright (선택 가이드 포함).
이름 규약: 파일 agent-fe-tester.md, frontmatter name: martial-arts-fe-tester.
산출물 위치: .claude/agents/ (실제는 .private-config/claude/claude-agents/ symlink).
```

### 4.2 harness 자동 실행 단계 (Phase 0–6)

harness 가 다음 phase 를 자동으로 진행 (대화형):
- Phase 0 현황 감사 → 신규 모드
- Phase 1 도메인 분석
- Phase 2 팀 아키텍처 설계 (예상: 단일 에이전트 또는 생성-검증 패턴)
- Phase 3 에이전트 정의 → `.claude/agents/agent-fe-tester.md`
- Phase 4 스킬 생성 → `.claude/skills/fe-bdd-test/SKILL.md` (예상 명칭)
- Phase 5 통합·오케스트레이션 → `.claude/CLAUDE.md` 트리거 추가
- Phase 6 검증 (구조/모드/실행/트리거/드라이런/시나리오)

### 4.3 산출물 확인

```bash
ls -la .claude/agents/agent-fe-tester.md
ls -la .claude/skills/
cat .claude/CLAUDE.md   # 하네스 트리거 항목 추가 여부
```

---

## 5. 결과 검증 (정합성 체크)

[harness-integration.md §3 Phase 3 체크리스트](./harness-integration.md#phase-3--산출물-검토-정합성-확인) 7항목 통과 여부 확인.

| # | 항목 | 통과 조건 |
|---|------|----------|
| 1 | frontmatter `name` | `martial-arts-fe-tester` |
| 2 | FE SSOT 인용 | `fe_reference_prompt.md` 명시 |
| 3 | BE 영역 침범 없음 | BE 검토 항목 미포함 |
| 4 | Closure Discipline 호환 | 커밋 메시지 초안 형식 |
| 5 | Synchronous Update 인지 | 변경 시 SSOT 역전파 |
| 6 | symlink 인지 | 실제 파일 위치는 `.private-config/...` |
| 7 | 천기망 LICENSE 표기 | frontmatter 다음 줄에 `<!-- Proprietary — Copyright © 2026 홍혁준. See LICENSE. -->` 1줄 (2026-04-30 확정. `harness-integration.md §3` Phase 3 동일 표준) |

검증 실패 항목은 수동 보정 후 [harness-state.md](./harness-state.md) 변경 이력에 사유 기록.

### 5.1 추가 — vibe-coding-flow 호환성

생성된 에이전트가 [vibe-coding-flow](../../../.private-config/shared/prompt/read_only/vibe-coding-flow.md) 의 plan 산출물을 입력으로 받을 수 있는지 확인. ([harness-integration.md Phase 4](./harness-integration.md#phase-4--vibe-coding-flow-와-통합) 의 phase 매핑 표 참조)

---

## 6. 후속 작업

### 6.1 변경 이력 기록

신규 에이전트 도입 사실을 [harness-state.md](./harness-state.md) 의 "변경 이력" 섹션에 추가:

```markdown
| 2026-MM-DD | agent-fe-tester 신규 (harness 시범 생성) | .claude/agents/agent-fe-tester.md | 첫 harness 적용 |
```

### 6.2 인벤토리 표 갱신

`harness-state.md` §정량 측정값 → 에이전트 인벤토리 표에서 `agent-tester.md` 행을 "미작성" → "완성 (harness 생성)" 으로 갱신.

### 6.3 다음 도입 후보

- `agent-reviewer.md` (코디네이터) — BE 합류 후
- 도메인 분석 / 리서치 / 스파이크 에이전트 — 필요 시점에 발의

---

## 7. 롤백 / 제거

harness README 에 공식 제거 절차 미명시. 실무적 제거 절차:

### 7.1 옵션 A (Marketplace) 설치 시

```
/plugin uninstall harness@harness
/plugin marketplace remove revfactory/harness
```

### 7.2 옵션 B (Direct) 설치 시

```bash
rm -rf ~/.claude/skills/harness
```

### 7.3 생성된 산출물 처리 결정 트리

- 산출물 보존 → 그대로 두고 사람이 유지 보수
- 산출물 폐기 → 해당 에이전트/스킬 파일 삭제
   ```bash
   git -C .private-config rm claude/claude-agents/agent-fe-tester.md
   git -C .private-config rm -r claude/claude-skills/fe-bdd-test/
   ```
- 변경 이력에 *제거 사유* 기록 (Synchronous Update 원칙)

---

## 8. 트러블슈팅

### 8.1 `.claude/skills/` 가 git 본 저장소에 추적되어 노이즈 발생
**원인**: §2.1 의 symlink 단계 미수행.
**해결**: §2.1 절차로 `.private-config/claude/claude-skills/` 로 이동 + symlink 생성.

### 8.2 harness 가 `_workspace/` 를 천기망 root 에 만듦
**원인**: harness 기본 동작.
**해결**: 두 옵션
- (a) `_workspace/` 를 `.gitignore` 에 추가 (중간 산출물 보존하되 추적 안 함)
- (b) `_workspace/` 를 `.private-config/shared/prompt/_workspace/` 로 이동 + symlink

### 8.3 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` 미적용 시 증상
**증상**: harness 가 단일 에이전트만 생성, 팀 모드 불가.
**해결**: 셸 재시작 또는 `source ~/.zshrc` 후 Claude Code 재기동.

### 8.4 생성된 에이전트의 `name` 이 천기망 패턴 미준수
**원인**: harness 가 도메인에 맞춰 즉흥 명명.
**해결**: 트리거 프롬프트에서 명명 규약 명시 (§4.1 참조). 사후 보정도 가능.

### 8.5 BE 영역 검토 항목이 FE 에이전트에 섞여 들어감
**원인**: harness 가 FE/BE 경계를 과대 해석.
**해결**: §5 정합성 체크 #3 항목으로 검출 → 수동 제거 + 변경 이력 기록.

### 8.6 `.claude/CLAUDE.md` 변경 충돌
**원인**: harness 가 자동 추가하는 트리거 항목이 기존 항목과 위치 충돌.
**해결**: harness 산출물을 별도 섹션 (`## 하네스: {도메인}`) 으로 격리.

---

## 9. 참고

- harness 저장소: https://github.com/revfactory/harness
- harness SKILL.md: https://github.com/revfactory/harness/blob/main/skills/harness/SKILL.md
- 천기망 도입 가이드 (상위): [harness-integration.md](./harness-integration.md)
- 천기망 하네스 현 상태: [harness-state.md](./harness-state.md)
- 메타 워크플로우: `.private-config/shared/prompt/read_only/vibe-coding-flow.md` *(private)*
- FE 단일 기준점: `.private-config/shared/prompt/read_only/frontend/fe_reference_prompt.md` *(private)*
- 프라이빗 설정 관리: [private-config.md](../private-config.md)

# 천기망 문서 (docs/readme)

<!-- Proprietary — Copyright © 2026 홍혁준. See LICENSE. -->

천기망(天機網) 프로젝트의 주제별 상세 문서 모음입니다. 메인 [`README.md`](../../README.md) 의 *문서 인덱스* 가 1차 진입점이며, 본 디렉토리는 그 산출물을 카테고리별로 보관합니다.

## 카테고리

| 카테고리 | 문서 |
|---|---|
| 시작하기 | [`getting-started.md`](./getting-started.md) · [`private-config.md`](./private-config.md) · [`env-var-convention.md`](./env-var-convention.md) |
| 설계 | [`architecture.md`](./architecture.md) · [`data.md`](./data.md) · [`claude-artifact.md`](./claude-artifact.md) |
| 하네스 | [`harness/`](./harness/) — 3종 (현 상태 분석 · 도입 가이드 · 설치·적용) |
| 세션 핸드오프 | [`handoff/`](./handoff/) — 4-Tier 전략 가이드 + 사이클별 핸드오프 메모 |
| Git 컨벤션 | [`git/`](./git/) — 4종 (브랜치 전략 · 이슈 · 브랜치 네이밍 · 커밋) |

## 작성 원칙

- 모든 .md 는 LICENSE 헤더 (`<!-- Proprietary — Copyright © 2026 홍혁준. See LICENSE. -->`) 를 H1 다음에 박는다 — `harness-state.md` 변경 이력의 *옵션 A 표준*.
- 디렉토리 진입점은 `README.md` 로 통일 (본 파일 / `harness/` / `handoff/` / `git/`).
- 외부 인용은 **절대경로 금지** — 상대경로 사용 (이식성).
- 메타 워크플로우와의 정합성: 본 디렉토리의 모든 변경은 [`vibe-coding-flow.md`](../../.private-config/shared/prompt/read_only/vibe-coding-flow.md) §3.3 Synchronous Update / §3.4 Closure Discipline 을 따른다.

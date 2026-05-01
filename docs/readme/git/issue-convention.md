# 이슈 컨벤션

<!-- Proprietary — Copyright © 2026 홍혁준. See LICENSE. -->

모든 이슈는 일관된 형식을 따릅니다. 회고록 및 기술 블로그 원천 자료로 재활용할 수 있도록 제목 prefix 와 본문 섹션을 표준화합니다.

> 이슈 prefix 는 [브랜치 네이밍](./branch-naming.md) 및 [커밋 메시지 prefix](./commit-convention.md) 와 **반드시 일치**시킵니다.

## 목차

- [제목 prefix](#제목-prefix)
- [본문 표준 섹션](#본문-표준-섹션)
- [템플릿](#템플릿)
- [작성 예시](#작성-예시)

## 제목 prefix

| Prefix | 용도 | 예시 |
|---|---|---|
| `feat:` | 신규 기능 추가 | `feat: 천기 시스템 기본 구조 설계` |
| `fix:` | 버그 수정 | `fix: 캐릭터 능력치 계산 오류` |
| `refactor:` | 리팩토링 | `refactor: 무공 도메인 분리` |
| `chore:` | 환경/도구/설정 | `chore: Serena MCP 연동` |
| `docs:` | 문서 작성 | `docs: 세계관 설정 정리` |
| `design:` | 설계/기획 | `design: 강호 진영 구도 정의` |

## 본문 표준 섹션

- **배경** — 왜 이 작업이 필요한가
- **목적** — 이 이슈가 끝났을 때 달성되어 있어야 하는 상태
- **작업 내용** — 체크리스트 형태의 세부 작업
- **검증 기준** — 완료 여부를 객관적으로 판단할 조건
- **참고** — 관련 링크, 자료, 선행 이슈, 관련 PR

## 템플릿

GitHub 웹에서 "New Issue" 클릭 시 용도별 템플릿이 자동 노출됩니다.

| 템플릿 | 파일 | 자동 라벨 |
|---|---|---|
| Feature | [.github/ISSUE_TEMPLATE/feature.md](../../../.github/ISSUE_TEMPLATE/feature.md) | `feature` |
| Bug | [.github/ISSUE_TEMPLATE/bug.md](../../../.github/ISSUE_TEMPLATE/bug.md) | `bug` |
| Chore | [.github/ISSUE_TEMPLATE/chore.md](../../../.github/ISSUE_TEMPLATE/chore.md) | `chore` |
| Docs | [.github/ISSUE_TEMPLATE/docs.md](../../../.github/ISSUE_TEMPLATE/docs.md) | `documentation` |
| Design | [.github/ISSUE_TEMPLATE/design.md](../../../.github/ISSUE_TEMPLATE/design.md) | `design` |
| Refactor | [.github/ISSUE_TEMPLATE/refactor.md](../../../.github/ISSUE_TEMPLATE/refactor.md) | `refactor` |

참고: [Conventional Commits](https://www.conventionalcommits.org/), [GitHub Issue Templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository)

## 작성 예시

본 컨벤션이 정립된 원본 이슈 플랜: [chore: 이슈 템플릿 정형화](../../../.private-config/shared/issue/issue-template-standardization.md) *(로컬 전용 — git ignore 대상)*

- `chore:` prefix 사용 예시 (환경/도구/설정 분류)
- 배경 → 목적 → 작업 내용 체크리스트 → 검증 기준 → 참고 5단 구조의 실제 적용
- 작업 명령어 섹션 포함 (chore 템플릿 고유 섹션)

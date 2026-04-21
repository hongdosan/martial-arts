# Git 컨벤션

이슈 → 브랜치 → 커밋 3단계의 prefix 를 동일하게 유지하여 작업 단위를 추적 가능하게 만드는 것이 핵심입니다. 회고 / 블로그 원천 자료로 재활용하기 위한 최소 규약입니다.

## 구성

| 문서 | 내용 |
|---|---|
| [브랜치 전략](./branch-strategy.md) | 브랜치 구성 · 이슈 중심 워크플로우 · 릴리스 · 태그 (SemVer) |
| [이슈 컨벤션](./issue-convention.md) | 이슈 제목 prefix · 본문 표준 섹션 · GitHub Issue Template |
| [브랜치 네이밍](./branch-naming.md) | feature 브랜치 형식 · 작성 명령어 · 정리 |
| [커밋 컨벤션](./commit-convention.md) | 커밋 메시지 형식 · `.gitmessage` 템플릿 · 적용 방법 |

## 3종 prefix 일치 체계

| 단계 | 형식 | 예시 |
|---|---|---|
| 이슈 | `<type>: <제목>` | `feat: 천기 시스템 기본 구조 설계` (#12) |
| 브랜치 | `<type>/#<issue>-<slug>` | `feat/#12-cheongi-base-structure` |
| 커밋 | `<type>: <제목>` | `feat: 천기 시스템 엔티티 뼈대` |

`<type>` 은 `feat` / `fix` / `refactor` / `chore` / `docs` / `design` 중 하나이며, 세 단계에서 **반드시 동일**해야 합니다.

## 권장 초기 설정

```bash
# 커밋 템플릿 등록 (1회)
git config commit.template .gitmessage
```

이슈 템플릿은 GitHub 웹에서 "New Issue" 클릭 시 자동 노출됩니다.

# 커밋 컨벤션

커밋 메시지 prefix 는 [이슈 prefix](./issue-convention.md#제목-prefix) 및 [브랜치 `<type>`](./branch-naming.md#형식) 과 **완전히 일치**시킵니다. 3종이 어긋나면 작업 추적이 끊깁니다.

## 목차

- [형식](#형식)
- [예시](#예시)
  - [단일 행 (제목만)](#단일-행-제목만)
  - [본문 포함](#본문-포함)
  - [PR 머지 커밋 (본문에 Closes)](#pr-머지-커밋-본문에-closes)
- [템플릿 적용](#템플릿-적용)
  - [저장소 단위 (권장)](#저장소-단위-권장)
  - [사용자 전역 (선택)](#사용자-전역-선택)
- [관련 문서](#관련-문서)

## 형식

```
<type>: <제목>

<본문 — 선택>

<꼬리말 — 이슈 참조>
```

| 요소 | 규칙 |
|---|---|
| `<type>` | `feat` / `fix` / `refactor` / `chore` / `docs` / `design` |
| `<제목>` | 50자 이내, 명령형 현재시제, 마침표 없이 |
| `<본문>` | 72자 단위 줄바꿈. 무엇을 · 왜 — *어떻게* 는 코드로 충분 |
| `<꼬리말>` | `Refs #<issue>` (참조) 또는 `Closes #<issue>` (PR 머지 시 이슈 자동 종료) |

## 예시

### 단일 행 (제목만)

```
feat: 천기 시스템 엔티티 뼈대
```

### 본문 포함

```
refactor: 무공 도메인 분리

art 슬라이스를 심법·병기법·권각법 등 세부 계열로 분할.
세력 필터가 계열 필터와 독립적으로 동작해야 하므로
엔티티 내 하위 모델로 분리하는 편이 조회 경로가 단순해진다.

Refs #31
```

### PR 머지 커밋 (본문에 Closes)

PR 본문에 `Closes #<issue>` 를 포함하면 머지 커밋에서 이슈가 자동 종료됩니다.

```
Merge pull request #42 from hongdosan/feat/#12-cheongi-base-structure

feat: 천기 시스템 기본 구조 설계

Closes #12
```

## 템플릿 적용

저장소 루트의 [`.gitmessage`](../../../.gitmessage) 를 커밋 템플릿으로 등록하면, `git commit` 실행 시 에디터에 가이드 주석이 자동 노출됩니다.

### 저장소 단위 (권장)

```bash
git config commit.template .gitmessage
```

`.git/config` 에만 반영되므로 이 저장소에서만 동작합니다.

### 사용자 전역 (선택)

```bash
git config --global commit.template ~/.gitmessage
cp .gitmessage ~/.gitmessage
```

## 관련 문서

- [이슈 컨벤션](./issue-convention.md) — 이슈 prefix 정의 (커밋 prefix 와 동일)
- [브랜치 네이밍](./branch-naming.md) — 브랜치 `<type>` (커밋 prefix 와 동일)
- [브랜치 전략](./branch-strategy.md) — 이슈 중심 워크플로우 전체

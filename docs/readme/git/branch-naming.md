# 브랜치 네이밍

모든 작업 브랜치는 **이슈 단위로 생성**하며, 이슈 prefix 와 번호가 브랜치 이름에 드러나야 합니다. 브랜치만 보고도 어떤 이슈의 어떤 작업인지 즉시 식별 가능해야 합니다.

> 브랜치 `<type>` 은 [이슈 prefix](./issue-convention.md#제목-prefix) 와 동일해야 하며, [브랜치 전략](./branch-strategy.md) 의 `develop` 에서 분기합니다.

## 목차

- [형식](#형식)
- [예시](#예시)
- [규칙](#규칙)
- [브랜치 작성 방법](#브랜치-작성-방법)
  - [1. 이슈 번호 확인](#1-이슈-번호-확인)
  - [2. develop 최신화](#2-develop-최신화)
  - [3. feature 브랜치 생성 및 전환](#3-feature-브랜치-생성-및-전환)
  - [4. 최초 커밋 후 원격 push (upstream 설정)](#4-최초-커밋-후-원격-push-upstream-설정)
  - [5. PR 생성](#5-pr-생성)
  - [전체 흐름 요약](#전체-흐름-요약)
- [PR 머지 후 브랜치 정리](#pr-머지-후-브랜치-정리)

## 형식

```
<type>/#<issue>-<slug>
```

| 요소 | 규칙 | 예시 |
|---|---|---|
| `<type>` | 이슈 prefix 와 동일 (feat / fix / refactor / chore / docs / design) | `feat` |
| `<issue>` | 원본 이슈 번호 | `42` |
| `<slug>` | 작업 요약 — 소문자 kebab-case, 2~4단어 권장 | `level-filter-ui` |

## 예시

| 이슈 제목 | 브랜치 이름 |
|---|---|
| `feat: 천기 시스템 기본 구조 설계` (#12) | `feat/#12-cheongi-base-structure` |
| `fix: 캐릭터 능력치 계산 오류` (#27) | `fix/#27-stat-calculation` |
| `refactor: 무공 도메인 분리` (#31) | `refactor/#31-art-domain-split` |
| `chore: 이슈 템플릿 정형화` (#5) | `chore/#5-issue-template` |
| `docs: 세계관 설정 정리` (#8) | `docs/#8-worldview-notes` |
| `design: 강호 진영 구도 정의` (#14) | `design/#14-faction-structure` |

## 규칙

- 브랜치는 **`develop` 에서 분기**하고 작업 완료 후 `develop` 으로 PR 을 연다
- 하나의 브랜치는 **하나의 이슈**만 다룬다. 여러 이슈가 얽히면 이슈 자체를 분할하거나 병합한다
- 커밋 메시지 prefix 는 브랜치 `<type>` 과 일치시킨다 — 예: `feat/#12-…` 브랜치는 `feat:` 으로 커밋 ([커밋 컨벤션](./commit-convention.md))
- 이슈 번호가 없는 실험성 작업은 `wip/<slug>` 로 열되, 정식화 전에 반드시 이슈를 먼저 만든다
- PR 본문에 `Closes #<issue>` 를 포함해 머지 시 이슈 자동 종료

## 브랜치 작성 방법

### 1. 이슈 번호 확인

GitHub 이슈를 먼저 생성하고 번호를 기록한다. 이슈가 없는 작업은 브랜치도 열지 않는다.

### 2. develop 최신화

```bash
git checkout develop
git pull origin develop
```

### 3. feature 브랜치 생성 및 전환

```bash
# 형식: <type>/#<issue>-<slug>
git checkout -b feat/#12-cheongi-base-structure
```

### 4. 최초 커밋 후 원격 push (upstream 설정)

```bash
git add <변경 파일>
git commit -m "feat: 천기 시스템 엔티티 뼈대"

# 최초 1회 -u 로 upstream 연결
git push -u origin feat/#12-cheongi-base-structure
```

### 5. PR 생성

```bash
gh pr create \
  --base develop \
  --title "feat: 천기 시스템 기본 구조 설계" \
  --body "Closes #12"
```

또는 GitHub 웹에서 동일하게 작성. 본문에 `Closes #<issue>` 를 반드시 포함한다.

### 전체 흐름 요약

```
이슈 #12 생성
  ↓
git checkout develop && git pull
  ↓
git checkout -b feat/#12-cheongi-base-structure
  ↓
작업 · 커밋 (prefix: feat:)
  ↓
git push -u origin feat/#12-cheongi-base-structure
  ↓
PR → develop  (body: Closes #12)
  ↓
머지 후 브랜치 정리
```

## PR 머지 후 브랜치 정리

```bash
git checkout develop
git pull
git branch -d <merged-branch>
git push origin --delete <merged-branch>
```

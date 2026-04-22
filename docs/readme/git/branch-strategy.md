# 브랜치 전략

이슈 단위로 feature 브랜치를 생성하고, 3단 브랜치(`develop` → `release` → `master`)를 거쳐 배포합니다. 이슈 · 브랜치 · 커밋 prefix 는 모두 일치해야 합니다.

## 목차

- [브랜치 구성](#브랜치-구성)
- [이슈 중심 작업 플로우](#이슈-중심-작업-플로우)
- [릴리스 플로우](#릴리스-플로우)
- [태그 규칙 (SemVer)](#태그-규칙-semver)
- [관련 문서](#관련-문서)

## 브랜치 구성

| 브랜치 | 역할 | 배포 |
|--------|------|------|
| `feature/<type>/#<issue>-<slug>` | 이슈 단위 작업 브랜치 — [브랜치 네이밍](./branch-naming.md) 규약 적용 | — |
| `develop` | 통합 브랜치 — 모든 feature 브랜치의 PR target | — |
| `release` | 배포 브랜치 — push 시 GitHub Pages 자동 배포 | ✅ 라이브 |
| `master` | 최종 브랜치 — 확정된 릴리스만 반영, 태그 대상 | — |

`master` → `release` → `develop` → `feature/*` 방향으로 하위 레이어일수록 자주 움직이며, `master` 는 가장 안정된 최종본을 유지합니다.

## 이슈 중심 작업 플로우

```
1. 이슈 생성 (feat: ... / fix: ... 등 prefix + 번호 부여)
   └─ 템플릿: docs/readme/issue-convention.md

2. develop 에서 feature 브랜치 분기
   └─ 네이밍: <type>/#<issue>-<slug>
   └─ 예:    feat/#12-cheongi-base-structure

3. 작업 + 커밋 (prefix 동일: feat: ...)

4. feature → develop PR
   └─ 본문에 "Closes #<issue>" 포함하여 머지 시 이슈 자동 종료

5. 머지된 feature 브랜치 삭제 (로컬 · 원격)
```

## 릴리스 플로우

```
1. develop 에서 복수 feature 브랜치를 누적 머지
2. develop → release 머지          # push 시 GitHub Pages 자동 배포
3. 라이브 검증 (스모크 테스트)
4. release → master 머지 (fast-forward)
5. master HEAD 에 태그 생성 → push
```

## 태그 규칙 ([SemVer](https://semver.org/lang/ko/))

| 형태 | 용도 | 예시 |
|------|------|------|
| `vMAJOR.MINOR.PATCH` | 공개 릴리스 | `v1.0.0`, `v1.0.1`, `v1.1.0` |
| `PATCH` 증가 | 버그 수정 (하위호환) | `v1.0.0` → `v1.0.1` |
| `MINOR` 증가 | 기능 추가 (하위호환) | `v1.0.0` → `v1.1.0` |
| `MAJOR` 증가 | 하위호환이 깨지는 변경 | `v1.0.0` → `v2.0.0` |

태그는 **`release` → `master` 머지 직후 `master` HEAD 에 생성**합니다. (움직이는 `release` 가 아닌, 확정된 `master` 에 고정)

```bash
git checkout master
git merge --ff-only release
git push origin master

git tag -a v1.1.0 -m "v1.1.0 - 주요 변경사항 요약"
git push origin v1.1.0
```

## 관련 문서

- [이슈 컨벤션](./issue-convention.md) — 이슈 제목 prefix, 본문 섹션, 템플릿
- [브랜치 네이밍](./branch-naming.md) — feature 브랜치 형식 및 규칙
- [커밋 컨벤션](./commit-convention.md) — 커밋 메시지 형식 및 `.gitmessage` 템플릿

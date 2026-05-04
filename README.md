<h1 align="center">天 機 網</h1>

![天機網_thumbnail](docs/readme/images/天機網_thumbnail.png)

<p align="center">
  <sub>천기망 — 천하의 기밀을 엮어 강호의 서열을 정하다</sub>
</p>

<!-- Proprietary — Copyright © 2026 홍혁준. See LICENSE. -->

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-latest-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TanStack%20Query-FF4154?style=flat-square&logo=reactquery&logoColor=white" alt="TanStack Query" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Architecture-FSD-8B5CF6?style=flat-square" alt="FSD" />
</p>

---

## 개요

**천기망(天機網)** 은 무협 세계관의 데이터를 체계적으로 수집·분석·조회하는 레퍼런스 플랫폼입니다.

> *"데이터로 보는 무림의 정수."*

경지 체계, 무공, 세력, 칭호, 기연, 기타 설정까지 — 방대한 세계관 데이터를 하나의 인터페이스에서 탐색하고 편집할 수 있습니다.

---

## 핵심 가치

### 격(格)의 시각화 — 경지 데이터베이스

삼류부터 탈각/등선까지, 12단계 경지를 정량적 기준으로 정의합니다.
검도 8단계, 성취·방어·공격 분류까지 포함한 완전한 경지 체계.

### 수(手)의 분석 — 무공과 세력의 흐름

정파·사파·마교·혈교·세외·무소속 6대 세력 구분.
심법·병기법·권각법·신보법·호신법·암기법·특수법 7대 계열 분류.
각 무공의 장단점, 상세 초식, 특징을 구조화된 데이터로 제공.

### 명(名)의 증명 — 칭호와 기연

천하제일인, 무림십존, ○○마 등 칭호 체계.
영약·영물·신병이기 등 기연 데이터베이스.

---

## 문서

주제별 상세 문서는 [`docs/readme/`](./docs/readme) 에서 확인할 수 있습니다.

| 분류 | 문서 | 내용 |
|---|---|---|
| 시작하기 | [빠른 시작](./docs/readme/getting-started.md) | 권한 있음/없음 시나리오 · 서브모듈 · 실행 · 빌드 |
| 시작하기 | [프라이빗 설정 관리](./docs/readme/private-config.md) | 서브모듈 구조 · 공개/비밀 분리 · 2단계 커밋 |
| 시작하기 | [환경 변수 컨벤션](./docs/readme/env-var-convention.md) | 3-tier 파일 계층 · CRA 로딩 · 키 네이밍 · 코드 패턴 |
| 설계 | [아키텍처 & 기술 스택](./docs/readme/fe-architecture.md) | FSD · Vite · TanStack Query · Tailwind · 어댑터 격리 |
| 설계 | [현 상태 분석](./docs/readme/harness/harness-state.md) | 12개 구성 요소 · 정량 측정 · 비판적 사실 분석 · 변경 이력 |
| 설계 | ↳ [Harness 도입 가이드](./docs/readme/harness/harness-integration.md) | revfactory/harness 도입 절차 · BE/FE/기타 분담 원칙 |
| 설계 | ↳ [Harness 설치·적용 가이드](./docs/readme/harness/harness-setup.md) | 플러그인 설치 → 첫 에이전트 생성 · 검증 · 롤백 · 트러블슈팅 |
| 설계 | [세션 Context Handoff](./docs/readme/handoff/README.md) | 4-Tier 전략 (rewind/compact / Document & Clear / Persistent / Cross-Session Orchestration) |
| 설계 | [데이터 & 엔티티](./docs/readme/data.md) | 저장소 · 엔티티 구조 · 주요 기능 |
| 설계 | [Claude 아티팩트](./docs/readme/claude-artifact.md) | 단일 파일 번들 · FSD 와의 차이 |
| Git | [Git 컨벤션 인덱스](./docs/readme/git/README.md) | 4종 컨벤션 문서 모음 진입점 |
| Git | ↳ [브랜치 전략](./docs/readme/git/branch-strategy.md) | feature/develop/release/master · 릴리스 · 태그 |
| Git | ↳ [이슈 컨벤션](./docs/readme/git/issue-convention.md) | 이슈 제목 prefix · 본문 섹션 · 템플릿 |
| Git | ↳ [브랜치 네이밍](./docs/readme/git/branch-naming.md) | feature 브랜치 형식 · 규칙 · 정리 |
| Git | ↳ [커밋 컨벤션](./docs/readme/git/commit-convention.md) | 커밋 메시지 형식 · `.gitmessage` 템플릿 |

---

## 라이선스

**Proprietary — All Rights Reserved.** Copyright © 2026 홍혁준.

본 저장소의 모든 저작물은 저작권자의 사전 서면 동의 없이 **복제, 수정, 배포, 상업적 이용, 2차 저작물 작성, 타 프로젝트 포함** 등 일체의 이용이 금지됩니다. 저장소에 대한 접근은 열람(view) 만을 허용하며, 어떠한 묵시적 이용 허락도 부여하지 않습니다. 위반 시 저작권법 등 관련 법령에 따라 민·형사상 책임을 물을 수 있습니다.

자세한 내용은 [`LICENSE`](./LICENSE) 파일을 참조하세요. 이용 문의는 사전 서면으로 연락 바랍니다.

---

<p align="center">
  <sub>天下의 機密을 엮어 江湖의 序列을 정하다.</sub>
</p>

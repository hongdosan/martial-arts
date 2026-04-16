<p align="center">
  <br/>
  <strong>天 機 網</strong>
  <br/>
  <sub>천기망 — 천하의 기밀을 엮어 강호의 서열을 정하다</sub>
  <br/><br/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Architecture-FSD-8B5CF6?style=flat-square" alt="FSD" />
  <img src="https://img.shields.io/badge/Storage-Web%20Standard-1D9E75?style=flat-square" alt="Web Standard" />
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

## 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 (http://localhost:3000)
npm start

# 프로덕션 빌드
npm run build
```

---

## 아키텍처

[Feature-Sliced Design (FSD)](https://feature-sliced.design/) 기반, 특정 라이브러리에 비의존하는 이식 가능한 구조.

```
src/
├── app/              # 부트스트랩
├── pages/codex/      # 메인 페이지 + 데이터 훅
├── widgets/          # 헤더, 검색, 탭, 툴바, 리스트
├── features/         # 편집, 드래그 정렬, 필터, 내보내기
├── entities/         # level, art, faction, title, misc, fortune
├── shared/           # API 어댑터, 설정, 유틸, UI 원자
└── artifact/         # Claude 아티팩트 전용 단일 파일 번들
```

### 의존성 방향

```
app → pages → widgets → features → entities → shared
```

같은 레이어 내 슬라이스 간 import 금지. 하위 레이어는 상위 레이어를 알지 못합니다.

---

## 기술 스택

| 항목 | 선택 |
|------|------|
| Language | TypeScript (`strict: true`) |
| UI | React 19 (SPA, CSR) |
| Module | ESM |
| Storage | Web Storage API (localStorage) + 메모리 폴백 |
| Build | Create React App |
| Architecture | Feature-Sliced Design |

외부 UI 라이브러리·상태 관리 라이브러리 없이 순수 React + Web Standard 만으로 구성.
**코드만 있으면 어디서든 실행 가능**합니다.

---

## 데이터 관리

| 저장소 | 용도 | 영속성 |
|--------|------|--------|
| `DEFAULT_*` 상수 | 초기 기본 데이터 | 코드에 내장 (영구) |
| `localStorage` (`ma:data:*`) | 사용자 수정 데이터 | 브라우저 한정 |
| `localStorage` (`ma:default:*`) | 사용자 커스텀 기본값 | 브라우저 한정 |
| JSON 내보내기 | 수동 백업 | 파일로 보관 |

초기 데이터를 변경하려면 `src/entities/*/model/default-data.ts` 파일을 수정합니다.

---

## Claude 아티팩트

`src/artifact/codex-artifact.tsx` 는 전체 앱을 단일 파일로 번들한 아티팩트 전용 버전입니다.

**사용법**: 파일 내용을 복사 → Claude 채팅에 붙여넣기 → "React 아티팩트로 만들어줘"

| | FSD (`src/`) | 아티팩트 (`src/artifact/`) |
|---|---|---|
| 저장 | localStorage (영구) | useState (세션 한정) |
| 구조 | 95+ 파일 | 단일 파일 |
| CSS | CSS 변수 | 하드코딩 색상값 |

> FSD 코드 변경 시 아티팩트 파일에도 반드시 동기화해야 합니다.

---

## 엔티티 구조

| 엔티티 | 설명 | 필터 |
|--------|------|------|
| **경지** (Level) | 무림 경지 12단계, 검도 8단계, 성취·방어·공격 | 분류별 |
| **무공** (Art) | 정파~무소속 6세력 × 7계열 무공 | 세력별, 계열별 |
| **세력** (Faction) | 정파·사파·마교·혈교·세외·무소속 | — |
| **칭호** (Title) | 천하제일인, ○○마, 직위 등 | — |
| **기연** (Fortune) | 영약·영물·신병이기 | 분류별 |
| **기타** (Misc) | 내공 이론, 무공 범주, 증상, 기타 | 분류별 |

---

## 주요 기능

- 6개 탭 기반 데이터 탐색 (경지 / 무공 / 세력 / 칭호 / 기연 / 기타)
- 실시간 검색
- 항목 추가 / 수정 / 삭제
- 드래그 앤 드롭 순서 변경
- 기본값 저장 / 복원
- JSON 전체 내보내기

---

## 라이선스

**Proprietary — All Rights Reserved.** Copyright © 2026 홍혁준.

본 저장소의 모든 저작물은 저작권자의 사전 서면 동의 없이 **복제, 수정, 배포, 상업적 이용, 2차 저작물 작성, 타 프로젝트 포함** 등 일체의 이용이 금지됩니다. 저장소에 대한 접근은 열람(view) 만을 허용하며, 어떠한 묵시적 이용 허락도 부여하지 않습니다. 위반 시 저작권법 등 관련 법령에 따라 민·형사상 책임을 물을 수 있습니다.

자세한 내용은 [`LICENSE`](./LICENSE) 파일을 참조하세요. 이용 문의는 사전 서면으로 연락 바랍니다.

---

<p align="center">
  <sub>天下의 機密을 엮어 江湖의 序列을 정하다.</sub>
</p>

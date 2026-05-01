# 아키텍처

<!-- Proprietary — Copyright © 2026 홍혁준. See LICENSE. -->

[Feature-Sliced Design (FSD)](https://feature-sliced.design/) 기반, **도메인 코드는 라이브러리에 무지(library-agnostic)** 하며 외부 라이브러리는 어댑터를 통해 격리하여 이식 가능한 구조.

## 목차

- [폴더 구조](#폴더-구조)
- [의존성 방향](#의존성-방향)
- [기술 스택](#기술-스택)
- [라이브러리 격리 (Adapter Pattern)](#라이브러리-격리-adapter-pattern)
- [현재 상태 / 마이그레이션 예정](#현재-상태--마이그레이션-예정)

## 폴더 구조

```
src/
├── app/              # 부트스트랩, 프로바이더, 라우터
├── processes/        # (선택, 현재 미사용) 여러 페이지에 걸친 비즈니스 흐름
├── pages/codex/      # 메인 페이지
├── widgets/          # 헤더, 검색, 탭, 툴바, 리스트
├── features/         # 편집, 드래그 정렬, 필터, 내보내기
├── entities/         # level, art, faction, title, misc, fortune
├── shared/           # API 어댑터, 설정, 유틸, UI 원자
└── artifact/         # Claude 아티팩트 전용 단일 파일 번들
```

## 의존성 방향

```
app → processes → pages → widgets → features → entities → shared
```

- 같은 레이어 내 슬라이스 간 import 금지 (cross-import 금지).
- 하위 레이어는 상위 레이어를 알지 못합니다.
- 슬라이스 외부에서는 **public API (`index.ts`)** 만 import.

## 기술 스택

| 항목 | 선택 |
|------|------|
| Language | TypeScript (`strict: true`) |
| Library | React 19 (SPA, CSR) |
| Build Tool | Vite |
| Data Fetching | TanStack Query |
| Styling | Tailwind CSS |
| Module | ESM |
| Storage | Web Storage API (localStorage) + 메모리 폴백 — `shared/lib/store` 어댑터로 격리 |

> **Stable Latest** — 실험적 API 금지. 검증된 최신 안정 패턴(Stable Best Practice) 적용.

## 라이브러리 격리 (Adapter Pattern)

외부 라이브러리는 비즈니스 로직과 직접 결합하지 않고 어댑터를 거칩니다. **라이브러리 교체 시 도메인 코드 변경이 없어야 합니다.**

- **TanStack Query** → `shared/lib/query/*` 어댑터로 격리. `entities/`, `features/`, `pages/` 에서 `useQuery`/`useMutation` 직접 호출 금지.
- **HTTP** → `shared/api/http.ts` 단일 Fetch 어댑터를 통과. 외부 호출은 모두 이를 사용.
- **Tailwind CSS** → utility 클래스는 표현(`ui`) 레이어 한정. 도메인/모델 레이어는 스타일과 분리. 색상·간격·폰트는 `tailwind.config` 의 theme 토큰을 단일 진실로 사용.
- **OpenAPI** → BE↔FE 통신 시 OpenAPI 명세 기반 **생성 타입을 우선 활용**. 손수 작성한 DTO 보다 generated 타입을 신뢰.

**코드만 있으면 어디서든 실행 가능** — 환경 변수만 주입하면 표준 명령(`install` → `dev` / `build`)으로 동작합니다.

## 현재 상태 / 마이그레이션 예정

상기 기술 스택은 천기망의 **결정된 표준**입니다. 일부 항목은 마이그레이션이 진행 예정인 상태입니다.

| 항목 | 결정 표준 | 현재 구현 | 상태 |
|------|-----------|-----------|------|
| Build Tool | Vite | Create React App (`react-scripts`) | 마이그레이션 예정 |
| Data Fetching | TanStack Query | (미도입) | 도입 예정 |
| Styling | Tailwind CSS | (미도입) | 도입 예정 |

> ※ CRA → Vite 마이그레이션 시점에 [환경 변수 컨벤션](./env-var-convention.md) 문서도 함께 갱신 필요 (CRA `process.env.REACT_APP_*` → Vite `import.meta.env.VITE_*`).

> 결정 표준의 상세 규칙(라이브러리 어댑터 위치, OpenAPI 타입 운영, AI 행동 지침 등)은 프라이빗 서브모듈([`prompt/read_only/frontend/fe_reference_prompt.md`](../../.private-config/shared/prompt/read_only/frontend/fe_reference_prompt.md))에 단일 기준점으로 관리합니다. 접근 권한이 있는 협업자만 열람 가능합니다.

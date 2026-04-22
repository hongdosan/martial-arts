# 아키텍처

[Feature-Sliced Design (FSD)](https://feature-sliced.design/) 기반, 특정 라이브러리에 비의존하는 이식 가능한 구조.

## 목차

- [의존성 방향](#의존성-방향)
- [기술 스택](#기술-스택)

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

## 의존성 방향

```
app → pages → widgets → features → entities → shared
```

같은 레이어 내 슬라이스 간 import 금지. 하위 레이어는 상위 레이어를 알지 못합니다.

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

# 빠른 시작

> 본 저장소는 프라이빗 설정 서브모듈(`.private-config/`)을 포함하지만, **접근 권한이 없어도 앱을 Mock 모드로 기동**할 수 있습니다. 시나리오별 절차는 아래에서 확인하세요. 서브모듈 운영 상세는 [프라이빗 설정 관리](./private-config.md), 환경 변수 규약은 [환경 변수 컨벤션](./env-var-convention.md) 참조.

## 목차

- [권한 있는 개발자 — 전 기능 모드](#권한-있는-개발자--전-기능-모드)
- [권한 없는 사용자 — Mock 모드](#권한-없는-사용자--mock-모드)
- [빌드](#빌드)

## 권한 있는 개발자 — 전 기능 모드

프라이빗 저장소 `martial-arts-config` 에 접근 권한이 있다면 실제 API / OAuth / Analytics 등 전 기능을 사용할 수 있습니다.

```bash
# 최초 clone (서브모듈 포함)
git clone --recursive https://github.com/hongdosan/martial-arts.git
cd martial-arts

# 이미 clone 된 경우 서브모듈 초기화
git submodule update --init --recursive

# 프라이빗 설정 심볼릭 링크 생성 (macOS/Linux)
# .env.dev → .private-config/frontend/env/.env.dev 로 symlink 연결
./scripts/init-private.sh

# 의존성 설치 후 개발 서버 기동 (http://localhost:3000)
npm install
npm start
```

## 권한 없는 사용자 — Mock 모드

프라이빗 저장소 권한이 없어도 **추가 설정 없이** 앱을 실행할 수 있습니다. 비밀이 필요한 기능(OAuth 등) 은 자동으로 비활성화되고, 그 외 UI 는 정상 동작합니다.

```bash
# --recursive 없이 clone (또는 서브모듈 권한 에러가 나도 무시)
git clone https://github.com/hongdosan/martial-arts.git
cd martial-arts

# 서브모듈이 없으면 init-private.sh 가 자동으로
# .env.example 을 .env.dev 로 복사하여 Mock 모드를 준비합니다.
./scripts/init-private.sh

# 의존성 설치 후 개발 서버 기동
npm install
npm start
```

동작 원리 요약:

| 파일 | 역할 |
|---|---|
| `.env` | CRA 가 항상 로드하는 공개 기본값 (Mock API URL, feature flag OFF) |
| `.env.example` | 전체 키 템플릿 — 권한 없을 때 `.env.dev` 의 복사 원본 |
| `.env.dev` | 권한 있으면 symlink, 없으면 `.env.example` 복사본 |

## 빌드

```bash
npm run build
```

두 시나리오 모두에서 빌드가 성공하며, Mock 모드에서도 번들에 비밀 값이 포함되지 않는 것이 설계 원칙입니다.
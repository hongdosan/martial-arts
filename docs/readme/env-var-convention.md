# 환경 변수 컨벤션

권한 있는 개발자와 권한 없는 외부 기여자 모두 동일한 절차로 앱을 기동할 수 있어야 한다. 이 문서는 환경 변수를 공개/비밀로 분리해 관리하는 규약과 코드 패턴을 정리한다.

> 저장소 구조 / 서브모듈 운영은 [프라이빗 설정 관리](./private-config.md) 를, 초기 clone · 실행 절차는 [빠른 시작](./getting-started.md) 을 참조.

## 범위

- **본 문서의 구체 규약은 프론트엔드(CRA · React) 기준**이다. `REACT_APP_*` 접두사 · CRA 로딩 우선순위 등은 FE 전용.
- **설계 원칙(공개/비밀 3-tier 분리 · 2단계 커밋 · Graceful degradation)** 은 백엔드에도 그대로 적용된다. 스프링 프로파일 기반 BE 도입 시 [백엔드 확장 지침](#백엔드-확장-지침) 참고.

## 목차

- [범위](#범위)
- [설계 원칙](#설계-원칙)
- [파일 계층](#파일-계층)
- [CRA 로딩 우선순위](#cra-로딩-우선순위)
- [키 네이밍 규약](#키-네이밍-규약)
- [코드 패턴](#코드-패턴)
- [새 환경 변수 추가 절차](#새-환경-변수-추가-절차)
- [권한 시나리오 검증](#권한-시나리오-검증)
- [백엔드 확장 지침](#백엔드-확장-지침)

## 설계 원칙

1. **공개 기본값 최저선** — `.env` 만으로도 앱이 크래시 없이 기동된다 (Mock 모드)
2. **비밀 격리** — 실제 값은 프라이빗 서브모듈(`.private-config/frontend/env/.env.dev`) 에만 존재
3. **단일 진실 공급원** — 비밀 값은 symlink 로 연결하여 복사본을 만들지 않는다
4. **Graceful degradation** — 비밀 기반 기능은 feature flag 로 감싸 OFF 시 UI 붕괴 없이 동작

## 파일 계층

| 경로 | 가시성 | 커밋 | 역할 |
|---|---|---|---|
| `.env` | 공개 | ✅ | 공개 기본값 — CRA 가 항상 로드, 권한 없이 실행 가능한 최저선 |
| `.env.example` | 공개 | ✅ | 전체 키 템플릿 — 신규 키 추가 시 싱크 대상 + fallback 복사 원본 |
| `.env.dev` | 로컬 | ❌ | 실제 개발 값 — 권한 있으면 symlink, 없으면 `.env.example` 복사본 |
| `.private-config/frontend/env/.env.dev` | 프라이빗 | ✅(별도 저장소) | 실제 비밀 값 — 서브모듈에만 존재 |

`.env.dev` 가 어떻게 준비되는지는 [`scripts/init-private.sh`](../../scripts/init-private.sh) 가 자동 결정한다.

```
권한 있음 (서브모듈 존재)
  → .env.dev  ─symlink→  .private-config/frontend/env/.env.dev  (실제 비밀값)

권한 없음 (서브모듈 부재)
  → .env.dev  ─copy of→  .env.example  (더미값, Mock 모드)

.env.example 도 부재
  → warn 후 skip, .env 의 공개 기본값만 로드됨
```

## CRA 로딩 우선순위

Create React App 은 다음 순서로 `.env` 파일을 읽으며, **나중에 읽힌 파일이 앞 값을 덮어쓴다**.

```
.env.development.local > .env.local > .env.development > .env
```

- `.env` 의 공개 기본값은 항상 로드됨
- `.env.dev` 는 **CRA 기본 로딩 대상이 아님**. 실제 개발 값을 CRA 에 주입하려면 아래 중 택1
  - `dotenv-cli` 도입: `dotenv -e .env.dev react-scripts start`
  - symlink 타겟을 `.env.development.local` 로 변경 ([`scripts/init-private.sh`](../../scripts/init-private.sh) 조정 필요)

> 현재 리포지토리에는 `process.env` 참조가 없어 이 선택은 **실제 env 변수 도입 시점으로 유예**한다. 해당 이슈에서 위 옵션 중 하나를 확정하고 `package.json` 의 `start` 스크립트를 함께 갱신한다.

## 키 네이밍 규약

| 패턴 | 용도 | 예시 |
|---|---|---|
| `REACT_APP_*` | CRA 가 런타임에 번들로 주입 (필수 prefix) | `REACT_APP_API_URL` |
| `REACT_APP_<도메인>_<속성>` | 도메인 먼저, 속성 나중 | `REACT_APP_OAUTH_CLIENT_ID` |
| `REACT_APP_FEATURE_<이름>` | Feature flag — boolean 은 `'true'`/`'false'` 문자열 | `REACT_APP_FEATURE_ANALYTICS` |
| `REACT_APP_<이름>_ENABLED` | ON/OFF 토글 | `REACT_APP_OAUTH_ENABLED` |

- **`REACT_APP_` 접두사 필수**: CRA 는 이 접두사가 붙은 변수만 번들에 포함한다
- **비밀 값 금지 키워드**: 런타임 번들은 클라이언트에 노출되므로 *Server Secret* 은 절대 `REACT_APP_*` 로 두지 않는다 (백엔드 보호)
- 대문자 + 언더스코어 · kebab-case 금지

## 코드 패턴

### 1. 방어적 참조 (기본값 동반)

```typescript
const apiUrl = process.env.REACT_APP_API_URL ?? 'https://mock-api.local';
```

`undefined` 상태에서도 앱이 크래시하지 않도록 **항상 `??` 또는 `||` 로 기본값을 동반한다**.

### 2. Feature flag

```typescript
const oauthEnabled = process.env.REACT_APP_OAUTH_ENABLED === 'true';
```

env 변수는 문자열이므로 boolean 비교는 반드시 `=== 'true'` 로 한다. truthy 비교(`Boolean(x)`)는 `'false'` 문자열이 `true` 로 평가되어 버그 유발.

### 3. Graceful degradation

```tsx
if (oauthEnabled) {
  return <OAuthLoginButton />;
}
return <GuestModeNotice message="OAuth 비활성화 상태입니다" />;
```

Mock 모드에서도 UI 가 동작하도록 비밀 기반 기능은 **반드시 fallback UI 를 제공**한다.

### 4. 필수 값 누락 — 크래시 대신 경고

```typescript
if (!process.env.REACT_APP_REQUIRED_KEY) {
  console.warn('REACT_APP_REQUIRED_KEY 누락 — Mock 모드로 실행');
}
```

앱이 즉시 실패하는 대신 콘솔 경고 + 기능 비활성화 경로로 진입한다.

### 5. 상수 모듈로 중앙화 (권장)

FSD 의 `shared/config/env.ts` 같은 단일 지점에서 모든 env 변수를 읽고 타입 안전하게 export 하면, 참조 분산을 막고 테스트도 쉬워진다.

```typescript
// shared/config/env.ts
export const env = {
  apiUrl: process.env.REACT_APP_API_URL ?? 'https://mock-api.local',
  oauthEnabled: process.env.REACT_APP_OAUTH_ENABLED === 'true',
  oauthClientId: process.env.REACT_APP_OAUTH_CLIENT_ID ?? '',
  featureAnalytics: process.env.REACT_APP_FEATURE_ANALYTICS === 'true',
} as const;
```

이후 코드에서는 `env.apiUrl` 로만 접근. `process.env` 직접 참조는 `shared/config/` 외부에서 금지.

## 새 환경 변수 추가 절차

1. **`.env` 갱신** — 공개 가능한 기본값 (없으면 안전한 더미)
2. **`.env.example` 갱신** — 동일 키 + `your_<설명>_here` 플레이스홀더
3. **`.private-config/frontend/env/.env.dev` 갱신** (권한 있으면) — 실제 값
4. **코드 추가** — `shared/config/env.ts` 에 타입 안전 래퍼 추가
5. **문서 갱신** — 본 문서의 [키 네이밍 규약](#키-네이밍-규약) 표에 패턴 미등록 시 추가
6. **커밋 분리** — 프라이빗 저장소(실제 값) 먼저 push, 메인 저장소(공개 키 + 코드) 나중에 push

> 프라이빗/메인 2단계 커밋 절차의 근거는 [프라이빗 설정 관리 §4](./private-config.md#4-설정을-바꾸고-싶을-때--공통-절차) 참조.

## 권한 시나리오 검증

### 권한 있는 개발자

```bash
git clone --recursive https://github.com/hongdosan/martial-arts.git
cd martial-arts
./scripts/init-private.sh
npm install && npm start
```
- `readlink .env.dev` 이 `../.private-config/frontend/env/.env.dev` 반환
- 실제 API · OAuth 등 전 기능 동작

### 권한 없는 사용자

```bash
git clone https://github.com/hongdosan/martial-arts.git   # --recursive 없이
cd martial-arts
./scripts/init-private.sh          # fallback: .env.example → .env.dev 복사
npm install && npm start
```
- `.env.dev` 가 실파일(`.env.example` 복사본)로 존재
- OAuth · Analytics 등 비밀 기반 기능은 OFF, 그 외 UI 는 정상 동작
- 앱 크래시 / 빌드 실패 없음

## 백엔드 확장 지침

백엔드(Spring Boot 가정) 도입 시 위 FE 규약을 아래와 같이 매핑해 동일 원칙을 적용한다. 실제 BE 이슈 생성 시 본 섹션을 기준으로 별도 상세 규약 문서를 파생 작성한다.

### 파일 계층 매핑

| 티어 | FE (CRA) | BE (Spring Boot) | 가시성 |
|---|---|---|---|
| 공개 기본값 | `.env` | `application.yml` (또는 `application-default.yml`) | 공개 (커밋) |
| 공개 템플릿 | `.env.example` | `application-example.yml` | 공개 (커밋) |
| 실제 개발값 | `.env.dev` (symlink / copy) | `application-dev.yml` (symlink / copy) | 비커밋 |
| 실제 비밀값 | `.private-config/frontend/env/.env.dev` | `.private-config/backend/env/application-dev.yml` | 프라이빗 |

### 적용 규약 (FE 와 공통)

1. **공개 기본값 최저선** — `application.yml` 만으로 앱이 기동 (in-memory DB · Mock 엔드포인트 · `@ConditionalOnProperty` 기반 기능 OFF)
2. **비밀 격리** — 실제 DB 비밀번호 · OAuth Secret · JWT 서명 키는 `.private-config/backend/` 에만
3. **Spring Profile 연계** — `spring.profiles.active=dev` 가 `application-dev.yml` 을 로드. FE 의 `.env.development.local` 과 동일한 역할
4. **Feature Flag** — `@ConditionalOnProperty(name="feature.oauth.enabled", havingValue="true")` 로 비밀 기반 빈을 감싼다. FE 의 `REACT_APP_FEATURE_*` 대응
5. **`init-private.sh` 확장** — 서브모듈 부재 시 `application-example.yml` → `application-dev.yml` 복사 분기를 FE 블록과 동일 패턴으로 추가

### 유의점 (FE 와 차이)

- **접두사 필요 없음** — Spring 의 `@Value` / `@ConfigurationProperties` 는 임의 키를 허용하지만, FSD 의 `shared/config/env.ts` 와 유사하게 **단일 `ApplicationProperties` 클래스** 로 중앙화 권장
- **비밀은 서버에만 머무름** — FE 와 달리 클라이언트 번들에 노출될 위험이 없으므로 DB 비밀번호 등 "강한 비밀" 은 오직 BE 의 프라이빗 프로파일에만 둔다
- **환경별 프로파일 다수 가능** — `application-local.yml` · `application-prod.yml` 등. 공개/비밀 분리 원칙은 **prod 프로파일도 동일하게 프라이빗 저장소에만** 둔다

### 관련 후속 이슈 (생성 예정)

- `chore: 백엔드 환경 변수 3-tier 스캐폴딩` — `application.yml` · `application-example.yml` · `init-private.sh` BE 블록 추가
- `chore: 백엔드 Spring Profile 기반 비밀 격리 규약` — `@ConditionalOnProperty` feature flag · `ApplicationProperties` 중앙화

---

관련 문서:

- [프라이빗 설정 관리](./private-config.md) — 서브모듈 · symlink · 2단계 커밋
- [빠른 시작](./getting-started.md) — 최초 clone · 실행 절차
- [아키텍처 & 기술 스택](./architecture.md) — FSD · `shared/config/` 레이어 역할
- CRA 공식: https://create-react-app.dev/docs/adding-custom-environment-variables/
- 12-Factor App (Config): https://12factor.net/config
# Trigger — 2026-05-01 — BE Harness Setup

<!-- Proprietary — Copyright © 2026 홍혁준. See LICENSE. -->

> **vibe-coding-flow Step 02 등가** — 본 문서는 천기망 BE 표준 정의 사이클의 *하네스 호출 입력 (트리거 프롬프트)*. `.private-config/shared/prompt/custom/` 의 *개별 프롬프트 인스턴스* 와 동일한 의도이나, 사이클 산출물 / 세션 핸드오프 추적과 함께 보관하기 위해 본 위치(`docs/readme/handoff/`) 에 둔다.

## 메타

| 항목 | 값 |
|---|---|
| 사이클 | BE 표준 정의 (구조·기술 스택·아키텍처·에이전트 일괄) |
| 작성일 | 2026-05-01 |
| 사용자 결정 | "이 모든 건 하네스가 직접 설계한다" — 사용자는 *방향성*만 제시, *세부 설계*는 하네스 위임 |
| 호출 대상 | `harness:harness` 스킬 (Marketplace 옵션 A 설치) |
| 분담 매트릭스 영향 | `harness-integration.md §2` BE 행: 사용자 직영 → **하네스 자동** (방향성은 사용자). 사이클 후 매트릭스 갱신 필요 |
| 참고안 운명 | `.claude/{1,2,3}_백엔드_아키텍처_참고_문서.md` 3개 — **본 사이클 후 제거 예정** (사용자 결정) |

## 트리거 프롬프트 (입력 본문)

```
하네스 구성해줘.

==== 도메인 ====
천기망(天機網) 프로젝트의 백엔드 표준·아키텍처·에이전트 일괄 정의.
**모든 산출물은 하네스가 직접 설계** (사용자는 방향성만 제시).

==== 핵심 방향성 (사용자 결정 — 변경 불가) ====

[기술 스택]
- 언어: Java (가장 안정적인 최신 LTS — Java 21 LTS 권장, 하네스 확정)
- Framework: Spring Boot (안정적 최신 — 3.x, 하네스 확정)
- ORM: JPA
- DB: MariaDB (기본). 추후 Redis·Kafka 등 확장 여지.

[아키텍처 원칙]
- BDD + DDD 기반 헥사고날 (Hexagonal Architecture)
- inbound/outbound **풀네임 사용** (`in/out` 단축 사용 금지)
- infra 순수 분리 (의견 2 채택): adaptor/outbound = Port 구현 + 변환/조합 / infra = 순수 기술 (domain 모름)
- **헥사고날에서 "공통" 모듈·디렉토리 금지** — 모든 도메인이 의존하는 공통 영역은 안티패턴.
  횡단 관심사(AOP·Filter·Annotation·DB 설정) 는 다음 중 하네스가 합리적으로 결정:
  (a) 각 도메인 모듈 안에 자체 보유 (도메인 격리 강화)
  (b) `infra` 모듈에 통합 (헥사고날 주변부)
  (c) 최외곽 진입점 모듈 (예: `app`/`bootstrap`) 에만 두고 도메인은 순수 유지
  → 결정 사유와 함께 산출물에 명시.

[프로젝트 구조]
- FE + BE 모노레포 (천기망 root 안 공존)
- Gradle 멀티 모듈
- **모듈 의존성으로 헥사고날 참조 방향 컴파일 타임 강제** (Gradle dependency rules 으로 in→domain→out 방향 단방향 강제)

[도메인 미확정]
- 천기망 도메인은 *추후 도메인 설계 사이클에서 확정*. 본 단계는 *구조·표준* 정의만.
- 따라서 산출물의 도메인 예시는 *플레이스홀더* (`<domain>/`, `<aggregate>/`) 로 표기.
- 현재 `src/entities/` 에 있는 6개(level/art/faction/title/fortune/misc) 는 *FE 데이터 구조* 일 뿐 BE 도메인 확정안 아님.

==== 참고안 (제거 예정 — 인용·링크 금지, 패턴만 차용) ====

다음 3개 파일은 본 사이클에서 *참고용 임시 자료* 이며 **백엔드 설계 후 제거** 됨:
- .claude/1_백엔드_아키텍처_참고_문서.md
- .claude/2_백엔드_아키텍처_참고_문서.md
- .claude/3_백엔드_아키텍처_참고_문서.md

→ **하네스는 위 파일을 인용 링크로 박지 말 것** (곧 사라지므로 dead link 화). 패턴만 추출해서 천기망 컨텍스트로 재해석.

[차용 가능한 패턴]
- 4-layer 구조: adaptor/{inbound,outbound} + domain/{port,service,model,validate,exception} + infra/{jpa,kafka,restapi,...} + utils
- Inbound Port = `Handler` 네이밍, Service 가 Handler 구현
- Controller 호출자 기준 분리 + command/query 분리
- Outbound Adaptor 인프라별 분리 (`*PersistenceAdaptor` 등)
- 도메인 간 통신용 `internaladaptor` (양쪽 in/out 배치)

[차용하지 않을 패턴]
- 참고안의 `config/`, `framework/` 같은 *공통 모듈* — 헥사고날 원칙 위반 (위 (a)/(b)/(c) 중 선택)

==== 천기망 정합성 의무 (필수 8항목) ====
1. **명명 규약**: 파일 `agent-{scope}-{role}.md` / frontmatter `martial-arts-{scope}-{role}` (예: agent-be-developer.md ↔ martial-arts-be-developer)
2. **LICENSE 헤더**: 모든 .md 산출물 H1/frontmatter 다음 줄에 `<!-- Proprietary — Copyright © 2026 홍혁준. See LICENSE. -->`
3. **절대경로 금지**: 모든 인용은 상대경로 (이식성 자기모순 회피)
4. **메타 워크플로우 정렬**: vibe-coding-flow.md §3.3 Synchronous Update + §3.4 Closure Discipline 인지·인용
5. **SSOT 인용 의무**: 모든 BE 에이전트는 be_reference_prompt.md SSOT 양방향 참조
6. **symlink 인지**: .claude/agents/ → .private-config/claude/claude-agents/ symlink 인지
7. **변경 이력 누적**: docs/readme/harness/harness-state.md 변경 이력 표에 본 사이클 모든 변경 누적
8. **FE 와의 통합**: BE↔FE 통신은 OpenAPI 명세 단일 진실. fe_reference_prompt.md 와 대칭 유지 (FE 표준 변경 금지, BE 측 보강만)

==== 산출물 기대 ====

[필수 산출물]
- 에이전트:
  - .private-config/claude/claude-agents/agent-backend.md 본문 채우기 (현재 골격) — 코디네이터
  - .private-config/claude/claude-agents/agent-backend-reviewer.md 신규 — 리뷰어
  - 필요 시 도메인별 전문 에이전트 (인바운드·아웃바운드·도메인 등 — 하네스 결정)
- BE SSOT:
  - .private-config/shared/prompt/read_only/backend/be_reference_prompt.md
    - §1 핵심 기술 스택 (TBD 채움 — Java 21 LTS / Spring Boot 3.x / JPA / MariaDB / Gradle 멀티 모듈)
    - §4 API 계층 / §5 DB·마이그레이션 / §6 테스트 / §7 도메인 상수·재사용 / §8 보안 / §9 성능 / §10 코드 스타일 (placeholder 7개 모두 채움)
- BE 작업 템플릿:
  - be_{develop,improvement,review}_prompt.md 의 BE 도메인 결정 영역 보강 (DoD / 영향 범위 등)
- 신규 가이드:
  - docs/readme/be-architecture.md (FE 와 대칭, FSD 와 비교 가능 형태)
  - 멀티 모듈 가이드 — Gradle 모듈 분리 단위·참조 방향 강제 방법 (settings.gradle / build.gradle 예시 포함)
- 트리거 등록:
  - .claude/CLAUDE.md 백엔드 위임 가이드 본문 보강

[하네스 결정 항목]
- Java/Spring Boot 정확 버전
- 멀티 모듈 분리 단위 (도메인별 vs 레이어별 vs 혼합) + 결정 사유
- 횡단 관심사 처리 (a/b/c 중 선택) + 결정 사유
- BDD 도구 (Spock vs Cucumber vs JUnit5 + AssertJ) + 결정 사유
- 테스트 전략 (통합·단위·E2E 분리)
- 보안 정책 (Spring Security 기본 vs OAuth2)
- 성능 가이드 (N+1·캐시·페이징)
- DB 마이그레이션 도구 (Flyway vs Liquibase) + 결정 사유

==== 산출물 검증 (Phase 6) ====
- harness-setup.md §5 정합성 7항목 모두 통과
- 위 정합성 의무 8항목 모두 통과
- "공통 모듈 금지" 원칙 준수 검증
- 변경 이력 harness-state.md 표에 누적

==== 진행 방식 ====
- Phase 0–6 자동 실행
- 단 *결정 항목* 에서 사용자 confirm 받기 (멀티 모듈 분리 / 횡단 관심사 / BDD 도구 등)
- 산출물 분량 매우 크므로 Phase 별 중간 보고 + 사용자 검토 단계 명확히 구분
```

## 사이클 후 처리 (Open Work)

- [ ] 산출물 검증 — `harness-setup.md §5` 7항목 + 본 트리거 §정합성 의무 8항목 모두 통과
- [ ] [`harness-state.md`](../harness/harness-state.md) 변경 이력에 본 사이클 누적 (Phase 7 진화 패턴)
- [ ] [`harness-integration.md §2`](../harness/harness-integration.md#2-천기망의-분담-원칙) BE 행 갱신 — 사용자 직영 → 하네스 자동 (방향성은 사용자)
- [ ] [`harness-integration.md §4.1`](../harness/harness-integration.md#41-천기망-기존-구조와의-정합) 매트릭스에 BE 산출물 반영
- [ ] 참고안 3개 제거 — `.claude/{1,2,3}_백엔드_아키텍처_참고_문서.md` 삭제 (사용자 결정)
- [ ] 다음 사이클 — *FE 측 영향* 점검 (`harness-state.md` 인벤토리 갱신 / `vibe-coding-flow.md` References / `.claude/CLAUDE.md` 트리거 등)
- [ ] 별도 트랙 — `agent-fe-tester` 시범 생성 (`harness-setup.md §4`)

## 참고

- 이전 사이클 핸드오프: [`2026-04-30-harness-install.md`](./2026-04-30-harness-install.md)
- 4-Tier 가이드: [`README.md`](./README.md)
- 하네스 현 상태 + 변경 이력: [`../harness/harness-state.md`](../harness/harness-state.md)
- 하네스 도입 가이드: [`../harness/harness-integration.md`](../harness/harness-integration.md)
- 하네스 설치 가이드: [`../harness/harness-setup.md`](../harness/harness-setup.md)
- BE 단일 기준점 SSOT (보강 대상): `.private-config/shared/prompt/read_only/backend/be_reference_prompt.md` *(private)*
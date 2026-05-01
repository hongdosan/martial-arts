# Harness (AI 에이전트 하네스)

<!-- Proprietary — Copyright © 2026 홍혁준. See LICENSE. -->

천기망(天機網) 프로젝트가 [`revfactory/harness`](https://github.com/revfactory/harness) 플러그인 위에서 운영하는 *문서 기반 프로세스 하네스*. 본 디렉토리는 하네스의 **현 상태 분석**, **도입 가이드**, **설치·적용 절차** 3종 문서를 보관합니다.

## 구성

| 문서 | 내용 |
|---|---|
| [`harness-state.md`](./harness-state.md) | 천기망 하네스 12개 구성 요소 · 정량 측정값 · 비판적 사실 분석 · **변경 이력** (모든 하네스 변경 추적의 SSOT) |
| [`harness-integration.md`](./harness-integration.md) | 도입 가이드 — BE/FE/기타 분담 원칙 · Phase 매트릭스 · vibe-coding-flow 통합 |
| [`harness-setup.md`](./harness-setup.md) | 설치 → 적용 절차 — Marketplace 옵션 A 설치 · 첫 에이전트 시범 생성 · 7항목 정합성 검증 · 롤백 · 트러블슈팅 |

## 진입 순서

1. **현 상태 파악** — `harness-state.md` (12개 요소 정의 + 정량 측정값 + 변경 이력)
2. **도입 결정** — `harness-integration.md` (분담 매트릭스 + Phase 매핑)
3. **실제 적용** — `harness-setup.md` (`/plugin install harness@harness-marketplace` + agent-tester 시범 생성)

## 변경 추적

본 디렉토리 3종 문서의 모든 변경은 [`harness-state.md`](./harness-state.md) 의 *변경 이력* 표에 누적 기록한다 (harness Phase 7 패턴). 다른 곳에 분산 기록하지 않는다.

# Claude 아티팩트

<!-- Proprietary — Copyright © 2026 홍혁준. See LICENSE. -->

`src/artifact/codex-artifact.tsx` 는 전체 앱을 단일 파일로 번들한 아티팩트 전용 버전입니다.

**사용법**: 파일 내용을 복사 → Claude 채팅에 붙여넣기 → "React 아티팩트로 만들어줘"

| | FSD (`src/`) | 아티팩트 (`src/artifact/`) |
|---|---|---|
| 저장 | localStorage (영구) | useState (세션 한정) |
| 구조 | 95+ 파일 | 단일 파일 |
| CSS | CSS 변수 | 하드코딩 색상값 |

> FSD 코드 변경 시 아티팩트 파일에도 반드시 동기화해야 합니다.

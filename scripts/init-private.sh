#!/usr/bin/env bash
#
# init-private.sh
# Proprietary — Copyright © 2026 홍혁준. See LICENSE.
#
# 프라이빗 설정 서브모듈(.private-config/)의 파일을 메인 저장소의 원래 경로로
# 심볼릭 링크 연결한다. 멱등(idempotent)하게 작동하며 macOS/Linux 전용.
#
# 사용:
#   ./scripts/init-private.sh
#
# 전제:
#   - 서브모듈이 초기화되어 있어야 함: `git submodule update --init --recursive`

set -euo pipefail

# 스크립트 위치 기준으로 프로젝트 루트 계산
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PRIVATE_DIR="$PROJECT_ROOT/.private-config"

cd "$PROJECT_ROOT"

info()  { printf "\033[0;34m[INFO]\033[0m  %s\n" "$1"; }
ok()    { printf "\033[0;32m[OK]\033[0m    %s\n" "$1"; }
warn()  { printf "\033[0;33m[WARN]\033[0m  %s\n" "$1"; }
error() { printf "\033[0;31m[ERROR]\033[0m %s\n" "$1" >&2; }

# 서브모듈 초기화 여부 — 권한 있는 사용자는 존재, 권한 없는 사용자는 부재
# 없더라도 exit 하지 않는다. 아래 link() 는 원본 없음 시 skip 하고,
# 마지막에 env_fallback() 이 .env.dev 미생성 상태를 .env.example 복사로 보완한다.
if [[ ! -d "$PRIVATE_DIR" ]] || [[ -z "$(ls -A "$PRIVATE_DIR" 2>/dev/null)" ]]; then
  warn ".private-config/ 가 비어있거나 존재하지 않습니다 (권한 없음 또는 미초기화)."
  warn "권한이 있다면 다음으로 초기화:  git submodule update --init --recursive"
  warn "권한이 없다면 계속 진행 — Mock 모드로 기동 가능합니다."
fi

# 심볼릭 링크 생성 (멱등)
# $1: 원본(서브모듈 내부 상대 경로, PROJECT_ROOT 기준)
# $2: 링크 위치(PROJECT_ROOT 기준)
link() {
  local src_rel="$1"
  local link_rel="$2"
  local src_abs="$PROJECT_ROOT/$src_rel"
  local link_abs="$PROJECT_ROOT/$link_rel"

  if [[ ! -e "$src_abs" ]]; then
    warn "원본 없음 (skip): $src_rel"
    return 0
  fi

  # 링크 디렉토리 보장
  mkdir -p "$(dirname "$link_abs")"

  # 이미 symlink인 경우 타겟 확인
  if [[ -L "$link_abs" ]]; then
    local current
    current="$(readlink "$link_abs")"
    if [[ "$current" == "$src_abs" ]] || [[ "$(cd "$(dirname "$link_abs")" && cd "$current" 2>/dev/null && pwd)" == "$src_abs" ]]; then
      ok "이미 연결됨: $link_rel -> $src_rel"
      return 0
    else
      warn "다른 타겟의 symlink 존재: $link_rel -> $current (유지)"
      warn "의도된 타겟으로 교체하려면 먼저 제거: rm $link_rel"
      return 0
    fi
  fi

  # 실제 파일/디렉토리가 이미 있는 경우
  if [[ -e "$link_abs" ]]; then
    error "경로에 실제 파일/디렉토리 존재: $link_rel"
    error "서브모듈과 중복된 실제 데이터일 수 있습니다. 수동 확인 후 재실행하세요."
    return 1
  fi

  # 상대 경로 symlink 생성 (프로젝트 이동성 보장)
  local link_parent
  link_parent="$(dirname "$link_abs")"
  local rel_src
  rel_src="$(python3 -c "import os,sys; print(os.path.relpath(sys.argv[1], sys.argv[2]))" "$src_abs" "$link_parent")"

  ln -s "$rel_src" "$link_abs"
  ok "연결 생성: $link_rel -> $rel_src"
}

# .env.dev fallback — symlink 이 생성되지 않은 경우 .env.example 로부터 복사
# 다음 3가지 경우 모두에서 동작:
#   1) 서브모듈 부재 (권한 없는 사용자)
#   2) 서브모듈 존재하나 .env.dev 원본 파일 미존재 (프라이빗 저장소에 아직 미추가)
#   3) 수동 삭제로 .env.dev 가 사라진 상태
env_fallback() {
  local example="$PROJECT_ROOT/.env.example"
  local envdev="$PROJECT_ROOT/.env.dev"

  if [[ -L "$envdev" || -e "$envdev" ]]; then
    return 0
  fi
  if [[ ! -f "$example" ]]; then
    warn ".env.dev / .env.example 모두 부재 — .env 의 공개 기본값만 사용됨"
    return 0
  fi
  cp "$example" "$envdev"
  ok ".env.example → .env.dev 복사 완료 (Mock 모드)"
}

info "프라이빗 설정 심볼릭 링크 초기화 시작"

link ".private-config/claude/claude-agents"   ".claude/agents"
link ".private-config/claude/claude-artifact" ".claude/artifact"
link ".private-config/claude/CLAUDE.md"       ".claude/CLAUDE.md"
link ".private-config/frontend/env/.env.dev"  ".env.dev"

env_fallback

info "완료"

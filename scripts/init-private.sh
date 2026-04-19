#!/usr/bin/env bash
#
# init-private.sh
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

# 서브모듈 초기화 여부 확인
if [[ ! -d "$PRIVATE_DIR" ]] || [[ -z "$(ls -A "$PRIVATE_DIR" 2>/dev/null)" ]]; then
  error ".private-config/ 가 비어있거나 존재하지 않습니다."
  error "먼저 다음 명령으로 서브모듈을 초기화하세요:"
  error "    git submodule update --init --recursive"
  exit 1
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

info "프라이빗 설정 심볼릭 링크 초기화 시작"

link ".private-config/shared/claude-agents"   ".claude/agents"
link ".private-config/shared/claude-artifact" ".claude/artifact"
link ".private-config/frontend/env/.env.dev"  ".env.dev"

info "완료"

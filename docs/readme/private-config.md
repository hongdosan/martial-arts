# 프라이빗 설정 관리

민감 설정(에이전트 정의, 아티팩트 원본, 환경 변수)은 별도 프라이빗 저장소([martial-arts-config](https://github.com/hongdosan/martial-arts-config))로 분리되어 Git Submodule 로 연결됩니다.

## 구조

| 메인 경로 (심볼릭 링크) | → | 서브모듈 실체 |
|---|---|---|
| `.claude/agents` | → | `.private-config/shared/claude-agents` |
| `.claude/artifact` | → | `.private-config/shared/claude-artifact` |
| `.env.dev` (필요 시) | → | `.private-config/frontend/env/.env.dev` |

## 설정 변경 시 — 2단계 커밋

서브모듈 내부 파일을 수정한 경우 **서브모듈과 메인 저장소 양쪽에 커밋**이 필요합니다.

```bash
# 1단계: 서브모듈 내부 변경 → 서브모듈 저장소에 커밋 & 푸시
cd .private-config
git add . && git commit -m "feat: update xxx"
git push origin main

# 2단계: 메인 저장소에서 서브모듈 포인터 업데이트
cd ..
git add .private-config
git commit -m "chore: bump .private-config pointer"
git push
```

## 최신 설정 당겨오기

```bash
git submodule update --remote .private-config
./scripts/init-private.sh
```

## 이력 확인

```bash
git log --submodule
```

## 권한 및 OS

- 프라이빗 저장소 접근 권한이 있어야 `clone --recursive` 가 성공합니다. 접근 권한 없는 외부 기여자는 서브모듈 없이도 공개 코드 영역만 clone 가능하나, 로컬 실행 시 `.claude/agents` 등이 비어있습니다.
- 심볼릭 링크는 **macOS/Linux 전제**입니다. Windows 는 WSL 사용 권장.
- IntelliJ: **Settings → Version Control → Directory Mappings** 에 `.private-config/` 추가 필요.

자세한 내용은 서브모듈 저장소의 [README](../../.private-config/README.md) 를 참조하세요.

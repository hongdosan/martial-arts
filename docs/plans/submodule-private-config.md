# Plan: 프라이빗 설정 저장소를 Git Submodule로 분리

## 1. Context (왜 이 작업을 하는가)

현재 `martial-arts` 저장소는 **공개/배포용(GitHub Pages) 단일 저장소**이며, 보안 민감 데이터(에이전트 정의, 아티팩트, 환경변수)가 `.gitignore` 로만 격리되어 있다. 이 방식의 한계:

- 버전 관리 부재: `.claude/agents`, `.claude/artifact` 는 현재 `.gitignore` 되어 **이력 추적 불가**
- 동기화 부재: 여러 개발 환경/팀원 간 설정 공유 수단 없음
- 배포 환경 분리 불가: 환경별 설정 버전을 코드와 함께 고정할 수 없음

→ **프라이빗 저장소 + Git Submodule** 로 분리하여 (1) 설정 이력 추적, (2) 코드-설정 버전 동기화, (3) 공개/비공개 분리를 동시에 해결한다.

## 2. Scope

### 범위 (In)
- 프라이빗 저장소(`martial-arts-config`) Git Submodule 연결
- 현재 민감 파일 이동 및 심볼릭 링크 구성 (macOS/Linux 전제)
- 양쪽 저장소 README 작성 (개발 워크플로우, 주의사항)
- 루트 `.gitignore` 정리
- GitHub Issue 본문 초안 작성 (수동 생성용)

### 범위 밖 (Out)
- **메인 저장소 멀티모듈 재구성** (`apps/frontend/`, `apps/backend/` 이동) — 별도 계획으로 분리
- **Java/Gradle 스택 결정** (Gradle DSL, Java 버전, 헥사고날 모듈 구조) — 백엔드 개발 착수 시점까지 보류
- **백엔드 저장소 자체** (`martial-arts-backend`) — 실제 BE 코드 등장 시 별도 결정
- CI/CD 프라이빗 저장소 연동 (Deploy Key, Secrets) — 실제 배포 필요 시점에 별도 작업

### 이번 scope의 BE 고려사항
프라이빗 저장소 **내부 디렉토리 구조**만 BE 확장까지 미리 반영 (실제 BE 파일 이동은 없음).

## 3. 확정된 설계 결정

| 항목 | 결정 |
|---|---|
| 저장소 구조 패턴 | Pattern 2 (목적별 분리된 프라이빗 repo + 서브모듈) |
| 프라이빗 저장소 이름 | `martial-arts-config` |
| 서브모듈 마운트 경로 | `.private-config/` (메인 저장소 루트) |
| OS 지원 범위 | macOS/Linux (symlink 사용) |
| 프라이빗 저장소 내부 구조 | FE/BE + shared 디렉토리 사전 분리 |
| `logs/` 처리 | 서브모듈 아님, `.gitignore` 대상 |
| GitHub Issue 생성 방식 | 계획서에 본문 초안만 포함, 사용자가 수동 생성 |

## 4. 최종 디렉토리 구조

### 프라이빗 저장소(`martial-arts-config`) 내부
```
martial-arts-config/
├── shared/                    # FE/BE 공용 (Claude 에이전트, 아티팩트)
│   ├── claude-agents/         # ← .claude/agents 이동
│   └── claude-artifact/       # ← .claude/artifact 이동
├── frontend/
│   └── env/
│       └── .env.dev           # FE 개발 환경 변수 (신규 생성)
├── backend/                   # 추후 application-*.yml 등
│   └── .gitkeep
├── .gitignore
└── README.md                  # 내부 구조, 사용법, 주의사항
```

### 메인 저장소 (심볼릭 링크 배치)
```
martial-arts/
├── .claude/                   # 전체는 .gitignore 유지
│   ├── CLAUDE.md              # 로컬 유지 (untracked)
│   ├── settings.local.json    # 로컬 유지 (untracked)
│   ├── agents -> ../.private-config/shared/claude-agents
│   └── artifact -> ../.private-config/shared/claude-artifact
├── .env.dev -> .private-config/frontend/env/.env.dev
├── .private-config/           # Git Submodule (pointer만 추적)
├── .gitmodules                # 서브모듈 메타데이터 (신규)
├── logs/                      # .gitignore 처리
├── scripts/
│   └── init-private.sh        # 심볼릭 링크 생성 스크립트 (신규)
├── docs/
│   └── private-config.md      # 개발 가이드 (신규, 선택)
├── .gitignore                 # logs/, .env.dev 추가
└── README.md                  # 서브모듈 섹션 추가
```

## 5. 작업 체크리스트

### 5.1. 사용자가 직접 수행 (Claude Code 대행 불가)

1. **GitHub에서 프라이빗 저장소 생성**
   - 이름: `martial-arts-config`
   - Visibility: **Private**
   - 초기 커밋: README 1개만 포함 (또는 완전히 빈 저장소로 두고 Claude가 최초 커밋 생성)
   - HTTPS 또는 SSH URL 준비

2. **(현재는 미필요) CI/CD 인증 설정**
   - 본 작업 범위 밖. 실제 배포에 프라이빗 저장소가 필요해질 때 별도 작업으로 수행:
     - Deploy Key 생성 및 등록
     - `.github/workflows/*.yml` 에 `submodules: recursive` 및 `ssh-key` 주입

3. **프라이빗 저장소 URL 공유**
   - Claude에게 전달하여 `git submodule add <URL> .private-config` 실행 가능하게 함

4. **GitHub Issue 수동 생성**
   - 본 계획서 7번 섹션의 본문을 복사하여 이슈로 등록
   - 저장소는 메인(`martial-arts`)에 생성 권장

### 5.2. Claude Code가 수행

실행 순서(의존성 있음):

1. **준비 단계**
   - [ ] `scripts/` 디렉토리 생성 확인
   - [ ] 현재 `.claude/agents`, `.claude/artifact` 내용물 검증 (이동 대상 파일 목록화)

2. **서브모듈 초기 구성**
   - [ ] `git submodule add <사용자 제공 URL> .private-config` 실행
   - [ ] 프라이빗 저장소 내부 디렉토리 구조 생성 (`shared/`, `frontend/env/`, `backend/`)
   - [ ] `.gitkeep` 파일로 빈 디렉토리 유지

3. **파일 이동**
   - [ ] `.claude/agents/` → `.private-config/shared/claude-agents/` 이동 (원본 삭제)
   - [ ] `.claude/artifact/` → `.private-config/shared/claude-artifact/` 이동 (원본 삭제)
   - [ ] `.env.dev` 는 현재 **존재하지 않음**. 신규 생성은 사용자가 필요 시 수동 처리 (템플릿만 `.env.dev.example` 로 제공 가능 — 사용자 확인 후)

4. **심볼릭 링크 스크립트 작성**
   - [ ] `scripts/init-private.sh` 작성:
     - `.claude/agents`, `.claude/artifact`, `.env.dev` 링크 생성
     - 멱등성 보장 (이미 있으면 skip)
     - 프라이빗 저장소 없으면 안내 메시지 출력
   - [ ] 실행 권한 부여

5. **.gitignore 정리**
   - [ ] 루트 `.gitignore` 에 `logs/`, `.env.dev` 명시적 추가 (현재 누락)
   - [ ] `.claude/` 는 기존대로 gitignore 유지 (symlink도 자연스럽게 제외됨)

6. **프라이빗 저장소 README 작성** (`.private-config/README.md`)
   - 내부 디렉토리 구조 및 각 폴더 용도
   - 파일 매핑표 (어느 파일이 메인 저장소 어느 경로로 symlink 되는지)
   - 신규 설정 추가 절차
   - BE 확장 시 가이드

7. **메인 저장소 README 업데이트** (기존 `README.md` 에 섹션 추가)
   - 서브모듈 최초 clone: `git clone --recursive <url>`
   - 기존 clone 후 초기화: `git submodule update --init --recursive`
   - 심볼릭 링크 초기화: `./scripts/init-private.sh`
   - 서브모듈 업데이트: `git submodule update --remote`
   - 서브모듈 변경 시 2단계 커밋 워크플로우
   - 이력 추적: `git log --submodule`

8. **커밋 전략**
   - 프라이빗 저장소: 이동된 파일 최초 커밋
   - 메인 저장소: `.gitmodules` + 서브모듈 포인터 + `.gitignore` + `scripts/init-private.sh` + README 를 **별도 커밋**으로 분리 (리뷰 용이성)

## 6. 검증 방법 (Verification)

작업 완료 후 다음 순서로 검증:

1. **서브모듈 연결 확인**
   ```bash
   git submodule status
   # .private-config 가 나타나고 hash 가 표시되어야 함
   cat .gitmodules
   ```

2. **심볼릭 링크 유효성**
   ```bash
   ls -la .claude/agents .claude/artifact
   # -> .private-config/... 가 화살표로 표시, 링크 타겟 존재
   readlink .claude/agents
   ```

3. **파일 접근 가능성**
   ```bash
   ls .claude/agents/
   # 이전과 동일한 파일들이 보여야 함 (agent-backend.md 등)
   ```

4. **새 환경 clone 시뮬레이션**
   ```bash
   cd /tmp && git clone --recursive <main-repo-url> test-clone
   cd test-clone && ls .private-config/shared/
   ./scripts/init-private.sh
   ls -la .claude/agents   # symlink 정상 생성 확인
   ```

5. **React 빌드 무결성**
   ```bash
   npm run build
   # dist/ 생성 정상, homepage 동작 유지 확인
   ```

6. **Git 이력 추적**
   ```bash
   git log --submodule=log -1
   # 메인 커밋과 함께 서브모듈 변경사항 표시 확인
   ```

## 7. GitHub Issue 본문 초안 (복사-붙여넣기용)

---

**제목**: `[Infra] 보안 설정 정보를 Private Submodule로 분리`

**본문**:

```markdown
## 1. 목표 (Goal)
- 보안 민감 설정(`claude-agents`, `claude-artifact`, `.env.dev`)을 별도 프라이빗 저장소(`martial-arts-config`)로 분리
- `git submodule` 로 메인 저장소에서 참조하여 **코드-설정 버전 동기화 및 이력 추적** 가능하게 구성
- FE/BE 확장을 미리 고려한 내부 디렉토리 구조 설계

## 2. 배경 (Context)
- 현재 `.claude/agents`, `.claude/artifact` 는 `.gitignore` 처리되어 **버전 관리 불가**
- 팀/환경 간 설정 공유 수단 부재
- 향후 백엔드 모듈 추가 시 BE 설정도 동일 저장소에서 관리하기 위해 확장 가능한 구조 필요

## 3. 주요 작업 (Tasks)
### 사용자 수행
- [ ] `martial-arts-config` 프라이빗 저장소 생성 (GitHub, Private)
- [ ] 저장소 URL 공유
- [ ] 본 이슈 이후 CI/CD 배포에 프라이빗 저장소가 필요해지면 Deploy Key 설정 (별도 이슈)

### 구현
- [ ] `.private-config/` 경로에 서브모듈 추가 (`git submodule add`)
- [ ] 프라이빗 저장소 내부 구조 생성 (`shared/`, `frontend/env/`, `backend/`)
- [ ] `.claude/agents` → `.private-config/shared/claude-agents/` 이동
- [ ] `.claude/artifact` → `.private-config/shared/claude-artifact/` 이동
- [ ] `scripts/init-private.sh` 심볼릭 링크 초기화 스크립트 작성 (macOS/Linux)
- [ ] 루트 `.gitignore` 에 `logs/`, `.env.dev` 추가
- [ ] 프라이빗 저장소 `README.md` 작성 (구조, 매핑, 절차)
- [ ] 메인 저장소 `README.md` 에 서브모듈 사용법 섹션 추가

## 4. 상세 구현 가이드
### 서브모듈 추가
\`\`\`bash
git submodule add <private-repo-url> .private-config
\`\`\`

### 최초 clone
\`\`\`bash
git clone --recursive <main-repo-url>
./scripts/init-private.sh
\`\`\`

### 기존 clone 초기화
\`\`\`bash
git submodule update --init --recursive
./scripts/init-private.sh
\`\`\`

### 서브모듈 변경 반영 (2단계 커밋)
1. `.private-config/` 내부 변경 → 서브모듈 저장소에서 커밋 & 푸시
2. 메인 저장소에서 `git add .private-config && git commit` → 포인터 업데이트

### 이력 추적
\`\`\`bash
git log --submodule
\`\`\`

## 5. 기대 결과 (Expected Outcomes)
- 민감 설정의 버전 관리 일원화
- 메인 커밋 히스토리에서 설정 변경 시점 명확히 파악 가능
- BE 도입 시 `backend/` 하위에 설정만 추가하면 되는 확장성 확보
- 배포 환경에 무관한 일관된 설정 참조 환경

## 6. 범위 밖 (Out of Scope)
- 메인 저장소 멀티모듈(`apps/frontend`, `apps/backend`) 재구성 → 별도 이슈
- 백엔드 Java/Spring Boot 스택 결정 → 백엔드 착수 시점
- CI/CD 워크플로우의 프라이빗 저장소 연동 → 실제 배포 필요 시점

## 7. 참고
- OS 지원: macOS/Linux (Windows 미지원, 필요 시 WSL 권장)
- 인증: 로컬 개발은 개인 GitHub 권한 사용, CI는 향후 Deploy Key 도입
```

---

## 8. 수정/삭제될 파일 목록

### 신규 생성
- `.gitmodules` (git submodule add 부산물)
- `.private-config/` (서브모듈 마운트 포인트)
- `scripts/init-private.sh`
- `.claude/agents` (symlink, gitignored)
- `.claude/artifact` (symlink, gitignored)

### 수정
- `.gitignore` (`logs/`, `.env.dev` 추가)
- `README.md` (서브모듈 섹션 추가)

### 이동 (메인 저장소 → 프라이빗 저장소)
- `.claude/agents/*` → `.private-config/shared/claude-agents/`
- `.claude/artifact/*` → `.private-config/shared/claude-artifact/`

### 유지
- `.claude/CLAUDE.md`, `.claude/settings.local.json` (로컬 전용, 현 상태 유지)
- 나머지 모든 프로젝트 파일

## 9. 리스크 및 대응

| 리스크 | 대응 |
|---|---|
| 심볼릭 링크 깨짐 (서브모듈 미초기화 상태) | `init-private.sh` 스크립트가 서브모듈 존재 여부 검증 후 안내 메시지 출력 |
| 팀원이 `git clone` 시 `--recursive` 누락 | README 최상단에 **굵게** 명시 + `npm install` 전 서브모듈 초기화 확인 스크립트 |
| 서브모듈 포인터 업데이트 누락 | 메인 저장소 워크플로우 문서화 + 이후 pre-commit hook 도입 검토 (본 작업 범위 밖) |
| IDE(IntelliJ)에서 서브모듈 인식 이슈 | README에 IntelliJ 설정 가이드 추가 (VCS → Git → Submodule 체크) |
| macOS/Linux 외 환경에서 symlink 실패 | README에 "macOS/Linux 전제" 명시, Windows 사용자는 WSL 권장 |

## 10. 후속 작업 (Follow-up, 별도 이슈로 처리)

- **메인 저장소 멀티모듈 재구성**: `src/` → `apps/frontend/src/` 이동, `apps/backend/` placeholder 생성
- **백엔드 Java/Spring Boot 초기화**: Gradle DSL/Java 버전/헥사고날 모듈 구조 결정 후 `apps/backend/` 구현
- **CI/CD 프라이빗 저장소 연동**: Deploy Key 발급, GitHub Actions workflow 업데이트, `submodules: recursive` 적용
- **pre-commit hook**: 서브모듈 포인터 불일치 검출
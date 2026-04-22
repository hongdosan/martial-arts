# 프라이빗 설정 관리

민감하거나 외부에 공개하고 싶지 않은 설정(에이전트 정의, 아티팩트 원본, 프롬프트, 환경변수, 내부 이슈 기록 등)은 **별도 저장소**인 [`martial-arts-config`](https://github.com/hongdosan/martial-arts-config)에 분리 보관하고, Git **서브모듈(Submodule)** 로 연결합니다.

> **서브모듈이란?** 이 저장소 안에 다른 저장소를 "링크"로 끼워 넣는 기능입니다. 메인 저장소에는 "어느 시점의 프라이빗 저장소를 보고 있는지" 커밋 번호만 기록되고, 실제 파일은 프라이빗 저장소에만 존재합니다.

---

## 1. 현재 구조

프라이빗 저장소는 `.private-config/` 폴더에 연결되어 있습니다. 메인 저장소에서는 아래 **심볼릭 링크(단축 경로)** 로 접근합니다.

| 메인에서 보이는 경로 | → | 실제 위치 (프라이빗 저장소 안) |
|---|---|---|
| `.claude/CLAUDE.md` | → | `.private-config/claude/CLAUDE.md` |
| `.claude/agents/` | → | `.private-config/claude/claude-agents/` |
| `.claude/artifact/` | → | `.private-config/claude/claude-artifact/` |
| `docs/issue/` | → | `.private-config/shared/issue/` |

프라이빗 저장소 내부 폴더 구성(참고):

```
.private-config/
├── claude/              # Claude Code 관련 자원
│   ├── CLAUDE.md
│   ├── claude-agents/
│   ├── claude-artifact/
│   └── plan/
├── shared/              # 양쪽(BE/FE) 공용
│   ├── issue/           # 내부 이슈·플랜 원문
│   └── prompt/          # 개발/리뷰용 프롬프트 템플릿
├── backend/             # 백엔드 전용
└── frontend/            # 프론트엔드 전용 (.env.dev 등)
```

> **중요**: 메인 저장소의 `.gitignore`는 `.claude/`, `docs/issue`를 모두 무시합니다. 따라서 위 심볼릭 링크는 커밋되지 않고, 로컬에만 존재합니다. **프라이빗 내용은 절대 메인 저장소에 올라가지 않습니다.**

---

## 2. 서브모듈의 동작 원리

"메인 저장소와 프라이빗 저장소가 어떻게 연결되어 있는지" 개념을 잡아두면 이후의 모든 절차가 자연스럽게 이해됩니다.

### 2.1 `.private-config` 는 **독립된 git 저장소** 이다

`.private-config/` 는 메인 저장소의 "일부 폴더" 가 아닙니다. **다른 장소에 있는 별개의 git 저장소를 이 위치에 끼워 넣어 보여주는 것** 뿐입니다.

```
martial-arts/
├── .git/
│   └── modules/
│       └── .private-config/     ← 프라이빗 저장소의 "진짜 .git 저장소"
│           ├── config           ← 원격 URL 이 여기에 있음
│           ├── objects/         ← 모든 커밋 히스토리
│           ├── HEAD
│           └── ...
└── .private-config/
    └── .git                     ← 파일! (폴더 아님)
         └── 내용: "gitdir: ../.git/modules/.private-config"
                    ↑ 위쪽 진짜 저장소를 "가리키는 포인터"
```

`.private-config/.git` 파일 내부를 열어보면 한 줄이 있습니다.

```
gitdir: ../.git/modules/.private-config
```

그리고 그 경로의 `config` 파일엔:

```ini
[remote "origin"]
    url = https://github.com/hongdosan/martial-arts-config.git
```

즉, **`.private-config` 는 자기 원격 주소를 스스로 알고 있는 완결된 저장소** 입니다.

### 2.2 메인 저장소는 "포인터(SHA)" 만 기록한다

메인 저장소의 git 트리에서 `.private-config` 는 파일도 폴더도 아닌 **gitlink** 라는 특수 엔트리로 저장됩니다. 기록되는 건 딱 하나 — **"프라이빗 저장소의 어느 커밋 SHA 를 가리키고 있는가"** 입니다.

```
martial-arts (develop) 의 git log
  └─ 18be8c6  chore: bump .private-config submodule
       ↑ 이것만 남음. diff 를 펼쳐도 파일 변경 내역 없음.
         단지 ".private-config 의 SHA가 b4c259b → 5d94338 로 바뀜" 이라는
         포인터 변경만 기록됨.

martial-arts-config (main) 의 git log
  └─ 5d94338  refactor: claude 자원을 claude/ 하위로 재구성...
       ↑ 실제 파일 내용과 +803/-40 diff 는 전부 여기에만 남음.
```

"메인에 push 했는데 파일 변경 기록이 안 보인다" 는 오해가 자주 생기는데, **이건 설계상 정상입니다.** 메인 히스토리에는 포인터만 남고, 실제 변경은 프라이빗 저장소의 히스토리에만 남습니다.

그리고 `.gitmodules` 파일에 서브모듈의 URL·경로 메타데이터가 기록됩니다.

```ini
[submodule ".private-config"]
    path = .private-config
    url = https://github.com/hongdosan/martial-arts-config.git
```

### 2.3 "cd 로 들어가서 push" 는 별도 저장소에 직접 push 한 것과 같다

`cd .private-config` 하는 순간 git 명령은 위쪽 `.git/modules/.private-config/` 저장소를 상대하게 됩니다. 메인 저장소와의 대화는 끊기고, 프라이빗 저장소에 직접 접속한 것과 똑같습니다.

```bash
# 메인 저장소와 대화
$ pwd
/Users/.../martial-arts
$ git remote -v
origin  https://github.com/hongdosan/martial-arts.git  (fetch/push)
$ git push       # martial-arts 저장소로 전송됨

# 서브모듈 저장소와 대화 (같은 컴퓨터, 폴더만 이동)
$ cd .private-config
$ git remote -v
origin  https://github.com/hongdosan/martial-arts-config.git  (fetch/push)
$ git push       # martial-arts-config 저장소로 전송됨
```

**IntelliJ 에서 `martial-arts-config` 를 별도 프로젝트로 열어 push 하는 것과 본질적으로 같습니다.** 단지 워킹카피의 위치만 다를 뿐이고, GitHub 입장에서는 완전히 동일한 push 이벤트입니다.

| 방법 | 보는 워킹카피 | 푸시 도착지 |
|---|---|---|
| IntelliJ 에서 `martial-arts-config` 를 별도 프로젝트로 open | 어딘가에 별도로 clone 한 저장소 | `github.com/.../martial-arts-config.git` |
| `martial-arts` 안에서 `cd .private-config` 후 push | `.git/modules/.private-config/` 에 연결된 워킹카피 | `github.com/.../martial-arts-config.git` |

### 2.4 메인 로그에서 서브모듈 변경 내역까지 함께 보고 싶다면

메인 `git log` 는 기본적으로 포인터 변경만 보여줍니다. 서브모듈 커밋 메시지까지 함께 보고 싶다면 아래 옵션을 쓰세요.

```bash
# 일회용 — 서브모듈의 해당 커밋 메시지까지 함께 출력
git log --submodule=log
git show --submodule=log <commit>
```

출력 예:
```
commit 18be8c6...
    chore: bump .private-config submodule

Submodule .private-config b4c259b..5d94338:
  > refactor: claude 자원을 claude/ 하위로 재구성, issue/prompt 자원 추가
```

**영구 설정** (이 저장소 한정):

```bash
git config diff.submodule log
git config status.submoduleSummary true
```

- `diff.submodule log` — `git diff` / `git log -p` 시 서브모듈 변경 요약이 자동 표시
- `status.submoduleSummary true` — `git status` 에 서브모듈 변경 요약 표시

**GitHub 웹 UI 에서는?** 메인 저장소의 커밋 페이지에서 `.private-config` 는 폴더 아이콘 + SHA 로만 표기되고, 클릭하면 `martial-arts-config` 저장소의 해당 커밋으로 점프합니다(접근 권한 있을 때). 접근 권한 없는 방문자는 내용 자체를 볼 수 없으므로 **공개 저장소 페이지만 봐서는 프라이빗 내용이 절대 노출되지 않습니다.**

---

## 3. 심볼릭 링크를 쓰는 이유와 주의점

### 3.1 심볼릭 링크란?

파일이나 폴더의 **"바로가기(shortcut)"** 입니다. 경로 `A` 를 열면 자동으로 경로 `B` 로 연결됩니다. 실제 내용은 `B` 에만 존재하며, `A` 는 표지판 역할만 합니다.

```
.claude/agents  ─┐
                 ├─▶  .private-config/claude/claude-agents/  (원본)
.claude/...     ─┘         ↑ 실제 파일이 있는 곳
```

### 3.2 왜 심링크를 쓰는가 — 이점

| 이점 | 설명 |
|---|---|
| **도구 호환성** | Claude Code, IntelliJ, 각종 CLI 는 `.claude/agents` 같은 **표준 경로** 를 기대합니다. 실제 파일을 다른 곳에 두더라도 표준 경로를 유지할 수 있습니다. |
| **단일 진실 공급원** | 원본 파일은 프라이빗 저장소에 하나만 존재. 여러 경로에서 참조하더라도 내용 불일치가 생기지 않습니다. |
| **gitignore 와의 궁합** | 메인 저장소에서는 심링크만 ignore 하면 프라이빗 내용이 절대 공개 저장소로 새어나가지 않습니다. |
| **디스크·동기화 비용 0** | 파일을 복사하지 않으므로 디스크도 아끼고, 원본이 바뀌면 심링크를 통한 읽기도 즉시 바뀝니다. |
| **에디터 투명성** | IDE/에디터에서 심링크 경로의 파일을 열면 원본이 그대로 열립니다. 평소처럼 `vim .claude/CLAUDE.md` 로 수정하면 자동으로 원본이 수정됩니다. |
| **깔끔한 분리** | "공개해도 되는 코드"와 "사내·개인 자료"를 물리적으로 분리하면서도 개발 편의성은 유지할 수 있습니다. |

### 3.3 주의할 점

| 주의점 | 설명 및 대처 |
|---|---|
| **OS 제약** | Windows 기본 환경에서는 심링크 생성에 관리자 권한이 필요하고 Git 이 일부 심링크를 제대로 다루지 못합니다. → **WSL** 이나 macOS/Linux 사용을 권장합니다. |
| **상대 경로 사용** | 심링크는 **항상 상대 경로**(`../.private-config/...`)로 만드세요. 절대 경로(`/Users/me/...`)로 만들면 다른 사람이 clone 했을 때 작동하지 않습니다. |
| **원본 이동 시 링크가 깨짐** | `.private-config` 안에서 폴더 이름을 바꾸거나 이동하면 메인의 심링크가 **깨진 화살표**가 됩니다. → 반드시 `rm + ln -s` 로 재생성 (시나리오 D 참고). |
| **서브모듈 초기화 필수** | `git clone` 만 하고 `git submodule update --init` 을 안 하면 원본이 없어 모든 심링크가 깨진 상태로 보입니다. |
| **`rm -rf` 주의** | 심링크 "폴더"에 `rm -rf` 를 쓰면 **원본이 날아가지 않습니다** (심링크 자체만 제거). 하지만 폴더 **안**으로 들어가서 `rm -rf *` 하면 원본 내부 파일이 모두 삭제됩니다. 반드시 심링크 자체에 `rm` 만 사용하세요. |
| **Git 추적 혼동** | git 은 심링크를 "파일"이 아닌 "링크 대상 경로가 들어있는 특수 파일"로 추적합니다. 심링크를 실수로 커밋하면 경로 문자열만 공개되고, 팀원은 `.private-config` 없이 clone 하면 깨진 링크만 받습니다. → **`.gitignore` 로 반드시 제외**하세요. |
| **IDE 인덱싱 이슈** | IntelliJ 등에서 심링크 대상(서브모듈) 을 별도 VCS mapping 으로 등록하지 않으면 수정 이력을 제대로 인식하지 못합니다. → `Settings → Version Control → Directory Mappings` 에 `.private-config/` 추가. |
| **공개 저장소 외부 기여자** | 프라이빗 저장소 접근 권한이 없는 기여자는 심링크가 모두 깨진 상태로 clone 됩니다. → 기능이 프라이빗 자료에 의존하지 않도록 설계하거나, 해당 코드 경로를 옵셔널 처리하세요. |

### 3.4 "심링크인지" 확인하는 방법

```bash
ls -la .claude/agents
# lrwxr-xr-x ... .claude/agents -> ../.private-config/claude/claude-agents
#  ^ l 로 시작하면 심링크 (s 로 끝나는 권한 + 화살표 표기)

readlink .claude/agents
# ../.private-config/claude/claude-agents
```

---

## 4. 설정을 바꾸고 싶을 때 — 공통 절차

파일을 **추가 / 수정 / 삭제** 하는 모든 경우 공통적으로 **"두 번 커밋"** 합니다.

1. **프라이빗 저장소에 커밋** — 실제 파일 변경 내용 저장
2. **메인 저장소에 커밋** — "프라이빗의 어느 시점을 보고 있는지" 포인터 갱신

### 그림으로 보면

```
[ 내 컴퓨터 ]                       [ 원격 저장소 ]
.private-config  ── 1단계 push ──▶  martial-arts-config (프라이빗)
      ▲                                      │
      │ 어떤 커밋을 보고                      │
      │ 있는지 기록(SHA)                      │
      │                                      │
martial-arts    ── 2단계 push ──▶  martial-arts (공개)
                                   (프라이빗 커밋 번호만 저장)
```

### 4.1 자동화 팁 — `push` 한 번에 양쪽 푸시하기

메인에서 `git push` 만 쳐도 서브모듈까지 같이 올라가도록 설정할 수 있습니다.

```bash
# 이 저장소에서만 적용
cd /Users/hongdosan/IdeaProjects/martial-arts
git config push.recurseSubmodules on-demand
```

이후 동작:

```bash
cd .private-config
git add . && git commit -m "..."
cd ..
git add .private-config && git commit -m "chore: bump .private-config"
git push    # ← 이 한 번으로 .private-config 원격 push + 메인 원격 push
```

대안 설정:

| 설정값 | 동작 | 언제? |
|---|---|---|
| `on-demand` | 서브모듈에 미푸시 커밋이 있으면 먼저 push 후 메인 push | 서브모듈을 자주 수정할 때 (추천) |
| `check` | 서브모듈 미푸시 상태면 push 를 **차단**만 함 (자동 push 없음) | 실수 방지 안전망만 원할 때 |
| (미설정) | 메인만 push, 서브모듈은 수동 | 서브모듈을 거의 안 건드릴 때 |

> **주의**: 자동화는 push 만 도와줍니다. `commit` 은 여전히 두 저장소에서 각각 해야 합니다. 서브모듈은 자기 HEAD 가 움직여야 "새 SHA" 가 생기고, 그걸 가리키는 메인 커밋이 따로 필요하기 때문입니다.

---

## 5. 시나리오별 실행 방법

> 모든 명령은 프로젝트 루트(`martial-arts/`)에서 시작한다고 가정합니다.

### 시나리오 A. 프라이빗 자료를 **새로 추가**하고 싶다

예: 새 프롬프트 파일 `shared/prompt/qa_prompt.md` 추가

```bash
# 1단계: 프라이빗 저장소에서 작업
cd .private-config
# 파일을 만들거나 복사 (에디터로 직접 만들어도 됨)
vim shared/prompt/qa_prompt.md

git add shared/prompt/qa_prompt.md
git commit -m "feat: QA 프롬프트 템플릿 추가"
git push origin main

# 2단계: 메인 저장소로 돌아와 포인터 갱신
cd ..
git add .private-config
git commit -m "chore: bump .private-config (add QA prompt)"
git push
```

**메인 저장소에서도 보이게 하려면?**
새 카테고리 폴더를 메인에 노출해야 할 때만 심링크를 추가합니다. 기존 폴더(`claude-agents` 등) 안에 파일을 추가한 거라면 심링크는 이미 해당 폴더를 가리키므로 자동으로 보입니다.

심링크가 필요한 경우:

```bash
# 예: shared/prompt 를 docs/prompt 로 노출하고 싶다면
ln -s ../.private-config/shared/prompt docs/prompt

# .gitignore 에 /docs/prompt 추가 (심링크 커밋 방지)
echo "/docs/prompt" >> .gitignore
```

---

### 시나리오 B. 기존 파일을 **수정**하고 싶다

예: `.claude/CLAUDE.md` 내용 변경

```bash
# 1단계: 심링크를 통해 그냥 평소처럼 수정
vim .claude/CLAUDE.md
# ↑ 실제로는 .private-config/claude/CLAUDE.md 가 수정됨

# 프라이빗 저장소에 커밋
cd .private-config
git add claude/CLAUDE.md
git commit -m "docs: CLAUDE.md 에이전트 가이드 보강"
git push origin main

# 2단계: 메인 저장소 포인터 갱신
cd ..
git add .private-config
git commit -m "chore: bump .private-config"
git push
```

**핵심 포인트**: 심링크는 "지름길"일 뿐이므로 `.claude/CLAUDE.md` 를 수정해도 실제로는 `.private-config` 안 파일이 바뀝니다. 따라서 `cd .private-config` 하면 수정사항이 그대로 보입니다.

---

### 시나리오 C. 파일을 **삭제**하고 싶다

예: 더 이상 쓰지 않는 `.private-config/claude/claude-artifact/old.tsx` 제거

```bash
# 1단계: 프라이빗 저장소에서 삭제
cd .private-config
git rm claude/claude-artifact/old.tsx
git commit -m "chore: 더 이상 사용하지 않는 아티팩트 제거"
git push origin main

# 2단계: 메인 저장소 포인터 갱신
cd ..
git add .private-config
git commit -m "chore: bump .private-config"
git push
```

**심링크 자체를 없애고 싶다면?**
예: `docs/issue` 노출을 더 이상 원하지 않는 경우

```bash
rm docs/issue                       # 심링크만 제거 (원본은 안전)
# .gitignore 에서 /docs/issue 줄도 삭제
git add .gitignore
git commit -m "chore: docs/issue 심링크 해제"
```

---

### 시나리오 D. 폴더 **구조를 바꾸고 싶다** (예: 이름 바꾸기)

예: `shared/prompt/` → `shared/prompts/` 로 이름 변경

```bash
# 1단계: 프라이빗 저장소 안에서 이름 변경
cd .private-config
git mv shared/prompt shared/prompts
git commit -m "refactor: prompt -> prompts 로 폴더명 변경"
git push origin main

# 2단계: 메인 저장소에 해당 경로를 가리키는 심링크가 있다면 재생성
cd ..
# (예시: docs/prompt 가 옛 경로를 가리켰다면)
rm docs/prompt
ln -s ../.private-config/shared/prompts docs/prompt

# 3단계: 메인 저장소 포인터 갱신
git add .private-config
git commit -m "chore: bump .private-config"
git push
```

> **주의**: 프라이빗 저장소에서 폴더 이름을 바꾸면 **메인 저장소의 심링크가 깨집니다.** 반드시 재생성하세요.

---

### 시나리오 E. 메인에서만 수정·커밋한 상태를 뒤늦게 발견했다

> 흔한 실수: 평소처럼 `.claude/CLAUDE.md` 를 수정한 뒤 메인 저장소에서 `git commit` → `git push` 해버리고는, 프라이빗 저장소 쪽은 건드리지 않은 경우.

#### 먼저 알아둘 것

심링크로 수정한 파일은 사실 **`.private-config` 안의 파일**입니다.

```
내가 vim .claude/CLAUDE.md 로 수정
  ↓ (심링크를 따라감)
실제로는 .private-config/claude/CLAUDE.md 가 수정됨
  ↓
.private-config 는 독립 저장소이므로 그 변경은
"메인 프로젝트"의 git 입장에서는 그냥 "서브모듈 내부 변경"으로만 보임
```

즉, 메인 프로젝트에서 아무리 `git commit` 해도 **파일 내용 자체는 공개 저장소에 올라가지 않습니다.** (gitignore 때문에 올라가면 안 되는 게 맞습니다.) 그러나 **파일 내용은 여전히 내 로컬 `.private-config` 에만 저장된 "미커밋" 상태** 로 남아 있습니다. 다른 컴퓨터/팀원에게는 전혀 전달되지 않습니다.

#### 이 상태에서 메인 `git status` 는?

```
수정함:  .private-config (수정된 내용)   ← 서브모듈이 "더러워졌다"는 신호
```

`.claude/CLAUDE.md` 는 gitignore 대상이라 직접 나타나지 않고, 대신 **서브모듈 전체가 수정됨** 으로 잡힙니다. 이 줄이 보이면 "아, private-config 에 가서 커밋해야겠구나" 라고 판단하면 됩니다.

#### 복구 절차

```bash
# ① 서브모듈로 이동
cd .private-config

# ② 어떤 파일이 바뀌었는지 확인
git status
#   → 수정함: claude/CLAUDE.md 같은 줄이 보일 것

# ③ 변경 파일 스테이징 & 커밋 & 푸시
git add claude/CLAUDE.md              # (실제 바뀐 파일 경로로)
git commit -m "docs: CLAUDE.md 수정"
git push origin main

# ④ 메인 저장소로 돌아와 포인터 갱신
cd ..
git add .private-config
git commit -m "chore: bump .private-config"
git push
```

#### 메인 프로젝트에 이미 "빈 커밋"을 만들어버렸다면?

심링크 파일은 gitignore 대상이라 메인 커밋에는 **실질적 내용이 들어있지 않거나, 예전 포인터만 기록**된 상태일 수 있습니다.

검증:

```bash
git log -1 --stat                             # 방금 메인 커밋 내역
git diff HEAD~1 HEAD -- .private-config       # 포인터 변경이 있었는지
```

| 상황 | 권장 처리 |
|---|---|
| 아직 `push` 안 함 | `git reset --soft HEAD~1` 로 커밋만 되돌리고, 위 ①~④ 절차로 새로 커밋 |
| 이미 `push` 함 | 되돌리지 말고 **그냥 이어서** ①~④ 절차로 새 커밋 (히스토리 1줄 늘지만 안전) |

> 이미 공유된 히스토리를 재작성(`reset --hard` 후 force push)하는 건 협업자에게 혼란을 주므로, 푸시 이후엔 "이어 붙이기" 를 권장합니다.

---

## 6. 처음 저장소를 받거나, 최신으로 맞추고 싶을 때

```bash
# 처음 clone 하는 경우
git clone --recursive https://github.com/hongdosan/martial-arts.git

# 이미 clone 했는데 서브모듈이 비어있다면
git submodule update --init --recursive

# 원격의 최신 프라이빗 변경사항을 받고 싶다면
git submodule update --remote .private-config
```

---

## 7. 자주 겪는 문제

| 증상 | 원인 | 해결 |
|---|---|---|
| 메인 log 에 `.private-config` 파일 변경이 안 보임 | **정상 동작**. 메인 히스토리엔 포인터 변경만 기록됨 | `git log --submodule=log` 또는 `git config diff.submodule log` (§2.4 참고) |
| 메인에서 `git status` 시 `.private-config (수정된 내용)` 표시 | 프라이빗 안 파일을 고쳤지만 프라이빗 저장소에 커밋을 안 함 | 시나리오 E 절차로 서브모듈 커밋·푸시 후 포인터 갱신 |
| 메인에서 `git status` 시 `.private-config (새 커밋)` 표시 | 프라이빗에 커밋했지만 메인 포인터를 아직 안 올림 | `git add .private-config && git commit` (2단계 누락) |
| `.claude/agents` 등을 열어도 폴더가 비어있음 | 서브모듈 초기화 안 됨 | `git submodule update --init --recursive` |
| 심링크가 "깨짐"으로 표시 | 프라이빗 저장소 내부 폴더 구조가 바뀜 | `rm <심링크> && ln -s <새 경로> <심링크>` 로 재생성 |
| `git push` 가 "access denied" | 프라이빗 저장소 권한 없음 | 저장소 관리자에게 collaborator 등록 요청 |
| 메인 push 했는데 다른 사람이 서브모듈 변경을 못 봄 | 프라이빗 저장소 push 를 까먹음 | `cd .private-config && git push` 또는 `push.recurseSubmodules on-demand` 설정 (§4.1) |

---

## 8. 권한 및 환경

- 프라이빗 저장소 접근 권한이 있어야 `clone --recursive` 가 성공합니다. 권한이 없는 외부 기여자는 공개 영역만 받을 수 있습니다.
- 심볼릭 링크는 **macOS / Linux 전제** 입니다. Windows 에서는 **WSL** 사용을 권장합니다.
- IntelliJ IDEA: **Settings → Version Control → Directory Mappings** 에 `.private-config/` 를 별도 등록해야 프라이빗 변경을 IDE가 인식합니다.

---

## 9. 핵심 요약 (치트시트)

```bash
# 프라이빗 내용을 바꿨다면, 이 5줄을 항상 기억하세요.
cd .private-config
git add . && git commit -m "작업 메시지" && git push origin main
cd ..
git add .private-config && git commit -m "chore: bump .private-config" && git push
```

**한 줄로 말하면:** `.private-config` 는 메인 저장소의 일부가 아니라 **안에 얹혀있는 독립 저장소** 입니다. 그래서 파일 변경은 항상 프라이빗 저장소에 먼저 commit+push, 메인은 포인터만 나중에 갱신합니다. 메인 로그에 파일 변경이 안 보이는 건 정상이며, `git log --submodule=log` 로 함께 볼 수 있습니다.

자세한 내부 구조는 서브모듈 저장소의 [README](../../.private-config/README.md) 를 참고하세요.

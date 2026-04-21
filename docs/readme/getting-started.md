# 빠른 시작

> **중요**: 본 저장소는 프라이빗 설정 서브모듈(`.private-config/`)을 포함합니다. **반드시 `--recursive` 옵션으로 clone** 하거나, 기존 clone 시 서브모듈을 별도 초기화해야 합니다. 서브모듈 운영 상세는 [프라이빗 설정 관리](./private-config.md) 참조.

```bash
# 최초 clone (서브모듈 포함)
git clone --recursive https://github.com/hongdosan/martial-arts.git
cd martial-arts

# 이미 clone된 경우 서브모듈 초기화
git submodule update --init --recursive

# 프라이빗 설정 심볼릭 링크 생성 (macOS/Linux)
./scripts/init-private.sh

# 의존성 설치
npm install

# 개발 서버 (http://localhost:3000)
npm start

# 프로덕션 빌드
npm run build
```
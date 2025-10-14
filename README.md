# **PROJECT FLOW**

---

## **프로젝트 개요**
**PROJECT FLOW**는 사용자가 선택한 시간 동안 집중하거나 휴식을 취할 수 있도록 돕는 타이머 웹 애플리케이션입니다. 자연스러운 인터페이스와 배경 음악, 테마 전환을 통해 몰입감을 극대화하며, 간결한 사용자 경험을 제공합니다.

---

## **모바일 UX 핵심 개선 사항 (2024-12)**
- `viewport-fit=cover`와 `100dvh` 레이아웃을 적용해 iOS/안드로이드 주소창 변동과 세이프에어리어 이슈를 해소했습니다.
- 버튼과 타이포그래피를 `clamp()` 기반으로 재구성하고 최소 터치 영역 44px을 확보해 작은 화면에서도 조작이 편리합니다.
- 오디오 언락, 진동 피드백, 싱잉볼 토글 로직을 추가해 모바일 정책을 준수하면서 즉각적인 피드백을 제공합니다.
- 스티키 헤더와 유연한 그리드 레이아웃으로 필수 기능 접근성을 높이고, 스크롤 차단을 제거해 화면 잘림을 방지했습니다.

---

## **문서 링크**
- [Project Flow Documentation (프로젝트 전체 개요)](./docs/Project%20Flow_Documentation.md)
- [코드 문서 (Code Documentation)](./docs/code_docs.md)
- [UX 문서 (UX Documentation)](./docs/ux_docs.md)
- [사용자 피드백 및 개선 사항 (User Feedback)](./docs/2024_12_07_User_Feedback_and_Enhancements.md.md)
- [변경 내용 기록 (Changed Documentation)](./docs/changed_docs.md)

---

## **폴더 구조**

### 최상위 폴더
- `.github`: GitHub 워크플로우 설정 파일 저장.
- `archive`: 백업된 파일과 폴더 관리.
- `docs`: 프로젝트 문서 저장.
- `git`: Git 사용 가이드 및 형상관리 문서 저장.
- `sounds`: 프로젝트에서 사용되는 배경음악 및 효과음 저장.
- `src`: 현재 사용 중인 HTML, CSS, JS 파일과 사운드 파일 저장.
- 개별 파일:
  - `index.html`: 프로젝트 메인 HTML 파일.
  - `README.md`: 프로젝트 개요 및 소개 문서.
  - `script.js`: 주요 타이머 기능을 구현한 JavaScript 파일.
  - `styles.css`: 스타일을 정의한 CSS 파일.

### 상세 구조
1. **`.github`**
   - `workflows/static.yml`: GitHub Actions 관련 설정 파일.

2. **`archive`**
   - 히스토리 관리 폴더:
     - `241214_old`, `241214_old2`, `old`: 이전 백업 파일.
     - `sounds`: 백업된 사운드 파일 저장.
   - 주요 파일:
     - `FileInfo.txt`, `FilePaths.txt`, `PowerShell_Command.txt`: 백업 관련 정보 기록.
     - 백업된 HTML, JS, CSS 파일들.

3. **`docs`**
   - 주요 문서:
     - `Project Flow_Documentation.md`: 프로젝트 전체 개요.
     - `code_docs.md`: 코드 문서.
     - `ux_docs.md`: UX 문서.
     - `2024_12_07_User_Feedback_and_Enhancements.md.md`: 사용자 피드백 및 개선 사항.
     - `POC_REVIEW.md`: 개념 검토 문서.
   - 복사본 또는 이전 버전:
     - `2024_12_14_Project Flow_Documentation - 복사본.md`.
   - 추가 문서:
     - `changed_docs.md`: 변경 내용 기록.

4. **`git`**
   - 주요 파일:
     - `git_guide.html`: Git 업데이트 및 릴리즈 가이드.
     - `git_guide.md`: 텍스트 기반 Git 가이드.

5. **`sounds`**
   - 주요 배경음악 및 사운드 파일:
     - `Bill Douglas - Forest Hymn.mp3`
     - `meditation.mp3`
     - `singing-bowl.mp3`
     - `Sound That Heals ☯️ 432 hz.mp3`.

6. **`src`**
   - 메인 파일:
     - `index.html`, `script.js`, `styles.css`.
   - 사운드 파일 저장:
     - `src/sounds` 디렉토리 내 동일 사운드 파일들.

---

## **Git 사용법 및 버전 관리 가이드**

프로젝트 진행 중 팀원들이 Git 사용법에 대해 참고할 수 있는 가이드를 준비했습니다. Git 기본 사용 방법, 브랜치 전략, 커밋 규칙, 릴리즈 태그 생성 방법 등 형상관리에 필요한 정보들이 포함되어 있습니다. 해당 가이드는 지속적으로 업데이트될 예정이니 정기적으로 확인해주세요.

- [Git 사용법 가이드 (Markdown 문서)](./git/git_guide.md)

### Git 폴더 관리 권장사항
- `git` 폴더 내 `git_guide.html` 문서는 Git 관련 설정 및 사용 방법, 버전 관리 정책 등을 담고 있습니다.
- 새로운 Git 관련 전략(예: Git Flow, GitHub Flow, GitLab Flow)이나 변경 사항 발생 시 `git` 폴더 내에 추가 HTML 문서나 관련 자료를 업데이트하고, `README.md`에도 링크를 추가하세요.
- 브랜치 전략, 커밋 메시지 규칙, 릴리즈 노트 작성 방법, CI/CD 관련 Git 활용 방안 등을 문서화하여 `git` 폴더에서 함께 관리하면 팀 내 지식 공유에 유용합니다.

---

**추가 안내**
- Git 사용에 익숙하지 않은 팀원을 위해 `git_guide.html` 문서에 단계별 설명과 명령어 예시를 포함하였습니다.
- 프로젝트 진행 중 궁금한 점이나 새로운 협업 전략이 필요하다면, `git` 폴더에 관련 문서를 추가하고 해당 문서의 링크를 `README.md`에 반영해주세요.
- 지속적인 업데이트를 통해 팀원 모두가 Git과 형상관리 정책에 쉽게 접근하고 숙지할 수 있도록 함께 노력합시다.

---

**태그**: #Git #GitHub #버전관리 #협업 #지속적개선

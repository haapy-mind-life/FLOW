# **PROJECT FLOW**

---

## **프로젝트 개요**
**PROJECT FLOW**는 사용자가 선택한 시간 동안 집중하거나 휴식을 취할 수 있도록 돕는 타이머 웹 애플리케이션입니다. 자연스러운 인터페이스와 배경 음악, 테마 전환을 통해 몰입감을 극대화하며, 간결한 사용자 경험을 제공합니다.

---

## **문서 링크**
- [Project Flow Documentation (프로젝트 전체 개요)](./docs/Project%20Flow_Documentation.md)
- [코드 문서 (Code Documentation)](./docs/code_docs.md)
- [UX 문서 (UX Documentation)](./docs/ux_docs.md)
- [사용자 피드백 및 개선 사항 (User Feedback)](./docs/2024_12_07_User_Feedback_and_Enhancements.md.md)

---

## **폴더 구조**

### 최상위 폴더
- `.github`: GitHub 워크플로우 설정 파일 저장.
- `archive`: 백업된 파일과 폴더 관리.
- `docs`: 프로젝트 문서 저장.
- `git`: Git 사용 가이드 및 형상관리 문서 저장.
- `src`: HTML, CSS, JavaScript 파일 저장.
- `README.md`: 프로젝트 소개 문서.

### 상세 구조
1. **`.github`**
   - `workflows`: GitHub Actions 관련 설정 파일.
     - `static.yml`: 정적 파일 빌드 및 테스트.

2. **`archive`**
   - 백업된 주요 파일 저장.
   - 하위 폴더:
     - `241214_old`, `241214_old2`, `old`: 백업 파일 관리.
     - `sounds`: 백업된 사운드 파일 저장.
   - 주요 파일:
     - `index.html`, `script.js`, `styles.css`, `FileInfo.txt`, `FilePaths.txt`, `PowerShell_Command.txt`.
   - `sounds` 폴더:
     - `Bill Douglas - Forest Hymn.mp3`
     - `meditation.mp3`
     - `singing-bowl.mp3`
     - `Sound That Heals ☯️ 432 hz - Tibetan Meditation Music.mp3`.

3. **`docs`**
   - 프로젝트 관리 및 기술 문서 저장.
   - 주요 파일:
     - `2024_12_07_Project_Flow_Documentation.md`
     - `2024_12_07_Unified_Prompt_for_Project_Flow.md`
     - `2024_12_07_User_Feedback_and_Enhancements.md.md`
     - `2024_12_14_Project Flow_Documentation - 복사본.md`
     - `POC_REVIEW.md`
     - `code_docs.md`
     - `Project Flow_Documentation.md`
     - `ux_docs.md`

4. **`git`**
   - Git 사용법 가이드 파일.
     - `git_guide.html`

5. **`src`**
   - 현재 사용 중인 메인 소스 파일.
   - 주요 파일:
     - `index.html`
     - `script.js`
     - `styles.css`
   - `sounds` 폴더:
     - `Bill Douglas - Forest Hymn.mp3`
     - `meditation.mp3`
     - `singing-bowl.mp3`
     - `Sound That Heals ☯️ 432 hz - Tibetan Meditation Music.mp3`

---

## **Git 사용법 및 버전 관리 가이드**

프로젝트 진행 중 팀원들이 Git 사용법에 대해 참고할 수 있는 가이드를 준비했습니다. Git 기본 사용 방법, 브랜치 전략, 커밋 규칙, 릴리즈 태그 생성 방법 등 형상관리에 필요한 정보들이 포함되어 있습니다. 해당 가이드는 지속적으로 업데이트될 예정이니 정기적으로 확인해주세요.

- [Git 사용법 가이드 (HTML 문서)](./git/git_guide.html)

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

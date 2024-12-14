### 2024-12-15 수정 내역

#### **1. 싱잉볼 모드 개선**
- **기능 안정화**:
  - 싱잉볼 모드 실행 시, 이전 타임아웃과 상태를 초기화하도록 수정하여 다중 클릭 시 발생하는 충돌 문제 해결.
  - `singingBowlTimeouts` 배열을 추가하여 모든 타임아웃을 관리 및 초기화.
  - 사운드가 시작부터 10초간 정상 재생 후, 5초 동안 페이드 아웃되도록 구현.

- **UI 초기화**:
  - 싱잉볼 모드 종료 시 관련 상태와 UI가 명확히 초기화되도록 수정:
    - 음원 재생 중단, 볼륨 초기화, 타임아웃 제거.

#### **2. 타이머 버튼 기능 개선**
- **타이머 초기화 로직 추가**:
  - 싱잉볼 모드 종료 후 타이머 버튼(5분, 15분, 30분)이 정상 동작하지 않는 문제 해결.
  - 타이머 버튼 클릭 시 항상 `resetTimer()`를 호출하여 상태를 초기화한 뒤 새로운 타이머 시작.

- **배경음악 초기화**:
  - 타이머 실행 전, 배경음악이 항상 초기화되도록 수정:
    - `pause()` 및 `currentTime`을 리셋하여 반복 실행 안정화.

#### **3. UI 및 사용자 경험 개선**
- **싱잉볼 모드**:
  - 물결치는 배경 효과 제거로 UI 간결화.
  - 싱잉볼 모드 실행 시 "싱잉볼 모드 재생 중" 메시지 추가.

- **팝업 UI 유지**:
  - 기록 보기, 저작권 정보 팝업 UI를 유지하며 동작에 영향 없도록 설정.
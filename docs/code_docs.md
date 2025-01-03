# **PROJECT FLOW: Updated Code Documentation**

---

## **프로젝트 개요**

**PROJECT FLOW**는 사용자가 선택한 시간 동안 집중하거나 휴식을 취할 수 있도록 돕는 타이머 웹 애플리케이션입니다. 자연스러운 인터페이스와 배경 음악, 테마 전환을 통해 몰입감을 극대화하며, 간결한 사용자 경험을 제공합니다.

---

## **주요 기능**

- **타이머 설정**:
  - 싱잉볼 모드(1분), 5분, 15분, 30분, 연속 모드 중 선택 가능.
- **싱잉볼 모드**:
  - 배경 음악 없이 1분 후 종료 알람만 재생.
- **배경 음악 재생**:
  - 타이머 시작 시 배경 음악이 부드럽게 페이드 인(싱잉볼 모드 제외).
- **타이머 종료 후 동작**:
  - 배경 음악이 10초간 페이드 아웃된 뒤 알람이 재생됨.
  - 알람은 페이드 아웃 없이 명료하게 재생.
- **연속 모드 지원**:
  - 60분 주기로 알람이 울림.
  - 배경 색상이 시간 경과에 따라 자연스럽게 전환(0분: 연한 녹색 → 60분: 진한 녹색 → 반복).
  - 알람 종료 후 배경 음악이 10초간 페이드 인되며 다시 재생.

---

## **코드 상세 설명**

### **HTML 구조**

- **타이머 선택 버튼**:
  - `<button>` 요소로 구성되며, 각 버튼은 `data-increment`와 `data-mode` 속성을 통해 모드를 구분.
  - 싱잉볼 버튼은 `data-mode="singing-bowl"`로 설정되어 있으며, 1분 타이머로 작동.
- **진행 바 및 시간 표시**:
  - SVG로 구현된 원형 진행 바를 사용하여 타이머의 진행 상태를 시각적으로 표시.
  - 현재 남은 시간을 표시하는 `<p id="current-time">` 요소가 있음.
- **오디오 요소**:
  - `id="background-music"`: 배경 음악 재생용 오디오 요소.
  - `id="alarm-sound"`: 종료 알람 재생용 오디오 요소.

### **CSS 스타일링**

- **전체 레이아웃**:
  - 자연을 연상시키는 그라데이션 배경과 중앙 정렬된 레이아웃으로 디자인.
- **버튼 스타일**:
  - `.timer-option` 클래스는 공통 스타일을 정의.
  - 각 모드별 버튼은 추가적인 클래스로 배경색과 스타일을 지정(`.timer-singing-bowl`, `.timer-5min` 등).
- **진행 바 및 시간 표시**:
  - 원형 진행 바는 CSS를 통해 회전 및 애니메이션 효과를 부여.
  - 남은 시간은 큰 글씨로 중앙에 표시.

### **JavaScript 기능**

- **변수 정의**:
  - `buttons`: 모든 타이머 선택 버튼들을 담은 NodeList.
  - `currentTime`: 남은 시간을 표시하는 요소.
  - `circle`: 원형 진행 바의 `<circle>` 요소.
  - `music`: 배경 음악 오디오 요소.
  - `alarm`: 종료 알람 오디오 요소.
  - `FULL_DASH_ARRAY`: 원형 진행 바의 전체 둘레 길이.
  - `timeLeft`, `totalTime`: 타이머의 남은 시간과 총 시간(초 단위).
  - `interval`: `setInterval`의 ID를 저장하여 타이머를 제어.
  - `isContinuousMode`: 연속 모드 여부를 판단하는 불리언 값.
  - `isSingingBowlMode`: 싱잉볼 모드 여부를 판단하는 불리언 값.

- **함수 설명**:
  - `fadeOutAudio(audioElement, duration, callback)`:
    - 오디오 요소를 지정된 시간 동안 점점 볼륨을 줄여 페이드 아웃.
    - 페이드 아웃 완료 후 오디오를 정지하고 콜백 함수 호출.
  - `fadeInAudio(audioElement, duration, callback)`:
    - 오디오 요소를 지정된 시간 동안 점점 볼륨을 높여 페이드 인.
    - 오디오를 재생하고, 페이드 인 완료 후 콜백 함수 호출.
  - `updateCircleProgress(percentage)`:
    - 원형 진행 바의 진행 상태를 업데이트.
    - `percentage`에 따라 `stroke-dashoffset`을 조정하여 진행도를 표시.
  - `timerEnd()`:
    - 타이머가 종료되었을 때 호출되는 함수.
    - 싱잉볼 모드인 경우 바로 알람을 재생.
    - 그 외 모드에서는 배경 음악을 10초간 페이드 아웃한 뒤 알람 재생.
    - 연속 모드인 경우 알람 종료 후 배경 음악을 10초간 페이드 인하며 타이머 재시작.
  - `timerTick()`:
    - 1초마다 호출되어 타이머를 업데이트.
    - 남은 시간을 감소시키고, 진행 바와 시간 표시를 업데이트.
    - 시간이 다 되면 `timerEnd()` 호출.
  - `startTimer(seconds)`:
    - 선택된 모드에 따라 타이머를 초기화하고 시작.
    - 싱잉볼 모드에서는 배경 음악을 재생하지 않음.
    - 연속 모드와 일반 모드에 따라 초기 설정이 다름.

- **이벤트 리스너**:
  - 각 버튼에 클릭 이벤트를 추가하여 해당 모드의 타이머를 시작.
  - 버튼 클릭 시 다른 버튼들의 활성화 상태를 해제하고, 선택된 버튼을 활성화.
  - `data-increment`와 `data-mode` 속성을 통해 타이머 시간을 설정.

---

### **수정 내역**

- **2024-12-03**:
  - 싱잉볼 버튼 추가 및 관련 기능 구현.
  - 싱잉볼 모드에서는 배경 음악을 재생하지 않고, 1분 후 알람만 울림.
  - 종료 알람의 페이드 아웃 기능 제거.
  - 배경 음악의 페이드 아웃 및 페이드 인 시간 조정(10초).
  - 코드 문서에 수정 날짜 추가.

- **2024-12-07**:
  - 연속 모드에서 알람 주기를 60분으로 변경.
  - 60분 주기로 배경 색상이 자연스럽게 전환되는 기능 추가.
  - 진행 바 애니메이션을 60분 기준으로 회전하도록 수정.
  - 타이머 선택 버튼의 스타일을 개선하여 모드별 테마를 직관적으로 표현.

---

### **Project Flow: 숲속의 웰니스 타이머 (업데이트 버전)**

---

## **목차**
1. [프로젝트 개요](#프로젝트-개요)
2. [목표 및 필요성](#목표-및-필요성)
3. [주요 기능](#주요-기능)
4. [디자인 컨셉](#디자인-컨셉)
5. [기술 구성](#기술-구성)
6. [사용자 경험 흐름](#사용자-경험-흐름)
7. [향후 개선 아이디어 (COT 방식)](#향후-개선-아이디어-COT-방식)

---

## **프로젝트 개요**

**Project Flow**는 자연의 평온함을 중심으로 한 디지털 웰니스 타이머입니다. 타이머를 기반으로 명상과 집중을 돕고, 심리적 안정감을 제공하며, 사용자 중심의 직관적인 경험을 지원합니다.

---

## **목표 및 필요성**

### **프로젝트 목표**
1. 명상 및 집중 시간을 효과적으로 관리할 수 있는 도구 제공.
2. 자연 테마를 통해 심리적 안정감과 웰니스 경험을 증진.
3. 단순하고 직관적인 UX/UI로 누구나 쉽게 사용 가능하도록 설계.

### **필요성**
- **웰빙 트렌드**: 정신 건강 관리의 중요성이 부각됨에 따라 웰니스 제품에 대한 수요 증가.
- **기존 타이머의 한계**: 일반적인 타이머 앱은 기능적으로 충분하지만 심리적 안정감을 제공하지 못함.
- **간단한 경험**: 사용자는 복잡한 설정 없이 명확하고 직관적인 타이머를 원함.

---

## **주요 기능**

### **1. 타이머 기능**
- **타이머 선택 (5, 15, 30분)**:
  - 자연 테마를 나타내는 🌱, 🌳, 🌲 이모지를 활용한 버튼.
  - 타이머 시작과 함께 명상음악 자동 재생.
- **SVG 진행 바**:
  - 원형 애니메이션으로 시간의 흐름을 시각화.
  - `stroke-dashoffset` 값 기반의 부드러운 진행 효과.
- **싱잉볼 모드**:
  - 독립적인 명상 사운드를 제공.
  - 10초 재생 후 5초 동안 페이드아웃.

### **2. 사운드 디자인**
- **명상음악**:
  - 배경음악은 자연의 소리와 어우러지며 부드럽게 시작/종료.
- **싱잉볼 사운드**:
  - 사용자에게 짧고 강렬한 명상 상태를 제공.
  - 오디오 상태 충돌 방지를 위한 `playAudio`와 `fadeOutAudio` 함수 구현.

### **3. 사용자 인터페이스**
- **타이머 버튼**:
  - 직관적인 이모지와 색상 조합.
  - 클릭 시 타이머와 배경음악 즉시 실행.
- **상단 버튼**:
  - 기록 보기(📜): 타이머 사용 내역 확인 가능.
  - 저작권 정보(⚖️): 음원 및 기타 리소스 정보 제공.
  - 싱잉볼 모드(🔔): 독립적인 명상 사운드 실행.

---

## **디자인 컨셉**

### **테마 및 색상**
- **자연 테마**:
  - 녹색 그라데이션을 활용한 배경으로 숲의 편안한 분위기 연출.
- **심플한 인터페이스**:
  - 불필요한 장식을 배제한 미니멀리즘 UI.

### **시각적 요소**
- **SVG 원형 진행 바**:
  - 타이머의 진행 상황을 직관적으로 확인.
- **자연을 상징하는 이모지 버튼**:
  - 🌱 (5분), 🌳 (15분), 🌲 (30분).

### **레이아웃 구성**
1. **중앙 집중형 레이아웃**:
   - 타이머와 버튼을 사용자 시선 중심에 배치.
2. **상단 버튼**:
   - 추가 정보 및 기능 버튼을 상단에 배치.

---

## **기술 구성**

### **1. HTML**
```html
<div class="header-buttons">
  <button id="view-history" class="header-button brown" title="기록 확인">📜</button>
  <button id="copyright-info" class="header-button gray" title="저작권 정보">⚖️</button>
  <button id="singing-bowl-mode" class="header-button gold" title="싱잉볼">🔔</button>
</div>
<div id="svg-timer" class="svg-timer hidden">
  <svg class="progress-ring" width="300" height="300">
    <circle class="progress-ring__background" stroke="#E6F5E9" stroke-width="10" fill="transparent" r="140" cx="150" cy="150"></circle>
    <circle class="progress-ring__circle" stroke="#6B8E64" stroke-width="10" fill="transparent" r="140" cx="150" cy="150"></circle>
  </svg>
  <p id="time-remaining">00:00</p>
</div>
```

### **2. CSS**
```css
.progress-ring__circle {
  stroke-dasharray: 880;
  stroke-dashoffset: 880;
  transition: stroke-dashoffset 1s linear;
}
.timer-option {
  border-radius: 50%;
  background: linear-gradient(to top, #B6E5AC, #4CAF50);
}
```

### **3. JavaScript**
```javascript
function playAudio(audio) {
  if (!audio.paused) return;
  audio.currentTime = 0;
  audio.volume = 1;
  audio.play().catch(err => console.error(`오디오 재생 오류: ${err}`));
}

function fadeOutAudio(audio, duration = 5000) {
  if (audio.paused) return;
  const step = audio.volume / (duration / 100);
  const fadeInterval = setInterval(() => {
    if (audio.volume > 0) {
      audio.volume -= step;
    } else {
      clearInterval(fadeInterval);
      audio.pause();
    }
  }, 100);
}
```

---

## **사용자 경험 흐름**

1. **타이머 시작**:
   - 사용자가 5, 15, 30분 버튼 중 선택.
   - 선택 즉시 명상음악과 SVG 타이머 실행.
2. **타이머 진행**:
   - SVG 원형 진행 바를 통해 남은 시간 시각화.
   - 텍스트로도 시간 표시.
3. **타이머 종료**:
   - 명상음악이 부드럽게 페이드아웃 후 종료.
4. **싱잉볼 모드**:
   - 10초 동안 싱잉볼 사운드 재생, 이후 5초 동안 페이드아웃.

---

## **향후 개선 아이디어 (COT 방식)**

### **전문가 논의**
1. **기록 기능 확장**:
   - 명상 습관 형성을 지원하는 사용 시간 통계 제공.
2. **새로운 사운드 테마 추가**:
   - 숲, 바다, 폭포 등 다양한 자연 테마 추가.
3. **AI 추천 시스템**:
   - 사용자의 상태에 따른 최적의 명상 옵션 제공.
4. **다국어 지원**:
   - 다국어 지원으로 글로벌 사용자 경험 확대.
5. **모바일 앱화**:
   - 오프라인에서도 사용할 수 있는 독립적인 앱으로 확장.

--- 

이 프로젝트는 명상과 웰빙을 원하는 사용자들에게 심리적 안정감을 제공하며, 직관적이고 기능적인 경험을 선사합니다.
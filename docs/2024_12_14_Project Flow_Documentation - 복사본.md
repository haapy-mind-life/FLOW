# **Project Flow: 숲속의 웰니스 타이머**

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

**Project Flow**는 자연의 평온함과 웰니스 경험을 디지털 타이머로 구현한 웹 애플리케이션입니다. 타이머를 중심으로 한 심신 안정, 집중력 강화, 명상 및 휴식 지원 기능을 제공합니다.

---

## **목표 및 필요성**

### **프로젝트 목표**
1. 사용자가 명상과 집중 시간을 효과적으로 관리할 수 있도록 지원.
2. 웰니스 및 자연 중심의 테마를 통해 심리적 안정감을 제공.
3. 직관적이고 간결한 UX/UI를 활용하여 누구나 쉽게 사용할 수 있도록 설계.

### **필요성**
- **웰니스 수요 증가**: 현대인의 정신 건강과 웰빙을 위한 솔루션 필요.
- **사용자 중심 타이머 부족**: 기존 타이머 앱은 기능은 풍부하지만, 심리적 안정감 제공은 부족.
- **사용성**: 복잡한 설정 없이 명확한 시간 관리와 직관적인 경험 제공.

---

## **주요 기능**

### **1. 타이머 기능**
- **5분, 15분, 30분 타이머**: 
  - 이모지(🌱, 🌳, 🌲)로 자연의 생명력을 시각적으로 표현.
  - 타이머 시작 시 명상음악 자동 재생.
- **SVG 진행 바**:
  - 원형 진행 바와 텍스트로 남은 시간 시각화.
  - `stroke-dashoffset` 값을 활용해 부드러운 진행 애니메이션.
- **싱잉볼 모드**:
  - 독립적인 명상 사운드 제공.
  - 음원은 20초 재생되며, 5초 후 10초 동안 페이드아웃.
- **연속 모드**:
  - 무한 반복 실행.

### **2. 사운드 디자인**
- **명상음악**:
  - 자연의 소리를 기반으로 한 음원을 페이드인/페이드아웃으로 재생.
- **싱잉볼 사운드**:
  - 사용자가 명상 상태에 빠르게 도달하도록 돕는 단기 집중 사운드.

### **3. 사용자 인터페이스**
- **타이머 선택 버튼**:
  - 이모지와 색상 조합으로 직관적 UX 제공.
  - 클릭 후 즉시 실행.
- **상단 버튼**:
  - **기록 보기(📜)**: 사용자 사용 기록 추적 및 분석(추후 확장 가능).
  - **저작권 정보(⚖️)**: 음원과 저작권 정보를 팝업으로 제공.
  - **싱잉볼 모드(🔔)**: 독립 명상 사운드 제공.

---

## **디자인 컨셉**

### **테마 및 색상**
- **숲속 웰니스 테마**:
  - 녹색을 중심으로 자연스러운 색상 전환.
  - 옅은 녹색 → 짙은 녹색으로 이어지는 그라데이션 배경.

### **시각적 요소**
- **SVG 진행 바**:
  - 원형 진행 애니메이션으로 시간 흐름 시각화.
- **이모지 기반 UX**:
  - 타이머 버튼에 자연을 상징하는 🌱, 🌳, 🌲.

### **레이아웃 구성**
1. **중앙 집중형 레이아웃**:
   - 타이머 선택과 SVG 타이머를 중심으로 배치.
2. **상단 버튼**:
   - 사용 기록과 저작권 정보를 간편하게 제공.

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
    <circle class="progress-ring__circle" r="140" cx="150" cy="150"></circle>
  </svg>
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
function startTimer(duration) {
  let timeLeft = duration;
  isRunning = true;
  fadeInAudio(backgroundMusic);
  interval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(interval);
      fadeOutAudio(backgroundMusic);
    }
    timeLeft--;
  }, 1000);
}

document.getElementById('singing-bowl-mode').addEventListener('click', () => {
  if (!isRunning) {
    fadeInAudio(singingBowlSound, 5000);
    setTimeout(() => fadeOutAudio(singingBowlSound, 10000), 5000);
  }
});
```

---

## **사용자 경험 흐름**

1. **타이머 선택**:
   - 🌱, 🌳, 🌲 중 원하는 시간을 선택.
   - 명상음악 자동 재생.
2. **타이머 진행**:
   - SVG 진행 바와 남은 시간 표시.
3. **타이머 종료**:
   - 명상음악이 자연스럽게 종료.
4. **싱잉볼 모드**:
   - 20초 음원 재생 후 페이드아웃으로 마무리.

---

## **향후 개선 아이디어 (COT 방식)**

### **전문가 논의**
#### **1. 기록 기능 확장**
- 기록 데이터를 기반으로 명상 습관 형성 지원:
  - 주간/월간 사용 시간 통계 제공.
  - 사용자 목표 설정 및 알림 기능 추가.

#### **2. 새로운 사운드 추가**
- 숲속 이외의 자연 테마(예: 바다, 폭포) 추가:
  - 다양한 사용자 취향에 맞춤화.

#### **3. AI 기반 추천**
- AI를 활용해 사용자 상태(스트레스, 피로도)에 따라 최적의 명상음악과 시간 추천.

#### **4. 다국어 지원**
- 한국어, 영어 외에 추가 언어 지원:
  - 글로벌 사용자 확장 가능.

#### **5. 모바일 앱화**
- 반응형 웹에서 독립적인 모바일 앱으로 확장:
  - 오프라인에서도 타이머와 사운드 사용 가능.

---

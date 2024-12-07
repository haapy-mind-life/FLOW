### **2024_12_07_Project_Flow_Documentation.md**

---

# **PROJECT FLOW Documentation**

---

## **프로젝트 개요**
**PROJECT FLOW**는 사용자가 선택한 시간 동안 집중하거나 휴식을 취할 수 있도록 돕는 타이머 웹 애플리케이션입니다. 자연스러운 사용자 경험과 직관적인 인터페이스를 제공하기 위해 UX와 코드를 체계적으로 설계했습니다.

---

## **UX 문서**

### **1. 타이머 기능**
- **5가지 모드:**
  - **싱잉볼:** 1분 타이머 + 종료 알람 (배경 음악 없음).
  - **5분, 15분, 30분:** 타이머 시작 시 배경 음악 페이드 인, 종료 10초 전 페이드 아웃.
  - **연속 모드:** 60분 주기 반복 + 배경 색상 변화 + 진행 바 애니메이션.

### **2. 디자인 요소**
- **진행 바:** SVG 기반 원형 진행 바. 60분 주기로 회전하는 시계 컨셉.
- **타이머 버튼:** 각 모드에 맞는 이모지와 색상.
- **배경 색상:** 자연스러운 그라데이션 배경.

### **3. 사용자 흐름**
1. **타이머 선택:** 사용자가 원하는 모드를 선택하여 타이머 시작.
2. **타이머 진행:** 
   - 실시간 업데이트(남은 시간 및 진행 바).
   - 배경 색상 변화: 연한 녹색 → 진한 녹색 → 연한 녹색.
3. **타이머 종료:**
   - 알람 및 배경 음악 조정.
   - 연속 모드에서 60분 주기로 반복.

### **4. 사운드 디자인**
- **배경 음악:** 자연의 편안함 강조.
- **알람:** 싱잉볼 사운드를 기반으로 명상적인 마무리 제공.

---

## **코드 문서**

### **1. 주요 변수**
```javascript
const MODES = {
  SINGING_BOWL: { time: 60, music: false },
  FIVE_MIN: { time: 300, music: true },
  FIFTEEN_MIN: { time: 900, music: true },
  THIRTY_MIN: { time: 1800, music: true },
  CONTINUOUS: { time: 3600, music: true },
};

let currentMode = null;
let timeLeft = 0;
let isRunning = false;
const FULL_DASH_ARRAY = 283; // 원형 진행 바 전체 둘레 길이
```

---

### **2. 주요 함수**

#### **타이머 로직**
```javascript
function startTimer(mode) {
  currentMode = mode;
  timeLeft = MODES[mode].time;
  isRunning = true;

  if (MODES[mode].music) fadeInMusic();

  const interval = setInterval(() => {
    timeLeft--;
    updateProgressBar(timeLeft, MODES[mode].time);
    updateTimerDisplay(timeLeft);

    if (timeLeft <= 0) {
      clearInterval(interval);
      isRunning = false;
      handleTimerEnd();
    }
  }, 1000);
}

function handleTimerEnd() {
  if (currentMode === "SINGING_BOWL") {
    playAlarm();
  } else {
    fadeOutMusic(() => playAlarm());
    if (currentMode === "CONTINUOUS") startTimer("CONTINUOUS");
  }
}
```

---

### **3. UI 업데이트**

#### **진행 바 업데이트**
```javascript
function updateProgressBar(timeLeft, totalTime) {
  const percentage = (timeLeft / totalTime) * 100;
  const offset = (1 - percentage / 100) * FULL_DASH_ARRAY;
  document.querySelector(".progress-ring__circle").style.strokeDashoffset = offset;
}
```

#### **타이머 디스플레이 업데이트**
```javascript
function updateTimerDisplay(timeLeft) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById("current-time").textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}
```

---

### **4. 배경 색상 전환**
```javascript
function updateBackgroundColor(timeElapsed, totalTime) {
  const progress = timeElapsed / totalTime;
  const startColor = [144, 238, 144]; // 연한 녹색
  const endColor = [34, 139, 34]; // 진한 녹색

  const currentColor = startColor.map((start, index) =>
    Math.floor(start + (endColor[index] - start) * progress)
  );

  document.body.style.background = `rgb(${currentColor.join(",")})`;
}
```

---

### **5. 음악 제어**

#### **음악 페이드 인**
```javascript
function fadeInMusic() {
  const music = document.getElementById("background-music");
  music.volume = 0;
  music.play();

  let volume = 0;
  const interval = setInterval(() => {
    volume += 0.1;
    if (volume >= 1) clearInterval(interval);
    music.volume = volume;
  }, 1000);
}
```

#### **음악 페이드 아웃**
```javascript
function fadeOutMusic(callback) {
  const music = document.getElementById("background-music");
  let volume = music.volume;

  const interval = setInterval(() => {
    volume -= 0.1;
    if (volume <= 0) {
      clearInterval(interval);
      music.pause();
      if (callback) callback();
    }
    music.volume = volume;
  }, 1000);
}
```

#### **알람 재생**
```javascript
function playAlarm() {
  const alarm = document.getElementById("alarm-sound");
  alarm.play();
}
```

---

### **6. 이벤트 리스너**
```javascript
document.querySelectorAll(".timer-option").forEach((button) => {
  button.addEventListener("click", (event) => {
    const mode = event.target.dataset.mode;
    if (isRunning) return; // 이미 실행 중인 경우 무시
    startTimer(mode);
    highlightSelectedButton(button);
  });
});

function highlightSelectedButton(button) {
  document.querySelectorAll(".timer-option").forEach((btn) => btn.classList.remove("active"));
  button.classList.add("active");
}
```

---

### **HTML**
```html
<div class="app">
  <header>
    <h1>Project Flow</h1>
  </header>
  <div class="timer-controls">
    <button class="timer-option" data-mode="SINGING_BOWL">🔔 1분</button>
    <button class="timer-option" data-mode="FIVE_MIN">🌱 5분</button>
    <button class="timer-option" data-mode="FIFTEEN_MIN">🌳 15분</button>
    <button class="timer-option" data-mode="THIRTY_MIN">🌲 30분</button>
    <button class="timer-option" data-mode="CONTINUOUS">♾️ 연속</button>
  </div>
  <div class="timer-display">
    <svg class="progress-ring">
      <circle class="progress-ring__circle" cx="50" cy="50" r="45"></circle>
    </svg>
    <p id="current-time">0:00</p>
  </div>
  <footer>
    <audio id="background-music" src="background.mp3"></audio>
    <audio id="alarm-sound" src="alarm.mp3"></audio>
    <p>Music by: Bill Douglas, Sound That Heals</p>
  </footer>
</div>
```

---

### **CSS**
```css
body {
  font-family: Arial, sans-serif;
  background: linear-gradient(to bottom, #90ee90, #228b22);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

.timer-controls button {
  margin: 5px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.timer-option.active {
  background-color: #228b22;
  color: white;
}
```

---

## **다음 단계**
1. **테스트 환경에서 실행 및 디버깅.**
2. **사용자 피드백 반영 후 개선.**
3. **기능 확장을 위한 추가 작업 계획.**

---

## **해시태그**
#ProjectFlow #UXDocumentation #WebTimer #JavaScriptTimer #UserCenteredDesign
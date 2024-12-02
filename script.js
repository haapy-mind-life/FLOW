const buttons = document.querySelectorAll('.timer-option');
const currentTime = document.getElementById('current-time');
const circle = document.querySelector('.progress-ring__circle');
const music = document.getElementById('background-music');
const alarm = document.getElementById('alarm-sound');

const FULL_DASH_ARRAY = 2 * Math.PI * 140;
let timeLeft = 0;
let totalTime = 0;
let interval;
let isContinuousMode = false;
let isSingingBowlMode = false;

// 오디오 페이드 아웃
function fadeOutAudio(audioElement, duration = 10000, callback) {
  let volume = audioElement.volume;
  const fadeStep = volume / (duration / 100);
  const fadeInterval = setInterval(() => {
    if (volume > 0) {
      volume -= fadeStep;
      audioElement.volume = Math.max(0, volume);
    } else {
      clearInterval(fadeInterval);
      audioElement.pause();
      if (callback) callback();
    }
  }, 100);
}

// 오디오 페이드 인
function fadeInAudio(audioElement, duration = 10000, callback) {
  let volume = 0;
  audioElement.volume = volume;
  audioElement.play();
  const fadeStep = 1 / (duration / 100);
  const fadeInterval = setInterval(() => {
    if (volume < 1) {
      volume += fadeStep;
      audioElement.volume = Math.min(1, volume);
    } else {
      clearInterval(fadeInterval);
      if (callback) callback();
    }
  }, 100);
}

// 원형 진행 바 업데이트
function updateCircleProgress(percentage) {
  const offset = FULL_DASH_ARRAY - (percentage / 100) * FULL_DASH_ARRAY;
  circle.style.strokeDasharray = FULL_DASH_ARRAY;
  circle.style.strokeDashoffset = offset;
}

// 타이머 종료 시 동작
function timerEnd() {
  if (isSingingBowlMode) {
    // 싱잉볼 모드에서는 바로 알람 재생
    alarm.volume = 1;
    alarm.play();
  } else {
    // 배경음악 페이드 아웃
    fadeOutAudio(music, 10000, () => {
      // 배경음악 페이드 아웃 후 알람 재생
      alarm.volume = 1;
      alarm.play();

      alarm.onended = () => {
        if (isContinuousMode) {
          // 연속 모드에서는 배경음악 10초 페이드 인 후 타이머 재시작
          fadeInAudio(music, 10000);
          timeLeft = 1800; // 30분
          totalTime = 1800;
          interval = setInterval(timerTick, 1000);
        }
      };
    });
  }
}

// 타이머 틱 동작
function timerTick() {
  if (timeLeft > 0) {
    timeLeft--;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    currentTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    updateCircleProgress((timeLeft / totalTime) * 100);
  } else {
    clearInterval(interval);
    timerEnd();
  }
}

// 타이머 시작
function startTimer(seconds) {
  clearInterval(interval);

  isContinuousMode = false;
  isSingingBowlMode = false;

  const mode = this.getAttribute('data-mode');

  if (mode === 'continuous') {
    isContinuousMode = true;
    timeLeft = 1800; // 30분
    totalTime = 1800;
    fadeInAudio(music, 2000);
    currentTime.textContent = '';
  } else if (mode === 'singing-bowl') {
    isSingingBowlMode = true;
    timeLeft = seconds;
    totalTime = seconds;
    // 배경음악 없음
    currentTime.textContent = '';
  } else {
    timeLeft = seconds;
    totalTime = seconds;
    fadeInAudio(music, 2000);
  }

  interval = setInterval(timerTick, 1000);
}

// 버튼 클릭 이벤트
buttons.forEach(button => {
  button.addEventListener('click', function() {
    buttons.forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');

    const increment = parseInt(this.getAttribute('data-increment'), 10) || 0;

    startTimer.call(this, increment);
  });
});

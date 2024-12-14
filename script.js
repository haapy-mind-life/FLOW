// JavaScript for Project FLOW

const buttons = document.querySelectorAll('.timer-option');
const svgTimer = document.getElementById('svg-timer');
const timeRemaining = document.getElementById('time-remaining');
const progressCircle = document.querySelector('.progress-ring__circle');
const backgroundMusic = document.getElementById('background-music');
const singingBowlSound = document.getElementById('singing-bowl-sound');
const appContainer = document.getElementById('app');
const historyPopup = document.getElementById('history-popup');
const historyList = document.getElementById('history-list');
const closeHistoryButton = document.getElementById('close-history');
const footer = document.querySelector('.footer');
const FULL_DASH_ARRAY = 2 * Math.PI * 140;

let interval;
let isRunning = false;
let isSingingBowlPlaying = false;
let singingBowlTimeouts = [];
const timerRecords = [];

// 싱잉볼 모드 실행
function playSingingBowlMode() {
  if (isSingingBowlPlaying) return; // 이미 실행 중이면 종료
  console.log('싱잉볼 모드 실행');
  isRunning = true;
  isSingingBowlPlaying = true;

  // 이전 타임아웃 초기화
  clearSingingBowlTimeouts();

  appContainer.classList.add('singing-bowl-mode'); // 배경 모드 활성화
  document.querySelector('.timer-selection').classList.add('hidden');
  svgTimer.classList.add('hidden');

  // 싱잉볼 음원 재생 (페이드인 없음)
  singingBowlSound.volume = 1;
  singingBowlSound.currentTime = 0;
  singingBowlSound.play().catch(() => {
    console.error('싱잉볼 음원 재생 오류');
  });

  // 10초 후 페이드아웃 시작
  const fadeOutStartTimeout = setTimeout(() => {
    fadeOutAudio(singingBowlSound, 5000);
    const resetTimeout = setTimeout(() => {
      resetSingingBowlUI();
    }, 5000); // 페이드아웃 완료 후 UI 리셋
    singingBowlTimeouts.push(resetTimeout);
  }, 10000); // 10초 후 페이드아웃 시작

  singingBowlTimeouts.push(fadeOutStartTimeout);
}

// 싱잉볼 타임아웃 초기화
function clearSingingBowlTimeouts() {
  console.log('싱잉볼 타임아웃 초기화');
  singingBowlTimeouts.forEach(timeout => clearTimeout(timeout));
  singingBowlTimeouts = [];
}

// 싱잉볼 모드 초기화
function resetSingingBowlUI() {
  console.log('싱잉볼 모드 초기화');
  clearSingingBowlTimeouts();
  appContainer.classList.remove('singing-bowl-mode');
  document.querySelector('.timer-selection').classList.remove('hidden');
  isRunning = false;
  isSingingBowlPlaying = false;
  singingBowlSound.pause();
  singingBowlSound.currentTime = 0;
  singingBowlSound.volume = 1; // 초기 볼륨 복원
}

// 타이머 시작
function startTimer(duration) {
  if (isRunning) {
    resetTimer();
  }
  console.log('타이머 시작:', duration, '초');
  let timeLeft = duration;
  isRunning = true;

  progressCircle.style.strokeDasharray = FULL_DASH_ARRAY;
  progressCircle.style.strokeDashoffset = FULL_DASH_ARRAY;

  backgroundMusic.volume = 1; // 배경음악 초기화
  backgroundMusic.currentTime = 0;
  backgroundMusic.play().catch(() => {
    console.error('배경음악 재생 오류');
  });

  const updateTime = () => {
    if (timeLeft > 0) {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timeRemaining.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      progressCircle.style.strokeDashoffset = FULL_DASH_ARRAY * (1 - timeLeft / duration);
      timeLeft--;
    } else {
      clearInterval(interval);
      timeRemaining.textContent = "완료!";
      fadeOutAudio(backgroundMusic, 3000);
      setTimeout(() => {
        resetTimer();
      }, 3000);
    }
  };

  interval = setInterval(updateTime, 1000);
  updateTime();
}

// 페이드 아웃 함수
function fadeOutAudio(audio, duration = 5000) {
  console.log('페이드아웃 시작:', audio.src, 'Duration:', duration);
  const step = audio.volume / (duration / 100);
  const fadeInterval = setInterval(() => {
    if (audio.volume > 0) {
      audio.volume -= step;
    } else {
      console.log('페이드아웃 완료:', audio.src);
      audio.pause();
      clearInterval(fadeInterval);
    }
  }, 100);
}

// 타이머 초기화
function resetTimer() {
  console.log('타이머 초기화');
  clearInterval(interval);
  svgTimer.classList.add('hidden');
  document.querySelector('.timer-selection').style.display = 'flex';
  isRunning = false;
  timeRemaining.textContent = "00:00";
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
}

// 버튼 클릭 이벤트
buttons.forEach((button) => {
  button.addEventListener('click', () => {
    console.log('버튼 클릭:', button.getAttribute('data-increment'), '초');
    const duration = parseInt(button.getAttribute('data-increment'), 10);
    document.querySelector('.timer-selection').style.display = 'none';
    svgTimer.classList.remove('hidden');
    startTimer(duration);
  });
});

// 싱잉볼 버튼 클릭 이벤트
const singingBowlButton = document.getElementById('singing-bowl-mode');
singingBowlButton.addEventListener('click', playSingingBowlMode);

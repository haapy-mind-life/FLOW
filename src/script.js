// 요소 및 상태 변수
const buttons = document.querySelectorAll('.timer-option');
const svgTimer = document.getElementById('svg-timer');
const timeRemaining = document.getElementById('time-remaining');
const progressCircle = document.querySelector('.progress-ring__circle');
const backgroundMusic = document.getElementById('background-music');
const singingBowlSound = document.getElementById('singing-bowl-sound');
const FULL_DASH_ARRAY = 2 * Math.PI * 140;

let isRunning = false;
let isSingingBowlPlaying = false;
let intervalId = null;
let singingBowlTimeouts = [];

// 싱잉볼 모드 실행
function playSingingBowlMode() {
  if (isSingingBowlPlaying || isRunning) return; // 중복 실행 방지

  console.log('싱잉볼 모드 실행');
  resetSingingBowlUI(); // UI 초기화
  isSingingBowlPlaying = true;

  playAudio(singingBowlSound); // 싱잉볼 사운드 재생

  const fadeOutTimeout = setTimeout(() => {
    fadeOutAudio(singingBowlSound, 5000);
    const resetTimeout = setTimeout(resetSingingBowlUI, 5000);
    singingBowlTimeouts.push(resetTimeout);
  }, 10000);

  singingBowlTimeouts.push(fadeOutTimeout);
}

// 싱잉볼 UI 초기화
function resetSingingBowlUI() {
  console.log('싱잉볼 모드 초기화');
  clearTimeouts(singingBowlTimeouts);
  isSingingBowlPlaying = false;
  singingBowlSound.pause();
  singingBowlSound.currentTime = 0;
}

// 타이머 실행
function startTimer(duration) {
  if (isRunning || isSingingBowlPlaying) return; // 중복 실행 방지
  console.log(`타이머 시작: ${duration}초`);
  isRunning = true;

  let timeLeft = duration;
  progressCircle.style.strokeDasharray = FULL_DASH_ARRAY;
  progressCircle.style.strokeDashoffset = FULL_DASH_ARRAY;

  playAudio(backgroundMusic); // 배경 음악 재생

  intervalId = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(intervalId);
      fadeOutAudio(backgroundMusic, 3000);
      timeRemaining.textContent = '완료!';
      setTimeout(resetTimer, 3000);
    } else {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timeRemaining.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      progressCircle.style.strokeDashoffset = FULL_DASH_ARRAY * (1 - timeLeft / duration);
      timeLeft--;
    }
  }, 1000);
}

// 타이머 초기화
function resetTimer() {
  console.log('타이머 초기화');
  isRunning = false;
  clearInterval(intervalId);
  svgTimer.classList.add('hidden');
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
  timeRemaining.textContent = '00:00';
}

// 오디오 재생
function playAudio(audio) {
  if (!audio.paused) return;
  audio.currentTime = 0;
  audio.volume = 1;
  audio.play().catch(err => console.error(`오디오 재생 오류: ${err}`));
}

// 오디오 페이드아웃
function fadeOutAudio(audio, duration = 5000) {
  if (audio.paused) return;
  const step = audio.volume / (duration / 100);
  const fadeInterval = setInterval(() => {
    if (audio.volume > 0) {
      audio.volume -= step;
    } else {
      clearInterval(fadeInterval);
      audio.pause();
      console.log('페이드아웃 완료');
    }
  }, 100);
}

// 타임아웃 배열 초기화
function clearTimeouts(timeouts) {
  timeouts.forEach(timeout => clearTimeout(timeout));
  timeouts.length = 0;
}

// 버튼 클릭 이벤트 등록
buttons.forEach(button => {
  button.addEventListener('click', () => {
    const duration = parseInt(button.getAttribute('data-increment'), 10);
    svgTimer.classList.remove('hidden');
    startTimer(duration);
  });
});

// 싱잉볼 모드 버튼 이벤트 등록
document.getElementById('singing-bowl-mode').addEventListener('click', playSingingBowlMode);

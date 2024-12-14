const buttons = document.querySelectorAll('.timer-option');
const svgTimer = document.getElementById('svg-timer');
const timeRemaining = document.getElementById('time-remaining');
const progressCircle = document.querySelector('.progress-ring__circle');
const backgroundMusic = document.getElementById('background-music');
const singingBowlSound = document.getElementById('singing-bowl-sound');
const copyrightPopup = document.getElementById('copyright-popup');
const closePopup = document.getElementById('close-popup');
const FULL_DASH_ARRAY = 2 * Math.PI * 140;

let interval;
let isRunning = false;

// 페이드인
function fadeInAudio(audio, duration = 5000) {
  audio.volume = 0;
  audio.play().catch(() => {});
  const step = 1 / (duration / 100);
  const fadeInterval = setInterval(() => {
    if (audio.volume < 1) {
      audio.volume += step;
    } else {
      clearInterval(fadeInterval);
    }
  }, 100);
}

// 페이드아웃
function fadeOutAudio(audio, duration = 5000) {
  const step = audio.volume / (duration / 100);
  const fadeInterval = setInterval(() => {
    if (audio.volume > 0) {
      audio.volume -= step;
    } else {
      audio.pause();
      clearInterval(fadeInterval);
    }
  }, 100);
}

// 타이머 시작
function startTimer(duration) {
  let timeLeft = duration;
  isRunning = true;

  progressCircle.style.strokeDasharray = FULL_DASH_ARRAY;
  progressCircle.style.strokeDashoffset = FULL_DASH_ARRAY;

  fadeInAudio(backgroundMusic);

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
      fadeOutAudio(backgroundMusic);
      isRunning = false;
    }
  };

  interval = setInterval(updateTime, 1000);
  updateTime();
}

// 초기화
function resetTimer() {
  clearInterval(interval);
  fadeOutAudio(backgroundMusic); // 명상음악 종료
  svgTimer.classList.add('hidden');
  document.querySelector('.timer-selection').style.display = 'flex';
  isRunning = false;
}

// 버튼 클릭
buttons.forEach((button) => {
  button.addEventListener('click', () => {
    if (isRunning) {
      resetTimer();
    } else {
      const duration = parseInt(button.getAttribute('data-increment'), 10);
      document.querySelector('.timer-selection').style.display = 'none';
      svgTimer.classList.remove('hidden');
      startTimer(duration);
    }
  });
});

// 싱잉볼 모드
document.getElementById('singing-bowl-mode').addEventListener('click', () => {
  if (isRunning) return; // 타이머 진행 중에는 싱잉볼 모드 실행 안 됨

  fadeInAudio(singingBowlSound, 5000); // 5초 동안 페이드인
  setTimeout(() => fadeOutAudio(singingBowlSound, 10000), 5000); // 10초 동안 페이드아웃
});

// 저작권 팝업 표시
document.getElementById('copyright-info').addEventListener('click', () => {
  copyrightPopup.classList.remove('hidden');
});

// 저작권 팝업 닫기
closePopup.addEventListener('click', () => {
  copyrightPopup.classList.add('hidden');
});

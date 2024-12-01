const buttons = document.querySelectorAll('.timer-option');
const currentTime = document.getElementById('current-time');
const circle = document.querySelector('.progress-ring__circle');
const music = document.getElementById('background-music');
const alarm = document.getElementById('alarm-sound');

const FULL_DASH_ARRAY = 2 * Math.PI * 140;
let timeLeft = 0;
let interval;

// 음악 페이드 아웃
function fadeOutMusic(audioElement) {
  let volume = audioElement.volume;
  const fadeInterval = setInterval(() => {
    if (volume > 0) {
      volume -= 0.05;
      audioElement.volume = Math.max(0, volume);
    } else {
      clearInterval(fadeInterval);
      audioElement.pause();
    }
  }, 200);
}

// 원형 진행 바 업데이트
function updateCircleProgress(percentage) {
  const offset = FULL_DASH_ARRAY - (percentage / 100) * FULL_DASH_ARRAY;
  circle.style.strokeDasharray = FULL_DASH_ARRAY;
  circle.style.strokeDashoffset = offset;
}

// 타이머 시작
function startTimer(seconds) {
  clearInterval(interval);
  timeLeft = seconds;

  music.volume = 1;
  music.play();

  interval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      currentTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      updateCircleProgress((timeLeft / 1800) * 100); // 30분 기준
    } else {
      clearInterval(interval);
      fadeOutMusic(music);
      alarm.play();
    }
  }, 1000);
}

// 버튼 클릭 이벤트
buttons.forEach(button => {
  button.addEventListener('click', () => {
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const increment = parseInt(button.getAttribute('data-increment'), 10) || 0;
    startTimer(increment);
  });
});

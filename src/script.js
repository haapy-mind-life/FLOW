const buttons = document.querySelectorAll('.timer-option');
const timerSelection = document.querySelector('.timer-selection');
const svgTimer = document.getElementById('svg-timer');
const timeRemaining = document.getElementById('time-remaining');
const progressCircle = document.querySelector('.progress-ring__circle');
const backgroundMusic = document.getElementById('background-music');
const singingBowlSound = document.getElementById('singing-bowl-sound');
const singingBowlButton = document.getElementById('singing-bowl-mode');

const FULL_DASH_ARRAY = 2 * Math.PI * 120;
const HAPTIC_SHORT = 10;
const HAPTIC_MEDIUM = 30;

let isRunning = false;
let isSingingBowlPlaying = false;
let intervalId = null;
let singingBowlTimeouts = [];
let audioUnlocked = false;

function unlockAudioOnce() {
  if (audioUnlocked) return;
  const unlock = (audio) => {
    if (!audio) return;
    audio.muted = true;
    const playPromise = audio.play();
    if (!playPromise) return;
    playPromise
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      })
      .catch(() => {
        audio.muted = false;
      });
  };

  unlock(backgroundMusic);
  unlock(singingBowlSound);
  audioUnlocked = true;
}

function haptic(duration = 20) {
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
}

function playAudio(audio) {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
  audio.volume = 1;
  const playPromise = audio.play();
  if (playPromise) {
    playPromise.catch((err) => console.error('오디오 재생 오류:', err));
  }
}

function fadeOutAudio(audio, duration = 5000, shouldReset = true) {
  if (!audio || audio.paused) return;
  const stepInterval = 100;
  const steps = Math.max(1, duration / stepInterval);
  const step = audio.volume / steps;
  const fadeTimer = setInterval(() => {
    const nextVolume = Math.max(0, audio.volume - step);
    if (nextVolume <= 0) {
      clearInterval(fadeTimer);
      audio.pause();
      if (shouldReset) {
        audio.currentTime = 0;
      }
      audio.volume = 1;
    } else {
      audio.volume = nextVolume;
    }
  }, stepInterval);
}

function clearTimeouts(timeouts) {
  timeouts.forEach((timeout) => clearTimeout(timeout));
  timeouts.length = 0;
}

function resetTimer() {
  isRunning = false;
  clearInterval(intervalId);
  intervalId = null;

  timerSelection.classList.remove('hidden');
  svgTimer.classList.add('hidden');
  progressCircle.style.strokeDashoffset = FULL_DASH_ARRAY;
  timeRemaining.textContent = '00:00';

  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    backgroundMusic.volume = 1;
  }
}

function startTimer(duration) {
  if (isRunning || isSingingBowlPlaying) {
    haptic(HAPTIC_SHORT);
    return;
  }

  isRunning = true;
  let timeLeft = duration;

  progressCircle.style.strokeDasharray = FULL_DASH_ARRAY;
  progressCircle.style.strokeDashoffset = FULL_DASH_ARRAY;
  timeRemaining.textContent = formatTime(timeLeft);

  timerSelection.classList.add('hidden');
  svgTimer.classList.remove('hidden');

  playAudio(backgroundMusic);

  intervalId = setInterval(() => {
    timeLeft -= 1;
    if (timeLeft < 0) {
      clearInterval(intervalId);
      intervalId = null;
      fadeOutAudio(backgroundMusic, 4000);
      timeRemaining.textContent = '완료!';
      setTimeout(resetTimer, 4000);
      return;
    }

    timeRemaining.textContent = formatTime(timeLeft);
    progressCircle.style.strokeDashoffset = FULL_DASH_ARRAY * (1 - timeLeft / duration);
  }, 1000);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function stopSingingBowlMode() {
  clearTimeouts(singingBowlTimeouts);
  if (singingBowlSound) {
    if (!singingBowlSound.paused) {
      fadeOutAudio(singingBowlSound, 500);
    } else {
      singingBowlSound.pause();
      singingBowlSound.currentTime = 0;
      singingBowlSound.volume = 1;
    }
  }
  isSingingBowlPlaying = false;
  singingBowlButton?.setAttribute('aria-pressed', 'false');
}

function playSingingBowlMode() {
  if (isSingingBowlPlaying) {
    haptic(HAPTIC_SHORT);
    stopSingingBowlMode();
    return;
  }
  if (isRunning) {
    haptic(HAPTIC_SHORT);
    return;
  }

  clearTimeouts(singingBowlTimeouts);
  isSingingBowlPlaying = true;
  singingBowlButton?.setAttribute('aria-pressed', 'true');
  haptic(HAPTIC_MEDIUM);

  playAudio(singingBowlSound);

  const fadeOutTimeout = setTimeout(() => {
    fadeOutAudio(singingBowlSound, 5000);
    const resetTimeout = setTimeout(stopSingingBowlMode, 5000);
    singingBowlTimeouts.push(resetTimeout);
  }, 10000);

  singingBowlTimeouts.push(fadeOutTimeout);
}

buttons.forEach((button) => {
  button.addEventListener(
    'click',
    () => {
      if (isRunning || isSingingBowlPlaying) {
        haptic(HAPTIC_SHORT);
        return;
      }
      const duration = parseInt(button.getAttribute('data-increment'), 10);
      if (Number.isNaN(duration)) return;
      haptic(HAPTIC_MEDIUM);
      startTimer(duration);
    },
    { passive: true }
  );
});

singingBowlButton?.addEventListener(
  'click',
  () => {
    playSingingBowlMode();
  },
  { passive: true }
);

window.addEventListener('pointerdown', unlockAudioOnce, { once: true });
window.addEventListener('keydown', unlockAudioOnce, { once: true });

function fixVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', fixVH);
window.addEventListener('orientationchange', fixVH);

fixVH();

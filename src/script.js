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

/* === 기록 & 내보내기 & 훅 (Add-on) === */
const STORAGE_KEY = 'flow.sessions.v1';
let currentSession = null;
let startedAt = 0;

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"sessions":[]}');
  } catch (e) {
    return { sessions: [] };
  }
}

function pushSession(session) {
  const all = loadAll();
  all.sessions.push(session);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all;
}

function parseTags() {
  const raw = (document.getElementById('session-tags')?.value || '').trim();
  if (!raw) return [];
  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function startFlow(duration, mode = 'focus') {
  if (isRunning || isSingingBowlPlaying) {
    haptic(HAPTIC_SHORT);
    return;
  }
  currentSession = {
    id: new Date().toISOString(),
    mode,
    presetSec: duration,
    actualSec: 0,
    tags: [],
    note: '',
    success: false,
  };
  startedAt = Date.now();

  const startStopButton = document.getElementById('start-stop-btn');
  if (startStopButton) {
    startStopButton.setAttribute('aria-pressed', 'true');
    startStopButton.textContent = '정지';
  }
  haptic(HAPTIC_MEDIUM);
  svgTimer?.classList?.remove('hidden');
  startTimer(duration);
}

function completeFlow(success) {
  if (!currentSession) return;
  currentSession.actualSec = Math.round((Date.now() - startedAt) / 1000);
  currentSession.success = !!success;
  currentSession.tags = parseTags();
  currentSession.note = (document.getElementById('session-note')?.value || '').trim();
  pushSession(currentSession);

  const startStopButton = document.getElementById('start-stop-btn');
  if (startStopButton) {
    startStopButton.setAttribute('aria-pressed', 'false');
    startStopButton.textContent = '시작';
  }
  haptic(HAPTIC_SHORT);
  currentSession = null;
}

function stopFlowManually() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  completeFlow(false);
  resetTimer();
}

function successRateToday() {
  const today = new Date().toISOString().slice(0, 10);
  const { sessions } = loadAll();
  const daySessions = sessions.filter((session) => session.id.startsWith(today));
  if (!daySessions.length) return 0;
  const completed = daySessions.filter((session) => session.success).length;
  return completed / daySessions.length;
}

function exportMarkdownDaily(dateStr = new Date().toISOString().slice(0, 10)) {
  const { sessions } = loadAll();
  const daySessions = sessions.filter((session) => session.id.startsWith(dateStr));
  const totalMinutes = Math.round(
    daySessions.reduce(
      (acc, session) => acc + (session.actualSec || session.presetSec || 0),
      0
    ) / 60
  );
  const success = daySessions.length
    ? daySessions.filter((session) => session.success).length / daySessions.length
    : 0;
  const tags = daySessions.flatMap((session) => session.tags || []);
  const topTags = [...new Set(tags)].slice(0, 5);
  const modes = [...new Set(daySessions.map((session) => session.mode))];

  const lines = [
    `---`,
    `date: ${dateStr}`,
    `total_minutes: ${totalMinutes}`,
    `success_rate: ${success.toFixed(2)}`,
    `top_tags: ${JSON.stringify(topTags)}`,
    `modes: ${JSON.stringify(modes)}`,
    `---`,
    '',
    '## Sessions',
    ...daySessions.map((session) => {
      const time = session.id.slice(11, 16);
      const minutes = Math.round(
        (session.actualSec || session.presetSec || 0) / 60
      );
      const status = session.success ? '✅' : '❌';
      const tagLine = session.tags && session.tags.length ? ` | tags: ${session.tags.join(', ')}` : '';
      const noteLine = session.note ? ` | "${session.note}"` : '';
      return `- ${time} | ${session.mode} | ${minutes}m | ${status}${tagLine}${noteLine}`;
    }),
    '',
    '## GPT 요약',
    '- (여기에 GPT 분석 결과 붙여넣기)',
    '',
  ];

  const markdown = lines.join('\n');
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown' }));
  anchor.download = `${dateStr}.md`;
  anchor.click();
}

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
      completeFlow(true);
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
      startFlow(duration, 'focus');
    },
    { passive: true }
  );
});

const startStopButton = document.getElementById('start-stop-btn');
if (startStopButton) {
  startStopButton.addEventListener(
    'click',
    () => {
      const checkedPreset = document.querySelector('input[name="preset"]:checked');
      const duration = parseInt((checkedPreset?.value || '300'), 10);
      if (!isRunning) {
        startFlow(Number.isNaN(duration) ? 300 : duration, 'focus');
      } else {
        stopFlowManually();
      }
    },
    { passive: true }
  );
}

document.getElementById('export-md-btn')?.addEventListener(
  'click',
  () => exportMarkdownDaily(),
  { passive: true }
);

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

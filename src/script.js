/* ============ 전역 상태 ============ */
let isRunning = false;
let intervalId = null;
let totalDuration = 0;      // 초
let remaining = 0;          // 초

// 요소
const ring = document.getElementById('ring-circle');
const timeLabel = document.getElementById('time-remaining');
const svgTimer = document.getElementById('progress-ring');
const backgroundMusic = document.getElementById('background-music');
const singingBowlSound = document.getElementById('singing-bowl-sound');

const CIRCUM = 2 * Math.PI * 54; // r=54 (styles.css와 일치)

/* ============ 모바일 보정 & 오디오 언락 ============ */
let audioUnlocked = false;
window.addEventListener('pointerdown', () => {
  if (audioUnlocked) return;
  try {
    backgroundMusic?.play()?.then(() => {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
      audioUnlocked = true;
    }).catch(()=>{});
  } catch(e){}
}, { once:true });

function fixVH(){
  document.documentElement.style.setProperty('--vh', `${window.innerHeight*0.01}px`);
}
window.addEventListener('resize', fixVH);
window.addEventListener('orientationchange', fixVH);
fixVH();

/* ============ 기록 저장/내보내기 ============ */
const STORAGE_KEY = 'flow.sessions.v1';
let currentSession = null;
let startedAt = 0;

function loadAll(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"sessions":[]}'); }
  catch(e){ return { sessions: [] }; }
}
function pushSession(s){
  const all = loadAll();
  all.sessions.push(s);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all;
}
function parseTags(){
  const raw = (document.getElementById('session-tags')?.value || '').trim();
  return raw ? raw.split(',').map(s=>s.trim()).filter(Boolean) : [];
}

function exportMarkdownDaily(dateStr = new Date().toISOString().slice(0,10)) {
  const {sessions} = loadAll();
  const day = sessions.filter(s=>s.id.startsWith(dateStr));
  const totalMin = Math.round(day.reduce((a,s)=>a+(s.actualSec||s.presetSec||0),0)/60);
  const success = day.length ? (day.filter(s=>s.success).length/day.length) : 0;
  const tags = day.flatMap(s=>s.tags||[]);
  const topTags = [...new Set(tags)].slice(0,5);
  const modes = [...new Set(day.map(s=>s.mode))];

  const lines = [
    `---`,
    `date: ${dateStr}`,
    `total_minutes: ${totalMin}`,
    `success_rate: ${success.toFixed(2)}`,
    `top_tags: ${JSON.stringify(topTags)}`,
    `modes: ${JSON.stringify(modes)}`,
    `---`,
    ``,
    `## Sessions`,
    ...day.map(s=>{
      const time = s.id.slice(11,16);
      const min = Math.round((s.actualSec||s.presetSec||0)/60);
      const ok = s.success ? '✅' : '❌';
      const t = (s.tags && s.tags.length) ? ` | tags: ${s.tags.join(', ')}` : '';
      const n = s.note ? ` | "${s.note}"` : '';
      return `- ${time} | ${s.mode} | ${min}m | ${ok}${t}${n}`;
    }),
    ``,
    `## GPT 요약`,
    `- (여기에 GPT 분석 결과 붙여넣기)`,
    ``
  ];
  const md = lines.join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([md], {type:'text/markdown'}));
  a.download = `${dateStr}.md`;
  a.click();
}
document.getElementById('export-md-btn')?.addEventListener('click', exportMarkdownDaily);

/* ============ 기록 패널 + KPI ============ */
function renderTodayKPI(){
  const today = new Date().toISOString().slice(0,10);
  const { sessions } = loadAll();
  const day = sessions.filter(s=>s.id.startsWith(today));

  const totalMin = Math.round(day.reduce((a,s)=>a+(s.actualSec||s.presetSec||0),0)/60);
  const successRate = day.length ? Math.round((day.filter(s=>s.success).length/day.length)*100) : 0;

  const totalEl = document.getElementById('kpi-total-min');
  const rateEl  = document.getElementById('kpi-success-rate');
  if (totalEl) totalEl.textContent = `${totalMin}m`;
  if (rateEl)  rateEl.textContent  = `${successRate}%`;
}
function renderTodayHistory(){
  const panel = document.getElementById('history-panel');
  if(!panel) return;
  const ul = document.getElementById('history-list');
  const today = new Date().toISOString().slice(0,10);
  const { sessions } = loadAll();
  const day = sessions.filter(s => s.id.startsWith(today));
  // KPI 먼저
  renderTodayKPI();

  ul.innerHTML = day.length ? '' : '<li>기록이 없습니다.</li>';
  day.sort((a,b)=> a.id.localeCompare(b.id));
  day.forEach(s=>{
    const min = Math.round((s.actualSec || s.presetSec || 0)/60);
    const ok = s.success ? '✅' : '❌';
    const t  = (s.tags && s.tags.length) ? ` | #${s.tags.join(' #')}` : '';
    const n  = s.note ? ` | "${s.note}"` : '';
    const time = s.id.slice(11,16);
    const li = document.createElement('li');
    li.textContent = `${time} | ${s.mode} | ${min}m | ${ok}${t}${n}`;
    ul.appendChild(li);
  });
}
document.getElementById('view-history')?.addEventListener('click', ()=>{
  const panel = document.getElementById('history-panel');
  if(!panel){ alert('기록 패널이 활성화되지 않았습니다.'); return; }
  panel.classList.toggle('open');
  if(panel.classList.contains('open')) renderTodayHistory();
});

/* ============ YouTube IFrame 오디오 전용 ============ */
let ytPlayer = null;
let ytReady = false;

function loadYTApi(){
  if(window.YT && window.YT.Player){ ytReady = true; return; }
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
  window.onYouTubeIframeAPIReady = () => { ytReady = true; };
}
loadYTApi();

function parseYouTubeId(url){
  const m =
    url.match(/[?&]v=([^&#]+)/) ||
    url.match(/youtu\.be\/([^?&#/]+)/) ||
    url.match(/youtube\.com\/embed\/([^?&#/]+)/);
  return m ? m[1] : null;
}

function ensureYtPlayer(videoId){
  const host = document.getElementById('yt-audio');
  if(!host) return;
  if (ytPlayer) {
    ytPlayer.loadVideoById(videoId);
    try { ytPlayer.setLoop?.(true); } catch(e){}
    return;
  }
  ytPlayer = new YT.Player('yt-audio', {
    height: '0', width: '0',
    videoId,
    playerVars: {
      autoplay: 0, controls: 0, rel: 0, iv_load_policy: 3, modestbranding: 1,
      playsinline: 1, loop: 1, playlist: videoId
    },
    events: { onReady:()=>{}, onStateChange:()=>{} }
  });
}
function setYouTubeAudio(url){
  const vid = parseYouTubeId(url);
  if(!vid){ alert('유효한 YouTube 링크가 아닙니다.'); return; }
  if(!ytReady){ setTimeout(()=>setYouTubeAudio(url), 300); return; }
  ensureYtPlayer(vid);
}
function isYTReadyToUse(){ return !!(ytReady && ytPlayer); }
function startSessionAudio(){
  try{
    if(isYTReadyToUse()){
      ytPlayer.setVolume?.(100);
      ytPlayer.playVideo?.();
      backgroundMusic?.pause?.();
      if(backgroundMusic){ backgroundMusic.currentTime = 0; }
    } else {
      backgroundMusic?.play?.(); // fallback
    }
  }catch(e){}
}
function stopSessionAudio(){
  try{ ytPlayer?.pauseVideo?.(); }catch(e){}
  try{
    backgroundMusic?.pause?.();
    if(backgroundMusic){ backgroundMusic.currentTime = 0; }
  }catch(e){}
}
document.getElementById('yt-apply')?.addEventListener('click', ()=>{
  const url = (document.getElementById('yt-url')?.value||'').trim();
  if(!url) return;
  setYouTubeAudio(url);
});

/* ============ 타이머 로직 ============ */
function formatTime(sec){
  const m = Math.floor(sec/60);
  const s = sec%60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function setRingProgress(fraction){ // 1.0 = 가득, 0.0 = 0
  const offset = CIRCUM * (1 - fraction);
  ring.style.strokeDasharray = `${CIRCUM}`;
  ring.style.strokeDashoffset = `${offset}`;
}

function startTimer(duration){
  // 이미 실행중이면 무시
  if(isRunning) return;
  isRunning = true;
  totalDuration = duration;
  remaining = duration;

  // 초기 렌더
  timeLabel.textContent = formatTime(remaining);
  setRingProgress(1);

  // 주기
  clearInterval(intervalId);
  intervalId = setInterval(()=>{
    remaining--;
    if(remaining < 0) remaining = 0;
    timeLabel.textContent = formatTime(remaining);

    const fraction = totalDuration ? (remaining / totalDuration) : 0;
    setRingProgress(fraction);

    if(remaining <= 0){
      clearInterval(intervalId);
      intervalId = null;
      isRunning = false;

      // 세션 완료 → 기록 & 오디오 정리
      completeFlow(true);
      stopSessionAudio();

      // 기존 종료 알람 유지 (싱잉볼 등)
      try {
        singingBowlSound.currentTime = 0;
        singingBowlSound.play();
      } catch(e){}

      renderTodayKPI(); // KPI 갱신
    }
  }, 1000);
}

function stopTimer(){
  if(!isRunning) return;
  clearInterval(intervalId);
  intervalId = null;
  isRunning = false;
}

/* ============ Start/Stop + 기록 훅 ============ */
function startFlow(duration, mode='focus'){
  if(isRunning) return;
  // 싱잉볼이 켜져 있다면 끄기(중첩 방지, 필요시)
  try { if (window.isSingingBowlPlaying) { window.stopSingingBowlMode?.(); } } catch(e){}

  currentSession = {
    id: new Date().toISOString(),
    mode, presetSec: duration, actualSec: 0,
    tags: [], note: '', success: false
  };
  startedAt = Date.now();

  document.getElementById('start-stop-btn')?.setAttribute('aria-pressed','true');
  document.getElementById('start-stop-btn').textContent = '정지';
  svgTimer?.classList?.remove('hidden');

  startTimer(duration);
  startSessionAudio();   // 타이머 동안 유튜브 오디오만
}
function completeFlow(success){
  if(!currentSession) return;
  currentSession.actualSec = Math.round((Date.now()-startedAt)/1000);
  currentSession.success = !!success;
  currentSession.tags    = parseTags();
  currentSession.note    = (document.getElementById('session-note')?.value||'').trim();

  pushSession(currentSession);
  currentSession = null;

  document.getElementById('start-stop-btn')?.setAttribute('aria-pressed','false');
  document.getElementById('start-stop-btn').textContent = '시작';
}
function stopFlowManually(){
  if(!isRunning) return;
  stopTimer();
  completeFlow(false);
  stopSessionAudio();
  renderTodayKPI(); // KPI 갱신
}

// 버튼 바인딩
document.getElementById('start-stop-btn')?.addEventListener('click', ()=>{
  const checked = document.querySelector('input[name="preset"]:checked');
  const duration = parseInt((checked?.value)||'300', 10);
  if(!isRunning){ startFlow(duration, 'focus'); }
  else { stopFlowManually(); }
});
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
  if (isRunning) {
    haptic(HAPTIC_SHORT);
    return;
  }
  if (isSingingBowlPlaying) {
    try {
      stopSingingBowlMode();
    } catch (e) {}
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
  startSessionAudio();
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
  stopSessionAudio();
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

function ensureYtPlayer(videoId) {
  const host = document.getElementById('yt-audio');
  if (!host) return;
  if (ytPlayer) {
    ytPlayer.loadVideoById(videoId);
    try {
      ytPlayer.setLoop?.(true);
    } catch (e) {}
    return;
  }
  ytPlayer = new YT.Player('yt-audio', {
    height: '0',
    width: '0',
    videoId,
    playerVars: {
      autoplay: 0,
      controls: 0,
      rel: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      loop: 1,
      playlist: videoId,
    },
    events: {
      onReady: () => {
        ytReady = true;
        if (isRunning) {
          startSessionAudio();
        }
      },
      onStateChange: () => {},
    },
  });
}

function isYTReadyToUse() {
  return !!(ytReady && ytPlayer);
}

function startSessionAudio() {
  try {
    if (isYTReadyToUse()) {
      ytPlayer.setVolume?.(100);
      ytPlayer.playVideo?.();
      if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
      }
    } else {
      backgroundMusic?.play?.();
    }
  } catch (e) {}
}

function stopSessionAudio() {
  try {
    ytPlayer?.pauseVideo?.();
  } catch (e) {}
  try {
    if (backgroundMusic) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    }
  } catch (e) {}
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

  intervalId = setInterval(() => {
    timeLeft -= 1;
    if (timeLeft < 0) {
      clearInterval(intervalId);
      intervalId = null;
      completeFlow(true);
      stopSessionAudio();
      timeRemaining.textContent = '완료!';
      try {
        singingBowlSound.currentTime = 0;
        singingBowlSound.play();
      } catch (e) {}
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

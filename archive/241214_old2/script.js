// 변수 정의
const buttons = document.querySelectorAll('.timer-option');
const currentTime = document.getElementById('current-time');
const circle = document.querySelector('.progress-ring__circle');
const music = document.getElementById('background-music');
const alarm = document.getElementById('alarm-sound');

const FULL_DASH_ARRAY = 2 * Math.PI * 140; // 원형 진행 바의 전체 둘레 길이
let timeLeft = 0;
let totalTime = 0;
let interval;
let isContinuousMode = false;
let isSingingBowlMode = false;
let isRunning = false; // 중복 실행 방지 플래그

// 오디오 초기화
music.volume = 1; // 기본 볼륨 설정
music.load(); // 오디오 파일 초기화

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

// 싱잉볼 사운드 페이드 아웃 (마지막 10초 처리)
function fadeOutSingingBowl(audioElement) {
    fadeOutAudio(audioElement, 10000, () => {
        console.log("Singing bowl sound faded out.");
    });
}

// 원형 진행 바 업데이트
function updateCircleProgress(percentage) {
    const offset = FULL_DASH_ARRAY - (percentage / 100) * FULL_DASH_ARRAY;
    circle.style.strokeDasharray = FULL_DASH_ARRAY;
    circle.style.strokeDashoffset = offset;
}

// 타이머 종료 처리
function timerEnd() {
    if (isSingingBowlMode) {
        // 싱잉볼 모드: 바로 알람 재생 후 페이드 아웃
        alarm.volume = 1;
        alarm.play();
        setTimeout(() => fadeOutSingingBowl(alarm), 12000); // 12초 후 페이드 아웃 시작 (총 재생 시간 22초)
    } else {
        // 배경음악 페이드 아웃
        fadeOutAudio(music, 10000, () => {
            // 알람 재생
            alarm.volume = 1;
            alarm.play();
            alarm.onended = () => {
                if (isContinuousMode) {
                    // 연속 모드: 배경음악 페이드 인 후 타이머 재시작
                    fadeInAudio(music, 10000);
                    startTimer(1800); // 30분 반복
                }
            };
        });
    }
    isRunning = false; // 타이머 종료 후 플래그 초기화
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
    if (isRunning) return; // 중복 실행 방지
    isRunning = true;

    clearInterval(interval);
    timeLeft = seconds;
    totalTime = seconds;

    if (isSingingBowlMode) {
        currentTime.textContent = '';
        return;
    }

    fadeInAudio(music, 2000); // 타이머 시작 시 배경음악 페이드 인
    interval = setInterval(timerTick, 1000);
}

// 버튼 클릭 이벤트
buttons.forEach((button) => {
    button.addEventListener('click', function () {
        if (isRunning) return; // 중복 실행 방지
        buttons.forEach((btn) => btn.classList.remove('active'));
        this.classList.add('active');

        const increment = parseInt(this.getAttribute('data-increment'), 10);
        const mode = this.getAttribute('data-mode');

        isSingingBowlMode = mode === 'singing-bowl';
        isContinuousMode = mode === 'continuous';

        startTimer(increment || 0);
    });
});

// 오디오 페이드 인
function fadeInAudio(audioElement, duration = 10000, callback) {
    let volume = 0;
    audioElement.volume = volume;
    audioElement.play().catch((error) => {
        console.error('Audio playback failed:', error);
    });
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

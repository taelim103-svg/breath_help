'use strict';

const PHASES = [
  { key: 'inhale', label: '들이마시기', sec: 7, voice: '들이마시세요' },
  { key: 'hold',   label: '멈추기',     sec: 4, voice: '멈추세요' },
  { key: 'exhale', label: '내쉬기',     sec: 8, voice: '내쉬세요' },
];
const CYCLE_SEC = PHASES.reduce((s, p) => s + p.sec, 0); // 19

const state = {
  mode: 'count',         // 'count' | 'time'
  targetCount: 8,
  targetTime: 5,         // minutes
  opt: { vibrate: true, beep: true, voice: false },
  running: false,
  paused: false,
  phaseIdx: 0,
  phaseElapsed: 0,       // ms within phase
  cycleDone: 0,
  totalElapsed: 0,       // ms total
  rafId: null,
  lastTs: 0,
  audioCtx: null,
  wakeLock: null,
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ========== 화면 전환 ==========
function showScreen(id) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  $('#' + id).classList.add('active');
}

// ========== 설정 화면 이벤트 ==========
function bindSetup() {
  $$('.seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.mode = btn.dataset.mode;
      $('#field-count').classList.toggle('hidden', state.mode !== 'count');
      $('#field-time').classList.toggle('hidden', state.mode !== 'time');
    });
  });

  $$('.chip[data-count]').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.chip[data-count]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.targetCount = Number(btn.dataset.count);
    });
  });
  $$('.chip[data-time]').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.chip[data-time]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.targetTime = Number(btn.dataset.time);
    });
  });

  $('#opt-vibrate').addEventListener('change', e => state.opt.vibrate = e.target.checked);
  $('#opt-beep').addEventListener('change', e => state.opt.beep = e.target.checked);
  $('#opt-voice').addEventListener('change', e => state.opt.voice = e.target.checked);

  $('#btn-start').addEventListener('click', startSession);
  $('#btn-back').addEventListener('click', endSession);
  $('#btn-pause').addEventListener('click', togglePause);
  $('#btn-again').addEventListener('click', () => showScreen('screen-setup'));
}

// ========== 세션 시작/종료 ==========
async function startSession() {
  // 사용자 제스처 안에서 오디오 컨텍스트와 음성 합성 워밍업
  initAudio();
  if (state.opt.voice) primeVoice();

  state.running = true;
  state.paused = false;
  state.phaseIdx = 0;
  state.phaseElapsed = 0;
  state.cycleDone = 0;
  state.totalElapsed = 0;
  state.lastTs = performance.now();

  showScreen('screen-run');
  $('#screen-run').classList.remove('paused');
  $('#btn-pause').textContent = '❚❚';

  await requestWakeLock();
  announcePhase(true);
  state.rafId = requestAnimationFrame(tick);
}

function endSession(showDone) {
  state.running = false;
  if (state.rafId) cancelAnimationFrame(state.rafId);
  state.rafId = null;
  releaseWakeLock();
  if ('speechSynthesis' in window) speechSynthesis.cancel();

  if (showDone === true) {
    $('#done-summary').textContent =
      `${state.cycleDone}회 · ${formatTime(state.totalElapsed)}`;
    showScreen('screen-done');
  } else {
    showScreen('screen-setup');
  }
}

function togglePause() {
  if (!state.running) return;
  state.paused = !state.paused;
  $('#screen-run').classList.toggle('paused', state.paused);
  $('#btn-pause').textContent = state.paused ? '▶' : '❚❚';
  if (!state.paused) {
    state.lastTs = performance.now();
    state.rafId = requestAnimationFrame(tick);
  } else {
    if (state.rafId) cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }
}

// ========== 메인 루프 ==========
function tick(ts) {
  if (!state.running || state.paused) return;
  const dt = ts - state.lastTs;
  state.lastTs = ts;
  state.phaseElapsed += dt;
  state.totalElapsed += dt;

  const phase = PHASES[state.phaseIdx];
  const phaseMs = phase.sec * 1000;

  // UI 업데이트
  const remaining = Math.max(0, phaseMs - state.phaseElapsed);
  const secLeft = Math.ceil(remaining / 1000);
  $('#phase-sec').textContent = secLeft;
  $('#phase-of').textContent = `/ ${phase.sec}초`;
  $('#stat-cycle').textContent = state.cycleDone;
  $('#stat-elapsed').textContent = formatTime(state.totalElapsed);

  // 링 진행도 — 사이클 전체 기준
  const cycleProgressMs = PHASES.slice(0, state.phaseIdx).reduce((s, p) => s + p.sec * 1000, 0)
                        + state.phaseElapsed;
  const cycleTotalMs = CYCLE_SEC * 1000;
  const ratio = Math.min(1, cycleProgressMs / cycleTotalMs);
  const CIRC = 678.58; // 2 * PI * 108
  $('.ring-fg').style.strokeDashoffset = CIRC * (1 - ratio);

  // 단계 종료 판정
  if (state.phaseElapsed >= phaseMs) {
    state.phaseElapsed -= phaseMs;
    state.phaseIdx++;
    if (state.phaseIdx >= PHASES.length) {
      state.phaseIdx = 0;
      state.cycleDone++;
      $('#stat-cycle').textContent = state.cycleDone;
    }
    if (checkDone()) return;
    announcePhase(false);
  }

  // 시간 모드 종료 체크
  if (state.mode === 'time' && state.totalElapsed >= state.targetTime * 60 * 1000) {
    endSession(true);
    return;
  }

  state.rafId = requestAnimationFrame(tick);
}

function checkDone() {
  if (state.mode === 'count' && state.cycleDone >= state.targetCount) {
    endSession(true);
    return true;
  }
  return false;
}

// ========== 단계 안내 (시각/햅틱/오디오/음성) ==========
function announcePhase(initial) {
  const phase = PHASES[state.phaseIdx];
  $('#phase-label').textContent = phase.label;

  if (state.opt.vibrate && 'vibrate' in navigator) {
    const pattern = phase.key === 'inhale' ? [40] :
                    phase.key === 'hold'   ? [20, 60, 20] :
                                             [80];
    navigator.vibrate(pattern);
  }
  if (state.opt.beep) {
    const freq = phase.key === 'inhale' ? 660 :
                 phase.key === 'hold'   ? 880 :
                                          440;
    beep(freq, 0.18);
  }
  if (state.opt.voice) speak(phase.voice);
}

// ========== Audio ==========
function initAudio() {
  if (state.audioCtx) return;
  try {
    state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) { /* noop */ }
}

function beep(freq, durSec) {
  if (!state.audioCtx) return;
  const ctx = state.audioCtx;
  if (ctx.state === 'suspended') ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.02);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + durSec);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + durSec + 0.05);
}

// iOS는 사용자 제스처 안에서 한 번 발화시켜야 이후 자동 발화 가능
function primeVoice() {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(' ');
  u.volume = 0;
  u.lang = 'ko-KR';
  speechSynthesis.speak(u);
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR';
  u.rate = 0.95;
  u.pitch = 1.0;
  speechSynthesis.speak(u);
}

// ========== Wake Lock ==========
async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    state.wakeLock = await navigator.wakeLock.request('screen');
    state.wakeLock.addEventListener('release', () => { state.wakeLock = null; });
  } catch (e) { /* noop */ }
}
function releaseWakeLock() {
  if (state.wakeLock) { state.wakeLock.release().catch(() => {}); state.wakeLock = null; }
}
document.addEventListener('visibilitychange', async () => {
  if (state.running && !state.paused && document.visibilityState === 'visible' && !state.wakeLock) {
    await requestWakeLock();
  }
});

// ========== 유틸 ==========
function formatTime(ms) {
  const total = Math.floor(ms / 1000);
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// ========== Service Worker ==========
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

// ========== 시작 ==========
bindSetup();

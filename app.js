'use strict';

const TECHNIQUES = [
  {
    id: '748',
    name: '7·4·8 호흡',
    subtitle: '심박을 가라앉히는 호흡',
    pattern: '들숨 7 · 멈춤 4 · 날숨 8',
    desc: '심박과 긴장을 차분히 가라앉힐 때',
    phases: [
      { key: 'inhale', label: '들이마시기', sec: 7, voice: '들이마시세요' },
      { key: 'hold',   label: '멈추기',     sec: 4, voice: '멈추세요' },
      { key: 'exhale', label: '내쉬기',     sec: 8, voice: '내쉬세요' },
    ],
    gradient: ['#ff8fb1', '#7ad3ff'],
  },
  {
    id: 'box',
    name: 'Box Breathing',
    subtitle: '집중과 평정을 위한 호흡',
    pattern: '4 · 4 · 4 · 4',
    desc: '집중력 강화, 스트레스 관리',
    phases: [
      { key: 'inhale',    label: '들이마시기', sec: 4, voice: '들이마시세요' },
      { key: 'hold',      label: '멈추기',     sec: 4, voice: '멈추세요' },
      { key: 'exhale',    label: '내쉬기',     sec: 4, voice: '내쉬세요' },
      { key: 'holdEmpty', label: '멈추기',     sec: 4, voice: '멈추세요' },
    ],
    gradient: ['#a78bfa', '#60a5fa'],
  },
  {
    id: '478',
    name: '4·7·8 호흡',
    subtitle: '잠들기 전 이완 호흡',
    pattern: '들숨 4 · 멈춤 7 · 날숨 8',
    desc: '수면 유도 (Dr. Andrew Weil)',
    phases: [
      { key: 'inhale', label: '들이마시기', sec: 4, voice: '들이마시세요' },
      { key: 'hold',   label: '멈추기',     sec: 7, voice: '멈추세요' },
      { key: 'exhale', label: '내쉬기',     sec: 8, voice: '내쉬세요' },
    ],
    gradient: ['#fbcfe8', '#c4b5fd'],
  },
  {
    id: 'coherent',
    name: 'Coherent 5·5',
    subtitle: '균형 잡힌 명상 호흡',
    pattern: '들숨 5 · 날숨 5',
    desc: '자율신경 균형, 심박변이도 향상',
    phases: [
      { key: 'inhale', label: '들이마시기', sec: 5, voice: '들이마시세요' },
      { key: 'exhale', label: '내쉬기',     sec: 5, voice: '내쉬세요' },
    ],
    gradient: ['#86efac', '#7ad3ff'],
  },
  {
    id: '426',
    name: '4·2·6 이완',
    subtitle: '가벼운 이완 호흡',
    pattern: '들숨 4 · 멈춤 2 · 날숨 6',
    desc: '부교감 활성화, 일상 이완',
    phases: [
      { key: 'inhale', label: '들이마시기', sec: 4, voice: '들이마시세요' },
      { key: 'hold',   label: '멈추기',     sec: 2, voice: '멈추세요' },
      { key: 'exhale', label: '내쉬기',     sec: 6, voice: '내쉬세요' },
    ],
    gradient: ['#fde68a', '#fbcfe8'],
  },
];

const state = {
  techniqueId: '748',
  mode: 'count',
  targetCount: 8,
  targetTime: 5,
  opt: { vibrate: true, beep: true, voice: false },
  running: false,
  paused: false,
  phaseIdx: 0,
  phaseElapsed: 0,
  cycleDone: 0,
  totalElapsed: 0,
  rafId: null,
  lastTs: 0,
  audioCtx: null,
  wakeLock: null,
};

const music = {
  mode: 'off',          // 'off' | 'drone' | 'ocean' | 'track1' | 'track2' | 'track3'
  volume: 0.4,
  nodes: null,
  el: null,
  masterGain: null,
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function getTechnique() {
  return TECHNIQUES.find(t => t.id === state.techniqueId) || TECHNIQUES[0];
}
function getPhases() { return getTechnique().phases; }
function getCycleSec() { return getPhases().reduce((s, p) => s + p.sec, 0); }

// ========== 화면 전환 ==========
function showScreen(id) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  $('#' + id).classList.add('active');
}

// ========== 호흡법 카드 렌더링 ==========
function renderTechniques() {
  const slider = $('#tech-slider');
  slider.innerHTML = TECHNIQUES.map(t => `
    <button class="tech-card${t.id === state.techniqueId ? ' active' : ''}" data-id="${t.id}">
      <div class="tech-card-name">${t.name}</div>
      <div class="tech-card-pattern">${t.pattern}</div>
      <div class="tech-card-desc">${t.desc}</div>
    </button>
  `).join('');

  slider.querySelectorAll('.tech-card').forEach(card => {
    card.addEventListener('click', () => {
      state.techniqueId = card.dataset.id;
      slider.querySelectorAll('.tech-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      applyTechniqueTheme();
    });
  });
}

function applyTechniqueTheme() {
  const t = getTechnique();
  $('#intro-title').textContent = t.subtitle;
  $('#intro-desc').textContent = t.pattern;
  $('#run-title').textContent = t.name;
  const stops = $('#grad').querySelectorAll('stop');
  stops[0].setAttribute('stop-color', t.gradient[0]);
  stops[1].setAttribute('stop-color', t.gradient[1]);
  document.documentElement.style.setProperty('--pink', t.gradient[0]);
  document.documentElement.style.setProperty('--blue', t.gradient[1]);
}

// ========== 설정 화면 이벤트 ==========
function bindSetup() {
  renderTechniques();
  applyTechniqueTheme();

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

  $$('.chip[data-music]').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.chip[data-music]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      music.mode = btn.dataset.music;
      $('#music-volume-wrap').classList.toggle('hidden', music.mode === 'off');
    });
  });
  $('#music-volume').addEventListener('input', e => {
    setMusicVolume(Number(e.target.value) / 100);
  });

  $('#btn-start').addEventListener('click', startSession);
  $('#btn-back').addEventListener('click', endSession);
  $('#btn-pause').addEventListener('click', togglePause);
  $('#btn-again').addEventListener('click', () => showScreen('screen-setup'));
}

// ========== 세션 시작/종료 ==========
async function startSession() {
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
  if (music.mode !== 'off') startMusic(music.mode);
  announcePhase(true);
  state.rafId = requestAnimationFrame(tick);
}

function endSession(showDone) {
  state.running = false;
  if (state.rafId) cancelAnimationFrame(state.rafId);
  state.rafId = null;
  releaseWakeLock();
  stopMusic();
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
    resumeMusic();
  } else {
    if (state.rafId) cancelAnimationFrame(state.rafId);
    state.rafId = null;
    pauseMusic();
  }
}

// ========== 메인 루프 ==========
function tick(ts) {
  if (!state.running || state.paused) return;
  const dt = ts - state.lastTs;
  state.lastTs = ts;
  state.phaseElapsed += dt;
  state.totalElapsed += dt;

  const phases = getPhases();
  const phase = phases[state.phaseIdx];
  const phaseMs = phase.sec * 1000;

  const remaining = Math.max(0, phaseMs - state.phaseElapsed);
  const secLeft = Math.ceil(remaining / 1000);
  $('#phase-sec').textContent = secLeft;
  $('#phase-of').textContent = `/ ${phase.sec}초`;
  $('#stat-cycle').textContent = state.cycleDone;
  $('#stat-elapsed').textContent = formatTime(state.totalElapsed);

  const cycleProgressMs = phases.slice(0, state.phaseIdx).reduce((s, p) => s + p.sec * 1000, 0)
                        + state.phaseElapsed;
  const cycleTotalMs = getCycleSec() * 1000;
  const ratio = Math.min(1, cycleProgressMs / cycleTotalMs);
  const CIRC = 678.58;
  $('.ring-fg').style.strokeDashoffset = CIRC * (1 - ratio);

  if (state.phaseElapsed >= phaseMs) {
    state.phaseElapsed -= phaseMs;
    state.phaseIdx++;
    if (state.phaseIdx >= phases.length) {
      state.phaseIdx = 0;
      state.cycleDone++;
      $('#stat-cycle').textContent = state.cycleDone;
    }
    if (checkDone()) return;
    announcePhase(false);
  }

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

// ========== 단계 안내 ==========
function announcePhase(initial) {
  const phase = getPhases()[state.phaseIdx];
  $('#phase-label').textContent = phase.label;

  const isHold = phase.key === 'hold' || phase.key === 'holdEmpty';

  if (state.opt.vibrate && 'vibrate' in navigator) {
    const pattern = phase.key === 'inhale' ? [40] :
                    isHold                  ? [20, 60, 20] :
                                              [80];
    navigator.vibrate(pattern);
  }
  if (state.opt.beep) {
    const freq = phase.key === 'inhale' ? 660 :
                 isHold                  ? 880 :
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

// ========== Background Music ==========
function ensureMusicGain() {
  if (music.masterGain) return music.masterGain;
  if (!state.audioCtx) return null;
  music.masterGain = state.audioCtx.createGain();
  music.masterGain.gain.value = 0;
  music.masterGain.connect(state.audioCtx.destination);
  return music.masterGain;
}

function startMusic(mode) {
  stopMusic(true);
  music.mode = mode;
  if (mode === 'off') return;
  initAudio();
  const ctx = state.audioCtx;
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  if (mode === 'drone' || mode === 'ocean') {
    const master = ensureMusicGain();
    if (!master) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(music.volume, ctx.currentTime + 2);
    music.nodes = mode === 'drone' ? createDrone(ctx, master) : createOcean(ctx, master);
  } else if (mode.startsWith('track')) {
    const num = mode.replace('track', '');
    const audio = new Audio(`audio/track${num}.mp3`);
    audio.loop = true;
    audio.volume = 0;
    audio.play().then(() => {
      const start = performance.now();
      const fade = () => {
        const t = Math.min(1, (performance.now() - start) / 2000);
        audio.volume = music.volume * t;
        if (t < 1 && music.el === audio) requestAnimationFrame(fade);
      };
      fade();
    }).catch(err => {
      console.warn('mp3 재생 실패 — audio/track' + num + '.mp3 파일이 없거나 재생 차단됨', err);
      music.mode = 'off';
    });
    music.el = audio;
  }
}

function stopMusic(immediate) {
  const ctx = state.audioCtx;
  if (music.masterGain && ctx) {
    music.masterGain.gain.cancelScheduledValues(ctx.currentTime);
    music.masterGain.gain.setValueAtTime(music.masterGain.gain.value, ctx.currentTime);
    music.masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + (immediate ? 0.05 : 1.0));
  }
  const nodesToStop = music.nodes;
  const elToStop = music.el;
  music.nodes = null;
  music.el = null;
  setTimeout(() => {
    if (nodesToStop) {
      nodesToStop.forEach(n => { try { n.stop && n.stop(); } catch(e) {} try { n.disconnect(); } catch(e) {} });
    }
    if (elToStop) {
      try { elToStop.pause(); elToStop.src = ''; } catch(e) {}
    }
  }, immediate ? 80 : 1100);
}

function pauseMusic() {
  if (music.el) music.el.pause();
  if (music.masterGain && state.audioCtx) {
    music.masterGain.gain.linearRampToValueAtTime(0, state.audioCtx.currentTime + 0.3);
  }
}
function resumeMusic() {
  if (music.el) music.el.play().catch(() => {});
  if (music.masterGain && state.audioCtx && music.mode !== 'off') {
    music.masterGain.gain.linearRampToValueAtTime(music.volume, state.audioCtx.currentTime + 0.3);
  }
}

function setMusicVolume(v) {
  music.volume = v;
  if (music.el) music.el.volume = v;
  if (music.masterGain && state.audioCtx && music.mode !== 'off') {
    music.masterGain.gain.linearRampToValueAtTime(v, state.audioCtx.currentTime + 0.3);
  }
}

// 저음 화음 드론 — 차분한 명상 분위기
function createDrone(ctx, dest) {
  const nodes = [];
  // 트림 게인: Drone을 trackX 수준으로 끌어올림
  const trim = ctx.createGain();
  trim.gain.value = 2.2;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  filter.Q.value = 0.7;
  filter.connect(trim).connect(dest);

  const fundamentals = [110, 165]; // A2 + E3 (5도 화음)
  fundamentals.forEach(freq => {
    [-7, 0, 7].forEach(cents => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * Math.pow(2, cents / 1200);
      const g = ctx.createGain();
      g.gain.value = 0.07;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.06 + Math.random() * 0.05;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.04;
      lfo.connect(lfoGain).connect(g.gain);
      osc.connect(g).connect(filter);
      osc.start();
      lfo.start();
      nodes.push(osc, lfo);
    });
  });
  return nodes;
}

// 화이트노이즈 + 밴드패스 + LFO로 파도 느낌
function createOcean(ctx, dest) {
  const nodes = [];
  const bufSize = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  noise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 500;
  filter.Q.value = 1.6;

  const gain = ctx.createGain();
  gain.gain.value = 0.18;

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.15;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.16;
  lfo.connect(lfoGain).connect(gain.gain);

  const fLfo = ctx.createOscillator();
  fLfo.frequency.value = 0.1;
  const fLfoGain = ctx.createGain();
  fLfoGain.gain.value = 200;
  fLfo.connect(fLfoGain).connect(filter.frequency);

  noise.connect(filter).connect(gain).connect(dest);
  noise.start();
  lfo.start();
  fLfo.start();

  nodes.push(noise, lfo, fLfo);
  return nodes;
}

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

bindSetup();

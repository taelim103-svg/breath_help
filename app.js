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
  {
    id: 'lamaze-slow',
    name: '라마즈 1단계 · 느린 호흡',
    subtitle: '예비산모 · 진통 초기 (1단계)',
    pattern: '코 들숨 4 · 입 날숨 6',
    desc: '1단계 — 진통 초기 (분당 ~6회)',
    phases: [
      { key: 'inhale', label: '코로 들이마시기', sec: 4, voice: '들이마시세요' },
      { key: 'exhale', label: '입으로 후~',     sec: 6, voice: '후 하고 내쉬세요' },
    ],
    gradient: ['#fda4af', '#f9a8d4'],
  },
  {
    id: 'lamaze-mod',
    name: '라마즈 2단계 · 변형 가속',
    subtitle: '예비산모 · 진통 활성기 (2단계)',
    pattern: '들숨 2 · 날숨 2',
    desc: '2단계 — 진통 활성기 (분당 ~30회)',
    phases: [
      { key: 'inhale', label: '들숨', sec: 2, voice: '들숨' },
      { key: 'exhale', label: '날숨', sec: 2, voice: '날숨' },
    ],
    gradient: ['#fb7185', '#c084fc'],
  },
  {
    id: 'lamaze-hee',
    name: '라마즈 3단계 · 히히후',
    subtitle: '예비산모 · 진통 이행기 (3단계)',
    pattern: '히 · 히 · 후',
    desc: '3단계 — 이행기 / 강한 진통 (패턴 페이스)',
    phases: [
      { key: 'inhale', label: '들숨', sec: 1, voice: '들숨' },
      { key: 'exhale', label: '히',   sec: 1, voice: '히' },
      { key: 'inhale', label: '들숨', sec: 1, voice: '들숨' },
      { key: 'exhale', label: '히',   sec: 1, voice: '히' },
      { key: 'inhale', label: '들숨', sec: 1, voice: '들숨' },
      { key: 'exhale', label: '후',   sec: 2, voice: '후' },
    ],
    gradient: ['#a78bfa', '#f472b6'],
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

const metro = {
  bpm: 180,
  click: true,
  vibrate: false,
  clickType: 'wood',     // 'wood' | 'beep' | 'tick'
  volume: 0.85,
  running: false,
  paused: false,
  nextBeatTime: 0,       // audio context time for next beat
  beatCount: 0,
  schedulerId: null,
  rafId: null,
  startedAt: 0,          // performance.now() at start
  pausedElapsed: 0,      // accumulated elapsed before pause (ms)
  pausedAt: 0,
  scheduledBeats: [],    // beats already scheduled (audio time) — 처리된 항목은 주기적으로 정리
  visualBeatIdx: 0,      // index into scheduledBeats for visual loop
  totalBeatsShown: 0,    // 사용자에게 보여주는 누적 박자 수 (배열 정리와 무관하게 단조 증가)
  lastBeatTime: 0,       // 마지막 박자가 들린 audio time (페이드 계산용)
  // iOS 백그라운드 재생용 (HTML5 audio 경로)
  iosAudio: null,
  iosBlobUrl: null,
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

function bindNavigation() {
  $$('[data-go]').forEach(el => {
    el.addEventListener('click', () => {
      const target = el.dataset.go;
      // 호흡/메트로놈 실행 중이면 정리
      if (state.running) endSession(false);
      if (metro.running) stopMetronome();
      showScreen(target);
    });
  });
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

// ========== Metronome ==========
function bindMetronome() {
  $$('.chip[data-bpm]').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.chip[data-bpm]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      metro.bpm = Number(btn.dataset.bpm);
      $('#bpm-slider').value = metro.bpm;
      $('#bpm-display').textContent = metro.bpm;
    });
  });
  $('#bpm-slider').addEventListener('input', e => {
    metro.bpm = Number(e.target.value);
    $('#bpm-display').textContent = metro.bpm;
    // chip 활성 상태 갱신
    $$('.chip[data-bpm]').forEach(b => {
      b.classList.toggle('active', Number(b.dataset.bpm) === metro.bpm);
    });
  });

  $('#metro-vibrate').addEventListener('change', e => metro.vibrate = e.target.checked);
  $('#metro-click').addEventListener('change', e => metro.click = e.target.checked);

  $$('.chip[data-click]').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.chip[data-click]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      metro.clickType = btn.dataset.click;
    });
  });

  $('#metro-volume').addEventListener('input', e => {
    metro.volume = Number(e.target.value) / 100;
    $('#metro-volume-display').textContent = e.target.value;
  });

  $('#btn-metro-start').addEventListener('click', startMetronome);
  $('#btn-metro-back').addEventListener('click', () => {
    stopMetronome();
    showScreen('screen-home');
  });
  $('#btn-metro-pause').addEventListener('click', toggleMetroPause);
}

async function startMetronome() {
  // 공통 상태 초기화
  metro.running = true;
  metro.paused = false;
  metro.beatCount = 0;
  metro.scheduledBeats = [];
  metro.visualBeatIdx = 0;
  metro.totalBeatsShown = 0;
  metro.lastBeatTime = 0;
  metro.startedAt = performance.now();
  metro.pausedElapsed = 0;

  $('#metro-bpm-big').textContent = metro.bpm;
  $('#metro-beats').textContent = '0';
  $('#metro-elapsed').textContent = '00:00';
  $('#screen-metro-run').classList.remove('paused');
  $('#btn-metro-pause').textContent = '❚❚';

  // iOS는 HTML5 audio 경로, 그 외(Android/Desktop)는 Web Audio 스케줄러
  if (isIOS()) {
    await startMetronomeIOS();
  } else {
    await startMetronomeWebAudio();
  }
}

async function startMetronomeWebAudio() {
  initAudio();
  const ctx = state.audioCtx;
  if (!ctx) return;
  if (ctx.state === 'suspended') await ctx.resume();
  metro.nextBeatTime = ctx.currentTime + 0.1;

  showScreen('screen-metro-run');
  await requestWakeLock();
  metroScheduler();
  metro.rafId = requestAnimationFrame(metroVisualLoop);
}

async function startMetronomeIOS() {
  // 사용자 제스처 안에서 호출되므로 audio 재생 가능
  // 1) audio context 깨우기 (해도 손해 안 봄)
  initAudio();
  if (state.audioCtx && state.audioCtx.state === 'suspended') {
    state.audioCtx.resume().catch(() => {});
  }

  // 2) 트랙 생성 (1~2초 소요)
  $('#btn-metro-start').disabled = true;
  $('#btn-metro-start').textContent = '준비 중…';
  try {
    const url = await generateClickTrackBlob(metro.bpm, metro.clickType, metro.click ? metro.volume : 0);
    metro.iosBlobUrl = url;

    const audio = new Audio(url);
    audio.loop = true;
    audio.preload = 'auto';
    audio.playsInline = true;
    metro.iosAudio = audio;
    await audio.play();

    setupMediaSession();
  } catch (err) {
    console.error('iOS metronome start failed', err);
    metro.running = false;
  } finally {
    $('#btn-metro-start').disabled = false;
    $('#btn-metro-start').textContent = '시작하기';
  }

  if (!metro.running) return;

  showScreen('screen-metro-run');
  await requestWakeLock();
  metro.rafId = requestAnimationFrame(metroVisualLoopIOS);
}

function setupMediaSession() {
  if (!('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${metro.bpm} BPM`,
      artist: "sunny's lab",
      album: '달리기 메트로놈',
    });
    navigator.mediaSession.setActionHandler('play', () => {
      if (metro.paused) toggleMetroPause();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      if (!metro.paused) toggleMetroPause();
    });
    navigator.mediaSession.setActionHandler('stop', () => {
      stopMetronome();
      showScreen('screen-home');
    });
  } catch (e) { /* ignore */ }
}

// iOS 시각 루프: audio.currentTime 기반으로 비트 위상 추정
function metroVisualLoopIOS() {
  if (!metro.running) return;
  const audio = metro.iosAudio;
  const pulse = $('#metro-pulse');
  if (!audio || pulse == null) {
    metro.rafId = requestAnimationFrame(metroVisualLoopIOS);
    return;
  }

  const interval = 60.0 / metro.bpm;
  // 추정 박자 인덱스: 누적 재생 시간 / 비트 간격
  const cumulativeSec = (metro.pausedElapsed + (metro.paused ? 0 : (performance.now() - metro.startedAt))) / 1000;
  const expectedBeat = Math.floor(cumulativeSec / interval);

  if (expectedBeat > metro.totalBeatsShown) {
    while (metro.totalBeatsShown < expectedBeat) {
      metro.totalBeatsShown++;
      if (metro.vibrate && 'vibrate' in navigator && !metro.paused) navigator.vibrate(30);
    }
    metro.lastBeatTime = expectedBeat * interval; // sec 단위
    pulse.classList.remove('beat');
    void pulse.offsetWidth;
    pulse.classList.add('beat');
    $('#metro-beats').textContent = metro.totalBeatsShown;
  }

  // 페이드: 마지막 박자 이후 진행 위상으로 페이드
  const sinceLast = cumulativeSec - metro.lastBeatTime;
  const phase = Math.min(1, sinceLast / (interval * 0.5));
  pulse.style.opacity = (1 - phase);

  // 경과 시간 표시
  const total = Math.floor(cumulativeSec);
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  $('#metro-elapsed').textContent = `${m}:${s}`;

  metro.rafId = requestAnimationFrame(metroVisualLoopIOS);
}

function metroScheduler() {
  if (!metro.running || metro.paused) return;
  const ctx = state.audioCtx;

  // 백그라운드/화면 잠금 시 setTimeout이 throttle될 수 있어 자동 복구
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const interval = 60.0 / metro.bpm;
  // 화면 잠금 시 setTimeout이 1초+로 throttle되므로 3초 미리 스케줄
  const lookahead = 3.0;

  while (metro.nextBeatTime < ctx.currentTime + lookahead) {
    if (metro.click) scheduleClick(metro.nextBeatTime, metro.clickType);
    metro.scheduledBeats.push(metro.nextBeatTime);
    metro.beatCount++;
    metro.nextBeatTime += interval;
  }
  metro.schedulerId = setTimeout(metroScheduler, 500);
}

function metroVisualLoop() {
  if (!metro.running) return;
  const ctx = state.audioCtx;
  const pulse = $('#metro-pulse');

  // 이미 시간 지난 박자에 대해 시각 펄스 트리거
  while (metro.visualBeatIdx < metro.scheduledBeats.length &&
         metro.scheduledBeats[metro.visualBeatIdx] <= ctx.currentTime) {
    metro.totalBeatsShown++;
    metro.lastBeatTime = metro.scheduledBeats[metro.visualBeatIdx];
    $('#metro-beats').textContent = metro.totalBeatsShown;
    if (metro.vibrate && 'vibrate' in navigator && !metro.paused) {
      navigator.vibrate(30);
    }
    pulse.classList.remove('beat');
    void pulse.offsetWidth; // reflow to restart
    pulse.classList.add('beat');
    metro.visualBeatIdx++;
  }

  // 메모리 누적 방지: 처리된 비트가 100개 이상 쌓이면 잘라냄
  if (metro.visualBeatIdx >= 100) {
    metro.scheduledBeats.splice(0, metro.visualBeatIdx);
    metro.visualBeatIdx = 0;
  }

  // 비트 사이 페이드 아웃 (마지막 박자 시간 기준)
  const interval = 60.0 / metro.bpm;
  if (metro.lastBeatTime > 0) {
    const phase = Math.min(1, (ctx.currentTime - metro.lastBeatTime) / (interval * 0.5));
    pulse.style.opacity = (1 - phase) * 1.0;
  }

  // 경과 시간 = 누적 + 현재 구간
  const elapsedMs = metro.paused
    ? metro.pausedElapsed
    : (performance.now() - metro.startedAt) + metro.pausedElapsed;
  const total = Math.floor(elapsedMs / 1000);
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  $('#metro-elapsed').textContent = `${m}:${s}`;

  metro.rafId = requestAnimationFrame(metroVisualLoop);
}

function stopMetronome() {
  metro.running = false;
  metro.paused = false;
  if (metro.schedulerId) clearTimeout(metro.schedulerId);
  if (metro.rafId) cancelAnimationFrame(metro.rafId);
  metro.schedulerId = null;
  metro.rafId = null;
  metro.scheduledBeats = [];

  if (metro.iosAudio) {
    try { metro.iosAudio.pause(); metro.iosAudio.src = ''; } catch (e) {}
    metro.iosAudio = null;
  }
  if (metro.iosBlobUrl) {
    URL.revokeObjectURL(metro.iosBlobUrl);
    metro.iosBlobUrl = null;
  }
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('stop', null);
      navigator.mediaSession.metadata = null;
    } catch (e) {}
  }

  releaseWakeLock();
  const pulse = $('#metro-pulse');
  if (pulse) { pulse.classList.remove('beat'); pulse.style.opacity = ''; }
}

function toggleMetroPause() {
  if (!metro.running) return;
  metro.paused = !metro.paused;
  $('#screen-metro-run').classList.toggle('paused', metro.paused);
  $('#btn-metro-pause').textContent = metro.paused ? '▶' : '❚❚';

  if (metro.paused) {
    metro.pausedAt = performance.now();
    metro.pausedElapsed += metro.pausedAt - metro.startedAt;
    if (metro.iosAudio) {
      try { metro.iosAudio.pause(); } catch (e) {}
    } else {
      if (metro.schedulerId) clearTimeout(metro.schedulerId);
      metro.schedulerId = null;
      if (metro.rafId) cancelAnimationFrame(metro.rafId);
      metro.rafId = null;
    }
  } else {
    metro.startedAt = performance.now();
    if (metro.iosAudio) {
      metro.iosAudio.play().catch(() => {});
      metro.rafId = requestAnimationFrame(metroVisualLoopIOS);
    } else {
      const ctx = state.audioCtx;
      metro.nextBeatTime = ctx.currentTime + 0.1;
      metroScheduler();
      metro.rafId = requestAnimationFrame(metroVisualLoop);
    }
  }
}

function scheduleClick(time, type) {
  scheduleClickAt(state.audioCtx, state.audioCtx.destination, time, type, metro.volume);
}

// ctx와 destination을 인자로 받아 OfflineAudioContext에서도 재사용 가능
function scheduleClickAt(ctx, dest, time, type, v) {
  if (type === 'wood') {
    const dur = 0.04;
    const bufSize = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.3));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1500;
    filter.Q.value = 8;
    const gain = ctx.createGain();
    gain.gain.value = 1.4 * v;
    src.connect(filter).connect(gain).connect(dest);
    src.start(time);
    src.stop(time + dur);
  } else if (type === 'beep') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 1500;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.55 * v, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    osc.connect(gain).connect(dest);
    osc.start(time);
    osc.stop(time + 0.05);
  } else { // tick
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2000, time);
    osc.frequency.exponentialRampToValueAtTime(800, time + 0.02);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.7 * v, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    osc.connect(gain).connect(dest);
    osc.start(time);
    osc.stop(time + 0.04);
  }
}

// AudioBuffer → WAV bytes (16-bit PCM mono)
function audioBufferToWav(audioBuffer) {
  const numChannels = 1;
  const sampleRate = audioBuffer.sampleRate;
  const samples = audioBuffer.getChannelData(0);
  const dataLength = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);
  const writeStr = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }
  return buffer;
}

// 매끄러운 루프 WAV blob 생성 (정수 박자 길이로 정렬)
async function generateClickTrackBlob(bpm, clickType, volume) {
  const beatInterval = 60.0 / bpm;
  // 약 30초 분량을 정수 박자에 맞춰
  const targetSec = 30;
  const numBeats = Math.max(8, Math.round(targetSec / beatInterval));
  const durSec = numBeats * beatInterval;

  const sampleRate = 44100;
  const totalSamples = Math.ceil(durSec * sampleRate);
  const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const offlineCtx = new OfflineCtx(1, totalSamples, sampleRate);

  for (let i = 0; i < numBeats; i++) {
    scheduleClickAt(offlineCtx, offlineCtx.destination, i * beatInterval, clickType, volume);
  }

  const rendered = await offlineCtx.startRendering();
  const wavBytes = audioBufferToWav(rendered);
  return URL.createObjectURL(new Blob([wavBytes], { type: 'audio/wav' }));
}

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.platform) ||
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  );
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
  const anyRunning = (state.running && !state.paused) || (metro.running && !metro.paused);
  if (anyRunning && document.visibilityState === 'visible' && !state.wakeLock) {
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

bindNavigation();
bindSetup();
bindMetronome();

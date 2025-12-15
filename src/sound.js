/**
 * Sudoku Logic Lab - Sound Manager
 * 
 * WebAudio-based sound system with multiple procedural sound packs.
 * This file uses plain JavaScript (no JSX) and can be loaded before React.
 * 
 * @version 2.3.0
 */

// ============================================================================
// SOUND MANAGER CLASS
// ============================================================================

const SoundManager = {
  ctx: null,
  currentPack: 'classic',
  packHandlers: {},
  
  /**
   * Initialize the AudioContext (call on user interaction)
   */
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },
  
  /**
   * Set the active sound pack
   * @param {string} packId - Sound pack identifier
   */
  setPack(packId) {
    this.currentPack = packId in SOUND_PACKS ? packId : 'classic';
  },
  
  /**
   * Play a sound effect
   * @param {string} type - Sound type (e.g., 'select', 'write', 'error', 'success')
   */
  play(type) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    const handler = this.packHandlers[this.currentPack] || this.packHandlers.classic;
    if (handler) handler(type, this.ctx);
  }
};

// ============================================================================
// CLASSIC SOUND PACK HANDLER
// ============================================================================

const buildClassicHandler = () => (type, ctx) => {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  switch (type) {
    case 'select':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      gain.gain.setValueAtTime(0.02, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.start(t);
      osc.stop(t + 0.05);
      break;
      
    case 'uiTap':
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.start(t);
      osc.stop(t + 0.1);
      break;
      
    case 'chestOpen': {
      const oC = ctx.createOscillator();
      const gC = ctx.createGain();
      oC.type = 'triangle';
      oC.frequency.setValueAtTime(300, t);
      oC.frequency.linearRampToValueAtTime(800, t + 0.3);
      gC.gain.setValueAtTime(0.1, t);
      gC.gain.linearRampToValueAtTime(0, t + 0.5);
      oC.connect(gC);
      gC.connect(ctx.destination);
      oC.start(t);
      oC.stop(t + 0.5);
      setTimeout(() => SoundManager.play('success'), 300);
      break;
    }
    
    case 'toggle':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, t);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.start(t);
      osc.stop(t + 0.08);
      break;
      
    case 'write':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.start(t);
      osc.stop(t + 0.1);
      break;
      
    case 'erase':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.linearRampToValueAtTime(50, t + 0.15);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.15);
      osc.start(t);
      osc.stop(t + 0.15);
      break;
      
    case 'undo':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.15);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.15);
      osc.start(t);
      osc.stop(t + 0.15);
      break;
      
    case 'pencil':
      osc.type = 'square';
      osc.frequency.setValueAtTime(2000, t);
      gain.gain.setValueAtTime(0.02, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      osc.start(t);
      osc.stop(t + 0.03);
      break;
      
    case 'startGame':
      [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'triangle';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.02, t + i * 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.5);
        o.start(t + i * 0.05);
        o.stop(t + i * 0.05 + 0.5);
      });
      break;
      
    case 'questStart': {
      const o1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      o1.frequency.setValueAtTime(100, t);
      o1.frequency.exponentialRampToValueAtTime(40, t + 1);
      g1.gain.setValueAtTime(0.1, t);
      g1.gain.linearRampToValueAtTime(0, t + 1);
      o1.connect(g1);
      g1.connect(ctx.destination);
      o1.start(t);
      o1.stop(t + 1);
      break;
    }
    
    case 'error':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.linearRampToValueAtTime(100, t + 0.3);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.3);
      break;
      
    case 'success':
      [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        const st = t + i * 0.08;
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.05, st);
        g.gain.exponentialRampToValueAtTime(0.001, st + 0.6);
        o.start(st);
        o.stop(st + 0.6);
      });
      break;
      
    case 'chat':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.setValueAtTime(1200, t + 0.1);
      gain.gain.setValueAtTime(0.02, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.2);
      break;
      
    case 'unlock':
      [800, 1200, 1500, 2000].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, t + i * 0.1);
        g.gain.linearRampToValueAtTime(0.05, t + i * 0.1 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 1);
        o.start(t + i * 0.1);
        o.stop(t + i * 0.1 + 1);
      });
      break;
      
    default:
      break;
  }
};

// ============================================================================
// VARIANT SOUND PACK BUILDER
// ============================================================================

const buildVariantHandler = (config) => (type, ctx) => {
  const base = SoundManager.packHandlers.classic;
  const t = ctx.currentTime;
  
  const playSimple = (wave, freqStart, freqEnd, duration, gainVal = 0.05) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = wave;
    o.frequency.setValueAtTime(freqStart, t);
    if (freqEnd !== null) o.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
    g.gain.setValueAtTime(gainVal, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t);
    o.stop(t + duration);
  };

  const profile = config[type];
  if (!profile) return base(type, ctx);
  
  if (profile.kind === 'simple') {
    playSimple(profile.wave, profile.freqStart, profile.freqEnd, profile.duration, profile.gain || 0.05);
    return;
  }
  
  if (profile.kind === 'chime') {
    profile.notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = profile.wave;
      o.frequency.value = f;
      const st = t + i * (profile.spacing || 0.07);
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(profile.gain || 0.05, st);
      g.gain.exponentialRampToValueAtTime(0.001, st + (profile.decay || 0.6));
      o.start(st);
      o.stop(st + (profile.decay || 0.6));
    });
    return;
  }
  
  return base(type, ctx);
};

// ============================================================================
// REGISTER ALL SOUND PACK HANDLERS
// ============================================================================

// Classic
SoundManager.packHandlers.classic = buildClassicHandler();

// Zen
SoundManager.packHandlers.zen = buildVariantHandler({
  select: { kind: 'simple', wave: 'sine', freqStart: 400, freqEnd: null, duration: 0.12, gain: 0.03 },
  uiTap: { kind: 'simple', wave: 'sine', freqStart: 320, freqEnd: 200, duration: 0.18, gain: 0.04 },
  write: { kind: 'simple', wave: 'sine', freqStart: 360, freqEnd: null, duration: 0.2, gain: 0.05 },
  success: { kind: 'chime', wave: 'sine', notes: [392, 523, 659, 784], decay: 0.8, spacing: 0.1, gain: 0.04 },
  unlock: { kind: 'chime', wave: 'sine', notes: [523, 659, 784, 988], decay: 1.0, spacing: 0.12, gain: 0.045 }
});

// Funfair
SoundManager.packHandlers.funfair = buildVariantHandler({
  select: { kind: 'simple', wave: 'square', freqStart: 900, freqEnd: null, duration: 0.08, gain: 0.04 },
  uiTap: { kind: 'simple', wave: 'triangle', freqStart: 600, freqEnd: 300, duration: 0.12, gain: 0.05 },
  write: { kind: 'simple', wave: 'triangle', freqStart: 720, freqEnd: null, duration: 0.12, gain: 0.05 },
  success: { kind: 'chime', wave: 'square', notes: [523, 659, 784, 1047], decay: 0.5, spacing: 0.09, gain: 0.05 },
  unlock: { kind: 'chime', wave: 'triangle', notes: [659, 784, 988, 1319], decay: 0.7, spacing: 0.08, gain: 0.06 }
});

// Retro
SoundManager.packHandlers.retro = buildVariantHandler({
  select: { kind: 'simple', wave: 'square', freqStart: 1200, freqEnd: null, duration: 0.04, gain: 0.04 },
  uiTap: { kind: 'simple', wave: 'square', freqStart: 900, freqEnd: 450, duration: 0.06, gain: 0.05 },
  write: { kind: 'simple', wave: 'square', freqStart: 1047, freqEnd: null, duration: 0.05, gain: 0.05 },
  erase: { kind: 'simple', wave: 'square', freqStart: 500, freqEnd: 220, duration: 0.06, gain: 0.05 },
  success: { kind: 'chime', wave: 'square', notes: [784, 988, 1319], decay: 0.35, spacing: 0.07, gain: 0.06 },
  unlock: { kind: 'chime', wave: 'square', notes: [988, 1319, 1568, 1976], decay: 0.4, spacing: 0.07, gain: 0.06 }
});

// Space
SoundManager.packHandlers.space = buildVariantHandler({
  select: { kind: 'simple', wave: 'sawtooth', freqStart: 700, freqEnd: 500, duration: 0.12, gain: 0.035 },
  uiTap: { kind: 'simple', wave: 'sine', freqStart: 520, freqEnd: 260, duration: 0.16, gain: 0.04 },
  write: { kind: 'simple', wave: 'triangle', freqStart: 640, freqEnd: 420, duration: 0.14, gain: 0.04 },
  success: { kind: 'chime', wave: 'sawtooth', notes: [392, 587, 784, 1175], decay: 0.9, spacing: 0.1, gain: 0.04 },
  unlock: { kind: 'chime', wave: 'sine', notes: [523, 659, 1047, 1319], decay: 1.1, spacing: 0.12, gain: 0.045 }
});

// Nature
SoundManager.packHandlers.nature = buildVariantHandler({
  select: { kind: 'simple', wave: 'triangle', freqStart: 500, freqEnd: null, duration: 0.12, gain: 0.03 },
  uiTap: { kind: 'simple', wave: 'sine', freqStart: 420, freqEnd: 240, duration: 0.18, gain: 0.035 },
  write: { kind: 'simple', wave: 'triangle', freqStart: 560, freqEnd: 360, duration: 0.14, gain: 0.035 },
  success: { kind: 'chime', wave: 'triangle', notes: [392, 523, 659, 784], decay: 0.7, spacing: 0.08, gain: 0.035 },
  unlock: { kind: 'chime', wave: 'triangle', notes: [494, 740, 880, 1175], decay: 0.8, spacing: 0.1, gain: 0.04 }
});

// Crystal
SoundManager.packHandlers.crystal = buildVariantHandler({
  select: { kind: 'simple', wave: 'triangle', freqStart: 1100, freqEnd: null, duration: 0.08, gain: 0.04 },
  uiTap: { kind: 'simple', wave: 'sine', freqStart: 900, freqEnd: 700, duration: 0.1, gain: 0.04 },
  write: { kind: 'simple', wave: 'triangle', freqStart: 1319, freqEnd: 988, duration: 0.12, gain: 0.045 },
  success: { kind: 'chime', wave: 'triangle', notes: [880, 1047, 1319, 1760], decay: 0.6, spacing: 0.08, gain: 0.045 },
  unlock: { kind: 'chime', wave: 'triangle', notes: [1319, 1568, 1760, 2093], decay: 0.7, spacing: 0.09, gain: 0.05 }
});

// Minimal
SoundManager.packHandlers.minimal = buildVariantHandler({
  select: { kind: 'simple', wave: 'square', freqStart: 1500, freqEnd: null, duration: 0.03, gain: 0.03 },
  uiTap: { kind: 'simple', wave: 'square', freqStart: 1200, freqEnd: 800, duration: 0.05, gain: 0.03 },
  write: { kind: 'simple', wave: 'square', freqStart: 1000, freqEnd: 700, duration: 0.05, gain: 0.035 },
  erase: { kind: 'simple', wave: 'square', freqStart: 700, freqEnd: 400, duration: 0.05, gain: 0.035 },
  success: { kind: 'chime', wave: 'square', notes: [659, 880, 1175], decay: 0.3, spacing: 0.06, gain: 0.04 },
  unlock: { kind: 'chime', wave: 'square', notes: [880, 1175, 1568, 1976], decay: 0.35, spacing: 0.06, gain: 0.045 }
});

// Make SoundManager available globally
window.SoundManager = SoundManager;

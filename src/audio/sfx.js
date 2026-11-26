// Sons générés avec WebAudio (aucun fichier). Démarre après le premier clic.
export class Sfx {
  constructor() {
    this.ctx = null;
    this.level = 0.48; // volume réglé dans le panneau Réglages
  }
  setVolume(v) { this.level = 0.6 * v; if (this.master) this.master.gain.value = this.level; }
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = this.level;
      this.master.connect(this.ctx.destination);
      this.buildV8();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  // ---------- Moteur V8 (type Mustang) entièrement synthétisé ----------
  // On fabrique UN cycle moteur (2 tours de vilebrequin = 8 explosions) avec l'allumage irrégulier
  // d'un V8 « cross-plane », ce qui donne le fameux grondement « bloub-bloub ». Ce cycle est joué en boucle,
  // et sa vitesse de lecture suit le régime (tr/min).
  buildV8() {
    const ctx = this.ctx, sr = ctx.sampleRate;
    const BASE_RPM = 1000;
    const cycle = 2 * 60 / BASE_RPM; // 0,12 s pour 2 tours à 1000 tr/min
    const cycles = 6; // plusieurs cycles légèrement différents : plus naturel
    const len = Math.floor(sr * cycle * cycles);
    const buf = ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    // ordre d'allumage d'un V8 cross-plane : alternance irrégulière entre les deux rangées
    const amp = [1.0, 0.62, 0.9, 0.7, 0.95, 0.58, 0.85, 0.74];
    const jit = [0, 0.035, -0.02, 0.05, 0.01, -0.04, 0.03, -0.015];
    for (let c = 0; c < cycles; c++) {
      for (let k = 0; k < 8; k++) {
        const t0 = (c + (k + jit[k] * (0.7 + Math.random() * 0.6)) / 8) * cycle;
        const i0 = Math.floor(t0 * sr);
        const a = amp[k] * (0.9 + Math.random() * 0.2);
        for (let n = 0; n < sr * 0.06 && i0 + n < len; n++) {
          const t = n / sr;
          const pulse = Math.exp(-t / 0.0045);                          // claquement d'échappement
          const body = Math.sin(2 * Math.PI * 92 * t) * Math.exp(-t / 0.018); // résonance du pot
          const rumble = Math.sin(2 * Math.PI * 46 * t) * Math.exp(-t / 0.03); // grave
          const hiss = (Math.random() * 2 - 1) * Math.exp(-t / 0.006) * 0.35;
          d[i0 + n] += a * (pulse * 0.55 + body * 0.75 + rumble * 0.6 + hiss);
        }
      }
    }
    let peak = 0; for (let n = 0; n < len; n++) peak = Math.max(peak, Math.abs(d[n]));
    for (let n = 0; n < len; n++) d[n] /= peak || 1;
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    // un peu de saturation pour le côté rageur
    const shaper = ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; curve[i] = Math.tanh(x * 2.2); }
    shaper.curve = curve;
    this.v8Filter = ctx.createBiquadFilter(); this.v8Filter.type = 'lowpass'; this.v8Filter.frequency.value = 500; this.v8Filter.Q.value = 2.5;
    this.v8Gain = ctx.createGain(); this.v8Gain.gain.value = 0;
    src.connect(shaper); shaper.connect(this.v8Filter); this.v8Filter.connect(this.v8Gain); this.v8Gain.connect(this.master);
    src.start();
    this.v8 = src;
    this.v8Base = BASE_RPM;
    this.rpm = 800;
    this.lastThrottle = 0;
  }

  // Régime simulé avec une boîte 5 vitesses : le régime chute à chaque passage de rapport
  rpmFor(ratio, throttle) {
    if (ratio < 0.02) return 800 + throttle * 2600; // à l'arrêt : ralenti, coups de gaz possibles
    const gears = [0, 0.16, 0.33, 0.52, 0.74, 1.01];
    let g = 0; while (g < 5 && ratio > gears[g + 1]) g++;
    const t = (ratio - gears[g]) / (gears[g + 1] - gears[g]);
    return (g === 0 ? 1100 : 2600) + t * (g === 0 ? 4700 : 3400) + throttle * 300;
  }

  backfire() {
    const n = 2 + Math.floor(Math.random() * 3);
    for (let k = 0; k < n; k++) {
      const t = this.ctx.currentTime + 0.05 + k * (0.06 + Math.random() * 0.08);
      const len = 0.05, buf = this.ctx.createBuffer(1, this.ctx.sampleRate * len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
      const s = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
      f.type = 'bandpass'; f.frequency.value = 600 + Math.random() * 500; g.gain.value = 0.55;
      s.buffer = buf; s.connect(f); f.connect(g); g.connect(this.master); s.start(t);
    }
  }

  // on : dans une voiture ; ratio : vitesse 0..1 ; throttle : accélérateur 0..1
  engine(on, ratio, throttle = 0) {
    if (!this.ctx || !this.v8) return;
    const t = this.ctx.currentTime;
    const target = this.rpmFor(ratio, throttle);
    this.rpm += (target - this.rpm) * (target > this.rpm ? 0.12 : 0.08);
    // lâcher de l'accélérateur à haut régime : pétarades
    if (on && this.lastThrottle > 0.6 && throttle < 0.1 && this.rpm > 3800 && Math.random() < 0.7) this.backfire();
    this.lastThrottle = throttle;
    this.v8.playbackRate.setTargetAtTime(this.rpm / this.v8Base, t, 0.04);
    this.v8Filter.frequency.setTargetAtTime(380 + this.rpm * 0.22 + throttle * 900, t, 0.06);
    const vol = on ? 0.32 + throttle * 0.38 + (this.rpm / 6500) * 0.2 : 0;
    this.v8Gain.gain.setTargetAtTime(vol, t, on ? 0.06 : 0.3);
  }
  tone(freq, dur, type = 'sine', vol = 0.2, delay = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.05);
  }
  horn() { this.tone(392, 0.4, 'square', 0.12); this.tone(494, 0.4, 'square', 0.1); }
  pickup() { [660, 880, 1320].forEach((f, k) => this.tone(f, 0.15, 'triangle', 0.2, k * 0.07)); }
  success(short) { (short ? [523, 784] : [523, 659, 784, 1047]).forEach((f, k) => this.tone(f, 0.3, 'triangle', 0.22, k * 0.13)); }
  fail() { [400, 300].forEach((f, k) => this.tone(f, 0.25, 'sawtooth', 0.1, k * 0.15)); }
  click() { this.tone(900, 0.05, 'sine', 0.08); }
  hit(i) {
    if (!this.ctx) return;
    const len = 0.25, buf = this.ctx.createBuffer(1, this.ctx.sampleRate * len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let n = 0; n < d.length; n++) d[n] = (Math.random() * 2 - 1) * Math.pow(1 - n / d.length, 3);
    const s = this.ctx.createBufferSource(), g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 900; g.gain.value = 0.5 * i;
    s.buffer = buf; s.connect(f); f.connect(g); g.connect(this.master); s.start();
  }
}

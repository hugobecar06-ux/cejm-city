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
      const o1 = this.ctx.createOscillator(), o2 = this.ctx.createOscillator();
      o1.type = 'sawtooth'; o2.type = 'square'; o2.detune.value = 8;
      this.filter = this.ctx.createBiquadFilter(); this.filter.type = 'lowpass'; this.filter.frequency.value = 400;
      this.engineGain = this.ctx.createGain(); this.engineGain.gain.value = 0;
      o1.connect(this.filter); o2.connect(this.filter); this.filter.connect(this.engineGain); this.engineGain.connect(this.master);
      o1.start(); o2.start();
      this.o1 = o1; this.o2 = o2;
      this.loadF1();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  // Son de Formule 1 (public/sounds/f1.mp3) : on cherche la partie la plus régulière du moteur
  // et on la joue en boucle ; sa hauteur suit la vitesse, son volume suit l'accélération.
  async loadF1() {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}sounds/f1.mp3`);
      const buf = await this.ctx.decodeAudioData(await res.arrayBuffer());
      const data = buf.getChannelData(0), sr = buf.sampleRate;
      const win = Math.floor(sr * 0.1), n = Math.floor(data.length / win);
      const rms = new Float32Array(n);
      for (let k = 0; k < n; k++) { let s = 0; for (let j = k * win; j < (k + 1) * win; j += 4) s += data[j] * data[j]; rms[k] = Math.sqrt(s / (win / 4)); }
      const span = Math.min(n - 1, 20); // fenêtre de 2 s
      let best = 0, bestScore = -1;
      for (let k = 0; k + span < n; k++) {
        let m = 0; for (let j = k; j < k + span; j++) m += rms[j]; m /= span;
        let v = 0; for (let j = k; j < k + span; j++) v += (rms[j] - m) ** 2; v = Math.sqrt(v / span);
        const score = m - v * 2.5; // fort et régulier
        if (score > bestScore) { bestScore = score; best = k; }
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      src.loopStart = (best * win) / sr; src.loopEnd = ((best + span) * win) / sr;
      const peak = Math.max(...rms.slice(best, best + span)) || 0.3;
      this.f1Gain = this.ctx.createGain(); this.f1Gain.gain.value = 0;
      this.f1Norm = Math.min(3, 0.35 / peak);
      src.connect(this.f1Gain); this.f1Gain.connect(this.master);
      src.start(0, src.loopStart);
      this.f1 = src;
    } catch (e) {
      console.warn('Son F1 indisponible, moteur synthétique utilisé', e);
    }
  }

  // on : dans une voiture ; ratio : vitesse 0..1 ; throttle : accélérateur 0..1
  engine(on, ratio, throttle = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    if (this.f1) {
      this.engineGain.gain.setTargetAtTime(0, t, 0.1);
      // à l'arrêt : ralenti grave ; en accélérant : le régime monte
      const rate = 0.55 + ratio * 0.85 + throttle * 0.18;
      this.f1.playbackRate.setTargetAtTime(rate, t, throttle > 0 ? 0.12 : 0.3);
      const vol = on ? (0.22 + ratio * 0.38 + throttle * 0.4) * this.f1Norm : 0;
      this.f1Gain.gain.setTargetAtTime(vol, t, on ? 0.08 : 0.25);
      return;
    }
    const f = 45 + ratio * 130;
    this.o1.frequency.setTargetAtTime(f, t, 0.05);
    this.o2.frequency.setTargetAtTime(f * 0.5, t, 0.05);
    this.filter.frequency.setTargetAtTime(300 + ratio * 1400, t, 0.05);
    this.engineGain.gain.setTargetAtTime(on ? 0.06 + ratio * 0.05 : 0, t, 0.1);
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

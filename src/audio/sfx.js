// Sons générés avec WebAudio (aucun fichier). Démarre après le premier clic.
export class Sfx {
  constructor() {
    this.ctx = null;
    try { this.muted = localStorage.getItem('dc.muted') === '1'; } catch { this.muted = false; }
  }
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : 0.6;
      this.master.connect(this.ctx.destination);
      const o1 = this.ctx.createOscillator(), o2 = this.ctx.createOscillator();
      o1.type = 'sawtooth'; o2.type = 'square'; o2.detune.value = 8;
      this.filter = this.ctx.createBiquadFilter(); this.filter.type = 'lowpass'; this.filter.frequency.value = 400;
      this.engineGain = this.ctx.createGain(); this.engineGain.gain.value = 0;
      o1.connect(this.filter); o2.connect(this.filter); this.filter.connect(this.engineGain); this.engineGain.connect(this.master);
      o1.start(); o2.start();
      this.o1 = o1; this.o2 = o2;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  toggleMute() {
    this.muted = !this.muted;
    try { localStorage.setItem('dc.muted', this.muted ? '1' : '0'); } catch { /* stockage indisponible */ }
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.6;
    return this.muted;
  }
  engine(on, ratio) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
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

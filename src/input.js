// Clavier (event.code => AZERTY et QWERTY), souris/tactile pour la caméra, actions virtuelles (mobile)
const ACTIONS = {
  interact: ['KeyE'], notebook: ['KeyJ'], advance: ['Enter', 'NumpadEnter', 'Space'],
  horn: ['KeyH'], debug: ['KeyP'], mute: ['KeyM'], handbrake: ['Space'], jump: ['Space'], map: ['KeyC'],
};
const BLOCK = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

export class Input {
  constructor(canvas) {
    this.keys = new Set(); this.just = new Set(); this.virtual = new Set();
    this.hold = {};
    this.joy = { x: 0, y: 0 };
    this.pedal = { gas: false, brake: false, left: false, right: false };
    this.dragX = 0; this.dragY = 0; this.lastDrag = -10;
    this.listeners = [];
    window.addEventListener('keydown', (e) => {
      if (BLOCK.has(e.code)) e.preventDefault();
      if (!e.repeat) { this.just.add(e.code); this.listeners.forEach((f) => f(e.code)); }
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
    // Bloque le zoom de la page (pincement, double-tap, Ctrl+molette) : la caméra se règle dans Réglages
    const stop = (e) => e.preventDefault();
    for (const t of ['gesturestart', 'gesturechange', 'gestureend', 'dblclick']) document.addEventListener(t, stop, { passive: false });
    document.addEventListener('touchmove', (e) => { if (e.touches.length > 1 || e.scale && e.scale !== 1) e.preventDefault(); }, { passive: false });
    let lastTouch = 0;
    document.addEventListener('touchend', (e) => { const n = Date.now(); if (n - lastTouch < 300 && e.target.tagName !== 'INPUT') e.preventDefault(); lastTouch = n; }, { passive: false });
    window.addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
    const drags = new Map();
    canvas.addEventListener('pointerdown', (e) => { drags.set(e.pointerId, { x: e.clientX, y: e.clientY }); canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => {
      const d = drags.get(e.pointerId); if (!d) return;
      this.dragX += e.clientX - d.x; this.dragY += e.clientY - d.y;
      d.x = e.clientX; d.y = e.clientY;
      this.lastDrag = performance.now() / 1000;
    });
    const up = (e) => drags.delete(e.pointerId);
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  }
  onKey(f) { this.listeners.push(f); }
  down(code) { return this.keys.has(code); }
  action(name) { return this.virtual.has(name) || ACTIONS[name].some((c) => this.just.has(c)); }
  holding(name) { return !!this.hold[name] || ACTIONS[name].some((c) => this.keys.has(c)); }
  trigger(name) { this.virtual.add(name); }
  kb() {
    const k = this.keys;
    return {
      x: (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0),
      y: (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0),
    };
  }
  // À pied : clavier + joystick (toutes directions)
  axis() {
    const { x, y } = this.kb();
    const c = (v) => Math.max(-1, Math.min(1, v));
    return { x: c(x + this.joy.x), y: c(y - this.joy.y) };
  }
  // En voiture : joystick = direction seulement, pédales = avancer / freiner-reculer
  carAxis() {
    const { x, y } = this.kb();
    const c = (v) => Math.max(-1, Math.min(1, v));
    const p = this.pedal;
    return { x: c(x + (p.right ? 1 : 0) - (p.left ? 1 : 0)), y: c(y + (p.gas ? 1 : 0) - (p.brake ? 1 : 0)) };
  }
  endFrame() { this.just.clear(); this.virtual.clear(); this.dragX = 0; this.dragY = 0; }
}

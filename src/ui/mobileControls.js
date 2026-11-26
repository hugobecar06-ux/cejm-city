const $ = (id) => document.getElementById(id);

// Commandes tactiles : joystick à gauche, gros boutons à droite
export class MobileControls {
  constructor(input) {
    this.enabled = window.matchMedia('(pointer: coarse)').matches || /[?&]mobile/.test(location.search);
    this.input = input;
    if (!this.enabled) return;
    document.body.classList.add('touch');
    const base = $('joy'), knob = $('joy-knob');
    let id = null, cx = 0, cy = 0;
    const R = 50;
    base.addEventListener('pointerdown', (e) => {
      id = e.pointerId; base.setPointerCapture(id);
      const r = base.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2;
      move(e); e.preventDefault();
    });
    const move = (e) => {
      if (e.pointerId !== id) return;
      let dx = e.clientX - cx, dy = e.clientY - cy;
      const l = Math.hypot(dx, dy);
      if (l > R) { dx *= R / l; dy *= R / l; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      input.joy.x = dx / R; input.joy.y = dy / R;
    };
    const end = (e) => { if (e.pointerId !== id) return; id = null; input.joy.x = 0; input.joy.y = 0; knob.style.transform = ''; };
    base.addEventListener('pointermove', move);
    base.addEventListener('pointerup', end);
    base.addEventListener('pointercancel', end);
    const btn = (el, name, hold) => {
      el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); if (hold) input.hold[name] = true; else input.trigger(name); });
      const up = () => { if (hold) input.hold[name] = false; };
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('pointerleave', up);
    };
    btn($('m-action'), 'interact');
    btn($('m-brake'), 'handbrake', true);
    btn($('m-book'), 'notebook');
    btn($('m-horn'), 'horn');
    this.action = $('m-action');
  }
  setActionLabel(t) { if (this.enabled && this.action.textContent !== t) this.action.textContent = t; }
}

const $ = (id) => document.getElementById(id);

// Commandes tactiles :
//  - à pied : joystick = se déplacer dans toutes les directions
//  - en voiture : joystick = tourner uniquement, pédales GAZ / FREIN-RECUL à droite
export class MobileControls {
  constructor(input) {
    this.enabled = window.matchMedia('(pointer: coarse)').matches || /[?&]mobile/.test(location.search);
    this.input = input;
    this.inCar = null;
    if (!this.enabled) return;
    document.body.classList.add('touch');
    const base = $('joy'), knob = $('joy-knob');
    let id = null, cx = 0, cy = 0;
    base.addEventListener('pointerdown', (e) => {
      id = e.pointerId; base.setPointerCapture(id);
      const r = base.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2;
      move(e); e.preventDefault();
    });
    const move = (e) => {
      if (e.pointerId !== id) return;
      const R = base.clientWidth * 0.36;
      let dx = e.clientX - cx, dy = this.inCar ? 0 : e.clientY - cy;
      const l = Math.hypot(dx, dy);
      if (l > R) { dx *= R / l; dy *= R / l; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      input.joy.x = dx / R; input.joy.y = dy / R;
    };
    const end = (e) => { if (e.pointerId !== id) return; id = null; input.joy.x = 0; input.joy.y = 0; knob.style.transform = ''; };
    base.addEventListener('pointermove', move);
    base.addEventListener('pointerup', end);
    base.addEventListener('pointercancel', end);

    const hold = (el, name) => {
      const down = (e) => { e.preventDefault(); el.setPointerCapture?.(e.pointerId); input.pedal[name] = true; el.classList.add('on'); };
      const up = () => { input.pedal[name] = false; el.classList.remove('on'); };
      el.addEventListener('pointerdown', down);
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up);
    };
    hold($('p-gas'), 'gas');
    hold($('p-brake'), 'brake');
    this.action = $('m-action');
    this.action.addEventListener('pointerdown', (e) => { e.preventDefault(); input.trigger('interact'); });
  }

  setMode(inCar) {
    if (!this.enabled || this.inCar === inCar) return;
    this.inCar = inCar;
    document.body.classList.toggle('in-car', inCar);
    this.input.joy.y = 0;
    if (!inCar) { this.input.pedal.gas = false; this.input.pedal.brake = false; }
  }

  setActionLabel(t, visible = true) {
    if (!this.enabled) return;
    if (this.action.textContent !== t) this.action.textContent = t;
    this.action.classList.toggle('idle', !visible);
  }
}

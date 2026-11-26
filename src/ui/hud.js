const $ = (id) => document.getElementById(id);

export class Hud {
  constructor() {
    this.el = {
      title: $('mission-title'), obj: $('mission-obj'), extra: $('mission-extra'),
      defs: $('defcount'), toasts: $('toasts'), banner: $('banner'), hint: $('hint'),
      speedo: $('speedo'), speed: $('speed-val'), compass: $('compass'), arrow: $('arrow'), dist: $('dist'),
      yield: $('yield'), price: $('yield-price'), demand: $('yield-demand'), yfb: $('yield-feedback'),
    };
    this.hint = '';
    this.override = null;
    this.last = {};
  }
  set(key, el, prop, val) { if (this.last[key] !== val) { this.last[key] = val; el[prop] = val; } }
  setMission(title, obj, extra, urgent) {
    this.set('t', this.el.title, 'textContent', title);
    this.set('o', this.el.obj, 'textContent', obj);
    this.set('e', this.el.extra, 'textContent', extra);
    this.el.extra.classList.toggle('urgent', !!urgent);
  }
  setDefs(n) { this.el.defs.textContent = `Définitions : ${n}/10`; }
  toast(text, secs = 3) {
    const d = document.createElement('div');
    d.className = 'toast'; d.textContent = text;
    this.el.toasts.appendChild(d);
    setTimeout(() => d.classList.add('out'), secs * 1000);
    setTimeout(() => d.remove(), secs * 1000 + 500);
  }
  banner(sup, title) {
    const b = this.el.banner;
    b.innerHTML = `<div class="b-sup">${sup}</div><div class="b-title">${title}</div>`;
    b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
  }
  setHint(t) { this.hint = t; this.applyHint(); }
  setHintOverride(t) { this.override = t; this.applyHint(); }
  applyHint() {
    const t = this.override || this.hint;
    this.set('h', this.el.hint, 'textContent', t || '');
    this.el.hint.style.display = t ? 'block' : 'none';
  }
  setSpeed(kmh) {
    if (kmh === null) { this.el.speedo.style.display = 'none'; return; }
    this.el.speedo.style.display = 'flex';
    this.set('s', this.el.speed, 'textContent', String(kmh));
  }
  setArrow(angle, dist) {
    if (angle === null) { this.el.compass.style.display = 'none'; return; }
    this.el.compass.style.display = 'flex';
    this.el.arrow.style.transform = `rotate(${angle}rad)`;
    this.set('d', this.el.dist, 'textContent', `${Math.round(dist)} m`);
  }
  showYield() { this.el.yield.classList.remove('hidden'); this.el.yfb.textContent = 'Appuie sur E (ou ACTION) pour acheter.'; }
  hideYield() { this.el.yield.classList.add('hidden'); }
  updateYield(p, demand) {
    this.set('yp', this.el.price, 'textContent', `${Math.round(p)} €`);
    this.el.price.classList.toggle('cheap', p < 30);
    this.set('yd', this.el.demand, 'textContent', `Demande : ${demand}`);
  }
  yieldFeedback(t) { this.el.yfb.textContent = t; }
}

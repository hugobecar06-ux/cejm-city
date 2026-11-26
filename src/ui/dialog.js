const $ = (id) => document.getElementById(id);
const COLORS = { 'Léa': '#ff3d8b', UBIK: '#28e0d8' };

// Boîte de dialogue (effet machine à écrire) — Entrée / Espace / clic
export class Dialog {
  constructor(game) {
    this.game = game;
    this.box = $('dialog'); this.name = $('dlg-name'); this.text = $('dlg-text');
    this.isOpen = false;
    this.box.addEventListener('click', () => this.advance());
  }
  show(lines, onDone) {
    this.lines = lines; this.i = 0; this.onDone = onDone; this.isOpen = true;
    this.box.classList.remove('hidden');
    this.render();
  }
  render() {
    const [who, txt] = this.lines[this.i];
    this.name.textContent = who;
    this.name.style.background = COLORS[who] || '#ffb000';
    this.full = txt; this.shown = 0; this.text.textContent = '';
  }
  update(dt) {
    if (!this.isOpen || this.shown >= this.full.length) return;
    this.shown = Math.min(this.full.length, this.shown + dt * 70);
    this.text.textContent = this.full.slice(0, Math.floor(this.shown));
  }
  advance() {
    if (!this.isOpen) return;
    this.game.sfx.click();
    if (this.shown < this.full.length) { this.shown = this.full.length; this.text.textContent = this.full; return; }
    this.i++;
    if (this.i >= this.lines.length) this.close();
    else this.render();
  }
  close() {
    this.isOpen = false;
    this.box.classList.add('hidden');
    const cb = this.onDone; this.onDone = null;
    cb && cb();
  }
}

export class Quiz {
  constructor(game) {
    this.game = game;
    this.el = $('quiz'); this.q = $('quiz-q'); this.ans = $('quiz-answers'); this.fb = $('quiz-feedback'); this.cont = $('quiz-continue');
    this.isOpen = false;
    this.cont.addEventListener('click', () => this.close());
  }
  show(step, onDone) {
    this.step = step; this.onDone = onDone; this.isOpen = true; this.solved = false;
    this.q.textContent = step.question;
    this.fb.textContent = ''; this.fb.className = '';
    this.cont.classList.add('hidden');
    this.ans.innerHTML = '';
    step.answers.forEach((a, k) => {
      const b = document.createElement('button');
      b.className = 'answer';
      b.innerHTML = `<span class="num">${k + 1}</span>${a}`;
      b.addEventListener('click', () => this.pick(k, b));
      this.ans.appendChild(b);
    });
    this.el.classList.remove('hidden');
  }
  pick(k, btn) {
    if (this.solved) return;
    btn = btn || this.ans.children[k];
    if (k === this.step.correct) {
      this.solved = true;
      btn.classList.add('good');
      this.fb.textContent = this.step.explain; this.fb.className = 'good';
      this.cont.classList.remove('hidden');
      this.game.sfx.pickup();
    } else {
      btn.classList.add('bad');
      this.fb.textContent = this.step.help + ' Essaie encore !'; this.fb.className = 'bad';
      this.game.sfx.fail();
    }
  }
  key(code) {
    if (code === 'Digit1' || code === 'Numpad1') this.pick(0);
    if (code === 'Digit2' || code === 'Numpad2') this.pick(1);
    if (code === 'Digit3' || code === 'Numpad3') this.pick(2);
    if ((code === 'Enter' || code === 'Space') && this.solved) this.close();
  }
  close() {
    this.isOpen = false;
    this.el.classList.add('hidden');
    const cb = this.onDone; this.onDone = null;
    cb && cb();
  }
}

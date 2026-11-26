import { DEFINITIONS, MISSIONS } from '../missions/missions.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>');

// Carnet de définitions (touche J)
export class Notebook {
  constructor(game) {
    this.game = game;
    this.el = $('notebook'); this.list = $('nb-list');
    this.isOpen = false;
    $('nb-close').addEventListener('click', () => this.close());
    const reset = $('nb-reset');
    reset.addEventListener('click', () => {
      if (reset.dataset.armed) game.resetProgress();
      else { reset.dataset.armed = '1'; reset.textContent = 'Confirmer : tout effacer ?'; setTimeout(() => { delete reset.dataset.armed; reset.textContent = 'Réinitialiser la progression'; }, 3000); }
    });
  }
  toggle() { this.isOpen ? this.close() : this.open(); }
  open() {
    const n = this.game.missions.completed;
    this.list.innerHTML = DEFINITIONS.map((d, k) => k < n
      ? `<details class="nb-item open" ${k === n - 1 ? 'open' : ''}><summary><span class="nb-num">${k + 1}</span>${d.term}</summary><p>${esc(d.text)}</p><p class="ex">${esc(d.example)}</p></details>`
      : `<div class="nb-item locked"><span class="nb-num">${k + 1}</span>🔒 ${MISSIONS[k].title.charAt(0) + MISSIONS[k].title.slice(1).toLowerCase()} — termine la mission ${k + 1}</div>`).join('');
    this.el.classList.remove('hidden');
    this.isOpen = true;
  }
  close() { this.el.classList.add('hidden'); this.isOpen = false; }
}

// Écrans : titre, carte « définition débloquée », fin
export class Screens {
  constructor(game) {
    this.game = game;
    this.def = $('defcard'); this.end = $('endscreen'); this.title = $('title');
    this.cardOpen = false;
    $('def-continue').addEventListener('click', () => this.closeDefinition());
    $('end-continue').addEventListener('click', () => { this.end.classList.add('hidden'); this.cardOpen = false; });
  }
  showDefinition(idx, d, cb) {
    $('def-num').textContent = `NOTION ${idx + 1}/10`;
    $('def-term').textContent = d.term;
    $('def-text').innerHTML = esc(d.text);
    $('def-ex').textContent = d.example;
    this.def.classList.remove('hidden');
    this.cardOpen = true; this.cb = cb;
  }
  closeDefinition() {
    if (this.def.classList.contains('hidden')) return;
    this.def.classList.add('hidden'); this.cardOpen = false;
    const cb = this.cb; this.cb = null; cb && cb();
  }
  showEnd() {
    $('end-list').innerHTML = DEFINITIONS.map((d, k) => `<li><b>${k + 1}. ${d.term}</b> — ${esc(d.text.split('. ')[0])}.</li>`).join('');
    this.end.classList.remove('hidden');
    this.cardOpen = true;
  }
}

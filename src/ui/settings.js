const $ = (id) => document.getElementById(id);
const KEY = 'cejmcity.settings.v1';
const DEFAULTS = { sound: true, volume: 80, sens: 100, autocam: true, camdist: 'far', quality: 'mid', btnsize: '1', minimap: true };

// Panneau Réglages (son, caméra, qualité, commandes tactiles) — sauvegardé dans localStorage
export class Settings {
  constructor(game) {
    this.game = game;
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { /* stockage indisponible */ }
    this.v = { ...DEFAULTS, ...saved };
    if (!saved.quality) this.v.quality = game.mobile ? 'mid' : 'high';
    this.el = $('settings');
    this.isOpen = false;
    $('btn-settings').addEventListener('click', () => this.open());
    $('set-close').addEventListener('click', () => this.close());
    const toggle = (id, key, on, off) => {
      const b = $(id);
      const render = () => { b.textContent = this.v[key] ? on : off; b.classList.toggle('off', !this.v[key]); };
      b.addEventListener('click', () => { this.v[key] = !this.v[key]; render(); this.apply(); });
      render();
    };
    toggle('set-sound', 'sound', 'Activé', 'Coupé');
    toggle('set-autocam', 'autocam', 'Activée', 'Désactivée');
    toggle('set-minimap', 'minimap', 'Affichée', 'Masquée');
    const range = (id, key) => { const r = $(id); r.value = this.v[key]; r.addEventListener('input', () => { this.v[key] = +r.value; this.apply(); }); };
    range('set-volume', 'volume');
    range('set-sens', 'sens');
    const seg = (id, key) => {
      const box = $(id);
      const render = () => box.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.v === String(this.v[key])));
      box.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; this.v[key] = b.dataset.v; render(); this.apply(); });
      render();
    };
    seg('set-quality', 'quality');
    seg('set-camdist', 'camdist');
    seg('set-btnsize', 'btnsize');
    this.apply();
  }

  open() { this.el.classList.remove('hidden'); this.isOpen = true; }
  close() { this.el.classList.add('hidden'); this.isOpen = false; }
  toggleSound() { this.v.sound = !this.v.sound; $('set-sound').textContent = this.v.sound ? 'Activé' : 'Coupé'; $('set-sound').classList.toggle('off', !this.v.sound); this.apply(); }

  apply() {
    const g = this.game, v = this.v;
    g.sfx.setVolume(v.sound ? v.volume / 100 : 0);
    const dpr = window.devicePixelRatio || 1;
    const pr = { low: 0.75, mid: 1, high: 1.5 }[v.quality] || 1;
    g.renderer.setPixelRatio(Math.min(dpr, pr));
    g.renderer.setSize(window.innerWidth, window.innerHeight);
    document.documentElement.style.setProperty('--ctl-scale', v.btnsize);
    document.body.classList.toggle('no-minimap', !v.minimap);
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* stockage indisponible */ }
  }
}

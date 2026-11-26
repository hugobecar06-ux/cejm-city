import * as THREE from 'three';

// Façade à fenêtres générée sur un canvas : 8 colonnes de 4 m, 8 étages de 3,5 m.
export const FACADE_U = 32; // mètres couverts par la texture en largeur
export const FACADE_V = 28; // mètres couverts en hauteur

export function makeFacadeTextures(rng) {
  const cols = 8, rows = 8, cw = 64, ch = 56;
  const W = cols * cw, H = rows * ch;
  const c1 = document.createElement('canvas'); c1.width = W; c1.height = H;
  const c2 = document.createElement('canvas'); c2.width = W; c2.height = H;
  const a = c1.getContext('2d');
  const b = c2.getContext('2d');
  a.fillStyle = '#ece6de'; a.fillRect(0, 0, W, H);
  b.fillStyle = '#000'; b.fillRect(0, 0, W, H);
  const litColors = ['#ffd27a', '#ffe3a6', '#ffc36b', '#ffb36b', '#bfe8ff', '#ff9ad5'];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cw, y = r * ch;
      a.fillStyle = '#d4ccc2'; a.fillRect(x, y + ch - 6, cw, 6);
      const g = a.createLinearGradient(0, y + 9, 0, y + ch - 13);
      g.addColorStop(0, '#6a7aa6'); g.addColorStop(1, '#262c48');
      a.fillStyle = g; a.fillRect(x + 9, y + 9, cw - 18, ch - 22);
      a.fillStyle = 'rgba(255,255,255,0.22)'; a.fillRect(x + 9, y + 9, cw - 18, 4);
      a.fillStyle = 'rgba(0,0,0,0.25)'; a.fillRect(x + cw / 2 - 1, y + 9, 2, ch - 22);
      if (rng() < 0.3) {
        const col = litColors[Math.floor(rng() * litColors.length)];
        b.globalAlpha = 0.55 + rng() * 0.45;
        b.fillStyle = col; b.fillRect(x + 9, y + 9, cw - 18, ch - 22);
        b.globalAlpha = 1;
        a.fillStyle = '#9a8a64'; a.fillRect(x + 9, y + 9, cw - 18, ch - 22);
      }
    }
  }
  const map = new THREE.CanvasTexture(c1);
  const emissive = new THREE.CanvasTexture(c2);
  for (const t of [map, emissive]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
  }
  return { map, emissive };
}

// Texture de texte (enseignes, étiquettes)
export function textTexture(text, opts = {}) {
  const {
    font = 'Anton', size = 110, color = '#ffffff', bg = null, glow = null,
    pad = 36, stroke = null, weight = '400', radius = 24, maxWidth = 2000,
  } = opts;
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  const fontStr = `${weight} ${size}px "${font}", Impact, "Arial Black", sans-serif`;
  ctx.font = fontStr;
  const tw = Math.min(maxWidth, Math.ceil(ctx.measureText(text).width));
  c.width = tw + pad * 2;
  c.height = Math.ceil(size * 1.3) + pad * 2;
  ctx.font = fontStr;
  if (bg) {
    ctx.fillStyle = bg;
    roundRect(ctx, 4, 4, c.width - 8, c.height - 8, radius);
    ctx.fill();
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const cx = c.width / 2, cy = c.height / 2 + size * 0.04;
  if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = size * 0.35; }
  if (stroke) { ctx.lineWidth = size * 0.12; ctx.strokeStyle = stroke; ctx.strokeText(text, cx, cy, maxWidth); }
  ctx.fillStyle = color;
  ctx.fillText(text, cx, cy, maxWidth);
  if (glow) { ctx.shadowBlur = size * 0.12; ctx.fillText(text, cx, cy, maxWidth); }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { texture: tex, aspect: c.width / c.height };
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ---------- Textures du sol (générées sur canvas) ----------
function canvasTex(size, draw, repeat) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) t.repeat.set(repeat, repeat);
  return t;
}

// Asphalte : grain, taches, rapiéçages
export function asphaltTexture(rng, repeat) {
  return canvasTex(512, (g, S) => {
    g.fillStyle = '#3a3842'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 9000; i++) {
      const v = 40 + Math.floor(rng() * 40);
      g.fillStyle = `rgba(${v},${v - 2},${v + 8},${0.25 + rng() * 0.35})`;
      g.fillRect(rng() * S, rng() * S, 1 + rng() * 2, 1 + rng() * 2);
    }
    for (let i = 0; i < 14; i++) {
      g.fillStyle = `rgba(20,18,26,${0.15 + rng() * 0.2})`;
      g.beginPath(); g.ellipse(rng() * S, rng() * S, 10 + rng() * 40, 6 + rng() * 25, rng() * 3, 0, Math.PI * 2); g.fill();
    }
    for (let i = 0; i < 4; i++) {
      g.fillStyle = 'rgba(70,68,80,0.55)';
      g.fillRect(rng() * S, rng() * S, 30 + rng() * 60, 20 + rng() * 40);
    }
    g.strokeStyle = 'rgba(15,12,20,0.5)'; g.lineWidth = 1.2;
    for (let i = 0; i < 6; i++) {
      g.beginPath(); let x = rng() * S, y = rng() * S; g.moveTo(x, y);
      for (let k = 0; k < 6; k++) { x += (rng() - 0.5) * 40; y += (rng() - 0.5) * 40; g.lineTo(x, y); }
      g.stroke();
    }
  }, repeat);
}

// Trottoir : dalles carrées avec joints et légères variations
export function sidewalkTexture(rng) {
  return canvasTex(512, (g, S) => {
    const n = 12, s = S / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const v = 178 + Math.floor(rng() * 22);
      g.fillStyle = `rgb(${v},${v - 10},${v - 16})`;
      g.fillRect(i * s, j * s, s, s);
    }
    g.strokeStyle = 'rgba(90,80,80,0.6)'; g.lineWidth = 2;
    for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, S); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(S, i * s); g.stroke(); }
    // bordure de trottoir plus claire
    g.strokeStyle = '#e8e2da'; g.lineWidth = 10; g.strokeRect(5, 5, S - 10, S - 10);
  });
}

// Herbe : brins et taches de couleur
export function grassTexture(rng, repeat) {
  return canvasTex(256, (g, S) => {
    g.fillStyle = '#5e8a3a'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 5000; i++) {
      const c = ['#4f7a30', '#6d9a44', '#7fae52', '#456d2a'][Math.floor(rng() * 4)];
      g.fillStyle = c; g.fillRect(rng() * S, rng() * S, 1, 2 + rng() * 3);
    }
    for (let i = 0; i < 30; i++) {
      g.fillStyle = ['#f4e04d', '#ffffff', '#ff8fc8'][Math.floor(rng() * 3)];
      g.fillRect(rng() * S, rng() * S, 2, 2);
    }
  }, repeat);
}

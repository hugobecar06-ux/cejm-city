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

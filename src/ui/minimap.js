import { HALF, SPACING, blockCenter, N_BLOCKS, SEA_X } from '../world/constants.js';

const MINX = -260, MAXX = 320, MINZ = -260, MAXZ = 260, PPM = 2; // pixels par mètre (carte de base)
const COL = { start: '#ffd400', goal: '#2f9bff', item: '#36e27a', bonus: '#b04dff' };

// Mini-carte ronde qui tourne avec la caméra
export class Minimap {
  constructor(canvas, city) {
    this.c = canvas;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.size = canvas.clientWidth || 170;
    canvas.width = this.size * dpr; canvas.height = this.size * dpr;
    this.ctx = canvas.getContext('2d');
    this.ctx.scale(dpr, dpr);
    this.base = this.makeBase(city);
  }
  makeBase(city) {
    const b = document.createElement('canvas');
    b.width = (MAXX - MINX) * PPM; b.height = (MAXZ - MINZ) * PPM;
    const g = b.getContext('2d');
    const X = (x) => (x - MINX) * PPM, Z = (z) => (z - MINZ) * PPM;
    g.fillStyle = '#2c3b28'; g.fillRect(0, 0, b.width, b.height);
    g.fillStyle = '#e8c98e'; g.fillRect(X(HALF + 5), 0, (SEA_X - HALF - 5) * PPM, b.height);
    g.fillStyle = '#1f6f8b'; g.fillRect(X(SEA_X), 0, b.width, b.height);
    g.fillStyle = '#8a8794'; g.fillRect(X(-HALF - 5), Z(-HALF - 5), (2 * HALF + 10) * PPM, (2 * HALF + 10) * PPM);
    for (let i = 0; i < N_BLOCKS; i++) for (let j = 0; j < N_BLOCKS; j++) {
      const cx = blockCenter(i), cz = blockCenter(j);
      g.fillStyle = '#3b3846';
      g.fillRect(X(cx - 15), Z(cz - 15), 30 * PPM, 30 * PPM);
    }
    for (const p of city.parks) { g.fillStyle = '#3f7d36'; g.fillRect(X(p.x - 12.5), Z(p.z - 12.5), 25 * PPM, 25 * PPM); }
    g.font = `bold ${7 * PPM}px Inter, sans-serif`; g.textAlign = 'center';
    for (const lm of Object.values(city.landmarks)) {
      g.fillStyle = '#c2408a';
      g.fillRect(X(lm.center.x - 12.5), Z(lm.center.z - 12.5), 25 * PPM, 25 * PPM);
    }
    for (const lm of Object.values(city.landmarks)) {
      g.fillStyle = '#ffffff';
      const words = lm.name.split(' ');
      words.forEach((w, k) => g.fillText(w, X(lm.center.x), Z(lm.center.z) + (k - (words.length - 1) / 2) * 8 * PPM + 3 * PPM));
    }
    return b;
  }
  draw(px, pz, camYaw, heading, points, target, mpp) {
    const g = this.ctx, S = this.size, R = S / 2;
    g.clearRect(0, 0, S, S);
    g.save();
    g.beginPath(); g.arc(R, R, R - 2, 0, Math.PI * 2); g.clip();
    g.fillStyle = '#1f6f8b'; g.fillRect(0, 0, S, S);
    const alpha = -Math.PI / 2 - Math.atan2(Math.cos(camYaw), Math.sin(camYaw));
    const k = 1 / mpp; // px par mètre à l'écran
    g.translate(R, R);
    g.rotate(alpha);
    g.scale(k / PPM, k / PPM);
    g.drawImage(this.base, -(px - MINX) * PPM, -(pz - MINZ) * PPM);
    g.restore();
    const ca = Math.cos(alpha), sa = Math.sin(alpha);
    const proj = (x, z) => { const dx = (x - px) * k, dz = (z - pz) * k; return [dx * ca - dz * sa, dx * sa + dz * ca]; };
    for (const p of points) {
      let [x, y] = proj(p.x, p.z);
      const l = Math.hypot(x, y), lim = R - 9;
      const edge = l > lim;
      if (edge) { x *= lim / l; y *= lim / l; }
      g.beginPath(); g.arc(R + x, R + y, edge ? 5 : 6, 0, Math.PI * 2);
      g.fillStyle = COL[p.kind]; g.fill();
      g.lineWidth = 2; g.strokeStyle = '#111'; g.stroke();
    }
    // joueur
    const [hx, hy] = proj(px + Math.sin(heading), pz + Math.cos(heading));
    const ang = Math.atan2(hy, hx);
    g.save(); g.translate(R, R); g.rotate(ang);
    g.beginPath(); g.moveTo(9, 0); g.lineTo(-6, -6); g.lineTo(-3, 0); g.lineTo(-6, 6); g.closePath();
    g.fillStyle = '#ffffff'; g.fill(); g.strokeStyle = '#ff3d8b'; g.lineWidth = 2; g.stroke();
    g.restore();
    g.beginPath(); g.arc(R, R, R - 2, 0, Math.PI * 2); g.lineWidth = 4; g.strokeStyle = 'rgba(255,61,139,0.9)'; g.stroke();
  }
}

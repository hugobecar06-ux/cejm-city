import { BOUNDS } from './constants.js';

// Collisions arcade : cercles contre boîtes alignées (AABB), avec grille spatiale.
export class Colliders {
  constructor(cell = 20) {
    this.cell = cell;
    this.grid = new Map();
    this.boxes = [];
    this.stamp = 0;
  }

  key(cx, cz) { return cx * 73856093 ^ cz * 19349663; }

  add(minX, minZ, maxX, maxZ, h = 10, tag = '') {
    const b = { minX, minZ, maxX, maxZ, h, tag, _s: 0 };
    this.boxes.push(b);
    const c = this.cell;
    for (let cx = Math.floor(minX / c); cx <= Math.floor(maxX / c); cx++) {
      for (let cz = Math.floor(minZ / c); cz <= Math.floor(maxZ / c); cz++) {
        const k = this.key(cx, cz);
        let arr = this.grid.get(k);
        if (!arr) { arr = []; this.grid.set(k, arr); }
        arr.push(b);
      }
    }
    return b;
  }

  forEachNear(x, z, r, fn) {
    this.stamp++;
    const c = this.cell;
    for (let cx = Math.floor((x - r) / c); cx <= Math.floor((x + r) / c); cx++) {
      for (let cz = Math.floor((z - r) / c); cz <= Math.floor((z + r) / c); cz++) {
        const arr = this.grid.get(this.key(cx, cz));
        if (!arr) continue;
        for (const b of arr) {
          if (b._s === this.stamp) continue;
          b._s = this.stamp;
          fn(b);
        }
      }
    }
  }

  // Repousse le cercle (p.x, p.z, r) hors des boîtes. Renvoie la normale cumulée.
  resolve(p, r) {
    const out = { hit: false, nx: 0, nz: 0, depth: 0 };
    for (let iter = 0; iter < 2; iter++) {
      this.forEachNear(p.x, p.z, r + 1, (b) => {
        const cx = Math.max(b.minX, Math.min(p.x, b.maxX));
        const cz = Math.max(b.minZ, Math.min(p.z, b.maxZ));
        let dx = p.x - cx, dz = p.z - cz;
        const d2 = dx * dx + dz * dz;
        if (d2 >= r * r) return;
        let nx, nz, pen;
        if (d2 > 1e-8) {
          const d = Math.sqrt(d2);
          nx = dx / d; nz = dz / d; pen = r - d;
        } else {
          // centre à l'intérieur de la boîte : sortie par le côté le plus proche
          const l = p.x - b.minX, rr = b.maxX - p.x, t = p.z - b.minZ, bt = b.maxZ - p.z;
          const m = Math.min(l, rr, t, bt);
          if (m === l) { nx = -1; nz = 0; pen = l + r; }
          else if (m === rr) { nx = 1; nz = 0; pen = rr + r; }
          else if (m === t) { nx = 0; nz = -1; pen = t + r; }
          else { nx = 0; nz = 1; pen = bt + r; }
        }
        p.x += nx * pen; p.z += nz * pen;
        out.hit = true; out.nx += nx; out.nz += nz; out.depth = Math.max(out.depth, pen);
      });
    }
    // Limites invisibles de la carte
    if (p.x < BOUNDS.minX + r) { p.x = BOUNDS.minX + r; out.hit = true; out.nx += 1; }
    if (p.x > BOUNDS.maxX - r) { p.x = BOUNDS.maxX - r; out.hit = true; out.nx -= 1; }
    if (p.z < BOUNDS.minZ + r) { p.z = BOUNDS.minZ + r; out.hit = true; out.nz += 1; }
    if (p.z > BOUNDS.maxZ - r) { p.z = BOUNDS.maxZ - r; out.hit = true; out.nz -= 1; }
    const l = Math.hypot(out.nx, out.nz);
    if (l > 0) { out.nx /= l; out.nz /= l; }
    return out;
  }

  // Le point (x, y, z) est-il à l'intérieur d'un bâtiment ? (pour la caméra)
  pointInside(x, y, z) {
    let inside = false;
    this.forEachNear(x, z, 0.5, (b) => {
      if (!inside && y < b.h && x > b.minX && x < b.maxX && z > b.minZ && z < b.maxZ) inside = true;
    });
    return inside;
  }
}

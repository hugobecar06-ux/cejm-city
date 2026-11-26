import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { FACADE_U, FACADE_V } from './textures.js';

const tmpColor = new THREE.Color();

// Assemble des primitives colorées en UNE géométrie (couleurs par sommet) => 1 seul draw call.
// part : { t:'box'|'cyl'|'cone'|'ico', w,h,d | r,rt,rb,h, seg, pos:[x,y,z], rot:[x,y,z], yaw, color }
export function partsGeometry(parts) {
  const geos = parts.map((p) => {
    let g;
    if (p.t === 'cyl') g = new THREE.CylinderGeometry(p.rt ?? p.r, p.rb ?? p.r, p.h, p.seg ?? 8, 1, !!p.open);
    else if (p.t === 'cone') g = new THREE.ConeGeometry(p.r, p.h, p.seg ?? 8);
    else if (p.t === 'ico') g = new THREE.IcosahedronGeometry(p.r, p.detail ?? 0);
    else g = new THREE.BoxGeometry(p.w, p.h, p.d);
    if (g.index) g = g.toNonIndexed();
    if (p.scale) g.scale(...p.scale);
    if (p.rot) { g.rotateX(p.rot[0] || 0); g.rotateY(p.rot[1] || 0); g.rotateZ(p.rot[2] || 0); }
    if (p.yaw) g.rotateY(p.yaw);
    if (p.pos) g.translate(p.pos[0], p.pos[1], p.pos[2]);
    g.deleteAttribute('uv');
    tmpColor.set(p.color ?? '#ffffff');
    const n = g.attributes.position.count;
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { col[i * 3] = tmpColor.r; col[i * 3 + 1] = tmpColor.g; col[i * 3 + 2] = tmpColor.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  });
  const merged = mergeGeometries(geos, false);
  geos.forEach((g) => g.dispose());
  return merged;
}

// Bâtiments à façades (UV en coordonnées « monde » pour que les fenêtres gardent la bonne taille).
// list : { x0, z0, x1, z1, y0, h, color }  -> groupe 0 = murs, groupe 1 = toits
export function buildingGeometry(list) {
  const wp = [], wn = [], wu = [], wc = [];
  const rp = [], rn = [], ru = [], rc = [];
  const col = new THREE.Color();
  const quad = (P, N, U, C, pts, n, uvs, c) => {
    const idx = [0, 1, 2, 0, 2, 3];
    for (const i of idx) {
      P.push(...pts[i]); N.push(...n); U.push(...uvs[i]); C.push(c.r, c.g, c.b);
    }
  };
  for (const b of list) {
    const { x0, z0, x1, z1 } = b;
    const y0 = b.y0 || 0, y1 = y0 + b.h;
    col.set(b.color);
    const v0 = y0 / FACADE_V, v1 = y1 / FACADE_V;
    const W = (x1 - x0) / FACADE_U, D = (z1 - z0) / FACADE_U;
    const uvW = [[0, v0], [W, v0], [W, v1], [0, v1]];
    const uvD = [[0, v0], [D, v0], [D, v1], [0, v1]];
    quad(wp, wn, wu, wc, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1], uvW, col);
    quad(wp, wn, wu, wc, [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], [0, 0, -1], uvW, col);
    quad(wp, wn, wu, wc, [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], [1, 0, 0], uvD, col);
    quad(wp, wn, wu, wc, [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0], uvD, col);
    const z = [0, 0];
    quad(rp, rn, ru, rc, [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], [0, 1, 0], [z, z, z, z], col);
  }
  const g = new THREE.BufferGeometry();
  const wallCount = wp.length / 3, roofCount = rp.length / 3;
  g.setAttribute('position', new THREE.Float32BufferAttribute([...wp, ...rp], 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute([...wn, ...rn], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([...wu, ...ru], 2));
  g.setAttribute('color', new THREE.Float32BufferAttribute([...wc, ...rc], 3));
  g.addGroup(0, wallCount, 0);
  g.addGroup(wallCount, roofCount, 1);
  g.computeBoundingSphere();
  return g;
}

import * as THREE from 'three';
import { blockCenter, SIDE_VEC } from './constants.js';
import { textTexture } from './textures.js';

// Lieux nommés des missions. i/j = indice du pâté (0..9) en x / z, side = côté de l'entrée.
export const LANDMARKS = [
  { id: 'hq', name: 'NEON CITY HQ', i: 4, j: 4, side: 's', kind: 'tower', color: '#7b86d6' },
  { id: 'martin', name: 'CABINET MARTIN', i: 1, j: 1, side: 'e', kind: 'office', color: '#c9b79c', h: 28 },
  { id: 'datacenter', name: 'DATA CENTER', i: 8, j: 8, side: 'w', kind: 'datacenter' },
  { id: 'ferme', name: 'FERME DUBOIS', i: 0, j: 9, side: 'n', kind: 'farm' },
  { id: 'leroy', name: 'MAISON DE MME LEROY', i: 6, j: 7, side: 'n', kind: 'house' },
  { id: 'hublocal', name: 'HUBLOCAL', i: 3, j: 6, side: 'e', kind: 'office', color: '#7fc8a9', h: 21 },
  { id: 'clicshop', name: 'ENTREPÔT CLICSHOP', i: 9, j: 1, side: 'w', kind: 'warehouse' },
  { id: 'taxis', name: 'PLACE DES TAXIS', i: 2, j: 5, side: 'e', kind: 'taxistand' },
  { id: 'partag', name: "PARTAG'VOISINS", i: 6, j: 2, side: 's', kind: 'shop', color: '#f2b880', awning: '#3aa17e' },
  { id: 'techstore', name: 'TECHSTORE', i: 5, j: 3, side: 'w', kind: 'shop', color: '#9aa4b8', awning: '#1e88e5' },
  { id: 'megaelec', name: 'MÉGA ÉLEC', i: 1, j: 7, side: 'e', kind: 'bigbox', color: '#e53935' },
  { id: 'prixplus', name: 'PRIX+', i: 8, j: 4, side: 'w', kind: 'bigbox', color: '#fb8c00' },
  { id: 'laplace', name: 'LA PLACE – MARKETPLACE', i: 3, j: 1, side: 's', kind: 'plaza' },
  { id: 'concession', name: 'CONCESSION AUTO', i: 7, j: 6, side: 'w', kind: 'dealer' },
  { id: 'locauto', name: "LOC'AUTO", i: 2, j: 8, side: 'n', kind: 'station' },
  { id: 'arcade', name: 'ARCADE NEON', i: 5, j: 8, side: 'n', kind: 'arcade' },
  { id: 'cafe', name: 'CAFÉ WIFI', i: 7, j: 3, side: 'n', kind: 'cafe' },
  { id: 'zenith', name: 'ZÉNITH', i: 9, j: 6, side: 'w', kind: 'arena' },
];

// Contexte de construction en repère local : +z local = côté de l'entrée.
export function makeLandmarkContext(lm, sinks) {
  const cx = blockCenter(lm.i), cz = blockCenter(lm.j);
  const [fx, fz] = SIDE_VEC[lm.side];
  const rx = fz, rz = -fx; // vecteur « droite » cohérent avec rotateY(yaw)
  const yaw = Math.atan2(fx, fz);
  const W = (lx, lz) => [cx + rx * lx + fx * lz, cz + rz * lx + fz * lz];
  const aabb = (lx0, lz0, lx1, lz1) => {
    const a = W(lx0, lz0), b = W(lx1, lz1);
    return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
  };
  const local = (p) => {
    const [x, z] = W(p.pos[0], p.pos[2]);
    return { ...p, pos: [x, p.pos[1], z], yaw: (p.yaw || 0) + yaw };
  };
  const ctx = {
    lm, cx, cz, yaw, W, aabb,
    facade(lx0, lz0, lx1, lz1, h, color, y0 = 0) {
      const [x0, z0, x1, z1] = aabb(lx0, lz0, lx1, lz1);
      sinks.facade.push({ x0, z0, x1, z1, h, y0, color });
    },
    plain(p) { sinks.plain.push(local(p)); },
    neon(p) { sinks.neon.push(local(p)); },
    collide(lx0, lz0, lx1, lz1, h = 10) {
      const [x0, z0, x1, z1] = aabb(lx0, lz0, lx1, lz1);
      sinks.colliders.add(x0, z0, x1, z1, h, lm.id);
    },
    park(lx, lz, kind, color, headingOffset = 0) {
      const [x, z] = W(lx, lz);
      sinks.parked.push({ x, z, heading: yaw + headingOffset, kind, color });
    },
    sign(text, { lz = 10.2, lx = 0, y = 6, width = 14, color = '#ffffff', glow = '#ff3d8b', bg = 'rgba(18,8,36,0.88)', size = 110 } = {}) {
      const { texture, aspect } = textTexture(text, { color, glow, bg, size });
      const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false, fog: true });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, width / aspect), mat);
      const [x, z] = W(lx, lz);
      mesh.position.set(x, y, z);
      mesh.rotation.y = yaw;
      sinks.group.add(mesh);
      return mesh;
    },
  };
  return ctx;
}

// Toit à deux pentes, faîtage le long de l'axe z local
function gable(ctx, lx, lz, w, d, wallH, rise, color) {
  const half = w / 2 + 0.4;
  const len = Math.hypot(half, rise);
  const ang = Math.atan2(rise, half);
  for (const s of [-1, 1]) {
    ctx.plain({ t: 'box', w: len, h: 0.3, d: d + 0.8, pos: [lx + s * half / 2, wallH + rise / 2, lz], rot: [0, 0, -s * ang], color });
  }
  const dia = (w / 2) * Math.SQRT2;
  ctx.plain({ t: 'box', w: dia, h: dia, d: d - 0.1, pos: [lx, wallH, lz], rot: [0, 0, Math.PI / 4], color: '#f3ece0' });
}

const BUILDERS = {
  tower(c) {
    c.facade(-11, -11, 11, 11, 119, c.lm.color);
    c.collide(-11, -11, 11, 11, 120);
    for (const [w, d, x, z] of [[22.4, 0.5, 0, 11], [22.4, 0.5, 0, -11], [0.5, 22.4, 11, 0], [0.5, 22.4, -11, 0]]) {
      c.neon({ t: 'box', w, h: 0.8, d, pos: [x, 119.4, z], color: '#ff3d8b' });
      c.neon({ t: 'box', w, h: 0.4, d, pos: [x, 60, z], color: '#28e0d8' });
    }
    c.plain({ t: 'cyl', r: 0.6, h: 18, pos: [0, 128, 0], color: '#cfd3ff' });
    c.neon({ t: 'ico', r: 1.2, pos: [0, 137, 0], color: '#ff3d8b' });
    c.plain({ t: 'box', w: 12, h: 0.6, d: 5, pos: [0, 4.5, 13], color: '#2a2440' });
    c.neon({ t: 'box', w: 12, h: 0.2, d: 0.2, pos: [0, 4.3, 15.5], color: '#28e0d8' });
    c.sign('NEON CITY HQ', { lz: 11.15, y: 9, width: 18 });
    c.sign('CEJM NEON CITY', { lz: 11.15, y: 110, width: 21.5, glow: '#28e0d8' });
  },
  office(c) {
    const h = c.lm.h || 24;
    c.facade(-10, -10, 10, 10, h, c.lm.color);
    c.collide(-10, -10, 10, 10, h);
    c.plain({ t: 'box', w: 8, h: 0.4, d: 3, pos: [0, 3.6, 11.4], color: '#33304a' });
    c.sign(c.lm.name, { lz: 10.15, y: 6.4, width: 14, glow: '#28e0d8' });
  },
  datacenter(c) {
    c.plain({ t: 'box', w: 24, h: 10, d: 24, pos: [0, 5, 0], color: '#8d96a3' });
    c.collide(-12, -12, 12, 12, 10);
    for (const y of [2.5, 5.5]) c.neon({ t: 'box', w: 24.2, h: 0.25, d: 24.2, pos: [0, y, 0], color: '#28c8ff' });
    for (let k = -1; k <= 1; k++) c.plain({ t: 'box', w: 4, h: 2, d: 4, pos: [k * 7, 11, -4], color: '#6b7380' });
    c.plain({ t: 'box', w: 3, h: 3.2, d: 0.3, pos: [0, 1.6, 12.1], color: '#1b2230' });
    c.sign('DATA CENTER', { lz: 12.15, y: 8, width: 15, glow: '#28c8ff' });
  },
  farm(c) {
    c.plain({ t: 'box', w: 25, h: 0.1, d: 25, pos: [0, 0.14, 0], color: '#a7a33f' });
    for (let k = -5; k <= 5; k++) c.plain({ t: 'box', w: 0.6, h: 0.25, d: 12, pos: [k * 2.1, 0.25, 5], color: '#6f8a2a' });
    c.plain({ t: 'box', w: 10, h: 6, d: 12, pos: [0, 3, -5], color: '#b8322a' });
    gable(c, 0, -5, 10, 12, 6, 3, '#7a1f19');
    c.plain({ t: 'box', w: 4, h: 4.2, d: 0.2, pos: [0, 2.1, 1.05], color: '#f3ece0' });
    c.plain({ t: 'box', w: 0.3, h: 5.6, d: 0.25, pos: [0, 2.1, 1.15], rot: [0, 0, 0.75], color: '#b8322a' });
    c.plain({ t: 'box', w: 0.3, h: 5.6, d: 0.25, pos: [0, 2.1, 1.15], rot: [0, 0, -0.75], color: '#b8322a' });
    c.plain({ t: 'cyl', r: 2.2, h: 10, seg: 12, pos: [7.5, 5, -6], color: '#d9d9d9' });
    c.plain({ t: 'ico', r: 2.2, detail: 1, scale: [1, 0.6, 1], pos: [7.5, 10, -6], color: '#9aa0a6' });
    for (const [x, z] of [[-8, -8], [-9, -4.5], [-7.5, 7]]) c.plain({ t: 'cyl', r: 0.8, h: 1.3, seg: 10, pos: [x, 0.9, z], rot: [0, 0, Math.PI / 2], color: '#e5c35a' });
    for (let k = -6; k <= 6; k++) if (Math.abs(k) > 1) c.plain({ t: 'box', w: 0.15, h: 1.1, d: 0.15, pos: [k * 2, 0.6, 12], color: '#f3ece0' });
    c.plain({ t: 'box', w: 24, h: 0.15, d: 0.1, pos: [0, 0.9, 12], color: '#f3ece0' });
    c.collide(-5, -11, 5, 1, 9);
    c.collide(5.3, -8.2, 9.7, -3.8, 12);
    c.plain({ t: 'box', w: 0.25, h: 3, d: 0.25, pos: [-4.5, 1.5, 11], color: '#5d3a1a' });
    c.plain({ t: 'box', w: 0.25, h: 3, d: 0.25, pos: [4.5, 1.5, 11], color: '#5d3a1a' });
    c.sign('FERME DUBOIS', { lz: 11.2, y: 3.2, width: 9.5, bg: '#7a3b1f', glow: null, size: 100 });
  },
  house(c) {
    c.plain({ t: 'box', w: 25, h: 0.1, d: 25, pos: [0, 0.14, 0], color: '#5f9e4a' });
    c.plain({ t: 'box', w: 10, h: 5, d: 8, pos: [0, 2.5, -2], color: '#f4c2c2' });
    gable(c, 0, -2, 10, 8, 5, 2.6, '#8c3b4a');
    c.plain({ t: 'box', w: 1.4, h: 2.4, d: 0.2, pos: [0, 1.2, 2.05], color: '#5d3a1a' });
    for (const x of [-3, 3]) c.plain({ t: 'box', w: 1.8, h: 1.4, d: 0.2, pos: [x, 2.8, 2.05], color: '#9fd3e6' });
    c.plain({ t: 'box', w: 1.6, h: 0.1, d: 9, pos: [0, 0.2, 7], color: '#d8cdb8' });
    for (let k = -6; k <= 6; k++) if (Math.abs(k) > 0) c.plain({ t: 'box', w: 0.15, h: 1, d: 0.15, pos: [k * 2, 0.6, 11.5], color: '#ffffff' });
    c.plain({ t: 'box', w: 24, h: 0.12, d: 0.08, pos: [0, 0.95, 11.5], color: '#ffffff' });
    for (const [x, z] of [[-8, 4], [8, 6], [-9, -8]]) {
      c.plain({ t: 'cyl', r: 0.25, h: 2, pos: [x, 1, z], color: '#6b4226' });
      c.plain({ t: 'ico', r: 1.8, detail: 0, pos: [x, 3, z], color: '#2f7d3a' });
    }
    c.collide(-5, -6, 5, 2, 8);
    c.plain({ t: 'box', w: 0.2, h: 2.6, d: 0.2, pos: [3.5, 1.3, 11.8], color: '#444' });
    c.sign('MAISON DE MME LEROY', { lz: 12, lx: 3.5, y: 2.9, width: 7.5, bg: '#2d6a4f', glow: null, size: 90 });
  },
  warehouse(c) {
    c.plain({ t: 'box', w: 24, h: 12, d: 22, pos: [0, 6, -1.5], color: '#c9c2b5' });
    c.plain({ t: 'box', w: 24.4, h: 0.6, d: 22.4, pos: [0, 12.2, -1.5], color: '#8a8478' });
    for (let k = -1; k <= 1; k++) {
      c.plain({ t: 'box', w: 5, h: 5, d: 0.2, pos: [k * 7, 2.5, 9.55], color: '#5a6170' });
      c.plain({ t: 'box', w: 5.6, h: 0.3, d: 1.6, pos: [k * 7, 5.4, 10.3], color: '#ff6f00' });
    }
    c.neon({ t: 'box', w: 24.2, h: 0.3, d: 0.2, pos: [0, 11, 9.6], color: '#ff6f00' });
    c.collide(-12, -12.5, 12, 9.5, 12);
    c.sign('ENTREPÔT CLICSHOP', { lz: 9.7, y: 8.4, width: 17, glow: '#ff6f00' });
  },
  taxistand(c) {
    c.plain({ t: 'box', w: 25, h: 0.06, d: 25, pos: [0, 0.15, 0], color: '#6c6a73' });
    for (let k = -2; k <= 2; k++) c.plain({ t: 'box', w: 0.2, h: 0.03, d: 7, pos: [k * 4, 0.2, 2], color: '#ffd400' });
    c.plain({ t: 'box', w: 6, h: 3, d: 4, pos: [0, 1.5, -8], color: '#e8e2d6' });
    c.plain({ t: 'box', w: 7, h: 0.4, d: 5, pos: [0, 3.2, -8], color: '#ffd400' });
    c.collide(-3, -10, 3, -6, 4);
    c.park(-6, 2, 'taxi', '#ffd400');
    c.park(-2, 2, 'taxi', '#ffd400');
    c.park(6, 2, 'taxi', '#ffd400');
    for (const x of [-5.2, 5.2]) c.plain({ t: 'box', w: 0.3, h: 4.6, d: 0.3, pos: [x, 2.3, 11], color: '#333' });
    c.sign('PLACE DES TAXIS', { lz: 11.2, y: 4, width: 10.5, color: '#111111', bg: '#ffd400', glow: null, size: 100 });
  },
  shop(c) {
    c.facade(-10, -10, 10, 8, 14, c.lm.color);
    c.collide(-10, -10, 10, 8, 14);
    c.plain({ t: 'box', w: 16, h: 2.6, d: 0.2, pos: [0, 1.5, 8.05], color: '#9fd3e6' });
    c.plain({ t: 'box', w: 18, h: 0.3, d: 2.6, pos: [0, 3.4, 9.3], rot: [0.2, 0, 0], color: c.lm.awning });
    c.sign(c.lm.name, { lz: 8.15, y: 5.6, width: 12.5, glow: c.lm.awning });
  },
  bigbox(c) {
    c.plain({ t: 'box', w: 24, h: 9, d: 16, pos: [0, 4.5, -4.5], color: '#ece8e1' });
    c.plain({ t: 'box', w: 24.3, h: 1.6, d: 16.3, pos: [0, 8.4, -4.5], color: c.lm.color });
    c.plain({ t: 'box', w: 10, h: 3, d: 0.2, pos: [0, 1.5, 3.55], color: '#9fd3e6' });
    c.collide(-12, -12.5, 12, 3.5, 9);
    c.plain({ t: 'box', w: 24, h: 0.04, d: 8.5, pos: [0, 0.14, 8], color: '#45444c' });
    for (let k = -5; k <= 5; k++) c.plain({ t: 'box', w: 0.15, h: 0.03, d: 4, pos: [k * 2.2, 0.17, 9], color: '#ffffff' });
    c.sign(c.lm.name, { lz: 3.7, y: 6.2, width: c.lm.name.length > 6 ? 15 : 10, glow: c.lm.color, bg: c.lm.color, color: '#ffffff' });
  },
  plaza(c) {
    c.plain({ t: 'box', w: 25, h: 0.06, d: 25, pos: [0, 0.15, 0], color: '#e8d6b0' });
    for (let k = -3; k <= 3; k++) {
      c.plain({ t: 'box', w: 25, h: 0.02, d: 0.15, pos: [0, 0.19, k * 3.5], color: '#cdb88f' });
      c.plain({ t: 'box', w: 0.15, h: 0.02, d: 25, pos: [k * 3.5, 0.19, 0], color: '#cdb88f' });
    }
    c.plain({ t: 'cyl', r: 2.6, h: 0.8, seg: 16, pos: [0, 0.5, -2], color: '#bfae8e' });
    c.plain({ t: 'cyl', r: 2.2, h: 0.1, seg: 16, pos: [0, 0.85, -2], color: '#3fb6d9' });
    c.plain({ t: 'cyl', r: 0.3, h: 3, pos: [0, 1.5, -2], color: '#bfae8e' });
    c.collide(-2.6, -4.6, 2.6, 0.6, 1);
    for (const x of [-7, 7]) {
      c.plain({ t: 'box', w: 0.9, h: 6.5, d: 0.9, pos: [x, 3.25, 11], color: '#2a2440' });
      c.collide(x - 0.45, 10.55, x + 0.45, 11.45, 7);
    }
    c.plain({ t: 'box', w: 15, h: 1, d: 0.9, pos: [0, 6.6, 11], color: '#2a2440' });
    c.sign('LA PLACE – MARKETPLACE', { lz: 11.5, y: 7.8, width: 15, glow: '#ffb000' });
  },
  dealer(c) {
    c.plain({ t: 'box', w: 24, h: 7, d: 12, pos: [0, 3.5, -6.5], color: '#a8d8ea' });
    c.plain({ t: 'box', w: 24.4, h: 0.6, d: 12.4, pos: [0, 7.2, -6.5], color: '#f4f4f4' });
    for (let k = -3; k <= 3; k++) c.plain({ t: 'box', w: 0.25, h: 7, d: 0.25, pos: [k * 4, 3.5, -0.45], color: '#f4f4f4' });
    c.collide(-12, -12.5, 12, -0.5, 7.5);
    c.plain({ t: 'box', w: 24, h: 0.04, d: 12, pos: [0, 0.14, 6.2], color: '#d6d3cc' });
    c.park(-7, 5, 'car', '#e53935', 0.5);
    c.park(0, 5, 'car', '#1e88e5', 0.5);
    c.park(7, 5, 'car', '#ffffff', 0.5);
    for (const x of [-11.5, 11.5]) {
      c.plain({ t: 'cyl', r: 0.1, h: 7, pos: [x, 3.5, 11.5], color: '#ddd' });
      c.neon({ t: 'box', w: 0.05, h: 1.2, d: 1.8, pos: [x, 6.2, 12.4], color: x < 0 ? '#ff3d8b' : '#28e0d8' });
    }
    c.sign('CONCESSION AUTO', { lz: -0.2, y: 8.6, width: 15, glow: '#28e0d8' });
  },
  station(c) {
    c.plain({ t: 'box', w: 25, h: 0.05, d: 25, pos: [0, 0.14, 0], color: '#55545c' });
    for (const [x, z] of [[-7.5, -1], [7.5, -1], [-7.5, 8], [7.5, 8]]) {
      c.plain({ t: 'box', w: 0.5, h: 5, d: 0.5, pos: [x, 2.5, z], color: '#e8e8e8' });
      c.collide(x - 0.25, z - 0.25, x + 0.25, z + 0.25, 5);
    }
    c.plain({ t: 'box', w: 17, h: 0.6, d: 11, pos: [0, 5.2, 3.5], color: '#2ecc71' });
    c.neon({ t: 'box', w: 17.1, h: 0.15, d: 11.1, pos: [0, 4.85, 3.5], color: '#7dffb0' });
    c.plain({ t: 'box', w: 10, h: 4, d: 6, pos: [0, 2, -8], color: '#f1f1f1' });
    c.collide(-5, -11, 5, -5, 4);
    c.sign("LOC'AUTO", { lz: 9.05, y: 6.3, width: 9, color: '#ffffff', bg: '#1f9d55', glow: null });
  },
  arcade(c) {
    c.facade(-10, -10, 10, 10, 12, '#5a3b8c');
    c.collide(-10, -10, 10, 10, 12);
    const cols = ['#ff2bd6', '#28e0d8', '#ffe14d', '#7cff6b'];
    for (let k = 0; k < 4; k++) {
      c.neon({ t: 'box', w: 20.2, h: 0.25, d: 0.25, pos: [0, 2.2 + k * 0.6, 10.05], color: cols[k] });
      c.neon({ t: 'box', w: 0.25, h: 0.25, d: 20.2, pos: [10.05, 11.5 - k * 0.6, 0], color: cols[k] });
      c.neon({ t: 'box', w: 0.25, h: 0.25, d: 20.2, pos: [-10.05, 11.5 - k * 0.6, 0], color: cols[k] });
    }
    c.neon({ t: 'box', w: 5, h: 0.3, d: 0.3, pos: [0, 4.6, 10.3], color: '#ff2bd6' });
    c.sign('ARCADE NEON', { lz: 10.2, y: 8, width: 15, color: '#ffffff', glow: '#ff2bd6' });
  },
  cafe(c) {
    c.plain({ t: 'box', w: 14, h: 7, d: 12, pos: [0, 3.5, -3], color: '#d98e4f' });
    c.plain({ t: 'box', w: 14.3, h: 0.5, d: 12.3, pos: [0, 7.1, -3], color: '#6d3b1f' });
    c.plain({ t: 'box', w: 8, h: 2.6, d: 0.2, pos: [0, 1.5, 3.05], color: '#9fd3e6' });
    for (let k = 0; k < 7; k++) c.plain({ t: 'box', w: 2, h: 0.25, d: 2.6, pos: [-6 + k * 2, 3.3, 4.3], rot: [0.25, 0, 0], color: k % 2 ? '#ffffff' : '#e53935' });
    c.collide(-7, -9, 7, 3, 7);
    for (const [x, z] of [[-4, 7.5], [0, 8.5], [4, 7.5], [-6, 10], [6, 10]]) {
      c.plain({ t: 'cyl', r: 0.6, h: 0.08, pos: [x, 1, z], color: '#ffffff' });
      c.plain({ t: 'cyl', r: 0.07, h: 1, pos: [x, 0.5, z], color: '#333' });
      c.plain({ t: 'cyl', r: 0.05, h: 2.4, pos: [x, 1.2, z], color: '#ddd' });
      c.plain({ t: 'cone', r: 1.3, h: 0.6, pos: [x, 2.5, z], color: '#28e0d8' });
    }
    c.sign('CAFÉ WIFI', { lz: 3.15, y: 5.4, width: 9, glow: '#28e0d8' });
  },
  arena(c) {
    c.plain({ t: 'cyl', r: 11.5, h: 12, seg: 28, pos: [0, 6, -1], color: '#e7e1f0' });
    c.plain({ t: 'cyl', rt: 5, rb: 12, h: 4, seg: 28, pos: [0, 14, -1], color: '#b9a7d6' });
    c.neon({ t: 'cyl', r: 11.6, h: 0.5, seg: 28, pos: [0, 11.5, -1], color: '#ff3d8b' });
    c.neon({ t: 'cyl', r: 11.6, h: 0.3, seg: 28, pos: [0, 3, -1], color: '#28e0d8' });
    c.collide(-11, -12, 11, 9.5, 16);
    c.plain({ t: 'box', w: 4, h: 3, d: 2.5, pos: [6, 1.5, 11.2], color: '#c62828' });
    c.plain({ t: 'box', w: 4.6, h: 0.3, d: 3, pos: [6, 3.1, 11.2], color: '#ffffff' });
    c.collide(4, 10, 8, 12.5, 3.5);
    c.sign('ZÉNITH', { lz: 10.8, y: 8.5, width: 10, glow: '#ff3d8b' });
    c.sign('BILLETTERIE', { lz: 12.5, lx: 6, y: 3.9, width: 4.2, glow: null, bg: '#c62828', size: 90 });
  },
};

export function buildLandmark(lm, sinks) {
  const ctx = makeLandmarkContext(lm, sinks);
  BUILDERS[lm.kind](ctx);
  const [dx, dz] = ctx.W(0, 18);
  lm.center = { x: ctx.cx, z: ctx.cz };
  lm.door = { x: dx, z: dz };
  lm.ctx = ctx;
  return lm;
}

// Stands de la marketplace (mission 7)
export function stallParts(ctx) {
  const parts = [];
  const cols = ['#e53935', '#1e88e5', '#43a047', '#fdd835', '#8e24aa', '#fb8c00'];
  const spots = [[-8, -8], [8, -8], [-8, 0], [8, 0], [-8, 6], [8, 6]];
  spots.forEach(([lx, lz], k) => {
    const L = (p) => {
      const [x, z] = ctx.W(p.pos[0] + lx, p.pos[2] + lz);
      return { ...p, pos: [x, p.pos[1], z], yaw: ctx.yaw };
    };
    for (const [px, pz] of [[-1.5, -1], [1.5, -1], [-1.5, 1], [1.5, 1]]) parts.push(L({ t: 'box', w: 0.12, h: 2.6, d: 0.12, pos: [px, 1.3, pz], color: '#eeeeee' }));
    parts.push(L({ t: 'box', w: 3.6, h: 0.25, d: 2.6, pos: [0, 2.7, 0], color: cols[k] }));
    parts.push(L({ t: 'box', w: 3.2, h: 1, d: 1, pos: [0, 0.65, 0.6], color: '#8d6e63' }));
    parts.push(L({ t: 'box', w: 0.5, h: 0.5, d: 0.5, pos: [-0.8, 1.4, 0.6], color: cols[(k + 2) % 6] }));
    parts.push(L({ t: 'box', w: 0.4, h: 0.6, d: 0.4, pos: [0.6, 1.45, 0.6], color: cols[(k + 4) % 6] }));
  });
  return parts;
}

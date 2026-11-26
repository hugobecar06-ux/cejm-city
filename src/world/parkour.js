import * as THREE from 'three';
import { blockCenter } from './constants.js';

const COLORS = ['#ff3d8b', '#28e0d8', '#ffb000', '#b04dff', '#36e27a'];
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const pillarMat = new THREE.MeshLambertMaterial({ color: '#3a3150' });
const lavaMat = new THREE.MeshBasicMaterial({ color: '#ff4a1c', transparent: true, opacity: 0.85, toneMapped: false });

// Parcours « deathrun » des missions à pied.
// level 1 → 5 : plateformes plus petites et plus espacées, plateformes mobiles (≥2),
// plateformes qui s'effondrent (≥3), lave au sol : si on tombe, retour au départ.
export class Parkour {
  constructor(scene) {
    this.scene = scene;
    this.plats = [];
    this.group = null;
    this.standing = null;
    this.course = null;
    this.t = 0;
  }

  get boxes() { return this.plats; }

  spawn({ block, rot = 0, level = 1 }) {
    this.clear();
    const cx = blockCenter(block[0]), cz = blockCenter(block[1]);
    const c = [[1, 0], [0, 1], [-1, 0], [0, -1]][rot];
    const R = (lx, lz) => [cx + lx * c[0] - lz * c[1], cz + lx * c[1] + lz * c[0]];
    const ax = (dx, dz) => [dx * c[0] - dz * c[1], dx * c[1] + dz * c[0]]; // direction tournée
    const half = Math.max(0.62, 1.15 - level * 0.1);
    const gap = 3.0 + level * 0.18;
    // Tracé en « L » le long de deux bords du parc, qui monte progressivement
    const pts = [];
    let lx = -11.5, lz = 11.2, top = 0.7;
    const n1 = Math.floor(22.7 / gap) + 1;
    for (let k = 0; k < n1; k++) { pts.push([lx, lz, top]); lx += gap; if (k % 3 !== 1) top += 0.7; }
    lx = 11.2; lz = 11.2 - gap;
    while (lz > -11.5) { pts.push([lx, lz, top]); lz -= gap; top += 0.7; }
    this.group = new THREE.Group();
    // Lave sous le parcours (niveau ≥ 2) : la toucher = retour au départ
    if (level >= 2) {
      for (const [w, d, x, z] of [[25, 5, 0, 11.2], [5, 25, 11.2, 0]]) {
        const lava = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), lavaMat);
        const [px, pz] = R(x, z);
        const [sx, sz] = ax(w, d);
        lava.scale.set(Math.abs(sx), Math.abs(sz), 1);
        lava.rotation.x = -Math.PI / 2; lava.position.set(px, 0.22, pz);
        this.group.add(lava);
      }
    }
    pts.forEach(([plx, plz, ptop], k) => {
      const last = k === pts.length - 1;
      const h = last ? 1.6 : half;
      const [x, z] = R(plx, plz);
      const mat = new THREE.MeshLambertMaterial({ color: COLORS[k % COLORS.length], emissive: COLORS[k % COLORS.length], emissiveIntensity: 0.25 });
      const mesh = new THREE.Mesh(boxGeo, [pillarMat, pillarMat, mat, pillarMat, pillarMat, pillarMat]);
      mesh.scale.set(h * 2, ptop, h * 2);
      mesh.castShadow = true;
      this.group.add(mesh);
      const p = { x, z, bx: x, bz: z, half: h, top: ptop, mesh, active: true, move: null, crumble: null };
      if (!last && k > 0) {
        if (level >= 2 && k % 4 === 2) {
          const [mx, mz] = ax(plz > 11 ? 0 : 1, plz > 11 ? 1 : 0); // bouge perpendiculairement au tracé
          p.move = { dx: mx, dz: mz, amp: 1.2 + level * 0.35, speed: 0.9 + level * 0.25, phase: k };
        } else if (level >= 3 && k % 4 === 0) {
          p.crumble = { t: 0, down: 0 };
          mat.color.set('#ff7b2e'); mat.emissive.set('#ff3b00');
        } else if (level >= 5 && k % 4 === 3) {
          p.move = { dx: 0, dz: 0, vertical: true, amp: 0.9, speed: 1.6, phase: k };
        }
      }
      this.plats.push(p);
      this.placeMesh(p);
    });
    this.scene.add(this.group);
    const last = pts[pts.length - 1];
    const [tx, tz] = R(last[0], last[1]);
    const [sx, sz] = R(pts[0][0] - 3.5, pts[0][1]);
    this.course = { start: { x: sx, z: sz }, started: false, falls: 0 };
    return { top: { x: tx, z: tz, y: last[2] }, start: { x: sx, z: sz } };
  }

  placeMesh(p) {
    const yOff = p.move?.vertical ? p.dy || 0 : 0;
    p.mesh.position.set(p.x, (p.top + yOff) / 2, p.z);
    p.mesh.scale.y = Math.max(0.05, p.top + yOff);
    p.mesh.visible = p.active;
  }

  clear() {
    if (this.group) {
      this.group.traverse((o) => { if (o.material && o.material !== pillarMat && o.material !== lavaMat && !Array.isArray(o.material)) o.material.dispose?.(); });
      this.scene.remove(this.group); this.group = null;
    }
    this.plats = []; this.course = null; this.standing = null;
  }

  // Animation des plateformes + transport du joueur + chute dans la lave
  update(dt, player, onFall) {
    if (!this.plats.length) return;
    this.t += dt;
    for (const p of this.plats) {
      if (p.move) {
        const ox = p.x, oz = p.z, oy = p.dy || 0;
        const s = Math.sin(this.t * p.move.speed + p.move.phase);
        if (p.move.vertical) p.dy = s * p.move.amp;
        else { p.x = p.bx + p.move.dx * s * p.move.amp; p.z = p.bz + p.move.dz * s * p.move.amp; }
        if (this.standing === p && !player.vehicle) {
          player.pos.x += p.x - ox; player.pos.z += p.z - oz;
          if (p.move.vertical) player.y += (p.dy || 0) - oy;
        }
        this.placeMesh(p);
      }
      if (p.crumble) {
        const cr = p.crumble;
        if (p.active && this.standing === p) {
          cr.t += dt;
          p.mesh.position.x = p.x + Math.sin(this.t * 60) * 0.06; // tremble
          if (cr.t > 0.45) { p.active = false; cr.down = 2.5; this.placeMesh(p); }
        } else if (!p.active) {
          cr.down -= dt;
          if (cr.down <= 0) { p.active = true; cr.t = 0; this.placeMesh(p); }
        } else cr.t = Math.max(0, cr.t - dt);
      }
    }
    const c = this.course;
    if (!c || player.vehicle) return;
    if (player.y > 0.6) c.started = true;
    // retombé au sol près du parcours = dans la lave
    if (c.started && player.y < 0.15 && !player.airborne) {
      let near = false;
      for (const p of this.plats) if (Math.abs(player.pos.x - p.x) < 3.2 && Math.abs(player.pos.z - p.z) < 3.2) { near = true; break; }
      if (near) {
        c.started = false; c.falls++;
        player.pos.x = c.start.x; player.pos.z = c.start.z; player.y = 0; player.vy = 0;
        onFall?.(c.falls);
      }
    }
  }

  // Repousse horizontalement (si on est plus bas que le dessus) et renvoie la hauteur du sol sous les pieds.
  resolve(p, r, y = 0) {
    let floor = 0;
    let on = null;
    for (const b of this.plats) {
      if (!b.active) continue;
      const top = b.top + (b.move?.vertical ? b.dy || 0 : 0);
      const minX = b.x - b.half, maxX = b.x + b.half, minZ = b.z - b.half, maxZ = b.z + b.half;
      if (y >= top - 0.35) {
        const m = r * 0.5;
        if (p.x > minX - m && p.x < maxX + m && p.z > minZ - m && p.z < maxZ + m && top > floor) { floor = top; on = b; }
        continue;
      }
      const cx = Math.max(minX, Math.min(p.x, maxX)), cz = Math.max(minZ, Math.min(p.z, maxZ));
      const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
      if (d2 >= r * r) continue;
      if (d2 > 1e-8) { const d = Math.sqrt(d2); p.x += (dx / d) * (r - d); p.z += (dz / d) * (r - d); }
      else {
        const l = p.x - minX, rr = maxX - p.x, t = p.z - minZ, bt = maxZ - p.z, mm = Math.min(l, rr, t, bt);
        if (mm === l) p.x = minX - r; else if (mm === rr) p.x = maxX + r; else if (mm === t) p.z = minZ - r; else p.z = maxZ + r;
      }
    }
    if (r < 1) this.standing = on && y <= floor + 0.1 ? on : null; // seulement pour le joueur
    return floor;
  }
}

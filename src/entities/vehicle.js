import * as THREE from 'three';
import { partsGeometry } from '../world/geometry.js';
import { clamp } from '../world/constants.js';
import { textTexture } from '../world/textures.js';

export const CAR_COLORS = ['#e53935', '#1e88e5', '#43a047', '#fdd835', '#8e24aa', '#fb8c00', '#00acc1', '#ffffff', '#ff4081', '#212121', '#90a4ae', '#6d4c41'];
const mat = new THREE.MeshLambertMaterial({ vertexColors: true });

function carGeometry(color, kind) {
  const glass = '#1c2235';
  const p = [
    { t: 'box', w: 1.9, h: 0.6, d: 4.4, pos: [0, 0.6, 0], color },
    { t: 'box', w: 1.72, h: 0.55, d: 2.2, pos: [0, 1.17, -0.25], color: glass },
    { t: 'box', w: 1.76, h: 0.09, d: 2.0, pos: [0, 1.48, -0.3], color },
    { t: 'box', w: 1.96, h: 0.25, d: 0.22, pos: [0, 0.42, 2.2], color: '#222' },
    { t: 'box', w: 1.96, h: 0.25, d: 0.22, pos: [0, 0.42, -2.2], color: '#222' },
    { t: 'box', w: 0.38, h: 0.16, d: 0.06, pos: [-0.62, 0.72, 2.21], color: '#fff6d0' },
    { t: 'box', w: 0.38, h: 0.16, d: 0.06, pos: [0.62, 0.72, 2.21], color: '#fff6d0' },
    { t: 'box', w: 0.38, h: 0.16, d: 0.06, pos: [-0.62, 0.72, -2.21], color: '#ff2a2a' },
    { t: 'box', w: 0.38, h: 0.16, d: 0.06, pos: [0.62, 0.72, -2.21], color: '#ff2a2a' },
  ];
  for (const [x, z] of [[-0.95, 1.35], [0.95, 1.35], [-0.95, -1.35], [0.95, -1.35]]) {
    p.push({ t: 'cyl', r: 0.38, h: 0.3, seg: 10, pos: [x, 0.38, z], rot: [0, 0, Math.PI / 2], color: '#151515' });
  }
  if (kind === 'taxi') p.push({ t: 'box', w: 0.8, h: 0.25, d: 0.35, pos: [0, 1.65, -0.3], color: '#ffffff' });
  if (kind === 'rental') p.push({ t: 'box', w: 1.2, h: 0.3, d: 0.4, pos: [0, 1.67, -0.3], color: '#ffffff' });
  return partsGeometry(p);
}

let rentalLabel = null;

export class Vehicle {
  constructor(game, { x, z, heading = 0, color, kind = 'car' }) {
    this.game = game;
    this.kind = kind;
    this.rental = kind === 'rental';
    this.color = color || CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
    this.pos = { x, z };
    this.heading = heading;
    this.vel = { x: 0, z: 0 };
    this.speed = 0;
    this.steer = 0;
    this.radius = 1.7;
    this.ai = null;
    this.mesh = new THREE.Mesh(carGeometry(this.color, kind), mat);
    this.mesh.castShadow = game.shadows;
    if (this.rental) {
      if (!rentalLabel) rentalLabel = textTexture("LOC'AUTO", { color: '#ffffff', bg: '#1f9d55', size: 80 });
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: rentalLabel.texture, depthTest: false }));
      s.scale.set(2.6, 2.6 / rentalLabel.aspect, 1); s.position.y = 2.6; s.renderOrder = 5;
      this.mesh.add(s);
    }
    game.scene.add(this.mesh);
    this.sync();
  }

  get fx() { return Math.sin(this.heading); }
  get fz() { return Math.cos(this.heading); }

  // Conduite arcade du joueur
  drive(dt, ax, ay, handbrake) {
    const fx = this.fx, fz = this.fz;
    let fwd = this.vel.x * fx + this.vel.z * fz;
    let latX = this.vel.x - fx * fwd, latZ = this.vel.z - fz * fwd;
    const MAXF = 52, MAXR = -12;
    if (ay > 0) {
      if (fwd < -0.5) fwd += 32 * dt * ay;
      else fwd += 27 * ay * dt * (1 - Math.max(0, fwd) / MAXF * 0.7);
    } else if (ay < 0) {
      if (fwd > 0.5) fwd += 32 * dt * ay;
      else fwd += 10 * ay * dt;
    } else {
      fwd -= Math.sign(fwd) * Math.min(Math.abs(fwd), 3.5 * dt);
    }
    if (handbrake) fwd -= Math.sign(fwd) * Math.min(Math.abs(fwd), 13 * dt);
    fwd = clamp(fwd, MAXR, MAXF);
    this.steer += (ax - this.steer) * Math.min(1, dt * 8);
    const sp = Math.abs(fwd);
    const turn = this.steer * 2.3 * Math.min(1, sp / 5) / (1 + sp / 28) * (handbrake ? 1.6 : 1) * Math.sign(fwd || 1);
    this.heading -= turn * dt;
    // flaque d'huile : presque plus d'adhérence et la voiture part en tête-à-queue
    if (this.oil > 0) { this.oil -= dt; this.heading += this.oilSpin * dt * Math.min(1, sp / 8); }
    const grip = this.oil > 0 ? 0.5 : handbrake ? 1.4 : 9;
    const k = Math.exp(-grip * dt);
    latX *= k; latZ *= k;
    const nfx = Math.sin(this.heading), nfz = Math.cos(this.heading);
    this.vel.x = nfx * fwd + latX;
    this.vel.z = nfz * fwd + latZ;
    this.speed = fwd;
  }

  physics(dt) {
    if (!this.ai && !this.driven) {
      // voiture libre : friction
      const f = Math.exp(-2.5 * dt);
      this.vel.x *= f; this.vel.z *= f;
      this.speed *= f;
    }
    this.pos.x += this.vel.x * dt;
    this.pos.z += this.vel.z * dt;
    if (this.game.parkour.boxes.length) {
      const bx = this.pos.x, bz = this.pos.z;
      this.game.parkour.resolve(this.pos, this.radius, 0);
      if (bx !== this.pos.x || bz !== this.pos.z) { this.vel.x *= 0.5; this.vel.z *= 0.5; }
    }
    const res = this.game.colliders.resolve(this.pos, this.radius, this.ai ? 'hazard' : null);
    if (res.hit) {
      const vn = this.vel.x * res.nx + this.vel.z * res.nz;
      if (vn < 0) {
        this.vel.x -= 1.35 * vn * res.nx; this.vel.z -= 1.35 * vn * res.nz;
        this.vel.x *= 0.75; this.vel.z *= 0.75;
        this.speed = this.vel.x * this.fx + this.vel.z * this.fz;
        if (this.driven && -vn > 6) this.game.sfx.hit(Math.min(1, -vn / 25));
      }
    }
  }

  sync() {
    this.mesh.position.set(this.pos.x, 0, this.pos.z);
    this.mesh.rotation.y = this.heading;
  }

  dispose() {
    this.game.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
  }
}

// Collisions voiture contre voiture (cercle contre cercle)
export function carCarCollisions(vehicles) {
  for (let a = 0; a < vehicles.length; a++) {
    const A = vehicles[a];
    for (let b = a + 1; b < vehicles.length; b++) {
      const B = vehicles[b];
      if (A.ai && B.ai) continue;
      const dx = B.pos.x - A.pos.x, dz = B.pos.z - A.pos.z;
      const r = A.radius + B.radius - 0.3;
      const d2 = dx * dx + dz * dz;
      if (d2 >= r * r || d2 < 1e-6) continue;
      const d = Math.sqrt(d2), nx = dx / d, nz = dz / d, pen = r - d;
      const wa = A.ai ? 0.1 : 0.5, wb = B.ai ? 0.1 : 0.5;
      const s = wa + wb;
      A.pos.x -= nx * pen * (wa / s); A.pos.z -= nz * pen * (wa / s);
      B.pos.x += nx * pen * (wb / s); B.pos.z += nz * pen * (wb / s);
      const rv = (B.vel.x - A.vel.x) * nx + (B.vel.z - A.vel.z) * nz;
      if (rv < 0) {
        const j = -rv * 0.8;
        if (!A.ai) { A.vel.x -= nx * j * 0.5; A.vel.z -= nz * j * 0.5; }
        if (!B.ai) { B.vel.x += nx * j * 0.5; B.vel.z += nz * j * 0.5; }
        if ((A.driven || B.driven) && j > 5) A.game.sfx.hit(Math.min(1, j / 20));
      }
    }
  }
}

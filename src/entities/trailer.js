import * as THREE from 'three';
import { partsGeometry } from '../world/geometry.js';

const mat = new THREE.MeshLambertMaterial({ vertexColors: true });

// Remorque qui se décroche / s'accroche à une voiture et transporte des bottes de foin
export class Trailer {
  constructor(game, x, z, heading = 0) {
    this.game = game;
    this.car = null;
    this.pos = { x, z };
    this.heading = heading;
    this.bales = [];
    const parts = [
      { t: 'box', w: 2.1, h: 0.25, d: 3.6, pos: [0, 0.75, 0], color: '#6d4c41' },
      { t: 'box', w: 0.12, h: 0.5, d: 3.6, pos: [-1.05, 1.1, 0], color: '#8d6e63' },
      { t: 'box', w: 0.12, h: 0.5, d: 3.6, pos: [1.05, 1.1, 0], color: '#8d6e63' },
      { t: 'box', w: 2.1, h: 0.5, d: 0.12, pos: [0, 1.1, -1.8], color: '#8d6e63' },
      { t: 'box', w: 0.15, h: 0.15, d: 1.4, pos: [0, 0.65, 2.4], color: '#333' },
      { t: 'cyl', r: 0.42, h: 0.28, seg: 10, pos: [-1.15, 0.42, -0.3], rot: [0, 0, Math.PI / 2], color: '#151515' },
      { t: 'cyl', r: 0.42, h: 0.28, seg: 10, pos: [1.15, 0.42, -0.3], rot: [0, 0, Math.PI / 2], color: '#151515' },
    ];
    this.mesh = new THREE.Mesh(partsGeometry(parts), mat);
    this.mesh.castShadow = game.shadows;
    this.baleGeo = partsGeometry([
      { t: 'box', w: 0.9, h: 0.6, d: 1.4, pos: [0, 0, 0], color: '#e5c35a' },
      { t: 'box', w: 0.92, h: 0.06, d: 1.42, pos: [0, 0.12, 0], color: '#b8932f' },
      { t: 'box', w: 0.92, h: 0.06, d: 1.42, pos: [0, -0.12, 0], color: '#b8932f' },
    ]);
    game.scene.add(this.mesh);
    this.sync();
  }

  attach(car) { this.car = car; this.game.sfx.tone(300, 0.15, 'square', 0.15); }
  detach() { this.car = null; }
  get attachedToPlayer() { return !!this.car && this.car === this.game.player.vehicle; }

  setBales(n) {
    while (this.bales.length < n) {
      const k = this.bales.length;
      const b = new THREE.Mesh(this.baleGeo, mat);
      b.position.set(k % 2 ? 0.48 : -0.48, 1.2 + Math.floor(k / 4) * 0.62, Math.floor(k / 2) % 2 ? -0.75 : 0.75);
      this.mesh.add(b);
      this.bales.push(b);
    }
    while (this.bales.length > n) this.mesh.remove(this.bales.pop());
  }

  update() {
    const c = this.car;
    if (c) {
      // point d'attelage derrière la voiture ; la remorque est tirée vers lui
      const hx = c.pos.x - c.fx * 2.5, hz = c.pos.z - c.fz * 2.5;
      let dx = hx - this.pos.x, dz = hz - this.pos.z;
      const l = Math.hypot(dx, dz) || 1;
      dx /= l; dz /= l;
      // angle d'attelage limité (~65°) : la remorque reste toujours derrière la voiture
      if (dx * c.fx + dz * c.fz < 0.42) {
        const side = Math.sign(dx * c.fz - dz * c.fx) || 1;
        const a = Math.atan2(c.fx, c.fz) - side * 1.13;
        dx = Math.sin(a); dz = Math.cos(a);
      }
      this.heading = Math.atan2(dx, dz);
      this.pos.x = hx - dx * 2.5; this.pos.z = hz - dz * 2.5;
    }
    this.sync();
  }

  sync() {
    this.mesh.position.set(this.pos.x, 0, this.pos.z);
    this.mesh.rotation.y = this.heading;
  }
}

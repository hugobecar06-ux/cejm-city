import { createCharacter } from './character.js';
import { groundY } from '../world/constants.js';

export class Player {
  constructor(game, x, z) {
    this.game = game;
    this.pos = { x, z };
    this.heading = Math.PI;
    this.radius = 0.45;
    this.vehicle = null;
    this.moveSpeed = 0;
    this.char = createCharacter({ skin: '#c98b62', shirt: '#ff3d8b', pants: '#1f2a44', hair: '#2b1a12', cap: '#28e0d8' });
    game.scene.add(this.char.group);
  }

  get x() { return this.vehicle ? this.vehicle.pos.x : this.pos.x; }
  get z() { return this.vehicle ? this.vehicle.pos.z : this.pos.z; }

  updateOnFoot(dt, input, camYaw) {
    const { x: ax, y: ay } = input.axis();
    const len = Math.hypot(ax, ay);
    const sprint = input.down('ShiftLeft') || input.down('ShiftRight');
    const target = len > 0.1 ? (sprint ? 9 : 4.5) * Math.min(1, len) : 0;
    this.moveSpeed += (target - this.moveSpeed) * Math.min(1, dt * 10);
    if (len > 0.1) {
      const fx = Math.sin(camYaw), fz = Math.cos(camYaw);
      const rx = -Math.cos(camYaw), rz = Math.sin(camYaw);
      const dx = fx * ay + rx * ax, dz = fz * ay + rz * ax;
      const want = Math.atan2(dx, dz);
      const diff = Math.atan2(Math.sin(want - this.heading), Math.cos(want - this.heading));
      this.heading += diff * Math.min(1, dt * 12);
    }
    this.pos.x += Math.sin(this.heading) * this.moveSpeed * dt;
    this.pos.z += Math.cos(this.heading) * this.moveSpeed * dt;
    this.game.colliders.resolve(this.pos, this.radius);
    this.char.animate(dt, this.moveSpeed);
    this.sync();
  }

  sync() {
    const g = this.char.group;
    g.position.set(this.pos.x, groundY(this.pos.x, this.pos.z), this.pos.z);
    g.rotation.y = this.heading;
  }

  enter(vehicle) {
    this.vehicle = vehicle;
    vehicle.driven = true;
    this.char.group.visible = false;
  }

  exit() {
    const v = this.vehicle;
    if (!v) return;
    v.driven = false;
    this.vehicle = null;
    // sortir côté conducteur (gauche), sinon côté droit
    const lx = Math.cos(v.heading), lz = -Math.sin(v.heading);
    let placed = false;
    for (const s of [1, -1, 0]) {
      const p = s === 0 ? { x: v.pos.x + v.fx * 3.4, z: v.pos.z + v.fz * 3.4 } : { x: v.pos.x + lx * 2.2 * s, z: v.pos.z + lz * 2.2 * s };
      const before = { ...p };
      this.game.colliders.resolve(p, this.radius);
      if (Math.hypot(p.x - before.x, p.z - before.z) < 0.3) { this.pos = p; placed = true; break; }
    }
    if (!placed) { this.pos = { x: v.pos.x + lx * 2.2, z: v.pos.z + lz * 2.2 }; this.game.colliders.resolve(this.pos, this.radius); }
    this.heading = v.heading;
    this.char.group.visible = true;
    this.moveSpeed = 0;
    this.sync();
  }
}

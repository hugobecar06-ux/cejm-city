import { createCharacter, randomLook } from './character.js';
import { blockCenter, SIDEWALK_Y } from '../world/constants.js';

const OFF = 13.2, SIDE = OFF * 2, PERIM = SIDE * 4;

// Piétons qui font le tour des pâtés de maisons sur les trottoirs
export class Pedestrians {
  constructor(game, count = 30) {
    this.game = game;
    this.list = [];
    for (let n = 0; n < count; n++) {
      const c = createCharacter(randomLook());
      game.scene.add(c.group);
      this.list.push({
        c, bx: blockCenter(Math.floor(Math.random() * 10)), bz: blockCenter(Math.floor(Math.random() * 10)),
        s: Math.random() * PERIM, dir: Math.random() < 0.5 ? 1 : -1, speed: 1.1 + Math.random() * 0.7,
        knock: 0, ox: 0, oz: 0, vx: 0, vz: 0,
      });
    }
  }

  pathPos(p) {
    let s = ((p.s % PERIM) + PERIM) % PERIM;
    const side = Math.floor(s / SIDE), t = s - side * SIDE;
    let x, z, h;
    if (side === 0) { x = -OFF + t; z = -OFF; h = Math.PI / 2; }
    else if (side === 1) { x = OFF; z = -OFF + t; h = 0; }
    else if (side === 2) { x = OFF - t; z = OFF; h = -Math.PI / 2; }
    else { x = -OFF; z = OFF - t; h = Math.PI; }
    if (p.dir < 0) h += Math.PI;
    return { x: p.bx + x, z: p.bz + z, h };
  }

  update(dt) {
    const g = this.game;
    const px = g.player.x, pz = g.player.z;
    for (const p of this.list) {
      const g0 = p.c.group;
      const dpl = Math.abs(g0.position.x - px) + Math.abs(g0.position.z - pz);
      if (p.knock > 0) {
        p.knock -= dt;
        p.ox += p.vx * dt; p.oz += p.vz * dt; p.vx *= 0.9; p.vz *= 0.9;
        g0.rotation.x = p.knock > 0.6 ? -Math.PI / 2 : 0;
        g0.position.y = p.knock > 0.6 ? 0.3 : SIDEWALK_Y;
        g0.position.x = this.pathPos(p).x + p.ox; g0.position.z = this.pathPos(p).z + p.oz;
        if (p.knock <= 0) { p.ox = 0; p.oz = 0; g0.rotation.x = 0; }
        continue;
      }
      p.s += p.speed * p.dir * dt;
      const q = this.pathPos(p);
      g0.position.set(q.x, SIDEWALK_Y, q.z);
      g0.rotation.y = q.h;
      if (dpl < 60) p.c.animate(dt, p.speed);
      // percuté par une voiture du joueur ?
      const v = g.player.vehicle;
      if (v && Math.abs(v.speed) > 4) {
        const dx = q.x - v.pos.x, dz = q.z - v.pos.z;
        if (dx * dx + dz * dz < 4.4) {
          p.knock = 3; const l = Math.hypot(dx, dz) || 1;
          p.vx = dx / l * 6; p.vz = dz / l * 6;
          g.sfx.hit(0.3);
        }
      }
    }
  }
}

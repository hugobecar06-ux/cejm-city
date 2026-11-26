import { Vehicle } from './vehicle.js';
import { HALF, SPACING, angleDiff } from '../world/constants.js';

const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const NMAX = HALF / SPACING; // 5

// Voitures IA : roulent à droite sur la grille, choisissent une direction à chaque carrefour
export class Traffic {
  constructor(game, count = 15) {
    this.game = game;
    this.count = count;
    this.cars = [];
    for (let n = 0; n < count; n++) this.spawn(true);
  }

  spawn(anywhere) {
    const g = this.game;
    for (let tries = 0; tries < 30; tries++) {
      const ix = Math.floor(Math.random() * 11) - NMAX, iz = Math.floor(Math.random() * 11) - NMAX;
      const d = Math.floor(Math.random() * 4);
      if (!this.validDir(ix, iz, d)) continue;
      const nx = ix * SPACING, nz = iz * SPACING;
      if (!anywhere && Math.hypot(nx - g.player.x, nz - g.player.z) < 90) continue;
      const [dx, dz] = DIRS[d];
      const rx = -dz, rz = dx;
      const v = new Vehicle(g, { x: nx + dx * 10 + rx * 2.5, z: nz + dz * 10 + rz * 2.5, heading: Math.atan2(dx, dz) });
      v.ai = { ix, iz, d, wp: null, stopped: 0, ghost: 0, cruise: 9 + Math.random() * 4 };
      this.nextWaypoint(v, false);
      this.cars.push(v);
      g.vehicles.push(v);
      return v;
    }
  }

  validDir(ix, iz, d) {
    const [dx, dz] = DIRS[d];
    const tx = ix + dx, tz = iz + dz;
    return tx >= -NMAX && tx <= NMAX && tz >= -NMAX && tz <= NMAX;
  }

  // waypoint : fin du segment courant, puis début du segment suivant après virage
  nextWaypoint(v, turn) {
    const a = v.ai;
    if (turn) {
      a.ix += DIRS[a.d][0]; a.iz += DIRS[a.d][1];
      const opts = [];
      for (let d = 0; d < 4; d++) {
        if (d === (a.d + 2) % 4) continue;
        if (this.validDir(a.ix, a.iz, d)) opts.push(d, d === a.d ? d : -1);
      }
      const clean = opts.filter((d) => d >= 0);
      a.d = clean.length ? clean[Math.floor(Math.random() * clean.length)] : (a.d + 2) % 4;
    }
    const [dx, dz] = DIRS[a.d];
    const rx = -dz, rz = dx;
    a.wp = { x: a.ix * SPACING + dx * 33 + rx * 2.5, z: a.iz * SPACING + dz * 33 + rz * 2.5 };
  }

  release(v) {
    const i = this.cars.indexOf(v);
    if (i >= 0) this.cars.splice(i, 1);
    v.ai = null;
  }

  update(dt) {
    const g = this.game;
    const px = g.player.x, pz = g.player.z;
    for (const v of this.cars) {
      const a = v.ai;
      const dx = a.wp.x - v.pos.x, dz = a.wp.z - v.pos.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 3) { this.nextWaypoint(v, true); continue; }
      const want = Math.atan2(dx, dz);
      const diff = angleDiff(want, v.heading);
      v.heading += Math.max(-1.8 * dt, Math.min(1.8 * dt, diff * 3 * dt * 2));
      let target = Math.abs(diff) > 0.4 ? 5 : a.cruise;
      // obstacle devant ?
      const fx = v.fx, fz = v.fz;
      const blocked = (ox, oz, lat) => {
        const ddx = ox - v.pos.x, ddz = oz - v.pos.z;
        const ahead = ddx * fx + ddz * fz;
        const side = Math.abs(ddx * fz - ddz * fx);
        return ahead > 0.5 && ahead < 9 && side < lat;
      };
      let stop = blocked(px, pz, 2.2);
      if (!stop && a.ghost <= 0) {
        for (const o of g.vehicles) { if (o !== v && blocked(o.pos.x, o.pos.z, 1.6)) { stop = true; break; } }
      }
      if (stop) target = 0;
      a.ghost -= dt;
      if (v.speed < 0.5 && stop) { a.stopped += dt; if (a.stopped > 4) { a.ghost = 3; a.stopped = 0; } } else a.stopped = 0;
      v.speed += Math.max(-25 * dt, Math.min(8 * dt, target - v.speed));
      v.vel.x = v.fx * v.speed; v.vel.z = v.fz * v.speed;
    }
    // garder ~15 voitures IA
    if (this.cars.length < this.count) this.spawn(false);
  }
}

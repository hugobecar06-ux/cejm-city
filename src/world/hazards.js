import * as THREE from 'three';
import { partsGeometry } from './geometry.js';
import { createCharacter } from '../entities/character.js';

const mat = new THREE.MeshLambertMaterial({ vertexColors: true });

// Obstacles de mission : barrage de police, mamies qui traversent, travaux, flaque d'huile.
// at = [x, z] sur une route ; dir = 'x' si la route est orientée est-ouest (z constant), 'z' sinon.
export class Hazards {
  constructor(game) {
    this.game = game;
    this.items = [];
    this.t = 0;
    this.cool = 0;
  }

  spawn(list) {
    this.clear();
    const notes = new Set();
    for (const h of list) {
      const fn = this[h.type];
      if (fn) { fn.call(this, h); notes.add(h.type); }
    }
    const msg = {
      police: '🚓 Barrage de police : trouve un autre chemin !',
      mamies: '👵 Attention : des mamies traversent la route !',
      travaux: '🚧 Travaux : la route est rétrécie',
      huile: '🛢️ Flaques d\'huile signalées : gare aux dérapages !',
    };
    let k = 0;
    for (const n of notes) setTimeout(() => this.game.hud.toast(msg[n], 4), 600 + 900 * k++);
  }

  // repère local de la route : u = le long de la route, w = en travers
  frame(h) {
    const along = h.dir === 'x' ? [1, 0] : [0, 1];
    const across = h.dir === 'x' ? [0, 1] : [1, 0];
    const P = (u, w) => [h.at[0] + along[0] * u + across[0] * w, h.at[1] + along[1] * u + across[1] * w];
    const yaw = h.dir === 'x' ? 0 : Math.PI / 2; // +x local du modèle = le long de la route
    return { P, yaw };
  }

  addMesh(parts, flashing) {
    const mesh = new THREE.Mesh(partsGeometry(parts), mat);
    mesh.castShadow = this.game.shadows;
    this.game.scene.add(mesh);
    this.items.push({ mesh });
    return mesh;
  }

  addCollider(h, u0, w0, u1, w1, height = 2) {
    const { P } = this.frame(h);
    const a = P(u0, w0), b = P(u1, w1);
    const box = this.game.colliders.add(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1]), height, 'hazard');
    this.items.push({ box });
  }

  police(h) {
    const { P, yaw } = this.frame(h);
    const parts = [];
    const L = (p) => { const [x, z] = P(p.pos[0], p.pos[2]); return { ...p, pos: [x, p.pos[1], z], yaw: (p.yaw || 0) + yaw }; };
    for (const w of [-3.2, 0, 3.2]) {
      // voiture de police en travers de la route
      const car = [
        { t: 'box', w: 4.4, h: 0.6, d: 1.9, pos: [0, 0.6, w], color: '#1b2a5a' },
        { t: 'box', w: 1.2, h: 0.62, d: 1.92, pos: [0, 0.6, w], color: '#ffffff' },
        { t: 'box', w: 2.2, h: 0.55, d: 1.72, pos: [-0.2, 1.17, w], color: '#1c2235' },
        { t: 'box', w: 2.0, h: 0.09, d: 1.76, pos: [-0.25, 1.48, w], color: '#ffffff' },
      ];
      for (const [x, z] of [[1.35, -0.95], [1.35, 0.95], [-1.35, -0.95], [-1.35, 0.95]]) car.push({ t: 'cyl', r: 0.38, h: 0.3, seg: 10, pos: [x, 0.38, w + z], rot: [Math.PI / 2, 0, 0], color: '#151515' });
      car.forEach((p) => parts.push(L(p)));
    }
    for (const w of [-4.6, 4.6]) {
      parts.push(L({ t: 'box', w: 0.15, h: 1, d: 0.15, pos: [2.8, 0.5, w], color: '#ddd' }));
      parts.push(L({ t: 'box', w: 0.15, h: 1, d: 0.15, pos: [-2.8, 0.5, w], color: '#ddd' }));
    }
    parts.push(L({ t: 'box', w: 0.2, h: 0.35, d: 10, pos: [3, 1, 0], color: '#e53935' }));
    parts.push(L({ t: 'box', w: 0.2, h: 0.35, d: 10, pos: [-3, 1, 0], color: '#e53935' }));
    this.addMesh(parts);
    // gyrophares (clignotent en rouge / bleu)
    const lights = [];
    for (const w of [-3.2, 0, 3.2]) {
      for (const [s, col] of [[-1, '#ff2030'], [1, '#2060ff']]) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.35), new THREE.MeshBasicMaterial({ color: col, toneMapped: false }));
        const [x, z] = P(-0.25, w + s * 0.35);
        m.position.set(x, 1.65, z);
        this.game.scene.add(m);
        lights.push(m);
        this.items.push({ mesh: m, own: true });
      }
    }
    this.items.push({ flash: lights });
    this.addCollider(h, -3.2, -5.2, 3.2, 5.2, 2);
  }

  travaux(h) {
    const { P, yaw } = this.frame(h);
    const L = (p) => { const [x, z] = P(p.pos[0], p.pos[2]); return { ...p, pos: [x, p.pos[1], z], yaw: (p.yaw || 0) + yaw }; };
    const parts = [];
    // la moitié + de la route est fermée (côté w > -1), passage étroit côté w < -1
    parts.push(L({ t: 'box', w: 7, h: 0.05, d: 6.4, pos: [0, 0.03, 1.8], color: '#8a6a45' }));
    parts.push(L({ t: 'box', w: 3.4, h: 1.6, d: 2.2, pos: [0.6, 1.1, 2.2], color: '#ffb000' }));
    parts.push(L({ t: 'box', w: 1.6, h: 1.2, d: 1.8, pos: [0.4, 2.4, 2.2], color: '#2a2a2a' }));
    parts.push(L({ t: 'box', w: 3.2, h: 0.3, d: 0.4, pos: [-1.8, 2.6, 2.2], rot: [0, 0, 0.5], color: '#ffb000' }));
    for (let u = -3.5; u <= 3.5; u += 1.75) {
      parts.push(L({ t: 'cone', r: 0.32, h: 0.8, seg: 8, pos: [u, 0.4, -1.3], color: '#ff6f00' }));
      parts.push(L({ t: 'cyl', r: 0.33, h: 0.12, seg: 8, pos: [u, 0.45, -1.3], color: '#ffffff' }));
    }
    for (const u of [-3.6, 3.6]) parts.push(L({ t: 'box', w: 0.3, h: 1.1, d: 6, pos: [u, 0.55, 1.9], color: '#ffffff' }));
    this.addMesh(parts);
    this.addCollider(h, -3.6, -1, 3.6, 5.2, 2.5);
  }

  huile(h) {
    const { P } = this.frame(h);
    for (const u of [-6, 6]) {
      const [x, z] = P(u, u > 0 ? 1.5 : -1.5);
      const m = new THREE.Mesh(new THREE.CircleGeometry(3.2, 20), new THREE.MeshPhongMaterial({ color: '#0b0b12', shininess: 120, specular: '#8a7cff', transparent: true, opacity: 0.85 }));
      m.rotation.x = -Math.PI / 2; m.position.set(x, 0.04, z);
      this.game.scene.add(m);
      this.items.push({ mesh: m, own: true, oil: { x, z, r: 3.2 } });
    }
  }

  mamies(h) {
    const { P } = this.frame(h);
    const looks = ['#c7a4d8', '#8fc1e3', '#f4b6c2', '#b5d99c', '#f7d08a'];
    for (let k = 0; k < 5; k++) {
      const c = createCharacter({ skin: '#f1c9a5', shirt: looks[k], pants: '#6d5c7a', hair: '#e8e8e8' });
      c.group.scale.setScalar(0.92);
      this.game.scene.add(c.group);
      // chacune traverse la route en travers, en décalé
      this.items.push({ mesh: c.group, own: 'char', granny: { c, u: (k - 2) * 1.3, w: -6.5 + k * 0.4, dir: 1, speed: 0.75 + k * 0.05, pause: k * 0.6, P } });
    }
  }

  update(dt) {
    if (!this.items.length) return;
    this.t += dt;
    this.cool -= dt;
    const g = this.game, v = g.player.vehicle;
    for (const it of this.items) {
      if (it.flash) {
        const on = Math.floor(this.t * 6) % 2;
        it.flash.forEach((m, k) => { m.visible = (k % 2) === on; });
      }
      if (it.oil && v) {
        const d = Math.hypot(v.pos.x - it.oil.x, v.pos.z - it.oil.z);
        if (d < it.oil.r && Math.abs(v.speed) > 4 && !(v.oil > 0)) {
          v.oil = 1.4; v.oilSpin = (Math.random() < 0.5 ? -1 : 1) * 2.6;
          g.sfx.tone(180, 0.5, 'sawtooth', 0.12); g.hud.toast('Ça glisse !', 1.5);
        }
      }
      if (it.granny) {
        const gr = it.granny;
        if (gr.pause > 0) gr.pause -= dt;
        else {
          gr.w += gr.dir * gr.speed * dt;
          if (gr.w > 6.5 || gr.w < -6.5) { gr.dir *= -1; gr.pause = 2.5; }
        }
        const [x, z] = gr.P(gr.u, gr.w);
        const [x2, z2] = gr.P(gr.u, gr.w + gr.dir);
        it.mesh.position.set(x, Math.abs(gr.w) > 5 ? 0.12 : 0, z);
        it.mesh.rotation.y = Math.atan2(x2 - x, z2 - z);
        gr.c.animate(dt, gr.pause > 0 ? 0 : gr.speed);
        // une voiture fonce dans les mamies : elle est stoppée net, pénalité de temps
        for (const car of g.vehicles) {
          const dx = car.pos.x - x, dz = car.pos.z - z, d = Math.hypot(dx, dz);
          if (d < car.radius + 0.4) {
            const n = d || 1;
            car.pos.x = x + (dx / n) * (car.radius + 0.4); car.pos.z = z + (dz / n) * (car.radius + 0.4);
            if (car === v && Math.abs(car.speed) > 2 && this.cool <= 0) {
              this.cool = 2.5;
              g.sfx.horn();
              const m = g.missions;
              if (m.timer !== null) { m.timer = Math.max(1, m.timer - 5); g.hud.toast('« Doucement, jeune homme ! » −5 s', 2.5); }
              else g.hud.toast('« Doucement, jeune homme ! »', 2.5);
            }
            car.vel.x *= 0.1; car.vel.z *= 0.1; car.speed *= 0.1;
          }
        }
      }
    }
  }

  clear() {
    const g = this.game;
    for (const it of this.items) {
      if (it.box) g.colliders.remove(it.box);
      if (it.mesh) {
        g.scene.remove(it.mesh);
        if (it.own === true) { it.mesh.geometry.dispose(); it.mesh.material.dispose(); }
        else if (!it.own) it.mesh.geometry.dispose();
      }
    }
    this.items = [];
  }
}

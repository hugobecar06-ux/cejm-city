import * as THREE from 'three';

const $ = (id) => document.getElementById(id);
const FIRE = ['#ff3d8b', '#28e0d8', '#ffb000', '#b04dff', '#36e27a', '#ffffff', '#ff5a1f'];

// Cinématique de fin : vol de caméra autour du HQ, explosions, feux d'artifice, titre final.
export class Cinematic {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.bursts = [];
    this.light = new THREE.PointLight('#ffb070', 0, 260, 1.4);
    game.scene.add(this.light);
    this.flashSphereGeo = new THREE.IcosahedronGeometry(1, 2);
    $('cine-skip').addEventListener('click', () => this.finish());
  }

  // Courte cinématique de fin de mission : la caméra tourne autour du joueur, feux d'artifice, titre
  playMini(num, title, onDone) {
    const g = this.game;
    this.mode = 'mini';
    this.onDone = onDone;
    this.active = true;
    this.t = 0; this.nextFire = 0.2; this.shake = 0;
    this.center = { x: g.player.x, z: g.player.z, y: g.player.vehicle ? 1 : 1 + (g.player.y || 0) };
    this.a0 = Math.atan2(g.camera.position.x - this.center.x, g.camera.position.z - this.center.z);
    $('cine').classList.remove('hidden');
    $('cine-title').innerHTML = 'MISSION <span>RÉUSSIE</span>';
    $('cine-title').className = 'mini';
    $('cine-sub').textContent = `MISSION ${num}/10 · ${title}`;
    $('cine-sub').className = '';
    $('ui').classList.add('cine-hide');
    setTimeout(() => { if (this.mode === 'mini') { $('cine-title').className = 'mini show'; $('cine-sub').className = 'show'; } }, 350);
  }

  updateMini(dt) {
    const g = this.game, c = this.center;
    this.t += dt;
    const t = this.t, a = this.a0 + t * 0.7, r = 9 + t * 2.2;
    g.camera.position.set(c.x + Math.sin(a) * r, c.y + 2 + t * 1.6, c.z + Math.cos(a) * r);
    g.camera.lookAt(c.x, c.y + 0.8, c.z);
    if (t > this.nextFire && t < 3.6) {
      this.firework(c.x + (Math.random() - 0.5) * 36, 22 + Math.random() * 16, c.z + (Math.random() - 0.5) * 36);
      this.nextFire = t + 0.38;
    }
    if (t > 0.3 && !this.boomed) { this.boomed = true; this.sparks(c.x, c.y + 1, c.z, 160, ['#ffd400', '#ff3d8b', '#28e0d8'], 14, 1.4, 10); }
    this.updateParticles(dt);
    if (t > 4.4) this.finish();
  }

  play(onDone) {
    const g = this.game;
    this.mode = 'big';
    $('cine-title').innerHTML = 'CEJM <span>CITY</span>';
    this.onDone = onDone;
    this.active = true;
    this.t = 0;
    this.nextBoom = 0.4;
    this.nextFire = 3.5;
    this.shake = 0;
    this.textStep = 0;
    this.hq = g.city.landmarks.hq.center;
    $('cine').classList.remove('hidden');
    $('cine-title').className = ''; $('cine-sub').className = '';
    $('ui').classList.add('cine-hide');
    g.sfx.success();
  }

  // Explosion : boule de feu + étincelles + flash lumineux + secousse
  explode(x, y, z, size = 1) {
    const g = this.game;
    const ball = new THREE.Mesh(this.flashSphereGeo, new THREE.MeshBasicMaterial({ color: '#ffd27a', transparent: true, opacity: 1, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }));
    ball.position.set(x, y, z);
    g.scene.add(ball);
    this.bursts.push({ kind: 'ball', obj: ball, life: 0, max: 1.1, size: 9 * size });
    this.sparks(x, y, z, 160, ['#ffb000', '#ff5a1f', '#ffe08a'], 26 * size, 1.8, 18);
    this.light.position.set(x, y + 6, z); this.light.intensity = 900 * size;
    this.shake = Math.min(1.6, this.shake + 0.7 * size);
    g.sfx.hit(1); g.sfx.tone(55, 0.9, 'sawtooth', 0.25); g.sfx.tone(38, 1.2, 'sine', 0.35);
  }

  firework(x, y, z) {
    const col = FIRE[Math.floor(Math.random() * FIRE.length)];
    const col2 = FIRE[Math.floor(Math.random() * FIRE.length)];
    this.sparks(x, y, z, 220, [col, col2, '#ffffff'], 30, 2.6, 6);
    this.game.sfx.tone(900 + Math.random() * 600, 0.25, 'triangle', 0.1);
    this.game.sfx.hit(0.35);
  }

  sparks(x, y, z, n, colors, speed, life, gravity) {
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), vel = new Float32Array(n * 3);
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u), sp = speed * (0.4 + Math.random() * 0.6);
      vel[i * 3] = s * Math.cos(a) * sp; vel[i * 3 + 1] = u * sp + speed * 0.15; vel[i * 3 + 2] = s * Math.sin(a) * sp;
      c.set(colors[i % colors.length]); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 1.4, vertexColors: true, transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    this.game.scene.add(pts);
    this.bursts.push({ kind: 'pts', obj: pts, vel, life: 0, max: life, gravity });
  }

  update(dt) {
    if (this.mode === 'mini') { this.updateMini(dt); return; }
    const g = this.game, cam = g.camera, hq = this.hq;
    this.t += dt;
    const t = this.t;
    // --- Caméra : 3 plans ---
    let px, py, pz, lx, ly, lz;
    if (t < 5) { // plan 1 : travelling bas autour du HQ
      const a = -0.6 + t * 0.32;
      px = hq.x + Math.sin(a) * 62; pz = hq.z + Math.cos(a) * 62; py = 78 + t * 4;
      lx = hq.x; ly = 55 + t * 6; lz = hq.z;
    } else if (t < 10) { // plan 2 : montée en flèche le long de la tour
      const k = (t - 5) / 5;
      const a = 1.0 + k * 1.4;
      px = hq.x + Math.sin(a) * (62 + k * 50); pz = hq.z + Math.cos(a) * (62 + k * 50); py = 98 + k * 70;
      lx = hq.x; ly = 90 + k * 40; lz = hq.z;
    } else { // plan 3 : vue d'ensemble de la ville
      const k = Math.min(1, (t - 10) / 6);
      const a = 2.4 + k * 0.5;
      px = hq.x + Math.sin(a) * 230; pz = hq.z + Math.cos(a) * 230; py = 150 - k * 30;
      lx = hq.x; ly = 60; lz = hq.z;
    }
    this.shake = Math.max(0, this.shake - dt * 1.8);
    const sh = this.shake;
    cam.position.set(px + (Math.random() - 0.5) * sh * 2, py + (Math.random() - 0.5) * sh * 2, pz + (Math.random() - 0.5) * sh * 2);
    cam.lookAt(lx, ly, lz);
    // --- Effets ---
    if (t < 9.5 && t > this.nextBoom) {
      const a = Math.random() * Math.PI * 2, r = 12 + Math.random() * 6;
      this.explode(hq.x + Math.cos(a) * r, 30 + Math.random() * 85, hq.z + Math.sin(a) * r, 0.7 + Math.random() * 0.6);
      this.nextBoom = t + (t < 5 ? 0.45 : 0.3);
    }
    if (t > this.nextFire && t < 16.5) {
      for (let i = 0; i < (t > 10 ? 3 : 2); i++) this.firework(hq.x + (Math.random() - 0.5) * 220, 90 + Math.random() * 90, hq.z + (Math.random() - 0.5) * 220);
      this.nextFire = t + 0.35;
    }
    if (this.textStep === 0 && t > 1) { $('cine-sub').className = 'show'; $('cine-sub').textContent = '10 MISSIONS RÉUSSIES'; this.textStep = 1; }
    if (this.textStep === 1 && t > 9.6) { // méga explosion finale au sommet du HQ
      this.explode(hq.x, 125, hq.z, 2.6);
      $('cine-flash').className = 'go';
      this.textStep = 2;
    }
    if (this.textStep === 2 && t > 10.2) { $('cine-title').className = 'show'; $('cine-sub').textContent = 'TU AS MAÎTRISÉ L\'ÉCONOMIE NUMÉRIQUE'; this.textStep = 3; }
    this.updateParticles(dt);
    if (t > 17) this.finish();
  }

  // Effets aussi utilisés pendant les missions (ramassage, mission réussie)
  pickupFx(x, y, z) { this.sparks(x, y + 1.2, z, 70, ['#36e27a', '#ffffff', '#ffd400'], 9, 0.9, 12); }
  successFx(x, z) { for (let k = 0; k < 4; k++) setTimeout(() => this.firework(x + (Math.random() - 0.5) * 30, 28 + Math.random() * 18, z + (Math.random() - 0.5) * 30), k * 280); }

  updateParticles(dt) {
    const g = this.game;
    this.light.intensity = Math.max(0, this.light.intensity - dt * 1600);
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.life += dt;
      const k = b.life / b.max;
      if (b.kind === 'ball') {
        b.obj.scale.setScalar(1 + k * b.size);
        b.obj.material.opacity = Math.max(0, 1 - k);
        b.obj.material.color.lerpColors(new THREE.Color('#fff2c0'), new THREE.Color('#ff3b00'), k);
      } else {
        const p = b.obj.geometry.attributes.position.array, v = b.vel;
        for (let j = 0; j < p.length; j += 3) {
          v[j + 1] -= b.gravity * dt; v[j] *= 0.985; v[j + 2] *= 0.985;
          p[j] += v[j] * dt; p[j + 1] += v[j + 1] * dt; p[j + 2] += v[j + 2] * dt;
        }
        b.obj.geometry.attributes.position.needsUpdate = true;
        b.obj.material.opacity = Math.max(0, 1 - k * k);
      }
      if (k >= 1) { g.scene.remove(b.obj); b.obj.geometry !== this.flashSphereGeo && b.obj.geometry.dispose(); b.obj.material.dispose(); this.bursts.splice(i, 1); }
    }
  }

  finish() {
    if (!this.active) return;
    this.active = false;
    this.mode = null; this.boomed = false;
    $('cine-title').className = ''; $('cine-sub').className = '';
    this.light.intensity = 0;
    $('cine').classList.add('hidden');
    $('cine-flash').className = '';
    $('ui').classList.remove('cine-hide');
    const cb = this.onDone; this.onDone = null; cb && cb();
  }
}

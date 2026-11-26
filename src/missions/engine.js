import * as THREE from 'three';
import { MISSIONS, DEFINITIONS, FAIL_LINES, BONUS } from './missions.js';
import { createMarker, createNPC } from '../world/markers.js';
import { Vehicle } from '../entities/vehicle.js';

// Moteur de missions piloté par les données de missions.js
export class MissionEngine {
  constructor(game) {
    this.game = game;
    this.completed = 0;
    this.active = false;
    this.mi = 0;
    this.si = 0;
    this.markers = [];
    this.npcs = [];
    this.items = [];
    this.startMarker = null;
    this.timer = null;
    this.goal = null;
    this.yieldT = 0;
    this.lines = null;
    this.ctx = {
      spawnStalls: () => game.city.spawnStalls(),
      spawnRental: () => this.spawnRental(),
      toast: (t) => game.hud.toast(t),
      attachTrailer: () => { if (game.player.vehicle) game.trailer.attach(game.player.vehicle); game.hud.toast('Remorque attachée !', 2); },
      resetTrailer: () => { const t = game.trailer; t.detach(); t.pos = { x: BONUS.startPos[0], z: BONUS.startPos[1] + 6 }; t.heading = 0; t.setBales(0); t.sync();
        // une voiture garée juste à côté pour tirer la remorque
        const v = new Vehicle(game, { x: BONUS.startPos[0] - 4.3, z: BONUS.startPos[1] - 4, heading: 0, color: '#6d4c41' });
        game.vehicles.push(v);
      },
    };
  }

  init(completed) {
    this.completed = completed;
    if (completed >= 7) this.game.city.spawnStalls();
    this.refreshStart();
    this.game.hud.setDefs(completed);
  }

  resolvePos(p) {
    if (typeof p === 'string') { const d = this.game.city.landmarks[p].door; return { x: d.x, z: d.z }; }
    return { x: p[0], z: p[1] };
  }

  get mission() { return this.cur || MISSIONS[this.mi]; }
  get step() { return this.mission?.steps[this.si]; }

  refreshStart() {
    if (this.startMarker) { this.startMarker.remove(); this.startMarker = null; }
    if (this.bonusMarker) { this.bonusMarker.remove(); this.bonusMarker = null; }
    if (this.active) return;
    // mission bonus (remorque + foin) : disponible après la mission 1
    if (this.completed >= 1 && !this.game.save.bonusDone) {
      const b = BONUS.startPos;
      this.bonusMarker = createMarker(this.game.scene, 'bonus', b[0], b[1], 'MISSION BONUS : LE CASSE DU FOIN');
    }
    if (this.completed >= MISSIONS.length) return;
    const m = MISSIONS[this.completed];
    const lm = this.game.city.landmarks[m.start];
    this.startMarker = createMarker(this.game.scene, 'start', lm.door.x, lm.door.z, `MISSION ${this.completed + 1} : ${lm.name}`);
  }

  startBonus() {
    this.active = true;
    this.cur = BONUS;
    this.si = 0;
    this.refreshStart();
    this.game.hud.banner('MISSION BONUS', BONUS.title);
    this.game.sfx.success(true);
    this.runStep();
  }

  // Si le joueur est à pied et qu'aucune voiture libre n'est proche, Léa lui en fait livrer une
  ensureCar() {
    const g = this.game, p = g.player;
    if (p.vehicle) return;
    const near = g.vehicles.some((v) => !v.ai && !v.rental && Math.hypot(v.pos.x - p.x, v.pos.z - p.z) < 30);
    if (near) return;
    // place libre sur la chaussée la plus proche (les rues sont tous les 40 m)
    const rx = Math.round(p.x / 40) * 40, rz = Math.round(p.z / 40) * 40;
    const onX = Math.abs(p.x - rx) < Math.abs(p.z - rz);
    const x = onX ? rx + 4.3 : p.x + 5, z = onX ? p.z + 5 : rz + 4.3;
    const v = new Vehicle(g, { x, z, heading: onX ? 0 : Math.PI / 2, color: '#ff3d8b' });
    g.vehicles.push(v);
    setTimeout(() => g.hud.toast('🚗 Léa t\'a fait livrer une voiture juste à côté !', 3), 1500);
  }

  startMission() {
    this.ensureCar();
    this.active = true;
    this.mi = this.completed;
    this.cur = MISSIONS[this.mi];
    this.si = 0;
    this.refreshStart();
    this.game.hud.banner(`MISSION ${this.mi + 1}/10`, this.mission.title);
    this.game.sfx.success(true);
    this.runStep();
  }

  clearStep() {
    this.markers.forEach((m) => m.remove()); this.markers = [];
    this.npcs.forEach((n) => n.remove()); this.npcs = [];
    this.chaser = null;
    this.items = [];
    this.goal = null;
    this.timer = null;
    if (this.lines) { this.game.scene.remove(this.lines); this.lines.geometry.dispose(); this.lines = null; }
    this.game.hazards?.clear();
    this.game.hud.hideYield();
  }

  runStep() {
    const s = this.step;
    const g = this.game;
    this.clearStep();
    s.onStart?.(this.ctx);
    if (s.hazards) g.hazards.spawn(s.hazards);
    this.timer = s.time ? s.time : null;
    if (s.type === 'dialog') {
      g.talk.start(s.lines);
      g.dialog.show(s.lines, () => { g.talk.end(); this.completeStep(); });
    } else if (s.type === 'quiz') {
      g.quiz.show(s, () => this.completeStep());
    } else if (s.type === 'goto') {
      const p = this.resolvePos(s.target);
      const name = typeof s.target === 'string' ? g.city.landmarks[s.target].name : (s.npc ? s.npc.name : 'Objectif');
      this.goal = { ...p, name };
      this.markers.push(createMarker(g.scene, 'goal', p.x, p.z, name));
      if (s.npc) this.npcs.push(createNPC(g.scene, p.x, p.z));
    } else if (s.type === 'collect') {
      this.collected = 0;
      const course = s.course ? g.parkour.spawn(s.course) : null;
      for (const it of s.items) {
        const p = it.pos === 'course' ? { ...course.top } : this.resolvePos(it.pos);
        const item = { ...p, it, done: false, marker: createMarker(g.scene, s.rings ? 'ring' : 'item', p.x, p.z, it.label) };
        if (p.y) item.marker.group.position.y = p.y;
        if (s.npc) item.npc = createNPC(g.scene, p.x, p.z);
        this.items.push(item);
      }
      if (s.chaser) { // le fermier en colère court après le joueur
        const [cx, cz] = s.chaser;
        this.chaser = createNPC(g.scene, cx, cz, { skin: '#f1c27d', shirt: '#8d6e63', pants: '#1a237e', hair: '#5d4037', cap: '#43a047' });
        this.npcs.push(this.chaser);
        this.chaserCool = 2;
        g.hud.toast('M. Dubois : « Hé ! Mon foin ! Revenez ici ! »', 3);
      }
      if (s.network) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(66 * 6), 3));
        geo.setDrawRange(0, 0);
        this.lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#28e0d8', transparent: true, opacity: 0.85, toneMapped: false }));
        g.scene.add(this.lines);
      }
    } else if (s.type === 'yield') {
      this.yieldT = Math.random() * 10;
      g.hud.showYield();
    }
    this.updateHud();
  }

  completeStep() {
    const s = this.step;
    if (!s) return;
    s.onDone?.(this.ctx);
    if (s.done) this.game.hud.toast(s.done);
    // les PNJ de réseau / items disparaissent
    this.clearStep();
    this.si++;
    if (this.si >= this.mission.steps.length) this.finishMission();
    else this.runStep();
  }

  failStep() {
    this.clearStep();
    this.game.sfx.fail();
    this.game.dialog.show(FAIL_LINES, () => this.runStep());
  }

  finishMission() {
    const g = this.game;
    this.active = false;
    g.parkour.clear(); // les plateformes du parcours disparaissent à la fin de la mission
    g.sfx.success();
    if (this.cur === BONUS) { // mission bonus : pas de définition
      g.trailer.detach();
      g.save.bonusDone = true; g.saveProgress();
      g.screens.cardOpen = true;
      g.cinematic.playMini('BONUS', BONUS.title, () => { g.screens.cardOpen = false; this.refreshStart(); this.updateHud(); });
      return;
    }
    this.completed = Math.max(this.completed, this.mi + 1);
    g.saveProgress();
    g.hud.setDefs(this.completed);
    g.screens.cardOpen = true;
    g.cinematic.playMini(this.mi + 1, this.mission.title, () => g.screens.showDefinition(this.mi, DEFINITIONS[this.mi], () => {
      if (this.completed >= MISSIONS.length) {
        // grande cinématique de fin, puis l'écran de félicitations
        if (this.mi === MISSIONS.length - 1) { g.screens.cardOpen = true; g.cinematic.play(() => g.screens.showEnd()); }
        else g.screens.showEnd();
      }
      this.refreshStart();
      this.updateHud();
    }));
  }

  spawnRental() {
    const g = this.game;
    const lm = g.city.landmarks.locauto;
    if (this.rental && g.vehicles.includes(this.rental)) return;
    const [x, z] = lm.ctx.W(0, 4);
    const v = new Vehicle(g, { x, z, heading: lm.ctx.yaw, kind: 'rental', color: '#2ecc71' });
    g.vehicles.push(v);
    this.rental = v;
  }

  // Debug : passer l'étape
  skip() {
    if (!this.active) { if (this.completed < MISSIONS.length) this.startMission(); return; }
    const g = this.game;
    if (g.dialog.isOpen) { g.dialog.close(); return; }
    if (g.quiz.isOpen) { g.quiz.close(); return; }
    if (this.step?.type === 'goto' && this.step.car === 'rental' && !this.rental) this.spawnRental();
    this.completeStep();
  }

  interact() {
    if (this.active && this.step?.type === 'yield') { this.buyTicket(); return true; }
    return false;
  }

  price() { const t = this.yieldT; return 45 + 20 * Math.sin(0.9 * t) + 8 * Math.sin(2.3 * t); }

  buyTicket() {
    const p = Math.round(this.price());
    const g = this.game;
    if (p >= this.step.threshold) {
      g.sfx.fail();
      g.hud.yieldFeedback(`${p} € ? Trop cher ! Attends que le prix passe sous ${this.step.threshold} €.`);
      return;
    }
    g.sfx.pickup();
    g.hud.hideYield();
    const step = this.step;
    this.clearStep();
    g.dialog.show([
      ['Billetterie', `Billet acheté à ${p} € !`],
      ['Léa', `Le même siège valait 62 € une heure avant : c'est le yield management, comme la SNCF ou les compagnies aériennes.`],
      ['Léa', 'Le prix varie en temps réel selon la demande et le remplissage, pour maximiser le chiffre d\'affaires.'],
    ], () => { this.si = this.mission.steps.indexOf(step); this.completeStep(); });
  }

  update(dt) {
    const g = this.game;
    const px = g.player.x, pz = g.player.z;
    this.markers.forEach((m) => m.update(dt));
    const nextRing = this.step?.ordered ? this.items.find((x) => !x.done) : null;
    this.items.forEach((i) => { if (!i.done) { i.marker.update(dt); if (this.step?.ordered) i.marker.group.visible = i === nextRing; } });
    if (this.startMarker) {
      this.startMarker.update(dt);
      if (Math.hypot(px - this.startMarker.x, pz - this.startMarker.z) < 4.5) this.startMission();
    }
    if (this.bonusMarker) {
      this.bonusMarker.update(dt);
      if (!this.active && Math.hypot(px - this.bonusMarker.x, pz - this.bonusMarker.z) < 4.5) this.startBonus();
    }
    this.npcs.forEach((n) => n.update(dt, px, pz));
    this.items.forEach((i) => i.npc && i.npc.update(dt, px, pz));
    g.hud.setHintOverride(null);
    if (!this.active) { this.updateHud(); return; }
    const s = this.step;
    if (this.timer !== null) {
      this.timer -= dt;
      if (this.timer <= 0) { this.failStep(); return; }
    }
    const inCar = !!g.player.vehicle;
    const r = inCar ? 6.5 : 4.5;
    if (s.type === 'goto') {
      if (Math.hypot(px - this.goal.x, pz - this.goal.z) < r) {
        const ok = !s.car || (s.car === 'rental' ? g.player.vehicle?.rental : s.car === 'trailer' ? g.trailer.attachedToPlayer : inCar);
        if (ok) {
          if (s.npc) g.hud.toast(`${s.npc.name} monte à bord`);
          g.sfx.pickup();
          this.completeStep();
          return;
        }
        g.hud.setHintOverride(s.car === 'trailer' ? 'Il faut arriver avec la voiture qui tire la remorque !' : s.car === 'rental' ? "Il faut arriver avec la voiture LOC'AUTO !" : 'Il te faut un véhicule pour cette étape !');
      }
    } else if (s.type === 'collect') {
      if (this.chaser) {
        const ch = this.chaser, dx = px - ch.x, dz = pz - ch.z, d = Math.hypot(dx, dz);
        this.chaserCool -= dt;
        if (d > 1.2) { ch.x += (dx / d) * 3.6 * dt; ch.z += (dz / d) * 3.6 * dt; }
        ch.c.group.position.set(ch.x, 0.12, ch.z);
        ch.c.animate(dt, 3.6);
        if (d < 1.6 && this.chaserCool <= 0 && !g.player.vehicle) {
          this.chaserCool = 3;
          if (this.timer !== null) this.timer = Math.max(1, this.timer - 8);
          g.hud.toast('Le fermier t\'a attrapé par le col ! −8 s', 2.5);
          g.sfx.fail();
          g.player.pos.x += (dx / (d || 1)) * 4; g.player.pos.z += (dz / (d || 1)) * 4;
        }
      }
      for (const i of this.items) {
        if (i.done || Math.hypot(px - i.x, pz - i.z) > r) continue;
        if (s.ordered && i !== this.items.find((x) => !x.done)) continue; // anneaux : dans l'ordre
        if (s.car && !(s.car === 'rental' ? g.player.vehicle?.rental : inCar)) { g.hud.setHintOverride(s.car === 'rental' ? "Passe les anneaux avec la voiture LOC'AUTO !" : 'Passe les anneaux en voiture !'); continue; }
        if (i.y && (inCar || g.player.y < i.y - 0.6)) continue; // objet en hauteur : à atteindre à pied, en sautant
        i.done = true;
        this.collected++;
        if (s.bales) g.trailer.setBales(this.collected);
        i.marker.remove();
        if (i.npc && !s.network) { i.npc.remove(); i.npc = null; }
        g.hud.toast(i.it.msg, s.items.length <= 3 ? 5 : 3);
        g.sfx.pickup();
        g.cinematic.pickupFx(i.x, i.y || 0, i.z);
        if (s.network) this.updateNetwork();
      }
      if (this.collected >= this.items.length) {
        this.items.forEach((i) => i.npc && i.npc.remove());
        this.completeStep();
        return;
      }
    } else if (s.type === 'yield') {
      this.yieldT += dt;
      const p = this.price();
      g.hud.updateYield(p, p > 55 ? 'forte' : p > 35 ? 'moyenne' : 'faible');
    }
    this.updateHud();
  }

  updateNetwork() {
    const hq = this.game.city.landmarks.hq.door;
    const pts = [{ x: hq.x - 2, z: hq.z }, { x: hq.x + 2, z: hq.z }, ...this.items.filter((i) => i.done)];
    const arr = this.lines.geometry.attributes.position.array;
    let k = 0;
    for (let a = 0; a < pts.length; a++) for (let b = a + 1; b < pts.length; b++) {
      arr[k++] = pts[a].x; arr[k++] = 2.2; arr[k++] = pts[a].z;
      arr[k++] = pts[b].x; arr[k++] = 2.2; arr[k++] = pts[b].z;
    }
    this.lines.geometry.attributes.position.needsUpdate = true;
    this.lines.geometry.setDrawRange(0, k / 3);
    this.lines.geometry.computeBoundingSphere();
  }

  // Cible actuelle (pour la flèche et la mini-carte)
  target() {
    const px = this.game.player.x, pz = this.game.player.z;
    if (!this.active) return this.startMarker ? { x: this.startMarker.x, z: this.startMarker.z, kind: 'start' } : null;
    if (this.goal) return { ...this.goal, kind: 'goal' };
    let best = null, bd = 1e9;
    if (this.step?.ordered) { const n = this.items.find((x) => !x.done); if (n) return { x: n.x, z: n.z, kind: 'item' }; }
    for (const i of this.items) {
      if (i.done) continue;
      const d = Math.hypot(px - i.x, pz - i.z);
      if (d < bd) { bd = d; best = { x: i.x, z: i.z, kind: 'item' }; }
    }
    return best;
  }

  allPoints() {
    const out = [];
    if (this.startMarker) out.push({ x: this.startMarker.x, z: this.startMarker.z, kind: 'start' });
    if (this.bonusMarker && !this.active) out.push({ x: this.bonusMarker.x, z: this.bonusMarker.z, kind: 'bonus' });
    if (this.goal) out.push({ ...this.goal, kind: 'goal' });
    for (const i of this.items) if (!i.done) out.push({ x: i.x, z: i.z, kind: 'item' });
    return out;
  }

  updateHud() {
    const h = this.game.hud;
    if (!this.active) {
      if (this.completed >= MISSIONS.length) h.setMission('MODE LIBRE', 'Explore CEJM City ! (J : carnet de définitions)', '');
      else {
        const m = MISSIONS[this.completed];
        h.setMission(`MISSION ${this.completed + 1}/10 — ${m.title}`, `Rejoins le marqueur jaune : ${this.game.city.landmarks[m.start].name}`, '');
      }
      return;
    }
    const s = this.step;
    let extra = '';
    if (s.type === 'collect') extra = s.counter ? s.counter(this.collected, this.items.length) : `${this.collected}/${this.items.length}`;
    if (this.timer !== null) {
      const t = Math.max(0, Math.ceil(this.timer));
      extra += `${extra ? '  ·  ' : ''}⏱ ${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
    }
    h.setMission(this.cur === BONUS ? `MISSION BONUS — ${BONUS.title}` : `MISSION ${this.mi + 1}/10 — ${this.mission.title}`, s.objective || '', extra, this.timer !== null && this.timer < 15);
  }
}

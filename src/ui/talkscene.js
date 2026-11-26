import * as THREE from 'three';
import { createCharacter } from '../entities/character.js';

// Personnages qui parlent au téléphone (pas de PNJ à côté du joueur)
const PHONE = new Set(['Léa', 'UBIK', 'MusiCity']);
const LOOKS = {
  'M. Martin': { skin: '#e0ac69', shirt: '#37474f', pants: '#263238', hair: '#9e9e9e' },
  'Technicien': { skin: '#c68642', shirt: '#1e88e5', pants: '#263238', hair: '#000000', cap: '#1e88e5' },
  'M. Dubois': { skin: '#f1c27d', shirt: '#8d6e63', pants: '#1a237e', hair: '#5d4037', cap: '#43a047' },
  'Mme Leroy': { skin: '#ffdbac', shirt: '#f48fb1', pants: '#6d4c41', hair: '#e0e0e0' },
  'HubLocal': { skin: '#8d5524', shirt: '#7fc8a9', pants: '#263238', hair: '#000000' },
  'Sam': { skin: '#ffdbac', shirt: '#ff6f00', pants: '#212121', hair: '#c49a6c', cap: '#212121' },
  'Gérard': { skin: '#e0ac69', shirt: '#fdd835', pants: '#37474f', hair: '#757575', cap: '#212121' },
  'Inès': { skin: '#c68642', shirt: '#8e24aa', pants: '#263238', hair: '#000000' },
  'Karim': { skin: '#8d5524', shirt: '#43a047', pants: '#1a237e', hair: '#000000' },
  'Nadia': { skin: '#c68642', shirt: '#3aa17e', pants: '#4e342e', hair: '#2b1a12' },
  'M. Dupont': { skin: '#f1c27d', shirt: '#90a4ae', pants: '#263238', hair: '#5d4037' },
  'Vendeur': { skin: '#e0ac69', shirt: '#ffffff', pants: '#212121', hair: '#000000' },
  "L'Artisan": { skin: '#f1c27d', shirt: '#6d4c41', pants: '#37474f', hair: '#8d6e63' },
  'Zoé': { skin: '#ffdbac', shirt: '#ff2bd6', pants: '#212121', hair: '#7b1fa2', cap: '#28e0d8' },
};

// Mini-cinématique de dialogue : bandes noires + plans champ / contre-champ entre le joueur et son interlocuteur
export class TalkScene {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.npc = null;
    this.pos = new THREE.Vector3();
    this.look = new THREE.Vector3();
  }

  start(lines) {
    const g = this.game, p = g.player;
    this.active = true;
    document.body.classList.add('talking');
    const v = p.vehicle;
    const h = v ? v.heading : p.heading;
    // le joueur (ou sa voiture) et l'interlocuteur se font face
    const px = p.x, pz = p.z;
    const side = v ? 3.4 : 2.4;
    const ang = v ? h + Math.PI / 2 : h;
    this.me = { x: px, z: pz, y: v ? 1.3 : 1.55 + (p.y || 0) };
    this.them = { x: px + Math.sin(ang) * side, z: pz + Math.cos(ang) * side, y: 1.55 + (p.y || 0) };
    const speaker = lines.map((l) => l[0]).find((n) => !PHONE.has(n));
    if (speaker) {
      const c = createCharacter(LOOKS[speaker] || { skin: '#e0ac69', shirt: '#ffb000', pants: '#263238', hair: '#3e2723' });
      c.group.position.set(this.them.x, p.y || 0, this.them.z);
      c.group.rotation.y = Math.atan2(px - this.them.x, pz - this.them.z);
      g.scene.add(c.group);
      this.npc = c;
      this.npcName = speaker;
    }
    if (!v) p.heading = Math.atan2(this.them.x - px, this.them.z - pz);
    p.sync?.();
    this.t = 0;
    this.pos.copy(g.camera.position);
  }

  update(dt) {
    const g = this.game, cam = g.camera;
    this.t += dt;
    const who = g.dialog.lines?.[g.dialog.i]?.[0];
    const talkingNpc = this.npc && who === this.npcName;
    // plan sur celui qui parle, caméra derrière l'épaule de l'autre
    const A = talkingNpc ? this.me : this.them, B = talkingNpc ? this.them : this.me;
    const dx = B.x - A.x, dz = B.z - A.z, L = Math.hypot(dx, dz) || 1;
    const nx = dx / L, nz = dz / L;
    const sideX = -nz, sideZ = nx;
    const want = new THREE.Vector3(A.x - nx * 1.6 + sideX * 1.1, A.y + 0.35, A.z - nz * 1.6 + sideZ * 1.1);
    this.pos.lerp(want, 1 - Math.exp(-5 * dt));
    this.look.lerp(new THREE.Vector3(B.x, B.y, B.z), 1 - Math.exp(-6 * dt));
    cam.position.copy(this.pos);
    cam.lookAt(this.look);
    if (this.npc) {
      this.npc.body.position.y = talkingNpc ? Math.abs(Math.sin(this.t * 9)) * 0.04 : 0;
      this.npc.body.rotation.y = talkingNpc ? Math.sin(this.t * 3) * 0.12 : 0;
    }
  }

  end() {
    if (!this.active) return;
    this.active = false;
    document.body.classList.remove('talking');
    if (this.npc) { this.game.scene.remove(this.npc.group); this.npc = null; }
  }
}

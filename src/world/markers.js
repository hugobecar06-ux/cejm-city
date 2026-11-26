import * as THREE from 'three';
import { textTexture } from './textures.js';
import { createCharacter, randomLook } from '../entities/character.js';

const COLORS = { start: '#ffd400', goal: '#2f9bff', item: '#36e27a', bonus: '#b04dff' };
const beamGeo = new THREE.CylinderGeometry(1.6, 1.6, 40, 16, 1, true);
beamGeo.translate(0, 20, 0);
const ringGeo = new THREE.RingGeometry(2.2, 3, 32);
ringGeo.rotateX(-Math.PI / 2);

// Repère 3D : colonne lumineuse + étiquette visible à travers les murs
export function createMarker(scene, kind, x, z, label) {
  const color = COLORS[kind];
  const group = new THREE.Group();
  const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }));
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false, toneMapped: false }));
  ring.position.y = 0.2;
  group.add(beam, ring);
  let sprite = null;
  if (label) {
    const { texture, aspect } = textTexture(label, { font: 'Inter', weight: '800', size: 64, color: '#ffffff', bg: 'rgba(10,6,25,0.8)', pad: 22, radius: 30 });
    sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false, sizeAttenuation: false, transparent: true }));
    const h = 0.045;
    sprite.scale.set(h * aspect, h, 1);
    sprite.position.y = 5;
    sprite.renderOrder = 10;
    group.add(sprite);
  }
  group.position.set(x, 0, z);
  scene.add(group);
  let t = Math.random() * 5;
  return {
    group, x, z, kind,
    update(dt) {
      t += dt;
      beam.material.opacity = 0.28 + Math.sin(t * 3) * 0.08;
      ring.scale.setScalar(1 + Math.sin(t * 4) * 0.08);
    },
    remove() {
      scene.remove(group);
      beam.material.dispose(); ring.material.dispose();
      if (sprite) { sprite.material.map.dispose(); sprite.material.dispose(); }
    },
  };
}

// PNJ de mission (passager, vendeur, membre…)
export function createNPC(scene, x, z, look) {
  const c = createCharacter(look || randomLook());
  c.group.position.set(x, 0.12, z);
  scene.add(c.group);
  let t = Math.random() * 3;
  return {
    c, x, z,
    update(dt, px, pz) {
      t += dt;
      c.group.rotation.y = Math.atan2(px - this.x, pz - this.z);
      c.body.position.y = Math.sin(t * 2) * 0.02;
    },
    remove() { scene.remove(c.group); },
  };
}

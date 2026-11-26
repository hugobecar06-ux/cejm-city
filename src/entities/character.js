import * as THREE from 'three';
import { partsGeometry } from '../world/geometry.js';

const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
const legCache = new Map();
const SKINS = ['#f1c27d', '#c68642', '#8d5524', '#e0ac69', '#ffdbac'];
const SHIRTS = ['#e53935', '#1e88e5', '#43a047', '#fdd835', '#8e24aa', '#fb8c00', '#00acc1', '#ffffff', '#ff4081', '#5d4037'];
const PANTS = ['#263238', '#37474f', '#1a237e', '#4e342e', '#212121', '#546e7a'];

export function randomLook(rng = Math.random) {
  const p = (a) => a[Math.floor(rng() * a.length)];
  return { skin: p(SKINS), shirt: p(SHIRTS), pants: p(PANTS), hair: p(['#2b1a12', '#5d4037', '#000000', '#c49a6c', '#8d6e63']) };
}

// Personnage low-poly : corps fusionné + 2 jambes animées
export function createCharacter(look) {
  const group = new THREE.Group();
  const parts = [
    { t: 'box', w: 0.56, h: 0.66, d: 0.32, pos: [0, 1.18, 0], color: look.shirt },
    { t: 'box', w: 0.16, h: 0.6, d: 0.18, pos: [-0.37, 1.18, 0], color: look.shirt },
    { t: 'box', w: 0.16, h: 0.6, d: 0.18, pos: [0.37, 1.18, 0], color: look.shirt },
    { t: 'box', w: 0.15, h: 0.15, d: 0.15, pos: [-0.37, 0.82, 0], color: look.skin },
    { t: 'box', w: 0.15, h: 0.15, d: 0.15, pos: [0.37, 0.82, 0], color: look.skin },
    { t: 'box', w: 0.34, h: 0.34, d: 0.34, pos: [0, 1.7, 0], color: look.skin },
    { t: 'box', w: 0.36, h: 0.12, d: 0.36, pos: [0, 1.88, -0.01], color: look.hair },
    { t: 'box', w: 0.06, h: 0.06, d: 0.02, pos: [-0.08, 1.72, 0.17], color: '#111' },
    { t: 'box', w: 0.06, h: 0.06, d: 0.02, pos: [0.08, 1.72, 0.17], color: '#111' },
  ];
  if (look.cap) parts.push({ t: 'box', w: 0.38, h: 0.1, d: 0.5, pos: [0, 1.92, 0.06], color: look.cap });
  const body = new THREE.Mesh(partsGeometry(parts), mat);
  body.castShadow = true;
  group.add(body);
  let legGeo = legCache.get(look.pants);
  if (!legGeo) {
    legGeo = partsGeometry([
      { t: 'box', w: 0.22, h: 0.8, d: 0.24, pos: [0, -0.4, 0], color: look.pants },
      { t: 'box', w: 0.24, h: 0.1, d: 0.32, pos: [0, -0.83, 0.04], color: '#222' },
    ]);
    legCache.set(look.pants, legGeo);
  }
  const legL = new THREE.Mesh(legGeo, mat); legL.position.set(-0.14, 0.86, 0);
  const legR = new THREE.Mesh(legGeo, mat); legR.position.set(0.14, 0.86, 0);
  group.add(legL, legR);
  let phase = 0;
  return {
    group, body,
    animate(dt, speed) {
      phase += dt * speed * 2.4;
      const a = Math.min(1, speed / 2) * 0.6;
      legL.rotation.x = Math.sin(phase) * a;
      legR.rotation.x = -Math.sin(phase) * a;
      body.position.y = Math.abs(Math.sin(phase)) * 0.05 * Math.min(1, speed);
    },
  };
}

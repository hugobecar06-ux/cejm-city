import * as THREE from 'three';
import { HALF, SPACING, N_BLOCKS, blockCenter, mulberry32, SEA_X } from './constants.js';
import { makeFacadeTextures } from './textures.js';
import { partsGeometry, buildingGeometry } from './geometry.js';
import { LANDMARKS, buildLandmark, stallParts } from './landmarks.js';

const PARKS = new Set(['4,6', '6,5', '1,4', '8,1', '3,9']);
const BUILDING_COLORS = ['#f2d0c4', '#e9b8a8', '#cfd8e8', '#f6e2b3', '#d9c5e8', '#bfe3d6', '#f0c0d0', '#e8e0d0', '#a9c4e0', '#ffd6a5'];

export function buildCity(scene, colliders, { shadows }) {
  const rng = mulberry32(20240607);
  const sinks = { facade: [], plain: [], neon: [], parked: [], colliders, group: new THREE.Group() };
  scene.add(sinks.group);
  const city = { landmarks: {}, parks: [], parked: sinks.parked, blocks: [] };

  // --- Sol ---
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshLambertMaterial({ color: '#5d7a3a' }));
  grass.rotation.x = -Math.PI / 2; grass.position.y = -0.03; scene.add(grass);
  const asphalt = new THREE.Mesh(new THREE.PlaneGeometry(410, 410), new THREE.MeshLambertMaterial({ color: '#3a3842' }));
  asphalt.rotation.x = -Math.PI / 2; asphalt.receiveShadow = true; scene.add(asphalt);
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(38, 520), new THREE.MeshLambertMaterial({ color: '#f2d19b' }));
  sand.rotation.x = -Math.PI / 2; sand.position.set(224, 0.02, 0); sand.receiveShadow = true; scene.add(sand);
  const seaGeo = new THREE.PlaneGeometry(1400, 1400, 70, 70);
  seaGeo.rotateX(-Math.PI / 2);
  const sea = new THREE.Mesh(seaGeo, new THREE.MeshPhongMaterial({ color: '#1f8fb0', specular: '#ffd0a0', shininess: 60, flatShading: true }));
  sea.position.set(SEA_X + 700, 0.05, 0); scene.add(sea);
  const seaBase = Float32Array.from(seaGeo.attributes.position.array);

  // --- Pâtés : trottoirs, parcs, bâtiments ---
  const sidewalkGeo = new THREE.BoxGeometry(30, 0.12, 30);
  const sidewalks = new THREE.InstancedMesh(sidewalkGeo, new THREE.MeshLambertMaterial({ color: '#b5aaa2' }), N_BLOCKS * N_BLOCKS);
  sidewalks.receiveShadow = true;
  const m4 = new THREE.Matrix4();
  const lmByBlock = {};
  for (const lm of LANDMARKS) lmByBlock[`${lm.i},${lm.j}`] = lm;
  const palmSpots = [], lampSpots = [], treeSpots = [];
  let k = 0;
  for (let i = 0; i < N_BLOCKS; i++) {
    for (let j = 0; j < N_BLOCKS; j++) {
      const cx = blockCenter(i), cz = blockCenter(j);
      m4.makeTranslation(cx, 0.06, cz); sidewalks.setMatrixAt(k++, m4);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) palmSpots.push([cx + sx * 14.3, cz + sz * 14.3]);
      for (const sx of [-1, 1]) { lampSpots.push([cx + sx * 7.5, cz + 14.3]); lampSpots.push([cx - sx * 7.5, cz - 14.3]); }
      const key = `${i},${j}`;
      if (lmByBlock[key]) {
        const lm = buildLandmark(lmByBlock[key], sinks);
        city.landmarks[lm.id] = lm;
        continue;
      }
      if (PARKS.has(key)) {
        city.parks.push({ x: cx, z: cz });
        sinks.plain.push({ t: 'box', w: 25, h: 0.1, d: 25, pos: [cx, 0.14, cz], color: '#4f8f3a' });
        sinks.plain.push({ t: 'cyl', r: 3, h: 0.6, seg: 16, pos: [cx, 0.4, cz], color: '#bfae8e' });
        sinks.plain.push({ t: 'cyl', r: 2.6, h: 0.1, seg: 16, pos: [cx, 0.72, cz], color: '#3fb6d9' });
        colliders.add(cx - 3, cz - 3, cx + 3, cz + 3, 1);
        for (let t = 0; t < 7; t++) {
          const a = (t / 7) * Math.PI * 2 + rng();
          treeSpots.push([cx + Math.cos(a) * (7 + rng() * 3), cz + Math.sin(a) * (7 + rng() * 3)]);
        }
        continue;
      }
      // Bâtiments ordinaires : plus hauts au centre
      const d = Math.hypot(cx, cz);
      const maxH = Math.max(12, 75 - d * 0.25);
      const pattern = rng();
      const lots = [];
      if (pattern < 0.35) lots.push([-12, -12, 12, 12]);
      else if (pattern < 0.65) { lots.push([-12, -12, -0.5, 12]); lots.push([0.5, -12, 12, 12]); }
      else { lots.push([-12, -12, -0.5, -0.5], [0.5, -12, 12, -0.5], [-12, 0.5, -0.5, 12], [0.5, 0.5, 12, 12]); }
      for (const [x0, z0, x1, z1] of lots) {
        const inset = rng() * 1.5;
        const floors = Math.max(3, Math.round(((0.35 + rng() * 0.65) * maxH) / 3.5));
        const h = floors * 3.5;
        const b = { x0: cx + x0 + inset, z0: cz + z0 + inset, x1: cx + x1 - inset, z1: cz + z1 - inset, h, color: BUILDING_COLORS[Math.floor(rng() * BUILDING_COLORS.length)] };
        sinks.facade.push(b);
        colliders.add(b.x0, b.z0, b.x1, b.z1, h);
        if (rng() < 0.3) {
          const nc = ['#ff3d8b', '#28e0d8', '#ffb000', '#b04dff'][Math.floor(rng() * 4)];
          sinks.neon.push({ t: 'box', w: b.x1 - b.x0 + 0.2, h: 0.35, d: b.z1 - b.z0 + 0.2, pos: [(b.x0 + b.x1) / 2, h - 0.6, (b.z0 + b.z1) / 2], color: nc });
        }
        if (rng() < 0.4) sinks.plain.push({ t: 'box', w: 3, h: 1.6, d: 3, pos: [(b.x0 + b.x1) / 2 + 2, h + 0.8, (b.z0 + b.z1) / 2], color: '#7a7480' });
      }
    }
  }
  sidewalks.instanceMatrix.needsUpdate = true;
  scene.add(sidewalks);

  // Bâtiments fusionnés (2 draw calls)
  const fac = makeFacadeTextures(rng);
  const wallMat = new THREE.MeshLambertMaterial({ map: fac.map, emissiveMap: fac.emissive, emissive: '#ffffff', emissiveIntensity: 0.9, vertexColors: true });
  const roofMat = new THREE.MeshLambertMaterial({ color: '#4a4150' });
  const buildings = new THREE.Mesh(buildingGeometry(sinks.facade), [wallMat, roofMat]);
  buildings.castShadow = shadows; buildings.receiveShadow = shadows;
  scene.add(buildings);

  // --- Marquage au sol ---
  const dashes = [];
  for (let r = -HALF; r <= HALF; r += SPACING) {
    for (let s = -HALF; s < HALF; s += SPACING) {
      for (let t = s + 8; t < s + SPACING - 6; t += 6) { dashes.push([r, t + 1.5, 0]); dashes.push([t + 1.5, r, 1]); }
    }
  }
  const dashMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.25, 3), new THREE.MeshBasicMaterial({ color: '#f5f0e0' }), dashes.length);
  const q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(1, 1, 1), pv = new THREE.Vector3();
  dashes.forEach(([x, z, rot], n) => {
    e.set(-Math.PI / 2, 0, rot ? Math.PI / 2 : 0); q.setFromEuler(e); pv.set(x, 0.02, z);
    m4.compose(pv, q, sc); dashMesh.setMatrixAt(n, m4);
  });
  scene.add(dashMesh);

  // --- Palmiers, arbres, lampadaires ---
  for (let z = -200; z <= 200; z += 16) palmSpots.push([210 + rng() * 6, z + rng() * 4]);
  const palmTrunk = partsGeometry([{ t: 'cyl', rt: 0.18, rb: 0.32, h: 7, seg: 6, pos: [0, 3.5, 0], color: '#8a6a45' }]);
  const fronds = [];
  for (let f = 0; f < 7; f++) {
    const a = (f / 7) * Math.PI * 2;
    fronds.push({ t: 'box', w: 0.7, h: 0.08, d: 3.4, pos: [Math.sin(a) * 1.5, 6.8, Math.cos(a) * 1.5], rot: [0.45, 0, 0], yaw: a, color: f % 2 ? '#2f8f46' : '#3aa655' });
  }
  fronds.push({ t: 'ico', r: 0.45, pos: [0, 7, 0], color: '#5b4a2a' });
  const palmCrown = partsGeometry(fronds);
  const vcMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const inst = (geo, spots, scaleRnd = 0.25) => {
    const im = new THREE.InstancedMesh(geo, vcMat, spots.length);
    spots.forEach(([x, z], n) => {
      const s = 1 + (rng() - 0.5) * scaleRnd;
      e.set(0, rng() * 6.28, 0); q.setFromEuler(e); pv.set(x, 0, z); sc.set(s, s, s);
      m4.compose(pv, q, sc); im.setMatrixAt(n, m4);
    });
    im.castShadow = shadows;
    scene.add(im);
    return im;
  };
  const palmMats = [];
  const t1 = inst(palmTrunk, palmSpots);
  // Recopie des mêmes matrices pour les couronnes
  const crown = new THREE.InstancedMesh(palmCrown, vcMat, palmSpots.length);
  for (let n = 0; n < palmSpots.length; n++) { t1.getMatrixAt(n, m4); crown.setMatrixAt(n, m4); }
  crown.castShadow = shadows; scene.add(crown);
  palmMats.push(t1, crown);
  for (const [x, z] of palmSpots) if (x < 205) colliders.add(x - 0.35, z - 0.35, x + 0.35, z + 0.35, 7, 'palm');
  inst(partsGeometry([
    { t: 'cyl', r: 0.25, h: 2.4, pos: [0, 1.2, 0], color: '#6b4226' },
    { t: 'ico', r: 2.2, detail: 0, pos: [0, 3.8, 0], color: '#2f7d3a' },
    { t: 'ico', r: 1.5, detail: 0, pos: [0.8, 4.8, 0.3], color: '#3c9a48' },
  ]), treeSpots, 0.4);
  for (const [x, z] of treeSpots) colliders.add(x - 0.4, z - 0.4, x + 0.4, z + 0.4, 4, 'tree');
  inst(partsGeometry([
    { t: 'cyl', r: 0.1, h: 6, pos: [0, 3, 0], color: '#2c2c34' },
    { t: 'box', w: 0.3, h: 0.1, d: 1.4, pos: [0, 6, 0.5], color: '#2c2c34' },
  ]), lampSpots, 0);
  const lampHeads = new THREE.InstancedMesh(new THREE.BoxGeometry(0.45, 0.2, 0.6), new THREE.MeshBasicMaterial({ color: '#ffe2a0', toneMapped: false }), lampSpots.length);
  // les têtes suivent la même orientation aléatoire ? non : posées à plat, orientation libre
  lampSpots.forEach(([x, z], n) => { m4.makeTranslation(x, 5.9, z); lampHeads.setMatrixAt(n, m4); });
  scene.add(lampHeads);
  for (const [x, z] of lampSpots) colliders.add(x - 0.15, z - 0.15, x + 0.15, z + 0.15, 6, 'lamp');

  // Parasols sur la plage + collines au loin
  for (let z = -180; z <= 180; z += 30) {
    const x = 220 + rng() * 10, c = ['#ff3d8b', '#28e0d8', '#ffb000', '#ffffff'][Math.floor(rng() * 4)];
    sinks.plain.push({ t: 'cyl', r: 0.05, h: 2.6, pos: [x, 1.3, z], color: '#eee' });
    sinks.plain.push({ t: 'cone', r: 1.6, h: 0.7, seg: 8, pos: [x, 2.7, z], color: c });
    sinks.plain.push({ t: 'box', w: 0.9, h: 0.05, d: 1.9, pos: [x + 1.5, 0.08, z], color: c });
  }
  for (let n = 0; n < 26; n++) {
    const a = Math.PI * 0.55 + (n / 26) * Math.PI * 0.9 + rng() * 0.05;
    const r = 340 + rng() * 120;
    sinks.plain.push({ t: 'cone', r: 40 + rng() * 50, h: 25 + rng() * 45, seg: 6, pos: [Math.cos(a) * r, 10, Math.sin(a) * r * 1.2], color: rng() < 0.5 ? '#4b5d3a' : '#5c6a44' });
  }

  // Géométries fusionnées des landmarks / props / néons
  const plain = new THREE.Mesh(partsGeometry(sinks.plain), vcMat);
  plain.castShadow = shadows; plain.receiveShadow = shadows; scene.add(plain);
  const neonMat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
  scene.add(new THREE.Mesh(partsGeometry(sinks.neon), neonMat));

  city.spawnStalls = () => {
    if (city._stalls) return;
    const lm = city.landmarks.laplace;
    city._stalls = new THREE.Mesh(partsGeometry(stallParts(lm.ctx)), vcMat);
    city._stalls.castShadow = shadows;
    scene.add(city._stalls);
  };

  let tAcc = 0, frame = 0;
  city.update = (dt, lowPower) => {
    tAcc += dt; frame++;
    if (lowPower && frame % 3) return;
    const p = seaGeo.attributes.position.array;
    for (let n = 0; n < p.length; n += 3) {
      const x = seaBase[n], z = seaBase[n + 2];
      p[n + 1] = Math.sin(x * 0.05 + tAcc * 1.2) * 0.35 + Math.cos(z * 0.07 + tAcc * 0.9) * 0.3;
    }
    seaGeo.attributes.position.needsUpdate = true;
  };
  return city;
}

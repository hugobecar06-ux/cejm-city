import * as THREE from 'three';
import './style.css';
import { Colliders } from './world/collision.js';
import { buildCity } from './world/city.js';
import { damp, angleDiff, clamp } from './world/constants.js';
import { Input } from './input.js';
import { Sfx } from './audio/sfx.js';
import { Player } from './entities/player.js';
import { Vehicle, carCarCollisions } from './entities/vehicle.js';
import { Traffic } from './entities/traffic.js';
import { Pedestrians } from './entities/pedestrians.js';
import { Hud } from './ui/hud.js';
import { Dialog, Quiz } from './ui/dialog.js';
import { Minimap } from './ui/minimap.js';
import { Notebook, Screens } from './ui/notebook.js';
import { MobileControls } from './ui/mobileControls.js';
import { Settings } from './ui/settings.js';
import { Parkour } from './world/parkour.js';
import { Cinematic } from './ui/cinematic.js';
import { Hazards } from './world/hazards.js';
import { TalkScene } from './ui/talkscene.js';
import { Trailer } from './entities/trailer.js';
import { MissionEngine } from './missions/engine.js';
import { INTRO } from './missions/missions.js';

const SAVE_KEY = 'digitalcity.save.v1';
const loadSave = () => { try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || null; } catch { return null; } };
const writeSave = (d) => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } catch { /* indisponible */ } };
const DEBUG = /[?&]debug/.test(location.search);

async function init() {
  try { await Promise.race([Promise.all([document.fonts.load('100px "Anton"'), document.fonts.load('800 60px "Inter"')]), new Promise((r) => setTimeout(r, 1000))]); } catch { /* polices de secours */ }

  const mobile = window.matchMedia('(pointer: coarse)').matches;
  const canvas = document.getElementById('game');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const shadows = !mobile;
  renderer.shadowMap.enabled = shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#f08a7a', 80, 430);
  const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.3, 1600);

  // Ciel coucher de soleil : violet -> rose -> orange
  const sunDir = new THREE.Vector3(1, 0.13, 0.35).normalize();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { sunDir: { value: sunDir } },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec3 vDir; uniform vec3 sunDir;
      void main(){ float h = vDir.y;
        vec3 top = vec3(0.17,0.06,0.36), mid = vec3(0.86,0.25,0.50), hor = vec3(1.0,0.56,0.30);
        vec3 c = h > 0.18 ? mix(mid, top, clamp((h-0.18)/0.5,0.0,1.0)) : mix(hor, mid, clamp(h/0.18,0.0,1.0));
        if (h < 0.0) c = mix(hor, vec3(0.94,0.54,0.48), clamp(-h*4.0,0.0,1.0));
        float s = max(dot(vDir, sunDir), 0.0);
        c += vec3(1.0,0.85,0.55) * pow(s, 400.0) * 2.0 + vec3(1.0,0.55,0.3) * pow(s, 8.0) * 0.45;
        gl_FragColor = vec4(c, 1.0); }`,
  }));
  scene.add(sky);
  scene.add(new THREE.HemisphereLight('#c49ae6', '#5a3448', 1.6));
  const sun = new THREE.DirectionalLight('#ffb37a', 2.6);
  sun.castShadow = shadows;
  if (shadows) {
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera; sc.left = -80; sc.right = 80; sc.top = 80; sc.bottom = -80; sc.near = 1; sc.far = 400;
    sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.6;
  }
  scene.add(sun, sun.target);

  const colliders = new Colliders();
  const game = { scene, camera, renderer, colliders, shadows, vehicles: [], mobile };
  game.city = buildCity(scene, colliders, { shadows });
  game.parkour = new Parkour(scene);
  game.sfx = new Sfx();
  game.input = new Input(canvas);
  const hq = game.city.landmarks.hq.door;
  game.player = new Player(game, hq.x + 6, hq.z + 3);
  for (const p of game.city.parked) game.vehicles.push(new Vehicle(game, p));
  // Voitures garées dans les rues
  game.vehicles.push(new Vehicle(game, { x: hq.x + 9, z: hq.z + 6.3, heading: Math.PI / 2, color: '#ff3d8b' }));
  for (let n = 0; n < 9; n++) {
    const road = (Math.floor(Math.random() * 11) - 5) * 40, along = (Math.floor(Math.random() * 10) - 5) * 40 + 20;
    if (Math.random() < 0.5) game.vehicles.push(new Vehicle(game, { x: road + 4.3, z: along, heading: Math.PI }));
    else game.vehicles.push(new Vehicle(game, { x: along, z: road + 4.3, heading: -Math.PI / 2 }));
  }
  game.traffic = new Traffic(game, 15);
  game.peds = new Pedestrians(game, mobile ? 20 : 30);
  game.hud = new Hud();
  game.dialog = new Dialog(game);
  game.quiz = new Quiz(game);
  game.notebook = new Notebook(game);
  game.screens = new Screens(game);
  game.minimap = new Minimap(document.getElementById('minimap'), game.city);
  game.mobileControls = new MobileControls(game.input);
  game.settings = new Settings(game);
  game.cinematic = new Cinematic(game);
  game.hazards = new Hazards(game);
  game.talk = new TalkScene(game);
  game.trailer = new Trailer(game, -80, 134, 0);
  game.missions = new MissionEngine(game);
  game.save = loadSave() || { completed: 0, introSeen: false };
  game.saveProgress = () => { game.save.completed = game.missions.completed; writeSave(game.save); };
  game.resetProgress = () => { try { localStorage.removeItem(SAVE_KEY); } catch { /* */ } location.reload(); };

  game.input.onKey((code) => { if (game.quiz.isOpen) game.quiz.key(code); });

  // --- Écran titre ---
  let mode = 'title';
  const titleEl = document.getElementById('title');
  const playBtn = document.getElementById('btn-play');
  const newBtn = document.getElementById('btn-new');
  if (game.save.completed > 0) { playBtn.textContent = `Continuer (${game.save.completed}/10)`; newBtn.classList.remove('hidden'); }
  const start = (fresh) => {
    game.sfx.unlock();
    if (fresh) game.save = { completed: 0, introSeen: false };
    titleEl.classList.add('hidden');
    document.getElementById('ui').classList.remove('hidden');
    mode = 'play';
    game.missions.init(game.save.completed);
    if (!game.save.introSeen) {
      game.dialog.show(INTRO, () => { game.save.introSeen = true; writeSave(game.save); });
    }
  };
  playBtn.addEventListener('click', () => start(false));
  newBtn.addEventListener('click', () => start(true));
  document.getElementById('loading').classList.add('hidden');
  titleEl.classList.remove('hidden');
  document.getElementById('btn-settings').addEventListener('click', () => game.sfx.unlock());
  document.getElementById('btn-book').addEventListener('click', () => game.notebook.toggle());
  window.addEventListener('pointerdown', () => game.sfx.unlock(), { once: true });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // --- Caméra ---
  game.player.heading = 0; game.player.sync();
  const cam = { yaw: 0, pitch: 0.28, dist: 7, pos: new THREE.Vector3(), look: new THREE.Vector3() };
  const tmp = new THREE.Vector3();
  function updateCamera(dt) {
    const inp = game.input, p = game.player, v = p.vehicle;
    const sens = game.settings.v.sens / 100;
    cam.yaw -= inp.dragX * 0.006 * sens;
    cam.pitch = clamp(cam.pitch + inp.dragY * 0.004 * sens, 0.05, 1.1);
    const now = performance.now() / 1000;
    if (game.settings.v.autocam && now - inp.lastDrag > 1.5) {
      if (v && Math.abs(v.speed) > 2) cam.yaw += angleDiff(v.heading, cam.yaw) * Math.min(1, dt * 2.5);
      else if (!v && p.moveSpeed > 0.5) cam.yaw += angleDiff(p.heading, cam.yaw) * Math.min(1, dt * 1.2);
    }
    const zoom = { near: 0.72, far: 1, vfar: 1.5 }[game.settings.v.camdist] || 1;
    const wantDist = (v ? 11 + Math.abs(v.speed) * 0.08 : 6.5) * zoom;
    cam.dist = damp(cam.dist, wantDist, 3, dt);
    const tx = p.x, tz = p.z, ty = v ? 1.6 : 1.5 + p.y;
    let d = cam.dist;
    const cx = (k) => tx - Math.sin(cam.yaw) * Math.cos(cam.pitch) * k;
    const cz = (k) => tz - Math.cos(cam.yaw) * Math.cos(cam.pitch) * k;
    const cy = (k) => ty + 0.8 + Math.sin(cam.pitch) * k;
    for (let k = 1.5; k <= cam.dist; k += 0.75) if (colliders.pointInside(cx(k), cy(k), cz(k))) { d = Math.max(1.2, k - 0.8); break; }
    tmp.set(cx(d), Math.max(0.6, cy(d)), cz(d));
    cam.pos.lerp(tmp, 1 - Math.exp(-12 * dt));
    camera.position.copy(cam.pos);
    cam.look.set(tx, ty + 0.4, tz);
    camera.lookAt(cam.look);
  }

  // --- Interactions ---
  function nearestVehicle() {
    let best = null, bd = 4.2;
    for (const v of game.vehicles) {
      const d = Math.hypot(v.pos.x - game.player.pos.x, v.pos.z - game.player.pos.z);
      if (d < bd) { bd = d; best = v; }
    }
    return best;
  }
  function trimVehicles() {
    const free = game.vehicles.filter((v) => !v.ai && !v.driven && v !== game.missions.rental);
    if (free.length <= 16) return;
    let far = null, fd = 120;
    for (const v of free) { const d = Math.hypot(v.pos.x - game.player.x, v.pos.z - game.player.z); if (d > fd) { fd = d; far = v; } }
    if (far) { far.dispose(); game.vehicles.splice(game.vehicles.indexOf(far), 1); }
  }

  const modalOpen = () => game.dialog.isOpen || game.quiz.isOpen || game.notebook.isOpen || game.screens.cardOpen || game.settings.isOpen;

  // --- Boucle de jeu ---
  const clock = new THREE.Clock();
  let titleT = 0, frame = 0;
  function loop() {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, clock.getDelta());
    frame++;
    const inp = game.input;
    if (game.cinematic.active) {
      game.sfx.engine(false, 0, 0);
      game.cinematic.update(dt);
      game.traffic.update(dt);
      for (const v of game.vehicles) { if (v.ai) { v.physics(dt); v.sync(); } }
      game.city.update(dt, mobile);
      renderer.render(scene, camera);
      inp.endFrame();
      return;
    }
    if (mode === 'title') {
      titleT += dt * 0.08;
      camera.position.set(hq.x + Math.cos(titleT) * 140, 70, hq.z + Math.sin(titleT) * 140);
      camera.lookAt(hq.x, 30, hq.z - 15);
      game.traffic.update(dt);
      for (const v of game.vehicles) { if (v.ai) { v.physics(dt); v.sync(); } }
      game.peds.update(dt);
      game.city.update(dt, mobile);
      renderer.render(scene, camera);
      inp.endFrame();
      return;
    }
    // touches globales
    if (inp.action('mute')) game.settings.toggleSound();
    if (DEBUG && inp.action('debug')) game.missions.skip();
    if (inp.action('notebook') && !game.dialog.isOpen && !game.quiz.isOpen && !game.screens.cardOpen) game.notebook.toggle();
    if (game.dialog.isOpen) { game.dialog.update(dt); if (inp.action('advance')) game.dialog.advance(); }
    else if (game.screens.cardOpen && inp.action('advance')) { game.screens.closeDefinition(); }

    const p = game.player;
    const paused = modalOpen();
    if (!paused) {
      if (inp.action('interact') && !game.missions.interact()) {
        if (p.vehicle) p.exit();
        else {
          const v = nearestVehicle();
          if (v) {
            if (v.ai) { game.traffic.release(v); game.hud.toast('Voiture volée !', 2); }
            v.vel.x = v.fx * v.speed; v.vel.z = v.fz * v.speed;
            p.enter(v); trimVehicles();
          }
        }
      }
      if (inp.action('horn')) game.sfx.horn();
      if (p.vehicle) {
        const a = inp.carAxis();
        p.vehicle.drive(dt, a.x, a.y, inp.holding('handbrake'));
      } else {
        game.parkour.update(dt, p, (falls) => { game.sfx.fail(); game.hud.toast(falls > 2 ? `Dans la lave ! Retour au départ (essai ${falls + 1}) — astuce : sprinte pour les grands sauts` : 'Dans la lave ! Retour au départ', 3); });
        p.updateOnFoot(dt, inp, cam.yaw);
      }
      game.traffic.update(dt);
      for (const v of game.vehicles) v.physics(dt);
      carCarCollisions(game.vehicles);
      for (const v of game.vehicles) v.sync();
      game.trailer.update();
      game.peds.update(dt);
      game.hazards.update(dt);
      game.missions.update(dt);
    }
    game.cinematic.updateParticles(dt);
    game.city.update(dt, mobile);

    // HUD
    const v = p.vehicle;
    const thr = v && !paused ? Math.max(0, Math.abs(inp.carAxis().y)) : 0;
    game.sfx.engine(!!v && !paused, v ? Math.min(1, Math.abs(v.speed) / 38) : 0, thr);
    game.hud.setSpeed(v ? Math.round(Math.abs(v.speed) * 3.6) : null);
    let hint = '', label = 'ACTION';
    game.mobileControls.setMode(!!v);
    if (game.missions.active && game.missions.step?.type === 'yield') { hint = 'E : acheter le billet'; label = 'ACHETER'; }
    else if (v) { hint = game.mobile ? '' : 'E : descendre du véhicule  ·  Espace : frein à main  ·  H : klaxon'; label = 'DESCENDRE'; }
    else {
      const nv = nearestVehicle();
      if (nv) { hint = nv.ai ? 'Appuie sur E pour voler la voiture' : 'Appuie sur E pour monter dans la voiture'; label = nv.ai ? 'VOLER' : 'MONTER'; }
    }
    if (game.mobileControls.enabled) hint = '';
    game.hud.setHint(hint);
    game.mobileControls.setActionLabel(label, label !== 'ACTION');
    const tgt = game.missions.target();
    if (tgt) {
      const dx = tgt.x - p.x, dz = tgt.z - p.z;
      const bearing = Math.atan2(dx, dz);
      game.hud.setArrow(-angleDiff(bearing, cam.yaw), Math.hypot(dx, dz));
    } else game.hud.setArrow(null);
    if (frame % 2 === 0 && game.settings.v.minimap) game.minimap.draw(p.x, p.z, cam.yaw, v ? v.heading : p.heading, game.missions.allPoints(), tgt, v ? 1.7 : 1.1);

    if (game.talk.active && game.dialog.isOpen) { game.talk.update(dt); cam.pos.copy(camera.position); }
    else { if (game.talk.active) game.talk.end(); updateCamera(dt); }
    if (shadows) {
      sun.target.position.set(p.x, 0, p.z);
      sun.position.set(p.x + sunDir.x * 200, sunDir.y * 200 + 40, p.z + sunDir.z * 200);
    }
    renderer.render(scene, camera);
    inp.endFrame();
  }
  if (shadows) { sun.position.set(hq.x + sunDir.x * 200, 80, hq.z + sunDir.z * 200); sun.target.position.set(hq.x, 0, hq.z); }
  window.__game = game;
  loop();
}

init().catch((e) => {
  console.error(e);
  const l = document.getElementById('loading');
  l.textContent = 'Erreur de chargement : ' + e.message;
});

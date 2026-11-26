// Dimensions de la ville (en mètres / unités Three.js)
export const SPACING = 40;      // une rue tous les 40 m
export const HALF = 200;        // les rues vont de -200 à +200
export const ROAD_W = 10;       // largeur de chaussée
export const BLOCK_HALF = 15;   // demi-taille d'un pâté (trottoir compris)
export const LOT_HALF = 12.5;   // demi-taille de la parcelle constructible
export const N_BLOCKS = 10;
export const SEA_X = 240;       // début de la mer (côté est)
export const BOUNDS = { minX: -212, maxX: 236, minZ: -212, maxZ: 212 };
export const SIDEWALK_Y = 0.12;

export const blockCenter = (i) => -HALF + SPACING * i + SPACING / 2; // -180 .. 180

export const SIDE_VEC = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };

export function groundY(x, z) {
  if (x > HALF + 5 || x < -HALF - 5 || z > HALF + 5 || z < -HALF - 5) return 0;
  const lx = (((x + HALF) % SPACING) + SPACING) % SPACING;
  const lz = (((z + HALF) % SPACING) + SPACING) % SPACING;
  if (lx > 5 && lx < 35 && lz > 5 && lz < 35) return SIDEWALK_Y;
  return 0;
}

// Générateur pseudo-aléatoire reproductible
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const angleDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const damp = (a, b, rate, dt) => lerp(a, b, 1 - Math.exp(-rate * dt));

import { defineConfig } from 'vite';

// En production, le jeu est servi sous https://<pseudo>.github.io/cejm-neon-city/
// On peut surcharger avec la variable d'environnement BASE (ex. BASE=/ pour Netlify/Vercel).
export default defineConfig(({ command }) => ({
  base: command === 'build' ? (process.env.BASE || '/cejm-neon-city/') : '/',
  build: {
    chunkSizeWarningLimit: 1200,
  },
  server: { host: true },
}));

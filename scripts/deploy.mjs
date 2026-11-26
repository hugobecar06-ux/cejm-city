// Compile le jeu et publie dist/ sur la branche gh-pages (GitHub Pages).
import { execSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';

const run = (cmd, opts = {}) => execSync(cmd, { stdio: 'inherit', ...opts });
const remote = execSync('git remote get-url origin').toString().trim();
const m = remote.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
if (!m) throw new Error('Remote GitHub introuvable');
const [, owner, repo] = m;

run('npx vite build', { env: { ...process.env, BASE: `/${repo}/`, VITE_SITE_URL: `https://${owner}.github.io/${repo}/` } });
writeFileSync('dist/.nojekyll', '');
rmSync('dist/.git', { recursive: true, force: true });
const d = { cwd: 'dist' };
run('git init -q -b gh-pages', d);
run('git add -A', d);
run('git -c user.name=deploy -c user.email=deploy@users.noreply.github.com commit -qm Publication', d);
run(`git push -f ${remote} gh-pages`, d);
rmSync('dist/.git', { recursive: true, force: true });
console.log(`\nEn ligne dans 1 à 2 minutes : https://${owner}.github.io/${repo}/`);

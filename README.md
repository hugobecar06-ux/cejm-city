# DIGITAL CITY — le jeu de l'économie numérique

Jeu 3D en monde ouvert (Three.js) jouable dans le navigateur, sur PC et mobile, pour les étudiants de BTS NDRC.
Le joueur termine 10 missions, et chacune débloque la définition d'une notion de l'économie numérique.

## Lancer le jeu en local

```bash
npm install
npm run dev
```

Puis ouvrir l'adresse affichée (par défaut http://localhost:5173).
Mode debug : ajouter `?debug` à l'URL, puis appuyer sur **P** pour passer l'étape en cours.

## Modifier les missions et les définitions

Tout est dans **`src/missions/missions.js`** :

- `DEFINITIONS` : les 10 définitions (terme, texte, exemples) affichées dans les cartes et le carnet ;
- `INTRO` : l'introduction de Léa au premier lancement ;
- `MISSIONS` : les 10 missions, chacune avec un lieu de départ (`start`) et une liste d'étapes :
  - `dialog` : répliques `[personnage, texte]` ;
  - `goto` : aller à un lieu (`target: 'datacenter'` ou `[x, z]`), options `car: true`, `car: 'rental'`, `npc: { name }`, `time` (secondes) ;
  - `collect` : ramasser des objets (`items: [{ pos, label, msg }]`), options `time`, `npc`, `network`, `counter` ;
  - `quiz` : `question`, `answers` (3), `correct` (index), `help`, `explain` ;
  - `yield` : la billetterie à prix dynamique de la mission 10.

Les lieux (noms, positions) sont définis dans `src/world/landmarks.js`.

## Commandes

| Action | Touches |
|---|---|
| Avancer / reculer | Z/S (W/S en QWERTY) ou flèches |
| Tourner | Q/D (A/D en QWERTY) ou flèches |
| Sprint | Shift |
| Frein à main | Espace |
| Monter / descendre, action | E |
| Carnet de définitions | J |
| Klaxon / son | H / M |
| Caméra | glisser la souris |

Sur mobile : joystick à gauche, boutons ACTION / FREIN / CARNET à droite, glisser l'écran pour tourner la caméra.

## Redéployer

Le dépôt contient un workflow GitHub Actions (`.github/workflows/deploy.yml`) : **chaque `git push` sur `main` reconstruit et publie automatiquement le jeu sur GitHub Pages**.

```bash
git add .
git commit -m "Modification des missions"
git push
```

Le jeu est en ligne quelques minutes plus tard à l'adresse `https://<pseudo>.github.io/digital-city/`.

## Technique

Vite + Three.js, aucun backend, aucun fichier 3D externe (modèles low-poly générés en code), sons générés avec WebAudio, progression sauvegardée dans `localStorage`.

# Epic Castle Game (Three.js + TypeScript)

Cinematic, explorable storybook castle atop a mountain peak with moving patrols, fog and clouds, an interactive balloon‑popping minigame, character dialogue, and a score HUD. Built with Vite, Three.js, and TypeScript.

## Features
- **Cinematic intro**: camera pan on load (click or press any key to skip)
- **Stylized environment**: mountain plateau, castle walls with crenellations, towers, courtyard buildings
- **Patrols**: guards circle the walls and occasionally fire cannon shots
- **Atmosphere**: light fog and drifting cloud layers
- **Balloon minigame**:
  - Click balloons to pop, or shoot them with visible projectiles
  - Scoreboard updates and sound effects on hits
  - Balloons float and drift; new ones spawn over time
- **Dialogue system**:
  - Click a character in the courtyard to open dialogue
  - Nameplate, responses, and a simple input box for replies
- **Exploration**: zoom, pan, and orbit the scene (OrbitControls)

## Quick Start
Prereqs: Node.js 18+ recommended.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Controls
- **Camera**: left‑drag to rotate, right‑drag to pan, scroll to zoom
- **Click**:
  - On a character to open dialogue
  - On open space to fire a projectile forward
  - On a balloon to pop it directly
- **Intro**: any key or click to skip the cinematic pan

## Build
```bash
npm run build
npm run preview
```

## Project Structure
- `src/main.ts`: app bootstrap, scene setup, cinematic intro, update loop
- `src/scene/Castle.ts`: castle, towers, walls, patrols (with periodic cannon fire)
- `src/scene/Balloons.ts`: balloon spawning, motion, popping, scoring
- `src/scene/Characters.ts`: character meshes, selection, dialogue triggers
- `src/scene/Projectiles.ts`: projectile spawning, motion, collision with balloons
- `src/scene/Sound.ts`: lightweight WebAudio blips for shooting and hits
- `src/ui/Overlay.ts`: UI overlays (scoreboard, hint, dialogue, toasts)

## Troubleshooting
- Audio may require a user gesture: first click enables the WebAudio context.
- If performance is low, reduce device pixel ratio or decrease cloud/balloon counts in code.

## Notes
- Uses imports from `three/examples/jsm/...` which Vite handles without extra config.
- All code is TypeScript; adjust `tsconfig.json` if you need different target settings.

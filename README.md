# Ocean Defender

Ocean Defender is a two-stage underwater shooter built with React, TypeScript, and HTML5 Canvas.

## Overview
- Landing page with game intro and a `Play Game` button
- Full-viewport gameplay mode (`100svh`) with no page scrollbar
- Automatic progression from Stage 1 to Stage 2 when Stage 1 is cleared
- Real-time enemy waves, projectile combat, particle effects, and parallax backgrounds

## Controls
- `Arrow Up`: Move up
- `Arrow Down`: Move down
- `Space`: Shoot
- `D`: Toggle debug hitboxes and enemy lives

## Gameplay Flow
- Open app -> Landing page
- Click `Play Game` -> Stage 1 starts
- Stage 1 win -> Auto-redirect to Stage 2
- Stage 1 lose -> Auto-restart Stage 1
- Stage 2 can be restarted manually from in-game HUD

## Tech Stack
- React 18
- TypeScript (strict mode)
- Vite 5
- Canvas 2D API

## Run Locally
1. Install dependencies:
   - `npm install`
2. Start development server:
   - `npm run dev`
3. Create production build:
   - `npm run build`
4. Preview production build:
   - `npm run preview`
5. Type-check only:
   - `npm run typecheck`

## Project Structure
- `src/App.tsx` -> App flow (landing, play mode, stage transitions)
- `src/components/GameCanvas.tsx` -> Canvas lifecycle + engine bootstrapping
- `src/game/OceanGameEngine.ts` -> Main game engine (entities, collisions, update/draw loop)
- `src/game/stages.ts` -> Stage presets and balancing
- `src/game/assetLoader.ts` -> Asset loading
- `src/game/types.ts` -> Shared TypeScript types
- `src/styles/app.css` -> Landing and gameplay UI styles
- `public/game-assets/stage1` -> Stage 1 sprites/backgrounds
- `public/game-assets/stage2` -> Stage 2 sprites/backgrounds

## Notes
- The project is fully TS/TSX-driven (legacy plain HTML/JS game runtime removed).
- If assets fail to load, verify files exist under `public/game-assets/stage1` and `public/game-assets/stage2`.
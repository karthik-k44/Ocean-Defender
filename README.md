# Ocean Defender (React + TypeScript)

A professionalized rebuild of the original canvas game.

## Tech
- React 18
- Vite 5
- TypeScript (strict mode)

## Scripts
- `npm run dev` - start development server
- `npm run typecheck` - run TypeScript checks
- `npm run build` - type-check and create production build
- `npm run preview` - preview production build locally

## Project Structure
- `src/App.tsx` - main app shell and stage controls
- `src/components/GameCanvas.tsx` - canvas lifecycle and engine bootstrapping
- `src/game/OceanGameEngine.ts` - typed game engine (entities, collisions, rendering, UI)
- `src/game/stages.ts` - stage presets and balancing values
- `src/game/assetLoader.ts` - image preloader
- `src/game/types.ts` - shared types
- `src/styles/app.css` - UI styling
- `public/game-assets/stage1` - stage 1 sprites/backgrounds
- `public/game-assets/stage2` - stage 2 sprites/backgrounds

## Notes
- Stage 1 auto-transitions to Stage 2 on success (after 3 seconds).
- Stage 1 auto-restarts on failure (after 2.5 seconds).
- Stage 2 is manually restartable from the app controls.
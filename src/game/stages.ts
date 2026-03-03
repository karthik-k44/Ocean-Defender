import { StageConfig, StageId } from "./types";

const SHARED_FILES = {
  player: "player.png",
  angler1: "angler1.png",
  angler2: "angler2.png",
  lucky: "lucky.png",
  hivewhale: "hivewhale.png",
  drone: "drone.png",
  projectile: "projectile.png",
  gears: "gears.png",
  smokeExplosion: "smokeExplosion.png",
  fireExplosion: "fireExplosion.png",
  layer3: "layer3.png",
  layer4: "layer4.png",
} as const;

export const STAGES: readonly StageConfig[] = [
  {
    id: "stage1",
    label: "Stage 1",
    summary: "Original run with moderate pacing and a 30 second timer.",
    canvasWidth: 1200,
    canvasHeight: 500,
    assets: {
      basePath: "/game-assets/stage1",
      files: {
        ...SHARED_FILES,
        layer1: "layer1.png",
        layer2: "layer2.png",
      },
    },
    ui: {
      textColor: "#ffffff",
      ammoBoostColor: "#fff7bd",
      fontFamily: "Bangers",
      hudFontSize: 25,
      winTitle: "Most Wondrous!",
      winSubtitle: "Well done explorer!",
      loseTitle: "Blazes!",
      loseSubtitle: "Get my repair kit and try again!",
    },
    tuning: {
      enemyIntervalMs: 2000,
      winningScore: 80,
      timeLimitMs: 30000,
      collisionPenalty: 1,
      hiveThreshold: 0.7,
      particleBounceLimit: 2,
      particleBounceDamping: -0.7,
    },
  },
  {
    id: "stage2",
    label: "Stage 2",
    summary: "Faster enemy spawns, longer timer, and tougher score target.",
    canvasWidth: 1200,
    canvasHeight: 500,
    assets: {
      basePath: "/game-assets/stage2",
      files: {
        ...SHARED_FILES,
        layer1: "layer1.jpg",
        layer2: "layer2.png",
      },
    },
    ui: {
      textColor: "#d68756",
      ammoBoostColor: "#f0d911",
      fontFamily: "Bangers",
      hudFontSize: 23,
      winTitle: "Most Wondrous!",
      winSubtitle: "Well done explorer!",
      loseTitle: "Blazes!",
      loseSubtitle: "Get my repair kit and try again!",
    },
    tuning: {
      enemyIntervalMs: 1500,
      winningScore: 100,
      timeLimitMs: 50000,
      collisionPenalty: 2,
      hiveThreshold: 0.8,
      particleBounceLimit: 5,
      particleBounceDamping: -0.5,
    },
  },
] as const;

export const STAGE_BY_ID: Record<StageId, StageConfig> = {
  stage1: STAGES[0],
  stage2: STAGES[1],
};
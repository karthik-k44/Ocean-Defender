export type StageId = "stage1" | "stage2";
export type StageResult = "win" | "lose";

export type AssetKey =
  | "player"
  | "angler1"
  | "angler2"
  | "lucky"
  | "hivewhale"
  | "drone"
  | "projectile"
  | "gears"
  | "smokeExplosion"
  | "fireExplosion"
  | "layer1"
  | "layer2"
  | "layer3"
  | "layer4";

export interface StageAssets {
  basePath: string;
  files: Record<AssetKey, string>;
}

export interface StageUiConfig {
  textColor: string;
  ammoBoostColor: string;
  fontFamily: string;
  hudFontSize: number;
  winTitle: string;
  winSubtitle: string;
  loseTitle: string;
  loseSubtitle: string;
}

export interface StageTuning {
  enemyIntervalMs: number;
  winningScore: number;
  timeLimitMs: number;
  collisionPenalty: number;
  hiveThreshold: number;
  particleBounceLimit: number;
  particleBounceDamping: number;
}

export interface StageConfig {
  id: StageId;
  label: string;
  summary: string;
  canvasWidth: number;
  canvasHeight: number;
  assets: StageAssets;
  ui: StageUiConfig;
  tuning: StageTuning;
}

export interface CollisionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
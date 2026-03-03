import { useEffect, useRef, useState } from "react";
import { loadStageAssets } from "../game/assetLoader";
import { OceanGameEngine } from "../game/OceanGameEngine";
import { StageConfig, StageResult } from "../game/types";

interface GameCanvasProps {
  stage: StageConfig;
  runKey: number;
  onResult: (result: StageResult) => void;
  fullscreen?: boolean;
}

export const GameCanvas = ({
  stage,
  runKey,
  onResult,
  fullscreen = false,
}: GameCanvasProps): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [errorText, setErrorText] = useState<string>("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      setLoadState("error");
      setErrorText("Canvas 2D context is unavailable.");
      return undefined;
    }

    let disposed = false;
    let engine: OceanGameEngine | null = null;

    setLoadState("loading");
    setErrorText("");

    loadStageAssets(stage.assets)
      .then((assets) => {
        if (disposed) {
          return;
        }
        engine = new OceanGameEngine(context, stage, assets, { onResult });
        engine.start();
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        if (disposed) {
          return;
        }
        setLoadState("error");
        setErrorText(error instanceof Error ? error.message : "Unable to start the game.");
      });

    return () => {
      disposed = true;
      engine?.destroy();
    };
  }, [onResult, runKey, stage]);

  return (
    <section
      className={`game-shell ${fullscreen ? "game-shell-fullscreen" : ""}`.trim()}
      aria-label={`${stage.label} canvas area`}
    >
      {loadState !== "ready" && (
        <div className="game-overlay" role="status" aria-live="polite">
          {loadState === "loading" ? "Loading assets..." : `Error: ${errorText}`}
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="game-canvas"
        width={stage.canvasWidth}
        height={stage.canvasHeight}
      />
    </section>
  );
};
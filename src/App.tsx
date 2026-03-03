import { useCallback, useEffect, useMemo, useState } from "react";
import { GameCanvas } from "./components/GameCanvas";
import { STAGE_BY_ID } from "./game/stages";
import { StageId, StageResult } from "./game/types";

const INITIAL_STAGE: StageId = "stage1";

type ScreenMode = "landing" | "playing";

export const App = (): JSX.Element => {
  const [screenMode, setScreenMode] = useState<ScreenMode>("landing");
  const [stageId, setStageId] = useState<StageId>(INITIAL_STAGE);
  const [runKey, setRunKey] = useState(0);
  const [result, setResult] = useState<StageResult | null>(null);

  const stage = useMemo(() => STAGE_BY_ID[stageId], [stageId]);

  const startGame = useCallback((): void => {
    setScreenMode("playing");
    setStageId(INITIAL_STAGE);
    setResult(null);
    setRunKey((value) => value + 1);
  }, []);

  const restartStage = useCallback((): void => {
    setResult(null);
    setRunKey((value) => value + 1);
  }, []);

  const backToLanding = useCallback((): void => {
    setScreenMode("landing");
    setStageId(INITIAL_STAGE);
    setResult(null);
  }, []);

  const handleResult = useCallback((next: StageResult): void => {
    setResult((current) => current ?? next);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (screenMode === "playing") {
      html.classList.add("game-mode");
      body.classList.add("game-mode");
    } else {
      html.classList.remove("game-mode");
      body.classList.remove("game-mode");
    }

    return () => {
      html.classList.remove("game-mode");
      body.classList.remove("game-mode");
    };
  }, [screenMode]);

  useEffect(() => {
    if (screenMode !== "playing" || result === null || stageId !== "stage1") {
      return undefined;
    }

    const timeoutMs = result === "win" ? 1800 : 1500;
    const timer = window.setTimeout(() => {
      if (result === "win") {
        setStageId("stage2");
      }
      setResult(null);
      setRunKey((value) => value + 1);
    }, timeoutMs);

    return () => window.clearTimeout(timer);
  }, [result, screenMode, stageId]);

  const statusText = useMemo(() => {
    if (result === "win") {
      if (stageId === "stage1") {
        return "Stage 1 cleared. Redirecting to Stage 2...";
      }
      return "Stage 2 cleared. Mission complete.";
    }

    if (result === "lose") {
      if (stageId === "stage1") {
        return "Stage 1 failed. Restarting...";
      }
      return "Stage 2 failed. Restart this stage to continue.";
    }

    return stage.summary;
  }, [result, stage, stageId]);

  if (screenMode === "landing") {
    return (
      <main className="landing" aria-label="Ocean Defender landing page">
        <section className="landing-panel">
          <p className="landing-tag">Arcade Campaign</p>
          <h1>Ocean Defender</h1>
          <p className="landing-text">
            Pilot the deep-sea fighter, survive enemy waves, and complete both rounds. Stage 1 is your entry mission.
            Clear it to unlock Stage 2 automatically.
          </p>

          <div className="landing-points" role="list" aria-label="Game highlights">
            <p role="listitem">Dynamic enemy types with collisions and projectile combat</p>
            <p role="listitem">Two-stage progression with automatic round transition</p>
            <p role="listitem">Built on React + TypeScript with organized assets</p>
          </div>

          <button type="button" className="play-button" onClick={startGame}>
            Play Game
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="game-view" aria-label="Ocean Defender gameplay screen">
      <header className="game-hud">
        <div>
          <p className="hud-tag">Now Playing</p>
          <h2>{stage.label}</h2>
          <p className={`hud-status ${result ? `hud-status-${result}` : ""}`}>{statusText}</p>
        </div>

        <div className="hud-actions">
          <button type="button" onClick={restartStage}>
            Restart
          </button>
          <button type="button" onClick={backToLanding}>
            Home
          </button>
        </div>
      </header>

      <GameCanvas stage={stage} runKey={runKey} onResult={handleResult} fullscreen />
    </main>
  );
};
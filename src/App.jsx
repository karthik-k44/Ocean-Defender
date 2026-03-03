import { useMemo, useState } from "react";

const games = [
  { id: "game-1", label: "Game 1", path: "/legacy/index.html" },
  { id: "game-2", label: "Game 2", path: "/legacy/index1.html" },
];

export default function App() {
  const [activeGame, setActiveGame] = useState(games[0].id);
  const activePath = useMemo(
    () => games.find((game) => game.id === activeGame)?.path ?? games[0].path,
    [activeGame]
  );

  return (
    <main className="app">
      <header className="header">
        <h1>JS Game in React</h1>
        <p>Choose a game version below. Your original game code runs unchanged.</p>
      </header>

      <section className="switcher" aria-label="Game version">
        {games.map((game) => (
          <button
            key={game.id}
            type="button"
            className={game.id === activeGame ? "active" : ""}
            onClick={() => setActiveGame(game.id)}
          >
            {game.label}
          </button>
        ))}
      </section>

      <section className="frameWrap">
        <iframe
          key={activePath}
          title="JavaScript game"
          src={activePath}
          className="gameFrame"
        />
      </section>
    </main>
  );
}

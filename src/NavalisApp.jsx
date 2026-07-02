import { useState } from "react";
import { AmbientBackdrop } from "./components/shared/AmbientBackdrop";
import { AuthView } from "./components/auth/AuthView";
import { LobbyView } from "./components/lobby/LobbyView";
import { WaitingRoomView } from "./components/waiting/WaitingRoomView";
import { PlacingShipsView } from "./components/placing/PlacingShipsView";
import { ArenaView } from "./components/arena/ArenaView";
import { GameOverModal } from "./components/game-over/GameOverModal";

export function NavalisApp() {
  const [view, setView] = useState("auth");
  const [username, setUsername] = useState("Comandante");
  const [placedShips, setPlacedShips] = useState([]);
  const [gameOver, setGameOver] = useState(null);
  const [roomCode, setRoomCode] = useState("");

  return (
    <div className="min-h-screen w-full bg-bg text-text font-sans relative overflow-hidden">
      <AmbientBackdrop />
      <div className="relative z-10">
        {view === "auth" && (
          <AuthView
            onAuthed={(name) => {
              setUsername(name || "Comandante");
              setView("lobby");
            }}
          />
        )}
        {view === "lobby" && (
          <LobbyView
            username={username}
            onEnterMatch={() => {
              const code = `NV-${Math.floor(1000 + Math.random() * 9000)}`;
              setRoomCode(code);
              setPlacedShips([]);
              setView("waiting");
            }}
            onLogout={() => setView("auth")}
          />
        )}
        {view === "waiting" && (
          <WaitingRoomView
            roomCode={roomCode}
            username={username}
            onStart={() => setView("placing")}
            onCancel={() => setView("lobby")}
          />
        )}
        {view === "placing" && (
          <PlacingShipsView
            onConfirm={(ships) => {
              setPlacedShips(ships);
              setView("arena");
            }}
            onCancel={() => setView("lobby")}
          />
        )}
        {view === "arena" && (
          <ArenaView
            username={username}
            placed={placedShips}
            onGameOver={(r) => setGameOver(r)}
            onLeave={() => {
              setGameOver(null);
              setView("lobby");
            }}
          />
        )}
      </div>

      {gameOver && (
        <GameOverModal
          result={gameOver}
          onReturn={() => {
            setGameOver(null);
            setView("lobby");
          }}
        />
      )}
    </div>
  );
}

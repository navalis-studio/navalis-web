import { AmbientBackdrop } from "./components/shared/AmbientBackdrop";
import { AuthView } from "./components/auth/AuthView";
import { LobbyView } from "./components/lobby/LobbyView";
import { WaitingRoomView } from "./components/waiting/WaitingRoomView";
import { PlacingShipsView } from "./components/placing/PlacingShipsView";
import { ArenaView } from "./components/arena/ArenaView";
import { GameOverModal } from "./components/game-over/GameOverModal";
import { useAuth } from "./contexts/AuthContext";
import { useGame } from "./contexts/GameContext";

export function NavalisApp() {
  const { user, loading } = useAuth();
  const { gameState, gameOver, leaveGame } = useGame();

  if (loading) return null;

  // Determine current view based on auth and game state
  function getCurrentView() {
    if (!user) return "auth";
    if (!gameState) return "lobby";
    switch (gameState) {
      case "WAITING_FOR_OPPONENT":
        return "waiting";
      case "PLACING_SHIPS":
        return "placing";
      case "IN_PROGRESS":
        return "arena";
      case "FINISHED":
        return "arena";
      default:
        return "lobby";
    }
  }

  const view = getCurrentView();

  return (
    <div className="min-h-screen w-full bg-bg text-text font-sans relative overflow-hidden">
      <AmbientBackdrop />
      <div className="relative z-10">
        {view === "auth" && <AuthView />}
        {view === "lobby" && <LobbyView />}
        {view === "waiting" && <WaitingRoomView />}
        {view === "placing" && <PlacingShipsView />}
        {view === "arena" && <ArenaView />}
      </div>

      {gameOver && (
        <GameOverModal
          result={gameOver.result}
          reason={gameOver.reason}
          onReturn={() => leaveGame()}
        />
      )}
    </div>
  );
}

import { useEffect } from "react";
import { FilmOverlay } from "./components/shared/FilmOverlay";
import { AuthView } from "./components/auth/AuthView";
import { LobbyView } from "./components/lobby/LobbyView";
import { WaitingRoomView } from "./components/waiting/WaitingRoomView";
import { PlacingShipsView } from "./components/placing/PlacingShipsView";
import { ArenaView } from "./components/arena/ArenaView";
import { GameOverModal } from "./components/game-over/GameOverModal";
import { CancelledModal } from "./components/game-over/CancelledModal";
import { useAuth } from "./contexts/AuthContext";
import { useGame } from "./contexts/GameContext";

export function NavalisApp() {
  const { user, loading } = useAuth();
  const { gameState, gameOver, leaveGame, cancelledNotice, dismissCancelledNotice } = useGame();

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  if (loading) return null;

  return (
    <div className="min-h-screen w-full bg-surface text-on-surface font-sans relative overflow-x-hidden overflow-y-auto">
      {/* Content */}
      <div className="relative z-10">
        {view === "auth" && <AuthView />}
        {view === "lobby" && <LobbyView />}
        {view === "waiting" && <WaitingRoomView />}
        {view === "placing" && <PlacingShipsView />}
        {view === "arena" && <ArenaView />}
      </div>

      {/* Film effects on top of everything */}
      <FilmOverlay />

      {/* Modals */}
      {gameOver && (
        <GameOverModal
          result={gameOver.result}
          reason={gameOver.reason}
          onReturn={() => leaveGame()}
        />
      )}

      {cancelledNotice && (
        <CancelledModal message={cancelledNotice} onConfirm={dismissCancelledNotice} />
      )}
    </div>
  );
}

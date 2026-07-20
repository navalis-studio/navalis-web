import { useEffect, useRef, useState } from "react";
import { FilmOverlay } from "./components/shared/FilmOverlay";
import { IrisTransitionProvider, useIris } from "./components/shared/IrisTransition";
import { AuthView } from "./components/auth/AuthView";
import { LobbyView } from "./components/lobby/LobbyView";
import { WaitingRoomView } from "./components/waiting/WaitingRoomView";
import { PlacingShipsView } from "./components/placing/PlacingShipsView";
import { ArenaView } from "./components/arena/ArenaView";
import { GameOverModal } from "./components/game-over/GameOverModal";
import { CancelledModal } from "./components/game-over/CancelledModal";
import { useAuth } from "./contexts/AuthContext";
import { useGame } from "./contexts/GameContext";
import navalisShip from "./img/black_navalis_ship.png";

// Transitions that use the full iris wipe (close → wait → open)
const IRIS_TRANSITIONS = [
  { from: "placing", to: "arena" },
  { from: "arena", to: "lobby" },
];

// Transitions that use only iris open (reveal effect)
const IRIS_OPEN_TRANSITIONS = [
  { from: "auth", to: "lobby" },
  { from: "waiting", to: "placing" },
  { from: "lobby", to: "placing" },
];

function shouldIris(from, to) {
  return IRIS_TRANSITIONS.some((t) => t.from === from && t.to === to);
}

function shouldIrisOpen(from, to) {
  return IRIS_OPEN_TRANSITIONS.some((t) => t.from === from && t.to === to);
}

function NavalisContent() {
  const { user, loading } = useAuth();
  const { gameState, gameOver, leaveGame, cancelledNotice, dismissCancelledNotice } = useGame();
  const { trigger, triggerOpen } = useIris();
  const [displayedView, setDisplayedView] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const prevViewRef = useRef(null);
  const transitioningRef = useRef(false);

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

  const targetView = getCurrentView();

  // Splash: wait for loading to finish, then reveal
  useEffect(() => {
    if (!loading && showSplash) {
      const timer = setTimeout(() => {
        prevViewRef.current = targetView;
        setDisplayedView(targetView);
        setShowSplash(false);
        triggerOpen();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [loading, showSplash, targetView, triggerOpen]);

  // View changes after splash
  useEffect(() => {
    if (showSplash || !displayedView) return;
    if (targetView === prevViewRef.current) return;
    if (transitioningRef.current) return;

    const from = prevViewRef.current;
    const to = targetView;

    if (shouldIris(from, to)) {
      // Full iris: close → swap → open
      transitioningRef.current = true;
      trigger(() => {
        prevViewRef.current = to;
        setDisplayedView(to);
        transitioningRef.current = false;
        window.scrollTo(0, 0);
      });
    } else if (shouldIrisOpen(from, to)) {
      // Iris open only: instant swap then reveal
      prevViewRef.current = to;
      setDisplayedView(to);
      triggerOpen();
      window.scrollTo(0, 0);
    } else {
      // Instant swap (no iris)
      prevViewRef.current = to;
      setDisplayedView(to);
      window.scrollTo(0, 0);
    }
  }, [targetView, showSplash, displayedView, trigger]);

  // Splash screen
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[99998] bg-ink-black flex flex-col items-center justify-center">
        <div className="splash-bounce">
          <img
            src={navalisShip}
            alt="Navalis"
            className="w-24 2xl:w-32 h-auto invert"
            draggable="false"
          />
        </div>
        <div className="mt-6 flex items-center gap-2">
          <div className="splash-dots flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-paper-white animate-[pulse_1s_ease-in-out_infinite_0ms]" />
            <span className="w-2 h-2 rounded-full bg-paper-white animate-[pulse_1s_ease-in-out_infinite_200ms]" />
            <span className="w-2 h-2 rounded-full bg-paper-white animate-[pulse_1s_ease-in-out_infinite_400ms]" />
          </div>
        </div>
        <span className="mt-3 font-mono text-[11px] font-bold tracking-[0.2em] text-mid-tone-grey uppercase">
          Carregando
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-surface text-on-surface font-sans relative overflow-x-hidden overflow-y-auto">
      {/* Content */}
      <div className="relative z-10">
        {displayedView === "auth" && <AuthView />}
        {displayedView === "lobby" && <LobbyView />}
        {displayedView === "waiting" && <WaitingRoomView />}
        {displayedView === "placing" && <PlacingShipsView />}
        {displayedView === "arena" && <ArenaView />}
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

export function NavalisApp() {
  return (
    <IrisTransitionProvider>
      <NavalisContent />
    </IrisTransitionProvider>
  );
}

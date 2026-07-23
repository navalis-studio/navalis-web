import { useEffect, useRef, useState } from "react";
import { FilmOverlay } from "./components/shared/FilmOverlay";
import { IrisTransitionProvider, useIris } from "./components/shared/IrisTransition";
import { SoundControl } from "./components/shared/SoundControl";
import { TitleScreen } from "./components/shared/TitleScreen";
import { AuthView } from "./components/auth/AuthView";
import { LobbyView } from "./components/lobby/LobbyView";
import { WaitingRoomView } from "./components/waiting/WaitingRoomView";
import { PlacingShipsView } from "./components/placing/PlacingShipsView";
import { ArenaView } from "./components/arena/ArenaView";
import { GameOverModal } from "./components/game-over/GameOverModal";
import { CancelledModal } from "./components/game-over/CancelledModal";
import { useAuth } from "./contexts/AuthContext";
import { useGame } from "./contexts/GameContext";
import { useSound } from "./contexts/AudioContext";
import navalisShip from "./img/black_navalis_ship.png";

// Music mapping per view
const VIEW_MUSIC = {
  auth: "menu",
  lobby: "menu",
  waiting: "menu",
  placing: "placing",
  arena: "battle",
};

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
  const { gameState, gameOver, leaveGame, cancelledNotice, dismissCancelledNotice, opponentName, gameDuration, sunkEnemyShips, sunkMyShips } = useGame();
  const { trigger, triggerCloseOnly, triggerOpen } = useIris();
  const { playMusic, stopMusic, playSfx, stopSfx } = useSound();
  const [displayedView, setDisplayedView] = useState(null);
  const hasSession = Boolean(localStorage.getItem("navalis_token"));
  const [showTitle, setShowTitle] = useState(!hasSession);
  const [showSplash, setShowSplash] = useState(hasSession);
  const [splashFading, setSplashFading] = useState(false);
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

  // Title screen → user clicks → iris close → splash → iris open → content
  function handleStart() {
    // Small delay so user sees their click registered
    setTimeout(() => {
      triggerCloseOnly(() => {
        setShowTitle(false);
        setShowSplash(true);
      });
    }, 100);
  }

  // Splash: wait for loading to finish, then fade out and reveal with music
  useEffect(() => {
    if (!loading && showSplash && !splashFading) {
      const timer = setTimeout(() => {
        // Start fading out the splash
        setSplashFading(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loading, showSplash, splashFading]);

  // After splash fades out, open iris and show content
  useEffect(() => {
    if (splashFading) {
      const timer = setTimeout(() => {
        prevViewRef.current = targetView;
        setDisplayedView(targetView);
        setShowSplash(false);
        setSplashFading(false);
        triggerOpen();
        // Start music after splash (audio is now unlocked by the title screen click)
        const track = VIEW_MUSIC[targetView];
        if (track) playMusic(track);
      }, 800); // fade-out duration
      return () => clearTimeout(timer);
    }
  }, [splashFading, targetView, triggerOpen, playMusic]);

  // View changes after splash
  useEffect(() => {
    if (showTitle || showSplash || !displayedView) return;
    if (targetView === prevViewRef.current) return;
    if (transitioningRef.current) return;

    const from = prevViewRef.current;
    const to = targetView;

    if (shouldIris(from, to)) {
      // Full iris: close → swap → open
      transitioningRef.current = true;
      stopSfx();
      trigger(() => {
        prevViewRef.current = to;
        setDisplayedView(to);
        transitioningRef.current = false;
        window.scrollTo(0, 0);
      });
    } else if (shouldIrisOpen(from, to)) {
      // Iris open only: instant swap then reveal
      stopSfx();
      prevViewRef.current = to;
      setDisplayedView(to);
      triggerOpen();
      window.scrollTo(0, 0);
    } else {
      // Instant swap (no iris)
      stopSfx();
      prevViewRef.current = to;
      setDisplayedView(to);
      window.scrollTo(0, 0);
    }
  }, [targetView, showSplash, displayedView, trigger]);

  // Play music based on current displayed view
  useEffect(() => {
    if (!displayedView || showTitle || showSplash) return;
    const track = VIEW_MUSIC[displayedView];
    if (track) {
      playMusic(track);
    }
  }, [displayedView, showTitle, showSplash, playMusic]);

  // Play victory/defeat SFX
  useEffect(() => {
    if (!gameOver) return;
    stopMusic();
    if (gameOver.result === "victory") {
      playSfx("victory");
    } else {
      playSfx("defeat");
    }
  }, [gameOver, playSfx, stopMusic]);

  // Title screen
  if (showTitle) {
    return <TitleScreen onStart={handleStart} />;
  }

  // Splash screen
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[99998] bg-ink-black flex flex-col items-center justify-center">
        <div className={`flex flex-col items-center transition-opacity duration-700 ${splashFading ? "opacity-0" : "animate-[fadeIn_0.8s_ease-in-out]"}`}>
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

      {/* Sound control - visible on all screens */}
      <SoundControl />

      {/* Credits */}
      <a
        href="https://github.com/jhowzluk"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-[9000] font-mono text-[12px] font-bold text-paper-white hover:text-paper-white/60 transition-colors tracking-[0.1em]"
      >
        feito por @jhowzluk
      </a>

      {/* Modals */}
      {gameOver && (
        <GameOverModal
          result={gameOver.result}
          reason={gameOver.reason}
          opponentName={opponentName}
          playerName={user?.username}
          duration={gameDuration}
          sunkEnemyShips={sunkEnemyShips}
          sunkMyShips={sunkMyShips}
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

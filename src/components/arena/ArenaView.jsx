import { useMemo, useState, useEffect, useRef } from "react";
import { FLEET, cellsFor } from "../shared/constants";
import { BoardGrid } from "../board/BoardGrid";
import { SailorMascot } from "./SailorMascot";
import { HealthBar } from "./HealthBar";
import { useAuth } from "../../contexts/AuthContext";
import { useGame } from "../../contexts/GameContext";
import { useSound } from "../../contexts/AudioContext";
import { useLanguage } from "../../contexts/LanguageContext";

const SHIP_TYPE_MAP = {
  CARRIER: "carrier",
  BATTLESHIP: "battleship",
  CRUISER: "destroyer",
  SUBMARINE: "submarine",
  DESTROYER: "patrol",
};

const SHIP_ICONS = {
  carrier: "flight_takeoff",
  battleship: "directions_boat",
  destroyer: "sailing",
  submarine: "waves",
  patrol: "speed",
};

export function ArenaView() {
  const { user } = useAuth();
  const {
    myTurn,
    enemyMarks,
    myMarks,
    placedShips,
    fire,
    leaveGame,
    sunkEnemyShips,
    sunkMyShips,
    sunkEnemyCells,
    opponentDisconnected,
    reconnectCountdown,
    opponentName,
    turnTimer,
    revealedEnemyShips,
    gameOverPending,
    gameOverResult,
  } = useGame();
  const { playSfx } = useSound();
  const { t } = useLanguage();

  // Mascot animation states (counters to force re-trigger)
  const [myShootCount, setMyShootCount] = useState(0);
  const [enemyShootCount, setEnemyShootCount] = useState(0);
  const [myDamageCount, setMyDamageCount] = useState(0);
  const [enemyDamageCount, setEnemyDamageCount] = useState(0);
  const [showFleeModal, setShowFleeModal] = useState(false);
  const prevMyHitCount = useRef(null);
  const prevEnemyHitCount = useRef(null);

  // Derive booleans from counters with auto-reset
  const [myShooting, setMyShooting] = useState(false);
  const [enemyShooting, setEnemyShooting] = useState(false);
  const [myDamaged, setMyDamaged] = useState(false);
  const [enemyDamaged, setEnemyDamaged] = useState(false);

  useEffect(() => {
    if (myShootCount === 0) return;
    setMyShooting(false);
    requestAnimationFrame(() => {
      setMyShooting(true);
      setTimeout(() => setMyShooting(false), 600);
    });
  }, [myShootCount]);

  useEffect(() => {
    if (enemyShootCount === 0) return;
    setEnemyShooting(false);
    requestAnimationFrame(() => {
      setEnemyShooting(true);
      setTimeout(() => setEnemyShooting(false), 600);
    });
  }, [enemyShootCount]);

  useEffect(() => {
    if (myDamageCount === 0) return;
    setMyDamaged(false);
    requestAnimationFrame(() => {
      setMyDamaged(true);
      setTimeout(() => setMyDamaged(false), 600);
    });
  }, [myDamageCount]);

  useEffect(() => {
    if (enemyDamageCount === 0) return;
    setEnemyDamaged(false);
    requestAnimationFrame(() => {
      setEnemyDamaged(true);
      setTimeout(() => setEnemyDamaged(false), 600);
    });
  }, [enemyDamageCount]);

  // Trigger shoot/damage animations on every HIT (not just sink)
  useEffect(() => {
    // Count my hits on enemy board
    let myHits = 0;
    enemyMarks.forEach((v) => {
      if (v === "hit") myHits++;
    });

    // On first run, just store the count (skip animations on reconnect/reload)
    if (prevMyHitCount.current === null) {
      prevMyHitCount.current = myHits;
      return;
    }

    if (myHits > prevMyHitCount.current) {
      // I hit the enemy — my mascot shoots, enemy takes damage
      setMyShootCount((c) => c + 1);
      setEnemyDamageCount((c) => c + 1);
      playSfx("hit");
    }
    prevMyHitCount.current = myHits;
  }, [enemyMarks]);

  useEffect(() => {
    // Count enemy hits on my board
    let enemyHits = 0;
    myMarks.forEach((v) => {
      if (v === "hit") enemyHits++;
    });

    // On first run, just store the count (skip animations on reconnect/reload)
    if (prevEnemyHitCount.current === null) {
      prevEnemyHitCount.current = enemyHits;
      return;
    }

    if (enemyHits > prevEnemyHitCount.current) {
      // Enemy hit me — enemy mascot shoots, I take damage
      setEnemyShootCount((c) => c + 1);
      setMyDamageCount((c) => c + 1);
      playSfx("hit");
    }
    prevEnemyHitCount.current = enemyHits;
  }, [myMarks]);

  const occupied = useMemo(() => {
    const s = new Set();
    placedShips.forEach((p) => cellsFor(p).forEach((k) => s.add(k)));
    return s;
  }, [placedShips]);

  const sunkSet = useMemo(() => {
    const s = new Set();
    (sunkEnemyShips || []).forEach((type) => {
      const mapped = SHIP_TYPE_MAP[type];
      if (mapped) s.add(mapped);
    });
    return s;
  }, [sunkEnemyShips]);

  const mySunkSet = useMemo(() => {
    const s = new Set();
    (sunkMyShips || []).forEach((type) => {
      const mapped = SHIP_TYPE_MAP[type];
      if (mapped) s.add(mapped);
    });
    return s;
  }, [sunkMyShips]);

  // Cells of my ships that have been sunk (for visual on my board)
  const mySunkCells = useMemo(() => {
    const s = new Set();
    placedShips.forEach((ship) => {
      if (mySunkSet.has(ship.id)) {
        cellsFor(ship).forEach((k) => s.add(k));
      }
    });
    return s;
  }, [placedShips, mySunkSet]);

  function handleFire(r, c) {
    fire(r, c);
  }

  return (
    <div className="min-h-screen px-8 2xl:px-12 py-4 2xl:py-6 max-w-[1200px] 2xl:max-w-[1280px] mx-auto relative z-10">
      {/* Header */}
      <div className="relative flex items-center justify-end mb-3 2xl:mb-5">
        {/* Turn indicator — mobile: left-aligned; desktop: absolutely centered */}
        <div className="sm:absolute sm:left-0 sm:right-[260px] 2xl:sm:right-[300px] sm:flex sm:justify-center sm:pointer-events-none mr-auto sm:mr-0 pl-14 sm:pl-0">
          <div
            className={`pointer-events-auto flex items-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-2 rounded-full border-3 transition-all ${
              myTurn
                ? "border-paper-white bg-surface-container-high hard-shadow-sm"
                : "border-mid-tone-grey/50 bg-surface-container"
            }`}
          >
            {myTurn && <span className="h-2.5 w-2.5 rounded-full bg-paper-white animate-pulse" />}
            <span
              className={`font-display text-xs sm:text-sm 2xl:text-base font-extrabold uppercase tracking-tight ${
                myTurn ? "text-paper-white" : "text-mid-tone-grey"
              }`}
            >
              {myTurn ? <><span className="hidden sm:inline">{t('arena.yourTurn')}</span><span className="sm:hidden">{t('arena.yourTurnShort')}</span></> : <><span className="hidden sm:inline">{t('arena.opponentTurn')}</span><span className="sm:hidden">{t('arena.opponentTurnShort')}</span></>}
            </span>
            {turnTimer !== null && (
              <span
                className={`font-mono text-sm 2xl:text-base font-bold ${
                  turnTimer <= 5 ? "text-paper-white animate-pulse" : "text-mid-tone-grey"
                }`}
              >
                {turnTimer}s
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <div className="flex items-center bg-surface-container-high ink-border rounded-full overflow-hidden">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2">
              <span
                className="material-symbols-outlined text-paper-white text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                person
              </span>
              <span className="font-mono text-[11px] sm:text-[12px] font-bold text-paper-white tracking-[0.1em] uppercase truncate max-w-[80px] sm:max-w-[120px]">
                {user?.username}
              </span>
            </div>
            <div className="w-[2px] h-6 bg-paper-white/20" />
            <button
              onClick={() => setShowFleeModal(true)}
              className="font-mono text-[11px] font-bold tracking-[0.1em] text-paper-white/60 px-3 sm:px-4 py-2 hover:text-paper-white transition-colors uppercase"
            >
              {t('arena.flee')}
            </button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_240px] 2xl:grid-cols-[1fr_280px] gap-4 2xl:gap-6">
        {/* Left: Boards area */}
        <div className="flex flex-col gap-3 2xl:gap-5">
          {/* Two boards - stacked on mobile, side by side on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 2xl:gap-6">
            {/* Board: Minha Frota */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1.5 2xl:mb-2">
                <span
                  className="material-symbols-outlined text-paper-white text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  shield
                </span>
                <h3 className="font-display text-xs 2xl:text-sm font-extrabold text-paper-white uppercase tracking-wide">
                  {t('arena.myFleet')}
                </h3>
                <span className="font-mono text-[9px] font-bold text-mid-tone-grey tracking-[0.1em] ml-1">
                  {t('arena.defense')}
                </span>
              </div>
              <div className="w-full max-w-[320px] sm:max-w-[280px] 2xl:max-w-[380px]">
                <BoardGrid placed={placedShips} marks={myMarks} sunkCells={mySunkCells} />
              </div>
              {/* My Mascot - hidden on mobile */}
              <div className="hidden sm:flex flex-col items-center gap-1 2xl:gap-3 mt-4 2xl:mt-6 w-full">
                <span className="font-mono text-[11px] 2xl:text-[13px] font-bold tracking-[0.1em] text-paper-white uppercase truncate max-w-[150px] text-center">
                  {user?.username || t('arena.you')} <span className="text-mid-tone-grey">{t('arena.me')}</span>
                </span>
                <HealthBar sunkCount={sunkMyShips?.length || 0} />
                <SailorMascot shooting={myShooting} damaged={myDamaged} shootKey={myShootCount} damageKey={myDamageCount} gameOverState={gameOverPending ? gameOverResult : null} className="h-32 2xl:h-44" />
              </div>
              {/* Mobile: just the nick */}
              <span className="sm:hidden font-mono text-[11px] font-bold tracking-[0.1em] text-paper-white uppercase mt-2">
                {user?.username || t('arena.you')} {t('arena.me')}
              </span>
            </div>

            {/* Board: Frota Inimiga */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1.5 2xl:mb-2">
                <span
                  className="material-symbols-outlined text-paper-white text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  gps_fixed
                </span>
                <h3 className="font-display text-xs 2xl:text-sm font-extrabold text-paper-white uppercase tracking-wide">
                  {t('arena.enemyFleet')}
                </h3>
                <span className="font-mono text-[9px] font-bold text-mid-tone-grey tracking-[0.1em] ml-1">
                  {t('arena.attack')}
                </span>
              </div>
              <div className="w-full max-w-[320px] sm:max-w-[280px] 2xl:max-w-[380px] relative">
                <BoardGrid
                  marks={enemyMarks}
                  fog
                  interactive={!gameOverPending}
                  attackMode
                  disabled={!myTurn || gameOverPending}
                  onCellClick={(r, c) => handleFire(r, c)}
                  sunkCells={sunkEnemyCells}
                  revealedCells={revealedEnemyShips}
                />
                {!myTurn && !gameOverPending && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="bg-surface-container-high/90 ink-border rounded-lg px-4 py-1.5 hard-shadow-sm">
                      <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-mid-tone-grey uppercase">
                        {t('arena.blocked')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {/* Enemy Mascot - hidden on mobile */}
              <div className="hidden sm:flex flex-col items-center gap-1 2xl:gap-3 mt-4 2xl:mt-6 w-full">
                <span className="font-mono text-[11px] 2xl:text-[13px] font-bold tracking-[0.1em] text-paper-white uppercase truncate max-w-[150px] text-center">
                  {opponentName || t('arena.opponent')}
                </span>
                <HealthBar sunkCount={sunkEnemyShips?.length || 0} />
                <SailorMascot
                  isEnemy
                  shooting={enemyShooting}
                  damaged={enemyDamaged}
                  shootKey={enemyShootCount}
                  damageKey={enemyDamageCount}
                  gameOverState={gameOverPending ? (gameOverResult === "victory" ? "defeat" : "victory") : null}
                  className="h-32 2xl:h-44"
                />
              </div>
              {/* Mobile: just the nick */}
              <span className="sm:hidden font-mono text-[11px] font-bold tracking-[0.1em] text-paper-white uppercase mt-2">
                {opponentName || t('arena.opponent')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel: Ship Tracker */}
        <aside className="flex flex-col gap-4">
          {/* Enemy Fleet Tracker */}
          <div className="bg-paper-white border-4 border-ink-black rounded-xl p-3 2xl:p-5 shadow-[6px_6px_0px_0px_#000]">
            <h3 className="font-display text-base 2xl:text-xl font-extrabold text-ink-black uppercase tracking-tight text-center border-b-4 border-ink-black pb-2 mb-3 2xl:mb-4">
              {t('arena.enemyFleet')}
            </h3>
            <div className="flex items-center justify-between mb-2 2xl:mb-3">
              <span className="font-mono text-[11px] 2xl:text-[12px] font-bold text-mid-tone-grey tracking-[0.1em]">
                {sunkSet.size}/{FLEET.length} {t('arena.sunk')}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 2xl:gap-2.5">
              {FLEET.map((ship) => {
                const isSunk = sunkSet.has(ship.id);
                return (
                  <div
                    key={ship.id}
                    className={`flex items-center p-2 2xl:p-3.5 rounded-lg border-2 transition-all ${
                      isSunk
                        ? "border-mid-tone-grey/60 bg-light-grain/10"
                        : "border-ink-black bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 2xl:gap-3">
                      <span
                        className={`material-symbols-outlined text-lg 2xl:text-xl ${isSunk ? "text-mid-tone-grey" : "text-ink-black"}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {SHIP_ICONS[ship.id]}
                      </span>
                      <div className="flex flex-col gap-0.5 2xl:gap-1">
                        <span
                          className={`font-mono text-[11px] 2xl:text-[13px] font-bold tracking-[0.05em] uppercase leading-tight whitespace-nowrap ${
                            isSunk ? "text-mid-tone-grey line-through" : "text-ink-black"
                          }`}
                        >
                          {t('ships.' + ship.id)}
                        </span>
                        <div className="flex gap-1">
                          {Array.from({ length: ship.size }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 2xl:w-2 2xl:h-2 ${isSunk ? "bg-mid-tone-grey/40" : "bg-ink-black"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {isSunk && (
                      <span className="ml-auto text-ink-black font-display text-xl 2xl:text-2xl font-black leading-none">
                        ✕
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* Opponent disconnected overlay */}
      {opponentDisconnected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/85">
          <div className="relative w-full max-w-sm bg-surface-container-high ink-border rounded-xl p-8 hard-shadow text-center overflow-hidden">
            {/* Corner circles */}
            <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-paper-white" />
            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-paper-white" />
            <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-paper-white" />
            <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-paper-white" />

            <div className="relative z-10 flex flex-col items-center gap-4">
              <span
                className="material-symbols-outlined text-paper-white text-5xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                wifi_off
              </span>
              <h3 className="font-display text-2xl font-extrabold text-paper-white uppercase tracking-tight">
                {t('arena.disconnectedTitle')}
              </h3>
              <p className="font-sans text-sm text-on-surface-variant">{t('arena.disconnectedMessage')}</p>
              {reconnectCountdown !== null && (
                <div className="font-mono text-4xl font-bold text-paper-white">
                  {reconnectCountdown}s
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Flee confirmation modal */}
      {showFleeModal && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-ink-black/85">
          <div className="relative w-full max-w-sm bg-surface-container-high ink-border rounded-xl p-8 hard-shadow text-center overflow-hidden">
            {/* Corner circles */}
            <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-paper-white" />
            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-paper-white" />
            <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-paper-white" />
            <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-paper-white" />

            <div className="relative z-10 flex flex-col items-center gap-4">
              <span
                className="material-symbols-outlined text-paper-white text-5xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                directions_run
              </span>

              <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-paper-white">
                {t('arena.fleeTitle')}
              </h2>

              <p className="font-sans text-sm text-on-surface-variant">
                {t('arena.fleeMessage')}
              </p>

              <div className="flex flex-col gap-3 w-full mt-2">
                <button
                  onClick={leaveGame}
                  className="w-full bg-paper-white text-ink-black font-display text-sm font-extrabold py-3 px-6 rounded-full ink-border hard-shadow uppercase transition-all hover:scale-x-105 hover:scale-y-95 active:scale-x-95 active:scale-y-105"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.animation = "boil 0.3s infinite alternate steps(2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.animation = "none";
                  }}
                >
                  {t('arena.fleeConfirm')}
                </button>

                <button
                  onClick={() => setShowFleeModal(false)}
                  className="w-full font-mono text-[12px] font-bold tracking-[0.1em] text-paper-white uppercase py-2 transition-colors hover:text-mid-tone-grey"
                >
                  {t('arena.fleeCancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

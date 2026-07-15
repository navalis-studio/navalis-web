import { useMemo, useState, useEffect, useRef } from "react";
import { FLEET, cellsFor } from "../shared/constants";
import { BoardGrid } from "../board/BoardGrid";
import { SailorMascot } from "./SailorMascot";
import { HealthBar } from "./HealthBar";
import { useAuth } from "../../contexts/AuthContext";
import { useGame } from "../../contexts/GameContext";

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
  const { myTurn, enemyMarks, myMarks, placedShips, fire, leaveGame, sunkEnemyShips, sunkMyShips, sunkEnemyCells, opponentDisconnected, reconnectCountdown, opponentName } = useGame();

  // Mascot animation states
  const [myShooting, setMyShooting] = useState(false);
  const [enemyShooting, setEnemyShooting] = useState(false);
  const [myDamaged, setMyDamaged] = useState(false);
  const [enemyDamaged, setEnemyDamaged] = useState(false);
  const [showFleeModal, setShowFleeModal] = useState(false);
  const prevSunkEnemyCount = useRef(0);
  const prevSunkMyCount = useRef(0);

  // Detect when a ship is sunk to trigger animations
  useEffect(() => {
    const currentEnemySunk = sunkEnemyShips?.length || 0;
    const currentMySunk = sunkMyShips?.length || 0;

    if (currentEnemySunk > prevSunkEnemyCount.current) {
      // I sunk an enemy ship — my mascot shoots, enemy takes damage
      setMyShooting(true);
      setEnemyDamaged(true);
      setTimeout(() => setMyShooting(false), 600);
      setTimeout(() => setEnemyDamaged(false), 600);
    }
    if (currentMySunk > prevSunkMyCount.current) {
      // Enemy sunk my ship — enemy mascot shoots, I take damage
      setEnemyShooting(true);
      setMyDamaged(true);
      setTimeout(() => setEnemyShooting(false), 600);
      setTimeout(() => setMyDamaged(false), 600);
    }

    prevSunkEnemyCount.current = currentEnemySunk;
    prevSunkMyCount.current = currentMySunk;
  }, [sunkEnemyShips, sunkMyShips]);

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
    <div className="min-h-screen px-8 2xl:px-12 py-6 max-w-[1200px] 2xl:max-w-[1280px] mx-auto relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-2xl 2xl:text-3xl font-extrabold uppercase tracking-tight text-paper-white">
            Combate Naval
          </h1>
          <span className="hidden md:inline-block font-mono text-[11px] font-bold tracking-[0.1em] bg-paper-white text-ink-black px-3 py-1 rounded-full border-2 border-ink-black">
            EM BATALHA
          </span>
        </div>
        <div className="flex items-center">
          <div className="flex items-center bg-surface-container-high ink-border rounded-full overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2">
              <span className="material-symbols-outlined text-paper-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              <span className="font-mono text-[12px] font-bold text-paper-white tracking-[0.1em] uppercase">{user?.username}</span>
            </div>
            <div className="w-[2px] h-6 bg-paper-white/20" />
            <button
              onClick={() => setShowFleeModal(true)}
              className="font-mono text-[11px] font-bold tracking-[0.1em] text-paper-white/60 px-4 py-2 hover:text-paper-white transition-colors uppercase"
            >
              FUGIR
            </button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-6 2xl:gap-8">
        {/* Left: Boards area */}
        <div className="flex flex-col gap-6">
          {/* Turn indicator */}
          <div className="flex items-center justify-center">
            <div className={`flex items-center gap-2.5 px-5 py-2 rounded-full border-2 ${
              myTurn ? "border-paper-white bg-surface-container-high" : "border-mid-tone-grey/50 bg-surface-container"
            }`}>
              {myTurn && <span className="h-2.5 w-2.5 rounded-full bg-paper-white animate-pulse" />}
              <span className={`font-display text-base font-extrabold uppercase tracking-tight ${
                myTurn ? "text-paper-white" : "text-mid-tone-grey"
              }`}>
                {myTurn ? "SEU TURNO — ATAQUE!" : "TURNO DO OPONENTE"}
              </span>
            </div>
          </div>

          {/* Two boards side by side */}
          <div className="grid grid-cols-2 gap-6">
            {/* Board: Minha Frota */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-paper-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                <h3 className="font-display text-sm font-extrabold text-paper-white uppercase tracking-wide">
                  Minha Frota
                </h3>
                <span className="font-mono text-[9px] font-bold text-mid-tone-grey tracking-[0.1em] ml-1">DEFESA</span>
              </div>
              <div className="w-full max-w-[380px]">
                <BoardGrid placed={placedShips} marks={myMarks} sunkCells={mySunkCells} />
              </div>
              {/* My Mascot */}
              <div className="flex flex-col items-center gap-3 mt-8">
                <span className="font-mono text-[13px] font-bold tracking-[0.1em] text-paper-white uppercase truncate max-w-[150px]">
                  {user?.username || "VOCÊ"} <span className="text-mid-tone-grey">(eu)</span>
                </span>
                <HealthBar sunkCount={sunkMyShips?.length || 0} />
                <SailorMascot shooting={myShooting} damaged={myDamaged} />
              </div>
            </div>

            {/* Board: Frota Inimiga */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-paper-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>gps_fixed</span>
                <h3 className="font-display text-sm font-extrabold text-paper-white uppercase tracking-wide">
                  Frota Inimiga
                </h3>
                <span className="font-mono text-[9px] font-bold text-mid-tone-grey tracking-[0.1em] ml-1">ATAQUE</span>
              </div>
              <div className="w-full max-w-[380px] relative">
                <BoardGrid
                  marks={enemyMarks}
                  fog
                  interactive
                  attackMode
                  disabled={!myTurn}
                  onCellClick={(r, c) => handleFire(r, c)}
                  sunkCells={sunkEnemyCells}
                />
                {!myTurn && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="bg-surface-container-high/90 ink-border rounded-lg px-4 py-1.5 hard-shadow-sm">
                      <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-mid-tone-grey uppercase">
                        BLOQUEADO
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {/* Enemy Mascot */}
              <div className="flex flex-col items-center gap-3 mt-8">
                <span className="font-mono text-[13px] font-bold tracking-[0.1em] text-paper-white uppercase truncate max-w-[150px]">
                  {opponentName || "OPONENTE"}
                </span>
                <HealthBar sunkCount={sunkEnemyShips?.length || 0} />
                <SailorMascot isEnemy shooting={enemyShooting} damaged={enemyDamaged} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Ship Tracker */}
        <aside className="flex flex-col gap-4">
          {/* Enemy Fleet Tracker */}
          <div className="bg-paper-white border-4 border-ink-black rounded-xl p-5 shadow-[6px_6px_0px_0px_#000]">
            <h3 className="font-display text-xl font-extrabold text-ink-black uppercase tracking-tight text-center border-b-4 border-ink-black pb-2 mb-4">
              Frota Inimiga
            </h3>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[12px] font-bold text-mid-tone-grey tracking-[0.1em]">
                {sunkSet.size}/{FLEET.length} AFUNDADOS
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {FLEET.map((ship) => {
                const isSunk = sunkSet.has(ship.id);
                return (
                  <div
                    key={ship.id}
                    className={`flex items-center p-3.5 rounded-lg border-2 transition-all ${
                      isSunk
                        ? "border-mid-tone-grey/60 bg-light-grain/10"
                        : "border-ink-black bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`material-symbols-outlined text-xl ${isSunk ? "text-mid-tone-grey" : "text-ink-black"}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {SHIP_ICONS[ship.id]}
                      </span>
                      <div className="flex flex-col gap-1">
                        <span className={`font-mono text-[13px] font-bold tracking-[0.05em] uppercase leading-tight whitespace-nowrap ${
                          isSunk ? "text-mid-tone-grey line-through" : "text-ink-black"
                        }`}>
                          {ship.name}
                        </span>
                        <div className="flex gap-1">
                          {Array.from({ length: ship.size }).map((_, i) => (
                            <div key={i} className={`w-2 h-2 ${isSunk ? "bg-mid-tone-grey/40" : "bg-ink-black"}`} />
                          ))}
                        </div>
                      </div>
                    </div>

                    {isSunk && (
                      <span className="ml-auto text-ink-black font-display text-2xl font-black leading-none">✕</span>
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
              <span className="material-symbols-outlined text-paper-white text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                wifi_off
              </span>
              <h3 className="font-display text-2xl font-extrabold text-paper-white uppercase tracking-tight">
                Oponente Desconectou
              </h3>
              <p className="font-sans text-sm text-on-surface-variant">
                Aguardando reconexão...
              </p>
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
                FUGIR?
              </h2>

              <p className="font-sans text-sm text-on-surface-variant">
                Abandonar o campo de batalha contará como derrota. Seu oponente vencerá por W.O.
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
                  SIM, SOU UM COVARDE
                </button>

                <button
                  onClick={() => setShowFleeModal(false)}
                  className="w-full font-mono text-[12px] font-bold tracking-[0.1em] text-paper-white uppercase py-2 transition-colors hover:text-mid-tone-grey"
                >
                  VOLTAR À BATALHA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

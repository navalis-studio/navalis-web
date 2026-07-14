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
  carrier: "sailing",
  battleship: "directions_boat",
  destroyer: "kayaking",
  submarine: "water",
  patrol: "phishing",
};

export function ArenaView() {
  const { user } = useAuth();
  const { myTurn, enemyMarks, myMarks, placedShips, fire, leaveGame, sunkEnemyShips, sunkMyShips, sunkEnemyCells, opponentDisconnected, reconnectCountdown } = useGame();

  // Mascot animation states
  const [myShooting, setMyShooting] = useState(false);
  const [enemyShooting, setEnemyShooting] = useState(false);
  const [myDamaged, setMyDamaged] = useState(false);
  const [enemyDamaged, setEnemyDamaged] = useState(false);
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

  // Hits received per ship (how many cells of each ship were hit)
  const myShipHits = useMemo(() => {
    const hitsMap = {};
    placedShips.forEach((ship) => {
      const cells = cellsFor(ship);
      let count = 0;
      cells.forEach((key) => {
        if (myMarks.get(key) === "hit") count++;
      });
      hitsMap[ship.id] = count;
    });
    return hitsMap;
  }, [placedShips, myMarks]);

  const hits = Array.from(enemyMarks.values()).filter((v) => v === "hit").length;
  const received = Array.from(myMarks.values()).filter((v) => v === "hit").length;

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
    <div className="min-h-screen px-4 lg:px-8 py-6 max-w-[1280px] mx-auto relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-2xl lg:text-3xl font-extrabold uppercase tracking-tight text-paper-white">
            Combate Naval
          </h1>
          <span className="hidden md:inline-block font-mono text-[11px] font-bold tracking-[0.1em] bg-paper-white text-ink-black px-3 py-1 rounded-full border-2 border-ink-black">
            EM BATALHA
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-surface-container-high rounded-full px-3 py-1.5 ink-border">
            <span className="material-symbols-outlined text-paper-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            <span className="font-mono text-[11px] font-bold text-paper-white tracking-[0.1em] uppercase">{user?.username}</span>
          </div>
          <button
            onClick={leaveGame}
            className="font-mono text-[12px] font-bold tracking-[0.1em] text-mid-tone-grey hover:text-paper-white transition-colors uppercase border border-mid-tone-grey/50 rounded-full px-4 py-1.5 hover:border-paper-white"
          >
            DESISTIR
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-8">
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
            </div>

            {/* Board: Frota Inimiga */}
            <div className="flex flex-col items-center relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-paper-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>gps_fixed</span>
                <h3 className="font-display text-sm font-extrabold text-paper-white uppercase tracking-wide">
                  Frota Inimiga
                </h3>
                <span className="font-mono text-[9px] font-bold text-mid-tone-grey tracking-[0.1em] ml-1">ATAQUE</span>
              </div>
              <div className="w-full max-w-[380px]">
                <BoardGrid
                  marks={enemyMarks}
                  fog
                  interactive
                  attackMode
                  disabled={!myTurn}
                  onCellClick={(r, c) => handleFire(r, c)}
                  sunkCells={sunkEnemyCells}
                />
              </div>
              {!myTurn && (
                <div className="absolute inset-0 top-8 pointer-events-none flex items-center justify-center">
                  <div className="bg-surface-container-high/90 ink-border rounded-lg px-4 py-1.5 hard-shadow-sm">
                    <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-mid-tone-grey uppercase">
                      BLOQUEADO
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats bar below boards */}
          <div className="flex items-center justify-center gap-8 bg-surface-container-high ink-border rounded-xl px-6 py-3 hard-shadow-sm max-w-[500px] mx-auto">
            <div className="flex flex-col items-center">
              <span className="font-display text-2xl font-black text-paper-white">{hits}</span>
              <span className="font-mono text-[9px] font-bold tracking-[0.15em] text-mid-tone-grey">ACERTOS</span>
            </div>
            <div className="w-px h-8 bg-mid-tone-grey/30" />
            <div className="flex flex-col items-center">
              <span className="font-display text-2xl font-black text-mid-tone-grey">{received}</span>
              <span className="font-mono text-[9px] font-bold tracking-[0.15em] text-mid-tone-grey">RECEBIDOS</span>
            </div>
            <div className="w-px h-8 bg-mid-tone-grey/30" />
            <div className="flex flex-col items-center">
              <span className="font-display text-2xl font-black text-paper-white">{enemyMarks.size}</span>
              <span className="font-mono text-[9px] font-bold tracking-[0.15em] text-mid-tone-grey">TIROS</span>
            </div>
          </div>

          {/* Mascots Section */}
          <div className="flex items-end justify-center gap-16 mt-6 max-w-[700px] mx-auto">
            {/* My Mascot */}
            <div className="flex flex-col items-center gap-2">
              <HealthBar sunkCount={sunkMyShips?.length || 0} label="MINHA FROTA" />
              <SailorMascot shooting={myShooting} damaged={myDamaged} />
            </div>

            {/* VS divider */}
            <div className="flex flex-col items-center gap-1 pb-8">
              <span className="font-display text-2xl font-black text-paper-white uppercase tracking-tight">VS</span>
              <div className="w-px h-12 bg-mid-tone-grey/30" />
            </div>

            {/* Enemy Mascot */}
            <div className="flex flex-col items-center gap-2">
              <HealthBar sunkCount={sunkEnemyShips?.length || 0} label="FROTA INIMIGA" />
              <SailorMascot isEnemy shooting={enemyShooting} damaged={enemyDamaged} />
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
                    className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                      isSunk
                        ? "border-mid-tone-grey/60 bg-light-grain/10"
                        : "border-ink-black bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`material-symbols-outlined text-xl ${isSunk ? "text-mid-tone-grey" : "text-ink-black"}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {SHIP_ICONS[ship.id]}
                      </span>
                      <div className="flex flex-col">
                        <span className={`font-mono text-[13px] font-bold tracking-[0.05em] uppercase leading-tight ${
                          isSunk ? "text-mid-tone-grey line-through" : "text-ink-black"
                        }`}>
                          {ship.name}
                        </span>
                        <span className={`font-mono text-[11px] tracking-[0.05em] ${
                          isSunk ? "text-mid-tone-grey/60" : "text-mid-tone-grey"
                        }`}>
                          TAM. {ship.size}
                        </span>
                      </div>
                    </div>

                    {isSunk ? (
                      <span className="text-ink-black font-display text-2xl font-black leading-none">✕</span>
                    ) : (
                      <div className="flex gap-1.5">
                        {Array.from({ length: ship.size }).map((_, i) => (
                          <div key={i} className="w-2.5 h-2.5 rounded-sm bg-ink-black" />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* My Fleet status */}
          <div className="bg-surface-container-high ink-border rounded-xl p-5 hard-shadow-sm">
            <h4 className="font-display text-base font-extrabold text-paper-white uppercase tracking-wide text-center mb-4">
              Minha Frota
            </h4>
            <div className="flex flex-col gap-3">
              {FLEET.map((ship) => {
                const isMySunk = mySunkSet.has(ship.id);
                return (
                  <div key={ship.id} className="flex items-center gap-3">
                    {/* Ship icon with status */}
                    <div className="relative shrink-0">
                      <span
                        className={`material-symbols-outlined text-lg ${isMySunk ? "text-mid-tone-grey/30" : "text-paper-white"}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {SHIP_ICONS[ship.id]}
                      </span>
                      {isMySunk && (
                        <span className="absolute inset-0 flex items-center justify-center text-paper-white font-display text-xl font-black leading-none">
                          ✕
                        </span>
                      )}
                    </div>
                    {/* Name + hull bar */}
                    <div className="flex-1 min-w-0">
                      <span className={`font-mono text-[11px] font-bold uppercase tracking-[0.05em] block mb-1 ${
                        isMySunk ? "text-mid-tone-grey" : "text-paper-white"
                      }`}>
                        {ship.name}
                      </span>
                      {/* Hull integrity bar */}
                      <div className="flex gap-0.5">
                        {Array.from({ length: ship.size }).map((_, i) => {
                          const hitsOnShip = myShipHits[ship.id] || 0;
                          const isHit = i < hitsOnShip;
                          return (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-sm transition-colors ${
                                isHit ? "bg-mid-tone-grey" : "bg-paper-white/80"
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* Opponent disconnected overlay */}
      {opponentDisconnected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-sm">
          <div className="bg-surface-container-high ink-border rounded-xl p-8 hard-shadow text-center max-w-sm">
            <span className="material-symbols-outlined text-4xl text-paper-white mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>
              wifi_off
            </span>
            <h3 className="font-display text-xl font-extrabold text-paper-white uppercase tracking-tight mb-2">
              Oponente Desconectou
            </h3>
            <p className="font-sans text-sm text-on-surface-variant mb-4">
              Aguardando reconexão...
            </p>
            {reconnectCountdown !== null && (
              <div className="font-mono text-4xl font-bold text-paper-white">
                {reconnectCountdown}s
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

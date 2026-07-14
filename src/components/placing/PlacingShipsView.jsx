import { useState, useEffect, useMemo } from "react";
import { FLEET, GRID, isValidPlacement, cellsFor, key } from "../shared/constants";
import { BoardGrid } from "../board/BoardGrid";
import { useGame } from "../../contexts/GameContext";

export function PlacingShipsView() {
  const { confirmFleet, leaveGame, opponentReady, opponentDisconnected, reconnectCountdown } = useGame();
  const [placed, setPlaced] = useState([]);
  const [orientation, setOrientation] = useState("H");
  const [selectedShipId, setSelectedShipId] = useState(FLEET[0].id);
  const [hover, setHover] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const occupied = useMemo(() => {
    const s = new Set();
    placed.forEach((p) => cellsFor(p).forEach((k) => s.add(k)));
    return s;
  }, [placed]);

  const placedIds = new Set(placed.map((p) => p.id));
  const activeShip = FLEET.find((s) => s.id === (draggingId || selectedShipId)) || null;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === "r") {
        setOrientation((o) => (o === "H" ? "V" : "H"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const preview = useMemo(() => {
    if (!hover || !activeShip) return null;
    const cells = [];
    for (let i = 0; i < activeShip.size; i++) {
      const r = orientation === "H" ? hover.row : hover.row + i;
      const c = orientation === "H" ? hover.col + i : hover.col;
      const outOfBounds = r < 0 || r >= GRID || c < 0 || c >= GRID;
      const isOccupied = !outOfBounds && occupied.has(key(r, c));
      cells.push({ r, c, invalid: outOfBounds || isOccupied });
    }
    const valid = isValidPlacement(activeShip.size, hover.row, hover.col, orientation, occupied);
    return { cells, valid };
  }, [hover, activeShip, orientation, occupied]);

  const allPlaced = placed.length === FLEET.length;

  function tryPlace(row, col) {
    if (!activeShip) return;
    if (placedIds.has(activeShip.id)) return;
    if (!isValidPlacement(activeShip.size, row, col, orientation, occupied)) return;
    const next = { ...activeShip, row, col, orientation };
    setPlaced((p) => [...p, next]);
    const remaining = FLEET.find((s) => s.id !== activeShip.id && !placedIds.has(s.id));
    setSelectedShipId(remaining ? remaining.id : null);
    setDraggingId(null);
  }

  function removeShip(id) {
    setPlaced((p) => p.filter((x) => x.id !== id));
    setSelectedShipId(id);
  }

  function autoPlace() {
    const next = [];
    const occ = new Set();
    for (const s of FLEET) {
      for (let tries = 0; tries < 200; tries++) {
        const o = Math.random() > 0.5 ? "H" : "V";
        const row = Math.floor(Math.random() * GRID);
        const col = Math.floor(Math.random() * GRID);
        if (isValidPlacement(s.size, row, col, o, occ)) {
          const ship = { ...s, row, col, orientation: o };
          cellsFor(ship).forEach((k) => occ.add(k));
          next.push(ship);
          break;
        }
      }
    }
    setPlaced(next);
    setSelectedShipId(null);
  }

  function handleConfirm() {
    if (!allPlaced || confirming) return;
    setConfirming(true);
    confirmFleet(placed);
  }

  const SHIP_ICONS = {
    carrier: "flight_takeoff",
    battleship: "directions_boat",
    destroyer: "sailing",
    submarine: "waves",
    patrol: "speed",
  };

  return (
    <div className="min-h-screen px-4 lg:px-8 py-6 max-w-[1200px] mx-auto relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-2xl lg:text-3xl font-extrabold uppercase tracking-tight text-paper-white">
            Grade de Posicionamento
          </h1>
          <span className="hidden md:inline-block font-mono text-[11px] font-bold tracking-[0.1em] bg-paper-white text-ink-black px-3 py-1 rounded-full border-2 border-ink-black">
            FASE DE PREPARAÇÃO
          </span>
        </div>
        <div className="flex items-center gap-3">
          {opponentReady && (
            <span className="font-mono text-[11px] font-bold tracking-[0.1em] text-paper-white bg-surface-container-high px-3 py-1.5 rounded-full ink-border flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-paper-white animate-pulse" />
              OPONENTE PRONTO
            </span>
          )}
          <button
            onClick={leaveGame}
            className="font-mono text-[12px] font-bold tracking-[0.1em] text-mid-tone-grey hover:text-paper-white transition-colors uppercase border border-mid-tone-grey/50 rounded-full px-4 py-1.5 hover:border-paper-white"
          >
            ABORTAR
          </button>
        </div>
      </div>

      {/* Main layout: Grid + Controls */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        {/* Grid Section */}
        <div className="flex flex-col items-center justify-center relative">
          <div className="max-w-[520px] w-full">
            <BoardGrid
              occupied={occupied}
              placed={placed}
              preview={!confirming ? preview : null}
              interactive={!confirming}
              onCellEnter={(r, c) => setHover({ row: r, col: c })}
              onCellLeave={() => setHover(null)}
              onCellClick={(r, c) => tryPlace(r, c)}
              onCellDrop={(r, c) => tryPlace(r, c)}
            />
          </div>

          {/* Instructions */}
          <div className="mt-8 max-w-[520px] w-full bg-surface-container-high ink-border rounded-lg p-4 hard-shadow-sm">
            <div className="font-mono text-[12px] text-on-surface-variant leading-relaxed space-y-1.5">
              <div>· Arraste ou clique para posicionar</div>
              <div>· Pressione <span className="text-paper-white font-bold">[R]</span> para girar</div>
              <div>· Clique "REMOVER" para reposicionar</div>
            </div>
          </div>

          {confirming && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface/80 rounded-xl">
              <div className="bg-surface-container-high ink-border rounded-lg px-8 py-4 hard-shadow flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-paper-white animate-pulse" />
                <span className="font-display text-base font-extrabold text-paper-white uppercase tracking-wide">
                  Aguardando oponente...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Fleet Dock + Controls */}
        <aside className="flex flex-col gap-4">
          {/* Fleet Dock */}
          <div className="bg-paper-white border-4 border-ink-black rounded-xl p-5 shadow-[6px_6px_0px_0px_#000]">
            <h3 className="font-display text-xl font-extrabold text-ink-black uppercase tracking-tight text-center border-b-4 border-ink-black pb-2 mb-4">
              Doca da Frota
            </h3>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[12px] font-bold text-mid-tone-grey tracking-[0.1em]">
                {placed.length}/{FLEET.length} POSICIONADOS
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {FLEET.map((s) => {
                const isPlaced = placedIds.has(s.id);
                const isSelected = selectedShipId === s.id && !isPlaced;
                return (
                  <div
                    key={s.id}
                    draggable={!isPlaced && !confirming}
                    onDragStart={() => { setDraggingId(s.id); setSelectedShipId(s.id); }}
                    onDragEnd={() => setDraggingId(null)}
                    onClick={() => !isPlaced && !confirming && setSelectedShipId(s.id)}
                    className={`flex items-center justify-between p-3.5 rounded-lg border-2 transition-all ${
                      isPlaced
                        ? "border-mid-tone-grey/50 bg-light-grain/50 opacity-50 cursor-not-allowed"
                        : isSelected
                        ? "border-ink-black bg-surface-container-high cursor-grab active:cursor-grabbing shadow-[3px_3px_0px_0px_#000]"
                        : "border-ink-black bg-white cursor-grab active:cursor-grabbing hover:bg-light-grain"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`material-symbols-outlined text-xl ${isPlaced ? "text-mid-tone-grey" : isSelected ? "text-paper-white" : "text-ink-black"}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {SHIP_ICONS[s.id]}
                      </span>
                      <div className="flex flex-col">
                        <span className={`font-mono text-[13px] font-bold tracking-[0.05em] uppercase leading-tight ${
                          isPlaced ? "text-mid-tone-grey line-through" : isSelected ? "text-paper-white" : "text-ink-black"
                        }`}>
                          {s.name}
                        </span>
                        <span className={`font-mono text-[11px] tracking-[0.05em] ${
                          isPlaced ? "text-mid-tone-grey" : isSelected ? "text-on-surface-variant" : "text-mid-tone-grey"
                        }`}>
                          TAM. {s.size}
                        </span>
                      </div>
                    </div>

                    {isPlaced ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); if (!confirming) removeShip(s.id); }}
                        className="font-mono text-[9px] font-bold text-ink-black bg-paper-white px-2 py-1 rounded border border-ink-black hover:bg-light-grain"
                      >
                        REMOVER
                      </button>
                    ) : (
                      <div className="flex gap-1.5">
                        {Array.from({ length: s.size }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-sm ${isSelected ? "bg-paper-white" : "bg-ink-black"}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Orientation Toggle */}
          <div className="bg-surface-container-high ink-border rounded-xl p-4 hard-shadow-sm flex flex-col items-center gap-3">
            <span className="font-mono text-[11px] font-bold tracking-[0.15em] text-on-surface-variant uppercase">
              Orientação · [R]
            </span>
            <div className="flex w-full bg-surface border-2 border-paper-white rounded-full p-1 relative">
              <div
                className={`absolute bg-paper-white rounded-full transition-all duration-200`}
                style={{
                  width: "calc(50% - 4px)",
                  height: "calc(100% - 8px)",
                  top: "4px",
                  left: orientation === "V" ? "calc(50% + 2px)" : "4px",
                }}
              />
              <button
                onClick={() => setOrientation("H")}
                className={`flex-1 text-center py-2 z-10 font-mono text-[11px] font-bold tracking-[0.1em] transition-colors ${
                  orientation === "H" ? "text-ink-black" : "text-on-surface-variant"
                }`}
              >
                HORIZ.
              </button>
              <button
                onClick={() => setOrientation("V")}
                className={`flex-1 text-center py-2 z-10 font-mono text-[11px] font-bold tracking-[0.1em] transition-colors ${
                  orientation === "V" ? "text-ink-black" : "text-on-surface-variant"
                }`}
              >
                VERT.
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <button
            onClick={autoPlace}
            disabled={confirming}
            className="w-full bg-surface-container-high text-paper-white ink-border font-display text-base font-extrabold py-3 rounded-xl hard-shadow-sm uppercase flex items-center justify-center gap-2 transition-all hover:scale-x-105 hover:scale-y-95 active:scale-x-95 active:scale-y-105 disabled:opacity-40 disabled:cursor-not-allowed"
            onMouseEnter={(e) => {
              if (!confirming) e.currentTarget.style.animation = "boil 0.3s infinite alternate steps(2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.animation = "none";
            }}
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shuffle
            </span>
            Auto-Posicionar
          </button>

          <button
            onClick={() => setPlaced([])}
            disabled={confirming || placed.length === 0}
            className="w-full bg-surface-container-high text-paper-white ink-border font-display text-base font-extrabold py-3 rounded-xl hard-shadow-sm uppercase flex items-center justify-center gap-2 transition-all hover:scale-x-105 hover:scale-y-95 active:scale-x-95 active:scale-y-105 disabled:opacity-40 disabled:cursor-not-allowed"
            onMouseEnter={(e) => {
              if (!confirming && placed.length > 0) e.currentTarget.style.animation = "boil 0.3s infinite alternate steps(2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.animation = "none";
            }}
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              delete
            </span>
            Limpar Tudo
          </button>

          <button
            disabled={!allPlaced || confirming}
            onClick={handleConfirm}
            className={`w-full font-display text-lg font-extrabold py-4 rounded-xl uppercase flex items-center justify-center gap-2 transition-all ${
              allPlaced && !confirming
                ? "bg-paper-white text-ink-black border-4 border-ink-black shadow-[6px_6px_0px_0px_#000] hover:scale-x-105 hover:scale-y-95 active:scale-x-95 active:scale-y-105"
                : "bg-surface-container text-mid-tone-grey border-2 border-mid-tone-grey/50 cursor-not-allowed opacity-50"
            }`}
            onMouseEnter={(e) => {
              if (allPlaced && !confirming) e.currentTarget.style.animation = "boil 0.3s infinite alternate steps(2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.animation = "none";
            }}
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            {confirming ? "Enviando..." : "Confirmar Frota"}
          </button>

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

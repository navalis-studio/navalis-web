import { useState, useEffect, useMemo } from "react";
import { FLEET, GRID, isValidPlacement, cellsFor, key } from "../shared/constants";
import { BoardGrid } from "../board/BoardGrid";
import { useGame } from "../../contexts/GameContext";

export function PlacingShipsView() {
  const { confirmFleet, cancelReady, leaveGame, opponentReady, myReady, opponentDisconnected, reconnectCountdown } =
    useGame();
  const [placed, setPlaced] = useState([]);
  const [orientation, setOrientation] = useState("H");
  const [selectedShipId, setSelectedShipId] = useState(FLEET[0].id);
  const [hover, setHover] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [showFleeModal, setShowFleeModal] = useState(false);

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
    <div className="min-h-screen px-8 2xl:px-12 py-4 2xl:py-6 max-w-[1200px] mx-auto relative z-10">
      {/* Header - title + flee button on same line */}
      <div className="flex items-center justify-between 2xl:justify-end mb-3 2xl:mb-4">
        <h1 className="font-display text-xl 2xl:hidden font-extrabold uppercase tracking-tight text-paper-white">
          Grade de Posicionamento
        </h1>
        <div className="flex items-center gap-3">
          {opponentReady && (
            <span className="font-mono text-[11px] font-bold tracking-[0.1em] text-paper-white bg-surface-container-high px-3 py-1.5 rounded-full ink-border flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-paper-white animate-pulse" />
              OPONENTE PRONTO
            </span>
          )}
          <button
            onClick={() => setShowFleeModal(true)}
            className="font-mono text-[12px] font-bold tracking-[0.1em] text-paper-white hover:text-ink-black transition-colors uppercase border-2 border-paper-white rounded-full px-5 py-2 hover:bg-paper-white"
          >
            FUGIR
          </button>
        </div>
      </div>

      {/* Main layout: Grid + Controls */}
      <div className="grid lg:grid-cols-[1fr_280px] 2xl:grid-cols-[1fr_320px] gap-5 2xl:gap-8 items-start">
        {/* Grid Section */}
        <div className="flex flex-col items-center justify-start relative">
          {/* Title centered above board - only on large screens */}
          <div className="hidden 2xl:flex flex-col items-center mb-2 2xl:mb-6">
            <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight text-paper-white">
              Grade de Posicionamento
            </h1>
          </div>

          <div className="max-w-[350px] 2xl:max-w-[520px] w-full">
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

          {/* Action Buttons below board */}
          <div className="mt-3 2xl:mt-6 max-w-[350px] 2xl:max-w-[520px] w-full flex gap-3">
            <button
              onClick={autoPlace}
              disabled={confirming}
              className="flex-1 bg-surface-container-high text-paper-white ink-border font-display text-xs 2xl:text-sm font-extrabold py-2 2xl:py-2.5 rounded-xl hard-shadow-sm uppercase flex items-center justify-center gap-2 transition-all hover:scale-x-105 hover:scale-y-95 active:scale-x-95 active:scale-y-105 disabled:opacity-40 disabled:cursor-not-allowed"
              onMouseEnter={(e) => {
                if (!confirming)
                  e.currentTarget.style.animation = "boil 0.3s infinite alternate steps(2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.animation = "none";
              }}
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shuffle
              </span>
              Auto-Posicionar
            </button>

            <button
              onClick={() => {
                setPlaced([]);
                setSelectedShipId(FLEET[0].id);
              }}
              disabled={confirming || placed.length === 0}
              className="flex-1 bg-surface-container-high text-paper-white ink-border font-display text-xs 2xl:text-sm font-extrabold py-2 2xl:py-2.5 rounded-xl hard-shadow-sm uppercase flex items-center justify-center gap-2 transition-all hover:scale-x-105 hover:scale-y-95 active:scale-x-95 active:scale-y-105 disabled:opacity-40 disabled:cursor-not-allowed"
              onMouseEnter={(e) => {
                if (!confirming && placed.length > 0)
                  e.currentTarget.style.animation = "boil 0.3s infinite alternate steps(2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.animation = "none";
              }}
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                delete
              </span>
              Limpar Tudo
            </button>
          </div>

          {/* Confirm button below board */}
          <div className="mt-3 2xl:mt-4 max-w-[350px] 2xl:max-w-[520px] w-full">
            <button
              disabled={!allPlaced || confirming}
              onClick={handleConfirm}
              className={`w-full font-display text-xs 2xl:text-base font-extrabold py-2.5 2xl:py-3.5 rounded-xl uppercase flex items-center justify-center gap-2 transition-all ${
                allPlaced && !confirming
                  ? "bg-paper-white text-ink-black border-4 border-ink-black shadow-[6px_6px_0px_0px_#000] hover:scale-x-105 hover:scale-y-95 active:scale-x-95 active:scale-y-105"
                  : "bg-surface-container text-mid-tone-grey border-2 border-mid-tone-grey/50 cursor-not-allowed opacity-50"
              }`}
              onMouseEnter={(e) => {
                if (allPlaced && !confirming)
                  e.currentTarget.style.animation = "boil 0.3s infinite alternate steps(2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.animation = "none";
              }}
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              {confirming ? "Enviando..." : "Confirmar Frota"}
            </button>
          </div>

          {confirming && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-black/70">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-surface-container-high ink-border rounded-lg px-8 py-4 hard-shadow flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-paper-white animate-pulse" />
                  <span className="font-display text-base font-extrabold text-paper-white uppercase tracking-wide">
                    Aguardando oponente...
                  </span>
                </div>
                <button
                  onClick={() => {
                    cancelReady();
                    setConfirming(false);
                    setPlaced([]);
                    setSelectedShipId(FLEET[0].id);
                  }}
                  className="font-display text-sm font-extrabold tracking-[0.05em] text-ink-black uppercase py-3 px-8 bg-paper-white rounded-full ink-border hard-shadow-sm transition-all hover:scale-x-105 hover:scale-y-95 active:scale-x-95 active:scale-y-105"
                >
                  CANCELAR
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Fleet Dock + Controls */}
        <aside className="flex flex-col gap-3 2xl:gap-4">
          {/* Fleet Dock */}
          <div className="bg-paper-white border-4 border-ink-black rounded-xl p-4 2xl:p-5 shadow-[6px_6px_0px_0px_#000]">
            <h3 className="font-display text-lg 2xl:text-xl font-extrabold text-ink-black uppercase tracking-tight text-center border-b-4 border-ink-black pb-2 mb-3">
              Doca da Frota
            </h3>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] 2xl:text-[12px] font-bold text-mid-tone-grey tracking-[0.1em]">
                {placed.length}/{FLEET.length} POSICIONADOS
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {FLEET.map((s) => {
                const isPlaced = placedIds.has(s.id);
                const isSelected = selectedShipId === s.id && !isPlaced;
                return (
                  <div
                    key={s.id}
                    draggable={!isPlaced && !confirming}
                    onDragStart={() => {
                      setDraggingId(s.id);
                      setSelectedShipId(s.id);
                    }}
                    onDragEnd={() => setDraggingId(null)}
                    onClick={() => {
                      if (confirming) return;
                      if (isPlaced) {
                        removeShip(s.id);
                      } else {
                        setSelectedShipId(s.id);
                      }
                    }}
                    className={`flex items-center justify-between p-2 2xl:p-3.5 rounded-lg border-2 transition-all ${
                      isPlaced
                        ? "border-mid-tone-grey/50 bg-light-grain/50 opacity-60 hover:opacity-80 hover:border-ink-black"
                        : isSelected
                          ? "border-ink-black bg-surface-container-high shadow-[3px_3px_0px_0px_#000]"
                          : "border-ink-black bg-white hover:bg-light-grain"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`material-symbols-outlined text-xl ${isPlaced ? "text-mid-tone-grey" : isSelected ? "text-paper-white" : "text-ink-black"}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {SHIP_ICONS[s.id]}
                      </span>
                      <div className="flex flex-col gap-1">
                        <span
                          className={`font-mono text-[13px] font-bold tracking-[0.05em] uppercase leading-tight whitespace-nowrap ${
                            isPlaced
                              ? "text-mid-tone-grey line-through"
                              : isSelected
                                ? "text-paper-white"
                                : "text-ink-black"
                          }`}
                        >
                          {s.name}
                        </span>
                        <div className="flex gap-1">
                          {Array.from({ length: s.size }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 ${isPlaced ? "bg-mid-tone-grey/40" : isSelected ? "bg-paper-white" : "bg-ink-black"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Orientation Toggle */}
          <div className="bg-surface-container-high ink-border rounded-xl p-2.5 2xl:p-4 hard-shadow-sm flex flex-col items-center gap-1.5 2xl:gap-3">
            <span className="font-mono text-[12px] font-bold tracking-[0.15em] text-on-surface-variant uppercase">
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

          {/* Instructions - hidden on small screens */}
          <div className="hidden 2xl:block bg-surface-container-high ink-border rounded-lg p-3 hard-shadow-sm">
            <div className="font-mono text-[12px] text-on-surface-variant leading-relaxed space-y-1">
              <div>· Arraste ou clique para posicionar</div>
              <div>
                · Pressione <span className="text-paper-white font-bold">[R]</span> para girar
              </div>{" "}
            </div>
          </div>

          {/* Confirm button removed from aside - now below the board */}
        </aside>
      </div>

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
                Abandonar a fase de posicionamento cancelará a partida para ambos os jogadores.
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
                  SIM, ABANDONAR
                </button>

                <button
                  onClick={() => setShowFleeModal(false)}
                  className="w-full font-mono text-[12px] font-bold tracking-[0.1em] text-paper-white uppercase py-2 transition-colors hover:text-mid-tone-grey"
                >
                  VOLTAR AO POSICIONAMENTO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                Oponente Desconectou
              </h3>
              <p className="font-sans text-sm text-on-surface-variant">Aguardando reconexão...</p>
              {reconnectCountdown !== null && (
                <div className="font-mono text-4xl font-bold text-paper-white">
                  {reconnectCountdown}s
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

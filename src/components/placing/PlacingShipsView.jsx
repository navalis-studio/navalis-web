import { useState, useEffect, useMemo } from "react";
import { FLEET, GRID, isValidPlacement, cellsFor } from "../shared/constants";
import { BrandMark } from "../shared/BrandMark";
import { BoardGrid } from "../board/BoardGrid";
import { useGame } from "../../contexts/GameContext";

export function PlacingShipsView() {
  const { confirmFleet, leaveGame, opponentReady } = useGame();
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
      cells.push({ r, c });
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

  return (
    <div className="min-h-screen px-4 lg:px-8 py-4 max-w-[1100px] mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <BrandMark size={32} />
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-tac-blue-deep/60 bg-bg-elev/60">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-[pulse-neon_1.6s_ease-in-out_infinite]" />
            <span className="text-[10px] tracking-[0.3em] text-text-dim font-display">FASE</span>
            <span className="text-xs text-neon-cyan font-display tracking-[0.25em]">POSICIONAMENTO</span>
          </div>
          {opponentReady && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-neon-mint/60 bg-neon-mint/5">
              <span className="h-1.5 w-1.5 rounded-full bg-neon-mint" />
              <span className="text-[10px] tracking-[0.3em] text-neon-mint font-display">OPONENTE PRONTO</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={leaveGame} className="text-[10px] tracking-[0.3em] text-text-dim hover:text-neon-red font-display">
            ABORTAR
          </button>
          <button onClick={autoPlace} disabled={confirming} className="px-3 py-2 rounded border border-tac-blue-deep/70 text-text-dim hover:text-neon-cyan hover:border-neon-cyan/60 text-[10px] tracking-[0.3em] font-display disabled:opacity-40">
            AUTO-POSICIONAR
          </button>
          <button
            disabled={!allPlaced || confirming}
            onClick={handleConfirm}
            className={`px-6 py-2.5 rounded font-display font-bold tracking-[0.25em] text-xs transition-all ${
              allPlaced && !confirming
                ? "bg-neon-mint text-bg-elev neon-glow-cyan hover:bg-neon-cyan"
                : "bg-bg-elev/60 text-text-dim border border-tac-blue-deep/50 cursor-not-allowed"
            }`}
          >
            {confirming ? "ENVIANDO..." : "CONFIRMAR FROTA"}
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[260px_1fr] gap-4">
        <aside className="tac-panel rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display tracking-[0.15em] text-xs">DOCA DA FROTA</h3>
            <span className="text-[9px] text-text-dim font-mono">{placed.length}/{FLEET.length}</span>
          </div>

          <div className="mb-4">
            <div className="text-[9px] tracking-[0.2em] text-text-dim font-display mb-2">ORIENTAÇÃO · [R]</div>
            <div className="grid grid-cols-2 p-1 rounded-md bg-bg-elev border border-tac-blue-deep/60">
              {["H", "V"].map((o) => (
                <button
                  key={o}
                  onClick={() => setOrientation(o)}
                  className={`py-1.5 text-[10px] font-display tracking-[0.15em] rounded transition-all ${
                    orientation === o
                      ? "bg-tac-blue/20 text-neon-cyan neon-glow-cyan"
                      : "text-text-dim hover:text-text"
                  }`}
                >
                  {o === "H" ? "HORIZ." : "VERT."}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
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
                  className={`relative p-2 rounded-md border transition-all cursor-grab active:cursor-grabbing ${
                    isPlaced
                      ? "border-tac-blue-deep/30 bg-bg-elev/30 opacity-40"
                      : isSelected
                      ? "border-neon-cyan bg-neon-cyan/5 neon-glow-cyan"
                      : "border-tac-blue-deep/60 bg-bg-elev/60 hover:border-neon-cyan/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <div className="font-display tracking-wider text-xs text-text">{s.name}</div>
                      <div className="text-[9px] text-text-dim font-mono tracking-wide">
                        TAM {s.size} · QTD {isPlaced ? 0 : 1}
                      </div>
                    </div>
                    {isPlaced && !confirming && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeShip(s.id); }}
                        className="text-[10px] text-neon-red hover:underline font-display tracking-widest"
                      >
                        REMOVER
                      </button>
                    )}
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: s.size }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded-sm ${
                          isPlaced
                            ? "bg-tac-blue-deep/40"
                            : "bg-gradient-to-r from-tac-blue to-neon-cyan shadow-[0_0_8px_rgba(0,168,255,0.4)]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 text-[10px] text-text-dim font-mono leading-relaxed border-t border-tac-blue-deep/40 pt-3">
            <div>· Arraste um navio até o tabuleiro</div>
            <div>· Ou selecione + clique em uma célula</div>
            <div>· Pressione <span className="text-neon-cyan">R</span> para girar</div>
          </div>
        </aside>

        <section className="tac-panel rounded-xl p-5 relative">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display tracking-[0.2em] text-sm">GRADE DE POSICIONAMENTO</h3>
            <div className="flex items-center gap-4 text-[10px] tracking-[0.25em] text-text-dim font-display">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-neon-mint shadow-[0_0_8px_#00FFCC]" /> VÁLIDO</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-neon-red shadow-[0_0_8px_#FF3B5C]" /> INVÁLIDO</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-neon-cyan" /> POSICIONADO</span>
            </div>
          </div>

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

          {confirming && (
            <div className="absolute inset-0 flex items-center justify-center bg-bg/60 rounded-xl">
              <div className="px-6 py-3 rounded-md tac-panel border border-neon-cyan/40 text-neon-cyan font-display tracking-[0.3em] text-sm animate-pulse">
                AGUARDANDO OPONENTE...
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

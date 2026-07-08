import { useMemo } from "react";
import { FLEET, cellsFor } from "../shared/constants";
import { BrandMark } from "../shared/BrandMark";
import { BoardGrid } from "../board/BoardGrid";
import { TurnStat } from "./TurnStat";
import { useAuth } from "../../contexts/AuthContext";
import { useGame } from "../../contexts/GameContext";

export function ArenaView() {
  const { user } = useAuth();
  const { myTurn, enemyMarks, myMarks, placedShips, fire, leaveGame, log } = useGame();

  const myShipCells = useMemo(() => {
    const s = new Set();
    placedShips.forEach((p) => cellsFor(p).forEach((k) => s.add(k)));
    return s;
  }, [placedShips]);

  // Build occupied set for the "placed" prop of BoardGrid
  const occupied = useMemo(() => {
    const s = new Set();
    placedShips.forEach((p) => cellsFor(p).forEach((k) => s.add(k)));
    return s;
  }, [placedShips]);

  function handleFire(r, c) {
    fire(r, c);
  }

  return (
    <div className="min-h-screen px-4 lg:px-8 py-4 max-w-[960px] mx-auto">
      <header className="flex items-center justify-between mb-5">
        <BrandMark size={32} />
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-tac-blue-deep/60 bg-bg-elev/60">
            <span className="text-[10px] tracking-[0.3em] text-text-dim font-display">CMTE</span>
            <span className="text-xs text-neon-cyan font-display tracking-[0.25em]">{user?.username}</span>
          </div>
          <button onClick={leaveGame} className="text-[10px] tracking-[0.3em] text-text-dim hover:text-neon-red font-display">
            DESISTIR
          </button>
        </div>
      </header>

      <div
        className={`relative overflow-hidden rounded-xl border mb-6 px-6 py-5 ${
          myTurn ? "border-neon-mint/60 bg-neon-mint/5" : "border-neon-red/40 bg-neon-red/5"
        }`}
        style={{ boxShadow: myTurn ? "0 0 40px -10px rgba(0,255,204,0.4)" : "0 0 40px -10px rgba(255,59,92,0.3)" }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{
          background: `repeating-linear-gradient(0deg, ${myTurn ? "rgba(0,255,204,0.06)" : "rgba(255,59,92,0.06)"} 0 2px, transparent 2px 4px)`
        }} />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] tracking-[0.4em] text-text-dim font-display">STATUS DA PARTIDA</div>
            <h2
              className={`font-display font-black text-2xl md:text-4xl tracking-[0.1em] mt-1 ${myTurn ? "text-neon-mint" : "text-neon-red/80"}`}
              style={{ textShadow: myTurn ? "0 0 16px rgba(0,255,204,0.6)" : "0 0 16px rgba(255,59,92,0.5)" }}
            >
              {myTurn ? "SEU TURNO — ATIRE!" : "TURNO DO INIMIGO — AGUARDE..."}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <TurnStat label="ACERTOS" value={Array.from(enemyMarks.values()).filter(v => v === "hit").length} accent="mint" />
            <TurnStat label="RECEBIDOS" value={Array.from(myMarks.values()).filter(v => v === "hit").length} accent="red" />
            <TurnStat label="TIROS" value={enemyMarks.size} accent="cyan" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="tac-panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] tracking-[0.3em] text-text-dim font-display">VISÃO DE DEFESA</div>
              <h3 className="font-display tracking-[0.2em] text-sm">MINHA FROTA</h3>
            </div>
            <span className="text-[10px] text-text-dim font-mono">APENAS VISUALIZAÇÃO</span>
          </div>
          <BoardGrid placed={placedShips} marks={myMarks} />
        </section>

        <section className="tac-panel rounded-xl p-5 relative">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] tracking-[0.3em] text-text-dim font-display">VISÃO DE ATAQUE</div>
              <h3 className="font-display tracking-[0.2em] text-sm flex items-center gap-2">
                FROTA INIMIGA
                <span className="text-[10px] text-text-dim font-mono">· NÉVOA DE GUERRA</span>
              </h3>
            </div>
            <div className="relative h-8 w-8 rounded-full border border-neon-cyan/40 overflow-hidden">
              <div className="absolute inset-0" style={{
                background: "conic-gradient(from 0deg, rgba(0,168,255,0.6), transparent 40%)",
                animation: "radar-sweep 3s linear infinite",
              }} />
              <div className="absolute inset-1 rounded-full border border-neon-cyan/30" />
            </div>
          </div>
          <BoardGrid
            marks={enemyMarks}
            fog
            interactive
            attackMode
            disabled={!myTurn}
            onCellClick={(r, c) => handleFire(r, c)}
          />
          {!myTurn && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="px-4 py-1.5 rounded bg-bg-elev/80 border border-neon-red/40 text-[10px] tracking-[0.4em] text-neon-red/80 font-display">
                BLOQUEADO · AGUARDANDO INIMIGO
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 tac-panel rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display tracking-[0.2em] text-xs text-text-dim">REGISTRO DE COMBATE</h3>
          <span className="text-[10px] text-text-dim font-mono">{log.length} ENTRADAS</span>
        </div>
        <div className="max-h-32 overflow-y-auto font-mono text-xs space-y-1">
          {log.map((line, i) => (
            <div key={i} className={i === 0 ? "text-neon-cyan" : "text-text-dim"}>{line}</div>
          ))}
        </div>
      </section>
    </div>
  );
}

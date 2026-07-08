import { useState, useEffect } from "react";
import { BrandMark } from "../shared/BrandMark";
import { useAuth } from "../../contexts/AuthContext";
import { useGame } from "../../contexts/GameContext";

export function WaitingRoomView() {
  const { user } = useAuth();
  const { gameId, opponent, leaveGame } = useGame();
  const [copied, setCopied] = useState(false);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  function copyCode() {
    if (!gameId) return;
    navigator.clipboard.writeText(gameId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const displayId = gameId ? gameId.slice(0, 8).toUpperCase() : "---";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg tac-panel rounded-xl p-10 relative overflow-hidden text-center">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent" />

        <BrandMark size={44} />

        <div className="mt-8">
          <div className="text-[10px] tracking-[0.4em] text-text-dim font-display mb-2">SALA CRIADA</div>
          <h2 className="font-display font-black text-3xl tracking-tight neon-text">
            Aguardando jogadores{dots}
          </h2>
        </div>

        <div className="mt-8 p-6 rounded-lg bg-bg-elev/80 border border-tac-blue-deep/60">
          <div className="text-[10px] tracking-[0.4em] text-text-dim font-display mb-3">ID DA SALA</div>
          <div className="font-mono text-2xl font-bold text-neon-cyan tracking-[0.2em] neon-text break-all">
            {displayId}
          </div>
          <button
            onClick={copyCode}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-neon-cyan/60 text-neon-cyan font-display tracking-[0.2em] text-xs hover:bg-neon-cyan/10 transition-all"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            {copied ? "COPIADO!" : "COPIAR ID COMPLETO"}
          </button>
          <p className="mt-3 text-[10px] text-text-dim font-mono break-all select-all">{gameId}</p>
        </div>

        <p className="mt-6 text-text-dim text-sm">
          Compartilhe o ID acima com seu oponente para ele entrar na sala.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-md bg-bg-elev/60 border border-neon-mint/40 py-3 px-4">
            <div className="text-[9px] tracking-[0.3em] text-text-dim font-display mb-1">JOGADOR 1</div>
            <div className="text-sm text-neon-mint font-display tracking-wider">{user?.username}</div>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-neon-mint animate-[pulse-neon_1.6s_ease-in-out_infinite] shadow-[0_0_8px_#00FFCC]" />
              <span className="text-[9px] text-neon-mint tracking-widest">CONECTADO</span>
            </div>
          </div>
          <div className="rounded-md bg-bg-elev/60 border border-tac-blue-deep/40 py-3 px-4">
            <div className="text-[9px] tracking-[0.3em] text-text-dim font-display mb-1">JOGADOR 2</div>
            <div className="text-sm text-text-dim font-display tracking-wider">
              {opponent || "???"}
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              {opponent ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-neon-mint animate-[pulse-neon_1.6s_ease-in-out_infinite] shadow-[0_0_8px_#00FFCC]" />
                  <span className="text-[9px] text-neon-mint tracking-widest">CONECTADO</span>
                </>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-text-dim/40" />
                  <span className="text-[9px] text-text-dim tracking-widest">AGUARDANDO</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={leaveGame}
            className="text-[10px] tracking-[0.3em] text-text-dim hover:text-neon-red font-display transition-colors"
          >
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  );
}

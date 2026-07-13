import { useState, useEffect } from "react";
import { BrandMark } from "../shared/BrandMark";
import { useAuth } from "../../contexts/AuthContext";
import { useGame } from "../../contexts/GameContext";

export function WaitingRoomView() {
  const { user } = useAuth();
  const { gameId, roomCode, opponent, leaveGame } = useGame();
  const [copied, setCopied] = useState(false);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  function copyCode() {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const displayCode = roomCode || "------";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative z-10">
      <div className="w-full max-w-lg bg-surface-container-high ink-border rounded-xl p-10 hard-shadow relative overflow-hidden text-center">
        {/* Corner circles */}
        <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-paper-white" />
        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-paper-white" />
        <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-paper-white" />
        <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-paper-white" />

        {/* Dashed inner border */}
        <div className="absolute inset-4 border-2 border-paper-white/30 border-dashed rounded-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Header label */}
          <span className="font-mono text-[11px] font-bold tracking-[0.15em] text-on-surface-variant uppercase">
            SALA CRIADA
          </span>

          {/* Title with animated dots */}
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold uppercase tracking-tight text-paper-white">
            Aguardando oponente{dots}
          </h2>

          {/* Room code card */}
          <div className="w-full bg-surface ink-border rounded-lg p-6 hard-shadow-sm">
            <span className="font-mono text-[10px] font-bold tracking-[0.15em] text-on-surface-variant uppercase">
              CÓDIGO DA SALA
            </span>
            <div className="mt-3 font-mono text-4xl font-bold text-paper-white tracking-[0.4em]">
              {displayCode}
            </div>
            <button
              onClick={copyCode}
              className="mt-4 inline-flex items-center gap-2 bg-paper-white text-ink-black font-mono text-[11px] font-bold tracking-[0.1em] px-5 py-2.5 rounded-full ink-border hard-shadow-sm uppercase transition-all hover:scale-x-105 hover:scale-y-95 active:scale-x-95 active:scale-y-105"
              onMouseEnter={(e) => {
                e.currentTarget.style.animation = "boil 0.3s infinite alternate steps(2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.animation = "none";
              }}
            >
              <span
                className="material-symbols-outlined text-base"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                content_copy
              </span>
              {copied ? "COPIADO!" : "COPIAR CÓDIGO"}
            </button>
          </div>

          <p className="font-sans text-sm text-on-surface-variant">
            Compartilhe o código acima com seu oponente.
          </p>

          {/* Players */}
          <div className="w-full grid grid-cols-2 gap-3">
            {/* Player 1 (host) */}
            <div className="bg-surface ink-border rounded-lg p-4 hard-shadow-sm">
              <span className="font-mono text-[9px] font-bold tracking-[0.15em] text-on-surface-variant uppercase">
                JOGADOR 1
              </span>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span
                  className="material-symbols-outlined text-paper-white text-lg"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  person
                </span>
                <span className="font-display text-sm font-extrabold text-paper-white uppercase">
                  {user?.username}
                </span>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
                <span className="font-mono text-[9px] font-bold text-on-surface-variant tracking-[0.1em]">
                  CONECTADO
                </span>
              </div>
            </div>

            {/* Player 2 (opponent) */}
            <div className="bg-surface ink-border rounded-lg p-4 hard-shadow-sm">
              <span className="font-mono text-[9px] font-bold tracking-[0.15em] text-on-surface-variant uppercase">
                JOGADOR 2
              </span>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span
                  className="material-symbols-outlined text-on-surface-variant text-lg"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {opponent ? "person" : "hourglass_top"}
                </span>
                <span className={`font-display text-sm font-extrabold uppercase ${opponent ? "text-paper-white" : "text-on-surface-variant"}`}>
                  {opponent || "???"}
                </span>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                {opponent ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
                    <span className="font-mono text-[9px] font-bold text-on-surface-variant tracking-[0.1em]">
                      CONECTADO
                    </span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-mid-tone-grey/40" />
                    <span className="font-mono text-[9px] font-bold text-mid-tone-grey tracking-[0.1em]">
                      AGUARDANDO
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Cancel button */}
          <button
            onClick={leaveGame}
            className="mt-2 font-mono text-[11px] font-bold tracking-[0.1em] text-mid-tone-grey hover:text-paper-white transition-colors uppercase"
          >
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  );
}

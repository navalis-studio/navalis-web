export function GameOverModal({ result, reason, onReturn }) {
  const victory = result === "victory";
  const isWO = reason === "wo";

  function getMessage() {
    if (isWO) return "Oponente abandonou a partida. Vitória por W.O.!";
    if (victory) return "Você afundou toda a frota inimiga!";
    return "Sua frota foi destruída.";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/85 backdrop-blur-sm animate-in fade-in">
      <div className={`relative w-full max-w-lg rounded-2xl p-10 text-center tac-panel overflow-hidden border-2 ${
        victory ? "border-neon-mint/60" : "border-neon-red/60"
      }`}
      style={{
        boxShadow: victory
          ? "0 0 80px -10px rgba(0,255,204,0.6)"
          : "0 0 80px -10px rgba(255,59,92,0.5)",
      }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{
          background: `repeating-linear-gradient(0deg, ${victory ? "rgba(0,255,204,0.06)" : "rgba(255,59,92,0.06)"} 0 2px, transparent 2px 4px)`
        }} />
        <div className="relative">
          <div className="text-[10px] tracking-[0.5em] text-text-dim font-display mb-4">PARTIDA ENCERRADA</div>
          <h1
            className={`font-display font-black text-5xl md:text-6xl tracking-[0.1em] ${
              victory ? "text-neon-mint" : "text-neon-red"
            }`}
            style={{
              textShadow: victory
                ? "0 0 24px rgba(0,255,204,0.6)"
                : "0 0 24px rgba(255,59,92,0.6)",
            }}
          >
            {victory ? (isWO ? "W.O." : "VITÓRIA") : "DERROTA"}
          </h1>
          <p className="text-text-dim mt-4 font-display tracking-wider">
            {getMessage()}
          </p>
          <button
            onClick={onReturn}
            className={`mt-8 px-8 py-3 rounded font-display font-bold tracking-[0.25em] text-sm transition-all ${
              victory
                ? "bg-neon-mint text-bg-elev hover:bg-neon-cyan neon-glow-cyan"
                : "bg-neon-red/90 text-bg-elev hover:bg-neon-red"
            }`}
          >
            VOLTAR AO LOBBY
          </button>
        </div>
      </div>
    </div>
  );
}

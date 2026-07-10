export function GameOverModal({ result, reason, onReturn }) {
  const victory = result === "victory";
  const isWO = reason === "wo";

  function getMessage() {
    if (isWO) return "Oponente abandonou a partida. Vitória por W.O.!";
    if (victory) return "Você afundou toda a frota inimiga!";
    return "Sua frota foi destruída.";
  }

  function getTitle() {
    if (isWO) return "W.O.";
    return victory ? "VITÓRIA" : "DERROTA";
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-ink-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-surface-container-high ink-border rounded-xl hard-shadow p-10 text-center overflow-hidden">
        {/* Corner circles */}
        <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-paper-white" />
        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-paper-white" />
        <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-paper-white" />
        <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-paper-white" />

        {/* Dashed inner border */}
        <div className="absolute inset-4 border-2 border-paper-white/30 border-dashed rounded-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <span className="font-mono text-[11px] font-bold tracking-[0.15em] text-on-surface-variant uppercase">
            PARTIDA ENCERRADA
          </span>

          <span
            className="material-symbols-outlined text-paper-white text-6xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {victory ? "emoji_events" : "storm"}
          </span>

          <h1 className="font-display text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-paper-white">
            {getTitle()}
          </h1>

          <p className="font-sans text-base text-on-surface-variant max-w-sm">
            {getMessage()}
          </p>

          <button
            onClick={onReturn}
            className="mt-4 bg-paper-white text-ink-black font-display text-lg font-extrabold py-3 px-8 rounded-full ink-border hard-shadow uppercase flex items-center gap-2 transition-all hover:scale-x-105 hover:scale-y-95 active:scale-x-95 active:scale-y-105"
            onMouseEnter={(e) => {
              e.currentTarget.style.animation = "boil 0.3s infinite alternate steps(2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.animation = "none";
            }}
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              arrow_back
            </span>
            <span>VOLTAR AO LOBBY</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function CancelledModal({ message, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-ink-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-surface-container-high ink-border rounded-xl hard-shadow p-10 text-center overflow-hidden">
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
            className="material-symbols-outlined text-paper-white text-5xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            anchor
          </span>

          <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-paper-white">
            OPONENTE SAIU
          </h2>

          <p className="font-sans text-sm text-on-surface-variant">
            {message}
          </p>

          <button
            onClick={onConfirm}
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

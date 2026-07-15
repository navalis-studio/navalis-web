export function CancelledModal({ message, onConfirm }) {
  return (
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
            OPONENTE FUGIU
          </h2>

          <p className="font-sans text-sm text-on-surface-variant">
            {message}
          </p>

          <button
            onClick={onConfirm}
            className="w-full mt-2 bg-paper-white text-ink-black font-display text-sm font-extrabold py-3 px-6 rounded-full ink-border hard-shadow uppercase transition-all hover:scale-x-105 hover:scale-y-95 active:scale-x-95 active:scale-y-105"
            onMouseEnter={(e) => {
              e.currentTarget.style.animation = "boil 0.3s infinite alternate steps(2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.animation = "none";
            }}
          >
            VOLTAR AO LOBBY
          </button>
        </div>
      </div>
    </div>
  );
}

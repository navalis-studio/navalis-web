export function CancelledModal({ message, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl p-10 text-center tac-panel overflow-hidden border-2 border-tac-blue-deep/60"
        style={{ boxShadow: "0 0 60px -10px rgba(0,168,255,0.3)" }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{
          background: "repeating-linear-gradient(0deg, rgba(0,168,255,0.06) 0 2px, transparent 2px 4px)"
        }} />
        <div className="relative">
          <div className="text-[10px] tracking-[0.5em] text-text-dim font-display mb-4">PARTIDA ENCERRADA</div>
          <div className="flex justify-center mb-4">
            <svg viewBox="0 0 24 24" className="h-12 w-12 text-neon-cyan" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-display font-black text-2xl tracking-[0.1em] text-neon-cyan">
            OPONENTE SAIU
          </h2>
          <p className="text-text-dim mt-4 font-display tracking-wider">
            {message}
          </p>
          <button
            onClick={onConfirm}
            className="mt-8 px-8 py-3 rounded font-display font-bold tracking-[0.25em] text-sm bg-neon-cyan text-bg-elev hover:bg-neon-mint transition-all neon-glow-cyan"
          >
            VOLTAR AO LOBBY
          </button>
        </div>
      </div>
    </div>
  );
}

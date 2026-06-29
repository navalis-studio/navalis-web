export function BrandMark({ size = 36 }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex items-center justify-center rounded-md border border-neon-cyan/40"
        style={{ width: size, height: size, background: "linear-gradient(135deg, #0052FF22, #00A8FF22)" }}
      >
        <svg viewBox="0 0 24 24" width={size * 0.7} height={size * 0.7} fill="none" stroke="currentColor" strokeWidth="1.6" className="text-neon-cyan">
          <path d="M3 17h18l-2 3H5l-2-3Z" />
          <path d="M6 17V8l6-4 6 4v9" />
          <path d="M12 4v13" />
          <circle cx="12" cy="11" r="1.5" />
        </svg>
        <span className="absolute inset-0 rounded-md neon-glow-cyan opacity-40" />
      </div>
      <div className="leading-none">
        <div className="font-display font-black tracking-[0.18em] text-text neon-text" style={{ fontSize: size * 0.5 }}>
          NAVALIS<span className="text-neon-cyan">.IO</span>
        </div>
        <div className="text-[10px] tracking-[0.4em] text-text-dim mt-1">COMBATE NAVAL TÁTICO</div>
      </div>
    </div>
  );
}

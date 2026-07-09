export function BrandMark({ size = 36 }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex items-center justify-center rounded border border-white/15"
        style={{ width: size, height: size, background: "rgba(255,255,255,0.03)" }}
      >
        <svg viewBox="0 0 24 24" width={size * 0.7} height={size * 0.7} fill="none" stroke="currentColor" strokeWidth="2.2" className="text-white/80">
          <path d="M3 17h18l-2 3H5l-2-3Z" />
          <path d="M6 17V8l6-4 6 4v9" />
          <path d="M12 4v13" />
          <circle cx="12" cy="11" r="1.5" />
        </svg>
      </div>
      <div className="leading-none">
        <div className="font-display tracking-[0.15em] text-white" style={{ fontSize: size * 0.5 }}>
          NAVALIS
        </div>
        <div className="text-[9px] tracking-[0.4em] text-text-dim mt-1 uppercase">
          Combate Naval · Est. 1930
        </div>
      </div>
    </div>
  );
}

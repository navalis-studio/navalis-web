export function NeonInput({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block group">
      <div className="text-[10px] uppercase tracking-[0.3em] text-text-dim mb-1.5 font-display">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-bg-elev/80 border border-tac-blue-deep/70 rounded-md px-3 py-2.5 text-text placeholder:text-text-dim/60 font-mono text-sm outline-none transition-all focus:border-neon-cyan focus:shadow-[0_0_0_3px_rgba(0,168,255,0.18),0_0_18px_rgba(0,168,255,0.4)]"
      />
    </label>
  );
}

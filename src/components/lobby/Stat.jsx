export function Stat({ label, value }) {
  return (
    <div className="rounded-md bg-bg-elev/60 border border-tac-blue-deep/50 py-2 px-1 overflow-hidden">
      <div className="text-[8px] tracking-[0.15em] text-text-dim font-display truncate">{label}</div>
      <div className="text-neon-cyan font-display font-bold text-base">{value}</div>
    </div>
  );
}

export function Stat({ label, value }) {
  return (
    <div className="rounded-md bg-bg-elev/60 border border-tac-blue-deep/50 py-2">
      <div className="text-[9px] tracking-[0.3em] text-text-dim font-display">{label}</div>
      <div className="text-neon-cyan font-display font-bold text-lg">{value}</div>
    </div>
  );
}

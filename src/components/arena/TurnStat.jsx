export function TurnStat({ label, value, accent }) {
  const color = accent === "mint" ? "text-neon-mint" : accent === "red" ? "text-neon-red" : "text-neon-cyan";
  return (
    <div className="text-right">
      <div className="text-[9px] tracking-[0.3em] text-text-dim font-display">{label}</div>
      <div className={`font-display font-bold text-2xl ${color}`}>{value}</div>
    </div>
  );
}

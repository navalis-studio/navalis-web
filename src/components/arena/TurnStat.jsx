export function TurnStat({ label, value, accent }) {
  const color = accent === "green" ? "text-green-400" : accent === "red" ? "text-red-400" : "text-paper-white";
  return (
    <div className="text-center">
      <div className="font-mono text-[9px] font-bold tracking-[0.15em] text-on-surface-variant uppercase">{label}</div>
      <div className={`font-display font-extrabold text-2xl ${color}`}>{value}</div>
    </div>
  );
}

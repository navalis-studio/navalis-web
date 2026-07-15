/**
 * Barra de vida brutalista baseada em navios (5 segmentos).
 * Props:
 * - sunkCount: number (0-5, quantos navios foram afundados)
 * - label: string
 */
export function HealthBar({ sunkCount = 0, label = "" }) {
  const totalShips = 5;
  const alive = totalShips - sunkCount;

  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <span className="font-mono text-[10px] font-bold tracking-[0.15em] text-on-surface-variant uppercase">
          {label}
        </span>
      )}
      <div className="flex gap-1.5">
        {Array.from({ length: totalShips }).map((_, i) => {
          const isAlive = i < alive;
          return (
            <div
              key={i}
              className={`w-7 h-4 border-2 transition-all duration-300 ${
                isAlive
                  ? "border-paper-white bg-paper-white"
                  : "border-mid-tone-grey/50 bg-transparent"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

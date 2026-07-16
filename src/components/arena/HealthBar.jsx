/**
 * Barra de vida com corações estilo cartoon.
 * Cada coração representa um navio. Quando afundado, fica vazio.
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
      <div className="flex gap-1">
        {Array.from({ length: totalShips }).map((_, i) => {
          const isAlive = i < alive;
          return (
            <span
              key={i}
              className={`text-lg transition-all duration-300 ${
                isAlive ? "text-paper-white drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" : "text-mid-tone-grey/40"
              }`}
              style={{ fontVariationSettings: isAlive ? "'FILL' 1" : "'FILL' 0'" }}
            >
              {isAlive ? "♥" : "♡"}
            </span>
          );
        })}
      </div>
    </div>
  );
}

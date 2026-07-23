export function GameOverModal({
  result,
  reason,
  opponentName,
  playerName,
  duration,
  sunkEnemyShips = [],
  sunkMyShips = [],
  onReturn,
}) {
  const victory = result === "victory";
  const isWO = reason === "wo";

  function getTitle() {
    if (isWO) return "W.O.";
    return victory ? "VITÓRIA" : "DERROTA";
  }

  function getIcon() {
    if (isWO) return "directions_run";
    return victory ? "emoji_events" : "skull";
  }

  function formatDuration(seconds) {
    if (!seconds && seconds !== 0) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  }

  const mySunks = sunkEnemyShips.length;
  const enemySunks = sunkMyShips.length;

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-ink-black/85">
      <div className="relative w-full max-w-sm bg-surface-container-high ink-border rounded-xl p-8 hard-shadow text-center overflow-hidden">
        {/* Corner circles */}
        <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-paper-white" />
        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-paper-white" />
        <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-paper-white" />
        <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-paper-white" />

        <div className="relative z-10 flex flex-col items-center gap-4">
          {/* Icon */}
          <span
            className="material-symbols-outlined text-paper-white text-5xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {getIcon()}
          </span>

          {/* Title */}
          <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight text-paper-white">
            {getTitle()}
          </h1>

          {/* Scoreboard */}
          {playerName && opponentName && !isWO && (
            <div className="w-full flex items-center justify-center gap-3 mt-2">
              {/* Player */}
              <div className="flex-1 flex flex-col items-center gap-1">
                <span className="font-mono text-xs font-bold text-paper-white uppercase tracking-wide truncate max-w-[120px]">
                  {playerName}
                </span>
                <span className="font-display text-3xl font-extrabold text-paper-white">
                  {mySunks}
                </span>
              </div>

              {/* Separator */}
              <span className="font-display text-2xl font-extrabold text-mid-tone-grey">×</span>

              {/* Opponent */}
              <div className="flex-1 flex flex-col items-center gap-1">
                <span className="font-mono text-xs font-bold text-paper-white uppercase tracking-wide truncate max-w-[120px]">
                  {opponentName}
                </span>
                <span className="font-display text-3xl font-extrabold text-paper-white">
                  {enemySunks}
                </span>
              </div>
            </div>
          )}

          {/* W.O. message */}
          {isWO && (
            <p className="font-sans text-sm text-on-surface-variant">
              Oponente abandonou a partida.
            </p>
          )}

          {/* Duration */}
          {duration != null && (
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span
                className="material-symbols-outlined text-mid-tone-grey text-base"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                timer
              </span>
              <span className="font-mono text-xs font-bold text-on-surface-variant tracking-wide">
                {formatDuration(duration)}
              </span>
            </div>
          )}

          {/* Return button */}
          <button
            onClick={onReturn}
            className="w-full mt-2 bg-paper-white text-ink-black font-display text-sm font-extrabold py-3 px-6 rounded-full ink-border hard-shadow uppercase transition-all hover:scale-x-105 hover:scale-y-95 active:scale-x-95 active:scale-y-105"
            onMouseEnter={(e) => {
              e.currentTarget.style.animation = "boil 0.3s infinite alternate steps(2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.animation = "none";
            }}
          >
            VOLTAR AO LOBBY
          </button>
        </div>
      </div>
    </div>
  );
}

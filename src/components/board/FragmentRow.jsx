import { GRID, LETTERS, key } from "../shared/constants";

export function FragmentRow({
  row,
  shipCells,
  previewKeys,
  previewValid,
  marks,
  fog,
  interactive,
  attackMode,
  onCellEnter,
  onCellLeave,
  onCellClick,
  onCellDrop,
  disabled,
}) {
  return (
    <>
      <div className="flex items-center justify-center text-[10px] text-text-dim font-mono tracking-widest">
        {LETTERS[row]}
      </div>
      {Array.from({ length: GRID }).map((_, c) => {
        const k = key(row, c);
        const hasShip = shipCells.has(k);
        const inPreview = previewKeys.has(k);
        const mark = marks?.get(k);
        const isAttacked = !!mark;

        let bg = "bg-bg-elev/60";
        let extra = "";
        let content = null;

        if (fog && !isAttacked) {
          bg = "bg-bg-elev/90";
          extra = "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_30%_30%,rgba(30,58,138,0.35),rgba(11,14,20,0.95))]";
        }
        if (hasShip && !attackMode) {
          bg = "bg-gradient-to-br from-tac-blue/70 to-neon-cyan/40";
          extra = "shadow-[inset_0_0_0_1px_rgba(0,168,255,0.5)]";
        }
        if (mark === "errou") {
          bg = "bg-tac-blue-deep/60";
          content = <span className="block h-1.5 w-1.5 rounded-full bg-neon-cyan/80 shadow-[0_0_8px_#00A8FF]" />;
        }
        if (mark === "hit") {
          bg = "bg-neon-red/40";
          extra = "shadow-[inset_0_0_12px_rgba(255,59,92,0.7)]";
          content = (
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-neon-red" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          );
        }
        if (inPreview) {
          bg = previewValid
            ? "bg-neon-mint/30"
            : "bg-neon-red/30";
          extra = previewValid
            ? "shadow-[inset_0_0_0_1px_#00FFCC,0_0_12px_rgba(0,255,204,0.4)]"
            : "shadow-[inset_0_0_0_1px_#FF3B5C,0_0_12px_rgba(255,59,92,0.4)]";
        }

        const clickable = interactive && !disabled && !(attackMode && isAttacked);

        return (
          <button
            key={c}
            type="button"
            disabled={!clickable}
            onMouseEnter={() => onCellEnter?.(row, c)}
            onMouseLeave={() => onCellLeave?.()}
            onClick={() => onCellClick?.(row, c)}
            onDragOver={(e) => { e.preventDefault(); onCellEnter?.(row, c); }}
            onDrop={(e) => { e.preventDefault(); onCellDrop?.(row, c); }}
            className={`relative aspect-square border border-tac-blue-deep/40 transition-all overflow-hidden ${bg} ${extra} ${
              clickable ? "cursor-crosshair hover:border-neon-cyan/80 hover:shadow-[inset_0_0_0_1px_rgba(0,168,255,0.6)]" : "cursor-default"
            } ${disabled && attackMode ? "opacity-60" : ""}`}
          >
            <span className="absolute inset-0 flex items-center justify-center">{content}</span>
          </button>
        );
      })}
    </>
  );
}

import { GRID, key } from "../shared/constants";

export function FragmentRow({
  row,
  shipCells,
  previewKeys,
  previewInvalidKeys,
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
  sunkCells,
}) {
  return (
    <>
      {/* Row label */}
      <div className="flex items-center justify-center font-mono text-[11px] font-bold text-paper-white tracking-wider">
        {row + 1}
      </div>
      {Array.from({ length: GRID }).map((_, c) => {
        const k = key(row, c);
        const hasShip = shipCells.has(k);
        const inPreview = previewKeys.has(k);
        const mark = marks?.get(k);
        const isAttacked = !!mark;
        const isSunkCell = sunkCells?.has(k);

        let bg = "bg-surface";
        let extra = "";
        let content = null;

        if (fog && !isAttacked) {
          bg = "bg-surface-container";
        }
        if (hasShip && !attackMode) {
          bg = "bg-paper-white/20";
          extra = "border-paper-white/60";
        }
        if (mark === "errou") {
          bg = "bg-surface-container";
          content = (
            <span
              className="material-symbols-outlined text-mid-tone-grey text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              water_drop
            </span>
          );
        }
        if (mark === "hit") {
          if (isSunkCell) {
            // Sunk ship cell — skull icon
            bg = "bg-paper-white/15";
            content = (
              <span
                className="material-symbols-outlined text-paper-white text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                skull
              </span>
            );
          } else {
            // Regular hit — X noir
            bg = "bg-paper-white/10";
            content = (
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-paper-white" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            );
          }
        }
        if (inPreview) {
          const cellInvalid = previewInvalidKeys?.has(k);
          if (cellInvalid) {
            bg = "bg-paper-white/5";
            extra = "border-mid-tone-grey";
            content = (
              <span
                className="material-symbols-outlined text-mid-tone-grey text-[14px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                block
              </span>
            );
          } else {
            bg = "bg-paper-white/20";
            extra = "border-paper-white/70";
          }
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
            className={`relative aspect-square border border-paper-white/20 transition-all overflow-hidden ${bg} ${extra} ${
              clickable ? "cursor-crosshair hover:bg-paper-white/10 hover:border-paper-white/50" : "cursor-default"
            } ${disabled && attackMode ? "opacity-60" : ""}`}
          >
            <span className="absolute inset-0 flex items-center justify-center">{content}</span>
          </button>
        );
      })}
    </>
  );
}

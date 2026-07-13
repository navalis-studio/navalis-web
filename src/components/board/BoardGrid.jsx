import { GRID, LETTERS, key, cellsFor } from "../shared/constants";
import { FragmentRow } from "./FragmentRow";

export function BoardGrid({
  occupied,
  placed,
  preview,
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
  const previewKeys = new Set((preview?.cells || []).map((c) => key(c.r, c.c)));
  const shipCells = new Set();
  placed?.forEach((p) => cellsFor(p).forEach((k) => shipCells.add(k)));

  return (
    <div className="select-none w-full mx-auto">
      {/* Column labels (A-J) */}
      <div className="grid" style={{ gridTemplateColumns: `24px repeat(${GRID}, 1fr)` }}>
        <div />
        {LETTERS.map((letter) => (
          <div key={letter} className="text-center font-mono text-[11px] font-bold text-paper-white py-1 tracking-wider">
            {letter}
          </div>
        ))}
      </div>

      {/* Grid rows */}
      <div
        className="grid gap-0 border-3 border-paper-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
        style={{ gridTemplateColumns: `24px repeat(${GRID}, 1fr)` }}
      >
        {Array.from({ length: GRID }).map((_, r) => (
          <FragmentRow
            key={r}
            row={r}
            shipCells={shipCells}
            previewKeys={previewKeys}
            previewValid={preview?.valid ?? true}
            marks={marks}
            fog={fog}
            interactive={interactive}
            attackMode={attackMode}
            onCellEnter={onCellEnter}
            onCellLeave={onCellLeave}
            onCellClick={onCellClick}
            onCellDrop={onCellDrop}
            disabled={disabled}
            sunkCells={sunkCells}
          />
        ))}
      </div>
    </div>
  );
}

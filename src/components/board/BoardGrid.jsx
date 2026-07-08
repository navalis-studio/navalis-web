import { GRID, key, cellsFor } from "../shared/constants";
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
}) {
  const previewKeys = new Set((preview?.cells || []).map((c) => key(c.r, c.c)));
  const shipCells = new Set();
  placed?.forEach((p) => cellsFor(p).forEach((k) => shipCells.add(k)));

  return (
    <div className="select-none max-w-[420px] mx-auto">
      <div className="grid" style={{ gridTemplateColumns: `20px repeat(${GRID}, 1fr)` }}>
        <div />
        {Array.from({ length: GRID }).map((_, c) => (
          <div key={c} className="text-center text-[9px] text-text-dim font-mono py-0.5 tracking-widest">
            {c + 1}
          </div>
        ))}
      </div>

      <div className="grid gap-0" style={{ gridTemplateColumns: `20px repeat(${GRID}, 1fr)` }}>
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
          />
        ))}
      </div>
    </div>
  );
}

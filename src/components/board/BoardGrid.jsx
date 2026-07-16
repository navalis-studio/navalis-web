import { useState, useEffect, useRef } from "react";
import { GRID, LETTERS, key, cellsFor } from "../shared/constants";
import { FragmentRow } from "./FragmentRow";
import smokeVideo from "../../img/smoke-animation.webm";

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
  const previewKeys = new Set((preview?.cells || []).filter(c => c.r >= 0 && c.r < GRID && c.c >= 0 && c.c < GRID).map((c) => key(c.r, c.c)));
  const previewInvalidKeys = new Set((preview?.cells || []).filter(c => c.invalid && c.r >= 0 && c.r < GRID && c.c >= 0 && c.c < GRID).map((c) => key(c.r, c.c)));
  const shipCells = new Set();
  placed?.forEach((p) => cellsFor(p).forEach((k) => shipCells.add(k)));

  // Smoke explosions state: stores { id, row, col, x, y, size }
  const [smokeEffects, setSmokeEffects] = useState([]);
  const knownHitsRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!marks) return;

    // On first run, populate knownHitsRef with existing hits (skip animations on reconnect/reload)
    if (knownHitsRef.current === null) {
      const existing = new Set();
      marks.forEach((value, k) => {
        if (value === "hit") existing.add(k);
      });
      knownHitsRef.current = existing;
      return;
    }

    const timeout = setTimeout(() => {
      if (!containerRef.current) return;
      const newHits = [];
      marks.forEach((value, k) => {
        if (value === "hit" && !knownHitsRef.current.has(k)) {
          knownHitsRef.current.add(k);

          const cellEl = containerRef.current.querySelector(`[data-cell="${k}"]`);
          if (cellEl) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const cellRect = cellEl.getBoundingClientRect();
            const x = cellRect.left - containerRect.left + cellRect.width / 2;
            const y = cellRect.top - containerRect.top + cellRect.height;
            const size = cellRect.width * 3;
            newHits.push({ id: `${k}-${Date.now()}`, x, y, size });
          }
        }
      });

      if (newHits.length > 0) {
        setSmokeEffects((prev) => [...prev, ...newHits]);
        const ids = newHits.map((h) => h.id);
        setTimeout(() => {
          setSmokeEffects((prev) => prev.filter((e) => !ids.includes(e.id)));
        }, 1500);
      }
    }, 50);

    return () => clearTimeout(timeout);
  }, [marks]);

  return (
    <div ref={containerRef} className="select-none w-full mx-auto relative">
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
        className="relative grid gap-0 border-3 border-paper-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
        style={{ gridTemplateColumns: `24px repeat(${GRID}, 1fr)` }}
      >
        {Array.from({ length: GRID }).map((_, r) => (
          <FragmentRow
            key={r}
            row={r}
            shipCells={shipCells}
            previewKeys={previewKeys}
            previewInvalidKeys={previewInvalidKeys}
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

      {/* Smoke overlays — pixel-positioned on top of the grid */}
      {smokeEffects.map((effect) => (
        <div
          key={effect.id}
          className="absolute pointer-events-none z-30"
          style={{
            left: `${effect.x}px`,
            top: `${effect.y}px`,
            width: `${effect.size}px`,
            height: `${effect.size}px`,
            transform: "translate(-50%, -75%)",
          }}
        >
          <video
            autoPlay
            muted
            playsInline
            className="w-full h-full object-contain brightness-[1.8]"
          >
            <source src={smokeVideo} type="video/webm" />
          </video>
        </div>
      ))}
    </div>
  );
}

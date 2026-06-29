export const FLEET = [
  { id: "carrier", name: "Porta-Aviões", size: 5 },
  { id: "battleship", name: "Encouraçado", size: 4 },
  { id: "destroyer", name: "Destróier", size: 3 },
  { id: "submarine", name: "Submarino", size: 3 },
  { id: "patrol", name: "Barco de Patrulha", size: 2 },
];

export const GRID = 10;

export const LETTERS = "ABCDEFGHIJ".split("");

export const key = (r, c) => `${r}-${c}`;

export function cellsFor(ship) {
  const out = [];
  for (let i = 0; i < ship.size; i++) {
    const r = ship.orientation === "H" ? ship.row : ship.row + i;
    const c = ship.orientation === "H" ? ship.col + i : ship.col;
    out.push(key(r, c));
  }
  return out;
}

export function isValidPlacement(size, row, col, orientation, occupied) {
  for (let i = 0; i < size; i++) {
    const r = orientation === "H" ? row : row + i;
    const c = orientation === "H" ? col + i : col;
    if (r < 0 || c < 0 || r >= GRID || c >= GRID) return false;
    if (occupied.has(key(r, c))) return false;
  }
  return true;
}

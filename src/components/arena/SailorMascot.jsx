import player1Img from "../../img/player1.png";
import player2Img from "../../img/player2.png";

/**
 * Mascote do jogador usando imagens PNG.
 * Props:
 * - isEnemy: boolean (usa player2.png)
 * - shooting: boolean (animação de tiro ativa)
 * - damaged: boolean (animação de dano ativa)
 * - className: string
 */
export function SailorMascot({
  isEnemy = false,
  shooting = false,
  damaged = false,
  className = "",
}) {
  const img = isEnemy ? player2Img : player1Img;

  // All mascot PNGs face RIGHT by default.
  // Enemy mascot is flipped horizontally so it faces LEFT.
  // Flash always exits from the RIGHT side of the image (gun tip),
  // but since enemy is flipped, it visually appears on the left.

  return (
    <div
      className={`relative inline-block ${damaged ? "animate-mascot-damage" : ""} ${isEnemy ? "-scale-x-100" : ""}`}
    >
      {/* Muzzle flash — cartoon burst at gun tip (always right side of image) */}
      {shooting && (
        <div className="absolute right-[-8px] top-[32%] animate-flash-fade pointer-events-none">
          <div className="relative w-6 h-6">
            <div className="absolute inset-0 rounded-full bg-paper-white animate-ping-once" />
            <div className="absolute inset-1 rounded-full bg-paper-white opacity-90" />
          </div>
        </div>
      )}

      <img
        src={img}
        alt={isEnemy ? "Oponente" : "Jogador"}
        className={`w-auto object-contain drop-shadow-[3px_3px_0px_rgba(0,0,0,0.8)] transition-[filter] duration-200 ${damaged ? "brightness-[0.3]" : "brightness-100"} ${className}`}
        draggable="false"
      />
    </div>
  );
}

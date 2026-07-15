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
export function SailorMascot({ isEnemy = false, shooting = false, damaged = false, className = "" }) {
  const img = isEnemy ? player2Img : player1Img;

  return (
    <div
      className={`relative inline-block ${className} ${damaged ? "animate-mascot-damage" : ""} ${shooting ? "animate-mascot-shoot" : ""}`}
    >
      {/* Muzzle flash */}
      {shooting && (
        <div className="absolute right-0 top-[40%] animate-flash-fade">
          <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
            <polygon points="0,10 28,3 24,10 28,17" fill="white" opacity="0.9" />
            <circle cx="5" cy="10" r="4" fill="white" opacity="0.7" />
          </svg>
        </div>
      )}

      <img
        src={img}
        alt={isEnemy ? "Oponente" : "Jogador"}
        className="h-44 2xl:h-52 w-auto object-contain drop-shadow-[3px_3px_0px_rgba(0,0,0,0.8)]"
        draggable="false"
      />
    </div>
  );
}

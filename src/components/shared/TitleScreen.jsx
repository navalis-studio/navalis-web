import navalisName from "../../img/black_navalis_name.png";
import navalisShip from "../../img/black_navalis_ship.png";
import { useLanguage } from "../../contexts/LanguageContext";

export function TitleScreen({ onStart }) {
  const { t } = useLanguage();

  return (
    <div
      onClick={onStart}
      className="fixed inset-0 z-[99998] bg-ink-black flex flex-col items-center justify-center select-none"
    >
      {/* Logo */}
      <img
        src={navalisName}
        alt="Navalis"
        className="w-64 2xl:w-80 h-auto invert drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]"
        draggable="false"
      />

      {/* Ship with bounce animation */}
      <div className="splash-bounce mt-2">
        <img
          src={navalisShip}
          alt=""
          className="w-28 2xl:w-36 h-auto invert"
          draggable="false"
        />
      </div>

      {/* Press to start */}
      <div className="mt-12 flex flex-col items-center gap-3">
        <span className="font-display text-lg 2xl:text-xl font-extrabold text-paper-white uppercase tracking-[0.15em] animate-pulse">
          {t('title.clickToPlay')}
        </span>
        <span className="font-mono text-[10px] text-mid-tone-grey tracking-[0.2em] uppercase">
          {t('title.pressAnywhere')}
        </span>
      </div>
    </div>
  );
}

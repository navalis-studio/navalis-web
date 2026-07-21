import { useState } from "react";
import { useSound } from "../../contexts/AudioContext";

export function SoundControl() {
  const { muted, toggleMute, musicVolume, setMusicVolume } = useSound();
  const [showSlider, setShowSlider] = useState(false);

  function getIcon() {
    if (muted || musicVolume === 0) return "volume_off";
    if (musicVolume < 0.4) return "volume_down";
    return "volume_up";
  }

  return (
    <div
      className="fixed top-4 left-4 z-[9000] flex items-center gap-2"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      {/* Mute button */}
      <button
        onClick={toggleMute}
        className="w-14 h-14 bg-paper-white border-[3px] border-ink-black rounded-full shadow-[4px_4px_0px_0px_#000] flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      >
        <span
          className="material-symbols-outlined text-ink-black text-3xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {getIcon()}
        </span>
      </button>

      {/* Volume slider — appears to the right */}
      {showSlider && (
        <div className="bg-paper-white border-[3px] border-ink-black rounded-full px-3 py-2 shadow-[4px_4px_0px_0px_#000] flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={muted ? 0 : musicVolume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setMusicVolume(val);
              if (val > 0 && muted) toggleMute();
            }}
            className="w-20 h-1.5 appearance-none bg-ink-black/30 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-ink-black [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>
      )}
    </div>
  );
}

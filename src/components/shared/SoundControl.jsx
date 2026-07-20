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
      className="fixed bottom-4 right-4 z-[9000] flex items-center gap-2"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      {/* Volume slider */}
      {showSlider && (
        <div className="bg-surface-container-high ink-border rounded-full px-3 py-2 hard-shadow-sm flex items-center gap-2">
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
            className="w-20 h-1.5 appearance-none bg-mid-tone-grey rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-paper-white [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>
      )}

      {/* Mute button */}
      <button
        onClick={toggleMute}
        className="w-10 h-10 bg-surface-container-high ink-border rounded-full hard-shadow-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      >
        <span
          className="material-symbols-outlined text-paper-white text-xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {getIcon()}
        </span>
      </button>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useSound } from "../../contexts/AudioContext";

export function SoundControl() {
  const { muted, toggleMute, volume, setVolume } = useSound();
  const [showSlider, setShowSlider] = useState(false);
  const containerRef = useRef(null);
  const isTouchRef = useRef(false);

  // Detect touch device
  useEffect(() => {
    function onTouch() {
      isTouchRef.current = true;
    }
    window.addEventListener("touchstart", onTouch, { once: true });
    return () => window.removeEventListener("touchstart", onTouch);
  }, []);

  // Close slider on tap outside (mobile)
  useEffect(() => {
    if (!showSlider) return;
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSlider(false);
      }
    }
    // Small delay to avoid the same tap that opened it from closing it
    const timer = setTimeout(() => {
      document.addEventListener("pointerdown", handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [showSlider]);

  function getIcon() {
    if (muted || volume === 0) return "volume_off";
    if (volume < 0.4) return "volume_down";
    return "volume_up";
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 left-4 sm:bottom-auto sm:top-4 z-[9000] flex items-center gap-2"
      onMouseEnter={() => { if (!isTouchRef.current) setShowSlider(true); }}
      onMouseLeave={() => { if (!isTouchRef.current) setShowSlider(false); }}
    >
      {/* Mute button */}
      <button
        onClick={(e) => {
          // On mobile: first tap opens slider, subsequent taps toggle mute
          if (!showSlider) {
            setShowSlider(true);
            e.stopPropagation();
          } else {
            toggleMute();
          }
        }}
        className="w-10 h-10 sm:w-14 sm:h-14 bg-paper-white border-[3px] border-ink-black rounded-full shadow-[4px_4px_0px_0px_#000] flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      >
        <span
          className="material-symbols-outlined text-ink-black text-2xl sm:text-3xl"
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
            value={muted ? 0 : volume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setVolume(val);
              if (val > 0 && muted) toggleMute();
            }}
            className="w-20 h-1.5 appearance-none bg-ink-black/30 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-ink-black [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";

// === Configuration ===

const MUSIC_TRACKS = {
  menu: "/audio/music/menu.mp3",
  placing: "/audio/music/placing.mp3",
  battle: "/audio/music/battle.mp3",
};

const SFX = {
  hit: "/audio/sfx/hit.mp3",
  victory: "/audio/sfx/victory.mp3",
  defeat: "/audio/sfx/defeat.mp3",
};

// Gain multipliers (adjust relative loudness of music vs SFX)
const MUSIC_GAIN = 0.6;
const SFX_GAIN = 0.5;

// === Preloaded SFX cache ===
const sfxCache = {};

function preloadSfx() {
  Object.entries(SFX).forEach(([name, path]) => {
    const audio = new Audio(path);
    audio.preload = "auto";
    audio.volume = 0.3;
    sfxCache[name] = audio;
  });
}

// === Hook ===

export function useAudio() {
  const musicRef = useRef(null);
  const currentTrackRef = useRef(null);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("navalis-volume");
    return saved !== null ? parseFloat(saved) : 0.4;
  });
  const [muted, setMuted] = useState(() => {
    return localStorage.getItem("navalis-muted") === "true";
  });

  // Logarithmic curve for natural volume perception
  const applyVolumeCurve = useCallback((linear) => {
    return linear * linear; // quadratic curve: 0.5 slider → 0.25 actual
  }, []);

  // Preload SFX on mount
  useEffect(() => {
    preloadSfx();
  }, []);

  // Persist settings
  useEffect(() => {
    localStorage.setItem("navalis-volume", volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem("navalis-muted", muted.toString());
  }, [muted]);

  // Update music volume when it changes
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = muted ? 0 : applyVolumeCurve(volume) * MUSIC_GAIN;
    }
  }, [volume, muted, applyVolumeCurve]);

  // Resume music on user interaction (if autoplay was blocked)
  useEffect(() => {
    function handleInteraction() {
      if (musicRef.current && musicRef.current.paused && currentTrackRef.current) {
        musicRef.current.play().catch(() => {});
      }
    }

    document.addEventListener("click", handleInteraction, { once: true });
    document.addEventListener("keydown", handleInteraction, { once: true });
    document.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  // Play a music track (loops)
  const playMusic = useCallback(
    (track) => {
      if (!MUSIC_TRACKS[track]) return;
      if (currentTrackRef.current === track && musicRef.current && !musicRef.current.paused) return;

      // Fade out current music
      if (musicRef.current) {
        const prev = musicRef.current;
        const fadeOut = setInterval(() => {
          if (prev.volume > 0.05) {
            prev.volume = Math.max(0, prev.volume - 0.05);
          } else {
            clearInterval(fadeOut);
            prev.pause();
            prev.currentTime = 0;
          }
        }, 50);
      }

      // Start new track
      const audio = new Audio(MUSIC_TRACKS[track]);
      audio.loop = true;
      audio.volume = muted ? 0 : applyVolumeCurve(volume) * MUSIC_GAIN;
      audio.play().catch(() => {
        // Autoplay blocked — will resume on first user interaction
      });

      musicRef.current = audio;
      currentTrackRef.current = track;
    },
    [volume, muted, applyVolumeCurve],
  );

  // Stop music (with fade-out)
  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      const audio = musicRef.current;
      musicRef.current = null;
      currentTrackRef.current = null;
      const fadeOut = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume = Math.max(0, audio.volume - 0.05);
        } else {
          clearInterval(fadeOut);
          audio.pause();
          audio.currentTime = 0;
        }
      }, 40);
    }
  }, []);

  // Play a sound effect (fire and forget)
  const activeSfxRef = useRef([]);

  const playSfx = useCallback(
    (name) => {
      if (muted) return;
      if (!SFX[name]) return;

      // Clone the cached audio to allow overlapping plays
      const audio = sfxCache[name]?.cloneNode();
      if (!audio) return;
      audio.volume = applyVolumeCurve(volume) * SFX_GAIN;
      audio.addEventListener("ended", () => {
        activeSfxRef.current = activeSfxRef.current.filter((a) => a !== audio);
      });
      activeSfxRef.current.push(audio);
      audio.play().catch(() => {});
    },
    [volume, muted, applyVolumeCurve],
  );

  // Stop all active SFX (with fade-out)
  const stopSfx = useCallback(() => {
    activeSfxRef.current.forEach((audio) => {
      const fadeOut = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume = Math.max(0, audio.volume - 0.05);
        } else {
          clearInterval(fadeOut);
          audio.pause();
          audio.currentTime = 0;
        }
      }, 40);
    });
    activeSfxRef.current = [];
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const newMuted = !m;
      if (musicRef.current) {
        musicRef.current.volume = newMuted ? 0 : applyVolumeCurve(volume) * MUSIC_GAIN;
      }
      return newMuted;
    });
  }, [volume, applyVolumeCurve]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
    };
  }, []);

  return {
    playMusic,
    stopMusic,
    playSfx,
    stopSfx,
    volume,
    setVolume,
    muted,
    toggleMute,
  };
}

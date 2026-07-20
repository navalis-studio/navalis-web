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

// === Preloaded SFX cache ===
const sfxCache = {};

function preloadSfx() {
  Object.entries(SFX).forEach(([name, path]) => {
    const audio = new Audio(path);
    audio.preload = "auto";
    audio.volume = 0.5;
    sfxCache[name] = audio;
  });
}

// === Hook ===

export function useAudio() {
  const musicRef = useRef(null);
  const currentTrackRef = useRef(null);
  const [musicVolume, setMusicVolume] = useState(() => {
    const saved = localStorage.getItem("navalis-music-volume");
    return saved !== null ? parseFloat(saved) : 0.3;
  });
  const [sfxVolume, setSfxVolume] = useState(() => {
    const saved = localStorage.getItem("navalis-sfx-volume");
    return saved !== null ? parseFloat(saved) : 0.5;
  });
  const [muted, setMuted] = useState(() => {
    return localStorage.getItem("navalis-muted") === "true";
  });

  // Preload SFX on mount
  useEffect(() => {
    preloadSfx();
  }, []);

  // Persist settings
  useEffect(() => {
    localStorage.setItem("navalis-music-volume", musicVolume.toString());
  }, [musicVolume]);

  useEffect(() => {
    localStorage.setItem("navalis-sfx-volume", sfxVolume.toString());
  }, [sfxVolume]);

  useEffect(() => {
    localStorage.setItem("navalis-muted", muted.toString());
  }, [muted]);

  // Update music volume when it changes
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = muted ? 0 : musicVolume;
    }
  }, [musicVolume, muted]);

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
      audio.volume = muted ? 0 : musicVolume;
      audio.play().catch(() => {
        // Autoplay blocked — will resume on first user interaction
      });

      musicRef.current = audio;
      currentTrackRef.current = track;
    },
    [musicVolume, muted],
  );

  // Stop music
  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
      musicRef.current = null;
      currentTrackRef.current = null;
    }
  }, []);

  // Play a sound effect (fire and forget)
  const playSfx = useCallback(
    (name) => {
      if (muted) return;
      if (!SFX[name]) return;

      // Clone the cached audio to allow overlapping plays
      const audio = sfxCache[name]?.cloneNode();
      if (!audio) return;
      audio.volume = sfxVolume;
      audio.play().catch(() => {});
    },
    [sfxVolume, muted],
  );

  // Toggle mute
  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const newMuted = !m;
      if (musicRef.current) {
        musicRef.current.volume = newMuted ? 0 : musicVolume;
      }
      return newMuted;
    });
  }, [musicVolume]);

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
    musicVolume,
    setMusicVolume,
    sfxVolume,
    setSfxVolume,
    muted,
    toggleMute,
  };
}

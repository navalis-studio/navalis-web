import { createContext, useContext } from "react";
import { useAudio } from "../hooks/useAudio";

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const audio = useAudio();

  return <AudioContext.Provider value={audio}>{children}</AudioContext.Provider>;
}

export function useSound() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useSound must be used within AudioProvider");
  return ctx;
}
